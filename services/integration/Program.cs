using System.Text;
using StackExchange.Redis;
using Microsoft.AspNetCore.HttpOverrides;
using JiraGithubExport.IntegrationService.Application.Implementations;
using JiraGithubExport.IntegrationService.Application.Implementations.Reports;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.IntegrationService.Application.Interfaces.Reports;
using JiraGithubExport.IntegrationService.Background;
using JiraGithubExport.Shared.Common;
using JiraGithubExport.Shared.Models;
using JiraGithubExport.JiraService.Services.Implementations;
using JiraGithubExport.GithubService.Services.Implementations;
using JiraGithubExport.Shared.Infrastructure.ExternalServices.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Identity.Implementations;
using JiraGithubExport.Shared.Infrastructure.Identity.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Infrastructure.Repositories.Implementations;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.IntegrationService.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
var builder = WebApplication.CreateBuilder(args);

// Bind dynamic PORT early (Railway/Cloud) before building the app.
var envPort = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(envPort))
{
    var url = $"http://0.0.0.0:{envPort}";
    builder.WebHost.UseUrls(url);
    Console.WriteLine($"[STARTUP] PORT detected: {envPort}. Binding to {url}");
}

// Forwarded Headers for reverse proxy (Load Balancer)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// ============================================
// CONFIGURATION
// ============================================

            // JWT Settings
            var jwtSection = builder.Configuration.GetSection("JwtSettings");
            builder.Services.Configure<JwtSettings>(jwtSection);
            var jwtSettings = jwtSection.Get<JwtSettings>();

            if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.SecretKey))
            {
                throw new InvalidOperationException("JwtSettings:SecretKey is missing in configuration.");
            }

// ============================================
// DATABASE
// ============================================

            var connectionString = builder.Configuration.GetConnectionString("Default");
            
            // Fix for Supabase MaxClientsInSessionMode: Enforce strict connection pooling limits
            if (!string.IsNullOrEmpty(connectionString) && !connectionString.Contains("Max Pool Size", StringComparison.OrdinalIgnoreCase))
            {
                connectionString = $"{connectionString.TrimEnd(';')};Pooling=true;Minimum Pool Size=0;Maximum Pool Size=5;Connection Idle Lifetime=20;";
            }

            // Fix connection exhaustion by pooling DbContext instances
            builder.Services.AddDbContextPool<JiraGithubToolDbContext>(options =>
            {
                options.UseNpgsql(connectionString, o => 
                {
                    o.EnableRetryOnFailure(3); // Thêm retry để chống rớt mạng
                });

    if (builder.Environment.IsDevelopment())
    {
        options.EnableDetailedErrors();
        options.EnableSensitiveDataLogging();
    }
});


            // ============================================
            // AUTHENTICATION & AUTHORIZATION
            // ============================================
            
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings!.SecretKey)),
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtSettings.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];

                        // If the request for the hub
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) &&
                            (path.StartsWithSegments("/hubs") || path.StartsWithSegments("/notificationHub")))
                        {
                            // Read the token out of the query string
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    },
                    OnChallenge = context =>
                    {
                        context.HandleResponse();
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        context.Response.ContentType = "application/json";
                        var result = System.Text.Json.JsonSerializer.Serialize(JiraGithubExport.Shared.Contracts.Common.ApiResponse.ErrorResponse("Unauthorized. Please log in first."));
                        return context.Response.WriteAsync(result);
                    },
                    OnForbidden = context =>
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        context.Response.ContentType = "application/json";
                        var result = System.Text.Json.JsonSerializer.Serialize(JiraGithubExport.Shared.Contracts.Common.ApiResponse.ErrorResponse("Forbidden. You don't have permission to access this resource."));
                        return context.Response.WriteAsync(result);
                    }
                };
            });

builder.Services.AddAuthorization();

// ============================================
// APPLICATION SERVICES
// ============================================

// AutoMapper
builder.Services.AddAutoMapper(typeof(JiraGithubExport.IntegrationService.Application.Mappings.MappingProfile));

// Repository & UnitOfWork
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Identity services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();

            // Tầng Application (Services)
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<ISemesterService, SemesterService>();
            builder.Services.AddScoped<ISubjectService, SubjectService>();
            builder.Services.AddScoped<ICourseService, CourseService>();
            builder.Services.AddScoped<IProjectCoreService, ProjectCoreService>();
            builder.Services.AddScoped<IProjectTeamService, ProjectTeamService>();
            builder.Services.AddScoped<IProjectIntegrationService, ProjectIntegrationService>();
            builder.Services.AddScoped<IProjectDashboardService, ProjectDashboardService>();
            builder.Services.AddScoped<IReportService, ReportService>();
            builder.Services.AddScoped<IExcelReportGenerator, ExcelReportGenerator>();
            builder.Services.AddScoped<IPdfReportGenerator, PdfReportGenerator>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IAlertService, AlertService>();
            builder.Services.AddScoped<ISrsService, SrsService>();
            builder.Services.AddScoped<IInvitationService, InvitationService>();
            builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
            builder.Services.AddScoped<IStudentService, StudentService>();


// Background Services
var isRailwaySync = Environment.GetEnvironmentVariable("RAILWAY_ENVIRONMENT_NAME") != null;
var isRenderSync = Environment.GetEnvironmentVariable("RENDER") != null;
var hasPortSync = Environment.GetEnvironmentVariable("PORT") != null;
var isCloudSync = isRailwaySync || isRenderSync || hasPortSync;

// On cloud tiers, SyncWorker can compete with API cold-start (CPU/RAM + DB/Redis + upstream calls).
// Default: disable SyncWorker on cloud unless explicitly enabled.
var enableSyncOnCloud = Environment.GetEnvironmentVariable("ENABLE_SYNC_WORKER_ON_CLOUD") != null;
if (!isCloudSync || enableSyncOnCloud)
{
    builder.Services.AddHostedService<SyncWorker>();
}
else
{
    Console.WriteLine("[STARTUP] SyncWorker disabled on cloud (to prevent API starvation/503).");
}

// External Services (with HttpClient)
builder.Services.AddHttpClient<IGitHubClient, GitHubClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["GitHub:ApiBaseUrl"] ?? "https://api.github.com/");
});
builder.Services.AddHttpClient<IJiraClient, JiraClient>();

// ============================================
// API CONTROLLERS, SWAGGER, REDIS & SIGNALR
// ============================================

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                    options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                });
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSignalR();
            
            // Redis Configuration (Non-blocking Connect)
            var redisConnection = builder.Configuration["Redis:ConnectionString"] ?? "localhost:6379,abortConnect=false";
            
            try 
            {
                var multiplexer = ConnectionMultiplexer.Connect(redisConnection);
                builder.Services.AddSingleton<IConnectionMultiplexer>(multiplexer);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WARNING] Redis connection failed: {ex.Message}. Distributed features might not work.");
                // We still register a dummy or handle null in services if needed, 
                // but at least the app won't crash on startup.
            }

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = redisConnection;
    options.InstanceName = "PBLPlatform_";
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PBL Platform API",
        Version = "v1",
        Description = "Project-Based Learning Platform with Jira & GitHub Integration"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ============================================
// CORS
// ============================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
            {
                // Always allow any origin that sends an Origin header.
                // This avoids missing CORS headers when frontend subdomains change (Vercel, preview URLs, etc.).
                // Security can be tightened later via an allowlist if needed.
                if (string.IsNullOrWhiteSpace(origin)) return false;
                return Uri.TryCreate(origin, UriKind.Absolute, out _);
            })
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// ============================================
// BUILD APP
// ============================================

var app = builder.Build();

// ============================================
// MIDDLEWARE PIPELINE
// ============================================

app.UseForwardedHeaders();
app.UseRouting();
app.UseCors("AllowAll");
app.UseCustomExceptionHandler();


// Swagger is always enabled for demo and grading purposes
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "PBL Platform API v1");
    c.RoutePrefix = "swagger"; // Swagger at /swagger
    c.DocumentTitle = "PBL Platform – Jira & GitHub Export API";
});

            // Render/Railway handles SSL/TLS termination at the proxy level.
            // We use HttpsRedirection only for local development or non-cloud environments.
            var isRender = Environment.GetEnvironmentVariable("RENDER") != null;
            var isRailway = Environment.GetEnvironmentVariable("RAILWAY_ENVIRONMENT_NAME") != null;
            var isRailwayPort = Environment.GetEnvironmentVariable("PORT") != null;
            if (!app.Environment.IsDevelopment() && !isRender && !isRailway && !isRailwayPort)
            {
                app.UseHttpsRedirection();
            }

            // BUG-FIX: Ensure wwwroot exists and is properly served even if created dynamically
            var wwwroot = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
            if (!Directory.Exists(wwwroot)) Directory.CreateDirectory(wwwroot);
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(wwwroot),
                RequestPath = "" // Serve at root
            });

app.UseAuthentication();
app.UseAuthorization();

            // Map controllers & SignalR Hubs
            app.MapControllers();
            // Mount NotificationHub on both paths to support FE calling /notificationHub
            app.MapHub<JiraGithubExport.IntegrationService.Hubs.NotificationHub>("/hubs/notifications");
            app.MapHub<JiraGithubExport.IntegrationService.Hubs.NotificationHub>("/notificationHub");

            // Health Check Endpoint for Render/Deployments
            app.MapGet("/", () => Results.Ok(new { status = "Healthy", version = "1.1.0", timestamp = DateTime.UtcNow }));
            app.MapGet("/health", () => Results.Ok(new { status = "UP" }));

            // ============================================
            // DATABASE SEEDING (Background)
            // ============================================
              _ = Task.Run(async () => {
                try {
                    await JiraGithubExport.IntegrationService.Application.Startup.DatabaseSeeder.SeedAsync(app.Services);
                } catch (Exception ex) {
                    Console.WriteLine($"[CRITICAL] Background Seed failed: {ex.Message}");
                }
            });
            // ============================================
            // RUN APPLICATION
            // ============================================
            if (!string.IsNullOrEmpty(envPort))
            {
                app.Run($"http://0.0.0.0:{envPort}");
            }
            else
            {
                app.Run();
            }













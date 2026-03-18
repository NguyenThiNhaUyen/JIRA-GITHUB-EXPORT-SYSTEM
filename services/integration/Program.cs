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

// Fix for Supabase MaxClientsInSessionMode: Increase pool size to prevent exhaustion
if (!string.IsNullOrEmpty(connectionString) && !connectionString.Contains("Max Pool Size", StringComparison.OrdinalIgnoreCase))
{
    connectionString = $"{connectionString.TrimEnd(';')};Pooling=true;Minimum Pool Size=0;Maximum Pool Size=30;Connection Idle Lifetime=20;";
}

// Fix connection exhaustion by pooling DbContext instances
builder.Services.AddDbContextPool<JiraGithubToolDbContext>(options =>
{
    options.UseNpgsql(connectionString, o =>
    {
        o.EnableRetryOnFailure(3); // ThÄ‚Âªm retry Ă„â€˜Ă¡Â»Æ’ chĂ¡Â»â€˜ng rĂ¡Â»â€ºt mĂ¡ÂºÂ¡ng
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

            // Order of Priority:
            // 1. Authorization header (implicit handle by middleware)
            // 2. Query string (for SignalR hubs)
            // 3. Cookie (X-Access-Token)

            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/hubs") || path.StartsWithSegments("/notificationHub")))
            {
                context.Token = accessToken;
            }
            else if (string.IsNullOrEmpty(context.Token))
            {
                // Try to get token from cookie
                var cookieToken = context.Request.Cookies["X-Access-Token"];
                if (!string.IsNullOrEmpty(cookieToken))
                {
                    context.Token = cookieToken;
                }
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

// TĂ¡ÂºÂ§ng Application (Services)
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
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<ILecturerService, LecturerService>();

// Background Services
builder.Services.AddHostedService<SyncWorker>();

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

// ============================================
// REDIS & CACHING
// ============================================

var redisConnection = builder.Configuration["Redis:ConnectionString"] ?? "localhost:6379,abortConnect=false";
bool useRedis = false;

try
{
    // abortConnect=false ensures it doesn't throw immediate exception on Connect
    var multiplexer = ConnectionMultiplexer.Connect(redisConnection);
    builder.Services.AddSingleton<IConnectionMultiplexer>(multiplexer);
    useRedis = true;
}
catch (Exception ex)
{
    Console.WriteLine($"[WARNING] Redis connection failed: {ex.Message}. Falling back to In-Memory Cache.");
}

if (useRedis)
{
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConnection;
        options.InstanceName = "PBLPlatform_";
    });
}
else
{
    builder.Services.AddDistributedMemoryCache();
}

// Proper Health Checks
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString!, name: "database", tags: new[] { "db", "postgresql" })
    .AddRedis(redisConnection, name: "redis", tags: new[] { "cache", "redis" });

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
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "https://jira-github-export-system.onrender.com",
                "http://localhost:5173",
                "http://localhost:3000"
              )
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
app.UseCustomExceptionHandler();

// Swagger is always enabled for demo and grading purposes
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "PBL Platform API v1");
    c.RoutePrefix = "swagger"; // Swagger at /swagger
    c.DocumentTitle = "PBL Platform â€“ Jira & GitHub Export API";
});

// Render/Cloud handles SSL/TLS termination at the proxy level.
// We use HttpsRedirection only for local development or non-Render environments.
if (!app.Environment.IsDevelopment() && Environment.GetEnvironmentVariable("RENDER") == null)
{
    app.UseHttpsRedirection();
}

// Ensure wwwroot exists to avoid StaticFileMiddleware warning
var wwwroot = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
if (!Directory.Exists(wwwroot)) Directory.CreateDirectory(wwwroot);
app.UseStaticFiles();

app.UseCors("AllowFrontend");

// Map Health Check with JSON output
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            Status = report.Status.ToString(),
            Checks = report.Entries.Select(e => new
            {
                Component = e.Key,
                Status = e.Value.Status.ToString(),
                Description = e.Value.Description,
                Duration = e.Value.Duration
            }),
            Timestamp = DateTime.UtcNow
        };
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
    }
});

app.UseAuthentication();
app.UseAuthorization();

// Map controllers & SignalR Hubs
app.MapControllers();
// Mount NotificationHub on both paths to support FE calling /notificationHub
app.MapHub<JiraGithubExport.IntegrationService.Hubs.NotificationHub>("/hubs/notifications");
app.MapHub<JiraGithubExport.IntegrationService.Hubs.NotificationHub>("/notificationHub");

// Health Check Endpoint for Render/Deployments
app.MapGet("/", () => Results.Ok(new { Status = "Healthy", version = "1.1.0", Timestamp = DateTime.UtcNow }));

// ============================================
// DATABASE SEEDING
// ============================================

using (var scope = app.Services.CreateScope())
{
    try
    {
        await JiraGithubExport.IntegrationService.Application.Startup.DatabaseSeeder.SeedAsync(scope.ServiceProvider);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[CRITICAL] Seeder failed: {ex.Message}");
    }
}

// ============================================
// RUN APPLICATION
// ============================================
var envPort = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(envPort))
{
    // On Render/Cloud, listen on 0.0.0.0 with the assigned PORT
    var url = $"http://0.0.0.0:{envPort}";
    Console.WriteLine($"[STARTUP] Render PORT detected: {envPort}. Binding to {url}");
    app.Urls.Clear(); // Clear any pre-configured URLs
    app.Urls.Add(url);
    await app.RunAsync();
}
else
{
    // Local development will use launchSettings.json URLs (localhost:5032, etc.)
    Console.WriteLine("[STARTUP] No PORT env var found. Running with default/launchSettings URLs.");
    await app.RunAsync();
}

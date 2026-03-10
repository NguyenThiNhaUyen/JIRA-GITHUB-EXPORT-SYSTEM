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
            builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
            var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

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

            builder.Services.AddControllers();
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSignalR();
            
            // Redis Configuration
            var redisConnection = builder.Configuration["Redis:ConnectionString"] ?? "localhost:6379,abortConnect=false";
            
            // Register IConnectionMultiplexer for distributed locks (e.g., SyncWorker)
            var multiplexer = ConnectionMultiplexer.Connect(redisConnection);
            builder.Services.AddSingleton<IConnectionMultiplexer>(multiplexer);

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

                // Add JWT Authentication to Swagger
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
            // CORS (for frontend development)
            // ============================================
            
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    // For Production, change SetIsOriginAllowed(_ => true) to exact domains
                    policy.SetIsOriginAllowed(origin => true) // Allow any origin safely with credentials
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials(); // Required for SignalR WebSockets
                });
            });

            // ============================================
            // BUILD APP
            // ============================================

            var app = builder.Build();

            // ============================================
            // MIDDLEWARE PIPELINE
            // ============================================
            
            // First middleware: Forwarded headers
            app.UseForwardedHeaders();

            // Global exception handler
            app.UseCustomExceptionHandler();

            // Swagger (Development only)
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "PBL Platform API v1");
                    c.RoutePrefix = "swagger"; // Swagger at /swagger
                });
            }

            if (!app.Environment.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }

            app.UseStaticFiles();

            // CORS
            app.UseCors("AllowAll");

            // Authentication & Authorization
            app.UseAuthentication();
            app.UseAuthorization();

            // Map controllers & SignalR Hubs
            app.MapControllers();
            app.MapHub<JiraGithubExport.IntegrationService.Hubs.NotificationHub>("/hubs/notifications");

            // ============================================
            // DATABASE SEEDING
            // ============================================
            await SeedDatabaseAsync(app);

            // ============================================
            // RUN APPLICATION
            // ============================================
            await app.RunAsync();

            // Local function for seeding
            async Task SeedDatabaseAsync(WebApplication host)
            {
                using var seedScope = host.Services.CreateScope();
                var services = seedScope.ServiceProvider;
                var dbContext = services.GetRequiredService<JiraGithubToolDbContext>();
                var hasher = services.GetRequiredService<IPasswordHasher>();
                var seedLogger = services.GetRequiredService<ILogger<Program>>();

                try
                {
                    seedLogger.LogInformation("Applying database migrations...");
                    await dbContext.Database.MigrateAsync();

                    // 1. Roles
                    var roles = new[] { "ADMIN", "LECTURER", "STUDENT" };
                    foreach (var roleName in roles)
                    {
                        if (!await dbContext.roles.AnyAsync(r => r.role_name == roleName))
                        {
                            dbContext.roles.Add(new role { role_name = roleName });
                        }
                    }
                    await dbContext.SaveChangesAsync();

                    // 2. Admin
                    string adminEmail = "admin@truonghoc.com";
                    if (!await dbContext.users.AnyAsync(u => u.email == adminEmail))
                    {
                        var adminRole = await dbContext.roles.FirstAsync(r => r.role_name == "ADMIN");
                        var adminUser = new user { email = adminEmail, password = hasher.HashPassword("Admin@123"), full_name = "Super Admin", enabled = true };
                        adminUser.roles.Add(adminRole);
                        dbContext.users.Add(adminUser);
                        await dbContext.SaveChangesAsync();
                        seedLogger.LogWarning("🚀 [SEED] Admin seeded: {Email}", adminEmail);
                    }

                    // 3. Lecturer
                    string lectEmail = "gv@fpt.edu.vn";
                    if (!await dbContext.users.AnyAsync(u => u.email == lectEmail))
                    {
                        var role = await dbContext.roles.FirstAsync(r => r.role_name == "LECTURER");
                        var u = new user { email = lectEmail, password = hasher.HashPassword("Lecturer@123"), full_name = "Nguyễn Văn A", enabled = true };
                        u.roles.Add(role);
                        dbContext.users.Add(u);
                        await dbContext.SaveChangesAsync();
                        dbContext.lecturers.Add(new lecturer { user_id = u.id, lecturer_code = "GV001", office_email = lectEmail, department = "SE" });
                        await dbContext.SaveChangesAsync();
                        seedLogger.LogWarning("🚀 [SEED] Lecturer seeded: {Email}", lectEmail);
                    }

                    // 4. Student
                    string studEmail = "sv@fpt.edu.vn";
                    if (!await dbContext.users.AnyAsync(u => u.email == studEmail))
                    {
                        var role = await dbContext.roles.FirstAsync(r => r.role_name == "STUDENT");
                        var u = new user { email = studEmail, password = hasher.HashPassword("Student@123"), full_name = "Trần Thị B", enabled = true };
                        u.roles.Add(role);
                        dbContext.users.Add(u);
                        await dbContext.SaveChangesAsync();
                        dbContext.students.Add(new student { user_id = u.id, student_code = "SE123456", major = "SE", department = "IT" });
                        await dbContext.SaveChangesAsync();
                        seedLogger.LogWarning("🚀 [SEED] Student seeded: {Email}", studEmail);
                    }
                }
                catch (Exception ex)
                {
                    seedLogger.LogError(ex, "❌ Database seeding failed.");
                }
            }











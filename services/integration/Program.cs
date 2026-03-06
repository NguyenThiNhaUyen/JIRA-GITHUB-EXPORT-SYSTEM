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
            
            builder.Services.AddDbContext<JiraGithubToolDbContext>(options =>
            {
                options.UseNpgsql(connectionString);

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
            // DATABASE SEEDING (AUTO-CREATE ADMIN SYSTEM)
            // ============================================
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<JiraGithubToolDbContext>();
                    var passwordHasher = services.GetRequiredService<IPasswordHasher>();
                    var logger = services.GetRequiredService<ILogger<Program>>();

                    // 0. Auto-migrate database on startup
                    try
                    {
                        logger.LogInformation("Applying database migrations...");
                        await context.Database.MigrateAsync();
                        logger.LogInformation("Database migrated successfully.");
                    }
                    catch (Exception ex)
                    {
                        logger.LogCritical(ex, "❌ Database migration failed! Deployment halted.");
                        throw; // Rethrow so deployment fails fast
                    }

                    // 1. Create Default Roles if not exist
                    var defaultRoles = new[] { "ADMIN", "LECTURER", "STUDENT" };
                    bool rolesAdded = false;
                    foreach (var roleName in defaultRoles)
                    {
                        if (!await context.roles.AnyAsync(r => r.role_name == roleName))
                        {
                            context.roles.Add(new role { role_name = roleName });
                            rolesAdded = true;
                        }
                    }
                    if (rolesAdded) await context.SaveChangesAsync();

                    // 2. Create Super Admin Account if not exist
                    string adminEmail = "admin@truonghoc.com";
                    if (!await context.users.AnyAsync(u => u.email == adminEmail))
                    {
                        var adminRole = await context.roles.FirstAsync(r => r.role_name == "ADMIN");
                        var adminUser = new user
                        {
                            email = adminEmail,
                            password = passwordHasher.HashPassword("Admin@123"), // Password mặc định
                            full_name = "Super Admin",
                            enabled = true,
                            created_at = DateTime.UtcNow,
                            updated_at = DateTime.UtcNow
                        };
                        adminUser.roles.Add(adminRole);
                        context.users.Add(adminUser);
                        await context.SaveChangesAsync();
                        
                        logger.LogWarning("🚀 [SYSTEM INIT] Seeded Default Admin Account -> Email: {Email} | Pass: Admin@123", adminEmail);
                    }

                    // 3. Create Sample Lecturer Account if not exist
                    string lecturerEmail = "lecturer@truonghoc.com";
                    if (!await context.users.AnyAsync(u => u.email == lecturerEmail))
                    {
                        var lecturerRole = await context.roles.FirstAsync(r => r.role_name == "LECTURER");
                        var lecturerUser = new user
                        {
                            email = lecturerEmail,
                            password = passwordHasher.HashPassword("Admin@123"),
                            full_name = "Sample Lecturer",
                            lecturer_code = "LEC001",
                            enabled = true,
                            created_at = DateTime.UtcNow,
                            updated_at = DateTime.UtcNow
                        };
                        lecturerUser.roles.Add(lecturerRole);
                        context.users.Add(lecturerUser);
                        await context.SaveChangesAsync();
                        
                        logger.LogWarning("🚀 [SYSTEM INIT] Seeded Default Lecturer Account -> Email: {Email} | Pass: Admin@123", lecturerEmail);
                    }

                    // 4. Create Sample Student Account if not exist
                    string studentEmail = "student@truonghoc.com";
                    if (!await context.users.AnyAsync(u => u.email == studentEmail))
                    {
                        var studentRole = await context.roles.FirstAsync(r => r.role_name == "STUDENT");
                        var studentUser = new user
                        {
                            email = studentEmail,
                            password = passwordHasher.HashPassword("Admin@123"),
                            full_name = "Sample Student",
                            student_code = "STU001",
                            enabled = true,
                            created_at = DateTime.UtcNow,
                            updated_at = DateTime.UtcNow
                        };
                        studentUser.roles.Add(studentRole);
                        context.users.Add(studentUser);
                        await context.SaveChangesAsync();
                        
                        logger.LogWarning("🚀 [SYSTEM INIT] Seeded Default Student Account -> Email: {Email} | Pass: Admin@123", studentEmail);
                    }
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "❌ An error occurred while seeding the database.");
                }
            }

            // ============================================
            // RUN APPLICATION
            // ============================================

            await app.RunAsync();











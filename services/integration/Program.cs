using System.Text;
using JiraGithubExport.IntegrationService.Application.Implementations;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.IntegrationService.Background;
using JiraGithubExport.Shared.Common;
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

            app.UseHttpsRedirection();
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
            // RUN
            // ============================================

            app.Run();











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

namespace JiraGithubExport.IntegrationService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
            var builder = WebApplication.CreateBuilder(args);

            // ============================================
            // LOGGING CONFIGURATION
            // ============================================


            builder.Logging.AddConsole();
            builder.Logging.AddDebug();

            if (builder.Environment.IsDevelopment())
            {
                builder.Logging.SetMinimumLevel(LogLevel.Information);
            }

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

            // Application services
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<ICourseService, CourseService>();
            builder.Services.AddScoped<IProjectService, ProjectService>();
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
            // API CONTROLLERS & SWAGGER
            // ============================================

            builder.Services.AddControllers();
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddEndpointsApiExplorer();
            
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
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            // ============================================
            // BUILD APP
            // ============================================

            var app = builder.Build();

            // ============================================
            // MIDDLEWARE PIPELINE
            // ============================================
            
            // Request/Response logging
            app.Use(async (context, next) =>
            {
                var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogInformation("{Method} {Path}", context.Request.Method, context.Request.Path);
                await next();
            });

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

            // Map controllers
            app.MapControllers();

            // ============================================
            // RUN
            // ============================================

            app.Run();

        }
    }
}









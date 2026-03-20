using System.Net;
using System.Text.Json;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Common;

namespace JiraGithubExport.IntegrationService.Middleware;

public class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlerMiddleware> _logger;

    public ExceptionHandlerMiddleware(RequestDelegate next, ILogger<ExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = exception switch
        {
            NotFoundException notFoundEx => new
            {
                statusCode = (int)HttpStatusCode.NotFound,
                response = ApiResponse.ErrorResponse(notFoundEx.Message)
            },
            UnauthorizedException unauthorizedEx => new
            {
                statusCode = (int)HttpStatusCode.Unauthorized,
                response = ApiResponse.ErrorResponse(unauthorizedEx.Message)
            },
            ValidationException validationEx => new
            {
                statusCode = (int)HttpStatusCode.BadRequest,
                response = ApiResponse.ErrorResponse("Validation failed", validationEx.Errors)
            },
            BusinessException businessEx => new
            {
                statusCode = (int)HttpStatusCode.BadRequest,
                response = ApiResponse.ErrorResponse(businessEx.Message)
            },
            _ => new
            {
                statusCode = (int)HttpStatusCode.InternalServerError,
                response = ApiResponse.ErrorResponse("An internal server error occurred")
            }
        };

        context.Response.StatusCode = response.statusCode;

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response.response, jsonOptions));
    }
}

public static class ExceptionHandlerMiddlewareExtensions
{
    public static IApplicationBuilder UseCustomExceptionHandler(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ExceptionHandlerMiddleware>();
    }
}









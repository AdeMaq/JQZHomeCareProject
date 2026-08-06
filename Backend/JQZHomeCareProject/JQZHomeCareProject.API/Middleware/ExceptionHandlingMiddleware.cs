using JQZHomeCareProject.Application.Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Text.Json;

namespace JQZHomeCareProject.API.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger,
            IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            var (statusCode, message) = MapException(ex);

            var logLevel = statusCode == HttpStatusCode.InternalServerError
                ? LogLevel.Error
                : LogLevel.Warning;

            _logger.Log(
                logLevel,
                ex,
                "Request {Method} {Path} failed with {StatusCode}: {Message}",
                context.Request.Method,
                context.Request.Path,
                (int)statusCode,
                ex.Message);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var response = new
            {
                statusCode = (int)statusCode,
                message,
                traceId = context.TraceIdentifier,
                details = _env.IsDevelopment() ? ex.ToString() : null
            };

            var payload = JsonSerializer.Serialize(response);
            return context.Response.WriteAsync(payload);
        }

        private static (HttpStatusCode statusCode, string message) MapException(Exception ex) => ex switch
        {
            NotFoundException => (HttpStatusCode.NotFound, ex.Message),
            ValidationException => (HttpStatusCode.BadRequest, ex.Message),
            AuthenticationException => (HttpStatusCode.Unauthorized, ex.Message),

            DbUpdateException dbEx when IsUniqueConstraintViolation(dbEx) =>
                (HttpStatusCode.Conflict, "A record with these values already exists."),

            DbUpdateException => (HttpStatusCode.BadRequest, "The request could not be saved due to a data conflict."),

            UnauthorizedAccessException => (HttpStatusCode.Forbidden, "You do not have permission to perform this action."),

            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred.")
        };

        private static bool IsUniqueConstraintViolation(DbUpdateException ex)
        {
            return ex.InnerException is Microsoft.Data.SqlClient.SqlException sqlEx
                   && (sqlEx.Number == 2601 || sqlEx.Number == 2627);
        }
    }
}
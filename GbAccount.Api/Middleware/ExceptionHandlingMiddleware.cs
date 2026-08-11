using System.Text.Json;
using GbAccount.Api.DTOs;

namespace GbAccount.Api.Middleware;

/// <summary>
/// Converts unhandled exceptions into the same { success, message } envelope the
/// rest of the API returns, so a server fault does not reach the React client as
/// an HTML error page it cannot parse.
///
/// This replaces the per-action try/catch blocks the controllers used to carry.
/// The exception detail is logged and deliberately not sent to the client — the
/// response says only that the request failed.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
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
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            // The client navigated away or aborted. Not a fault; log at debug and
            // do not try to write a response to a connection that is already gone.
            _logger.LogDebug(
                "Request {Method} {Path} was cancelled by the client.",
                context.Request.Method,
                context.Request.Path);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unhandled exception for {Method} {Path}",
                context.Request.Method,
                context.Request.Path);

            // Headers already sent means a partial response is on the wire; there
            // is nothing safe to append, so let it terminate.
            if (context.Response.HasStarted)
            {
                throw;
            }

            context.Response.Clear();
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

            var payload = ApiResponse<object>.Fail("An unexpected error occurred.");

            // Matches the camelCase-disabled policy configured in Program.cs so
            // error bodies are shaped like every other response.
            await context.Response.WriteAsync(JsonSerializer.Serialize(
                payload,
                new JsonSerializerOptions { PropertyNamingPolicy = null }));
        }
    }
}

/// <summary>Registration helper so Program.cs reads as one line.</summary>
public static class ExceptionHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseExceptionHandlingMiddleware(this IApplicationBuilder app) =>
        app.UseMiddleware<ExceptionHandlingMiddleware>();
}

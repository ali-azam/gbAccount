using FluentValidation;
using GBWeb.Implementation.Domain.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Api.Middleware;

public sealed class GlobalExceptionHandler(IProblemDetailsService problemDetails, ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        var (status, title, errors) = exception switch
        {
            ValidationException validation => (StatusCodes.Status400BadRequest, "Validation failed", validation.Errors
                .GroupBy(x => x.PropertyName).ToDictionary(x => x.Key, x => x.Select(e => e.ErrorMessage).ToArray())),
            DomainException => (StatusCodes.Status409Conflict, "Business rule conflict", null),
            DbUpdateConcurrencyException => (StatusCodes.Status409Conflict, "The record was changed by another user", null),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred", null)
        };

        logger.Log(status >= 500 ? LogLevel.Error : LogLevel.Warning, exception,
            "Request failed with status {StatusCode}; TraceId {TraceId}", status, context.TraceIdentifier);

        var details = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = status < 500 ? exception.Message : "Use the traceId when contacting support.",
            Instance = context.Request.Path
        };
        details.Extensions["traceId"] = context.TraceIdentifier;
        if (errors is not null) details.Extensions["errors"] = errors;

        context.Response.StatusCode = status;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            ProblemDetails = details,
            Exception = exception
        });
    }
}

using System.Threading.RateLimiting;
using GBWeb.Implementation.Api.Middleware;
using GBWeb.Implementation.Api.Security;
using GBWeb.Implementation.Application;
using GBWeb.Implementation.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.OpenApi.Models;
using Serilog;
using QuestPDF.Infrastructure;


var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, loggerConfig) =>
    loggerConfig.ReadFrom.Configuration(context.Configuration));

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

builder.Services.AddControllers(options =>
{
    // Require authentication globally for all controllers by default.
    var policy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    options.Filters.Add(new AuthorizeFilter(policy));
});


// ============================================================
// CORS
// Allow the Next.js frontend running on localhost:3000
// to call this ASP.NET Core API.
// ============================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            // Report downloads take their file name from this header,
            // which a cross-origin caller cannot read unless it is
            // explicitly exposed.
            .WithExposedHeaders("Content-Disposition");
    });
});


builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new()
        {
            Title = "GBWeb Implementation API",
            Version = "v1"
        });

    options.AddSecurityDefinition("EntraId", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.OAuth2,
        Description = "Microsoft Entra ID authorization-code flow with PKCE.",
        Flows = new OpenApiOAuthFlows
        {
            AuthorizationCode = new OpenApiOAuthFlow
            {
                AuthorizationUrl = new Uri(
                    $"https://login.microsoftonline.com/{builder.Configuration["EntraId:TenantId"]}/oauth2/v2.0/authorize"),

                TokenUrl = new Uri(
                    $"https://login.microsoftonline.com/{builder.Configuration["EntraId:TenantId"]}/oauth2/v2.0/token"),

                Scopes = new Dictionary<string, string>
                {
                    [$"api://{builder.Configuration["EntraId:ClientId"]}/access_as_user"]
                        = "Access GBWeb API"
                }
            }
        }
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        [new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "EntraId"
            }
        }] = []
    });
});


builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.GlobalLimiter =
        PartitionedRateLimiter.Create<HttpContext, string>(context =>
            RateLimitPartition.GetFixedWindowLimiter(
                context.User.FindFirst("oid")?.Value
                    ?? context.Connection.RemoteIpAddress?.ToString()
                    ?? "anonymous",

                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 120,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0,
                    AutoReplenishment = true
                }));
});


builder.Services.AddHealthChecks();

QuestPDF.Settings.License = LicenseType.Community;
var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(options =>
    {
        options.OAuthClientId(
            builder.Configuration["EntraId:SwaggerClientId"]
                ?? builder.Configuration["EntraId:ClientId"]);

        options.OAuthUsePkce();
        options.OAuthScopeSeparator(" ");
    });
}


// ============================================================
// CORS
// This must be BEFORE the request reaches the controllers.
// ============================================================
app.UseCors("Frontend");


app.UseExceptionHandler();

app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (diagnostic, context) =>
    {
        diagnostic.Set("TraceId", context.TraceIdentifier);

        diagnostic.Set(
            "UserId",
            context.User.FindFirst("oid")?.Value ?? "anonymous");
    };
});

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();

app.UseAuthorization();

app.UseRateLimiter();

app.MapControllers();

app.MapHealthChecks("/health").AllowAnonymous();

app.Run();

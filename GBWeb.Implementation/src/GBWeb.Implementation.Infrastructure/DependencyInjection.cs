using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Infrastructure.Identity;
using GBWeb.Implementation.Infrastructure.Persistence;
using GBWeb.Implementation.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace GBWeb.Implementation.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<
    IVoucherReportPdfService,
    VoucherReportPdfService>();

        var databaseOptions = configuration.GetSection(DatabaseOptions.SectionName).Get<DatabaseOptions>() ?? new();
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is required.");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
            {
                sql.EnableRetryOnFailure(databaseOptions.MaxRetryCount, TimeSpan.FromSeconds(databaseOptions.MaxRetryDelaySeconds), null);
                sql.CommandTimeout(databaseOptions.CommandTimeoutSeconds);
            }));

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

        var entra = configuration.GetSection(EntraIdOptions.SectionName).Get<EntraIdOptions>() ?? new();
        services.AddOptions<EntraIdOptions>().Bind(configuration.GetSection(EntraIdOptions.SectionName))
            .Validate(x => !string.IsNullOrWhiteSpace(x.TenantId), "EntraId:TenantId is required.")
            .Validate(x => !string.IsNullOrWhiteSpace(x.ClientId), "EntraId:ClientId is required.")
            .ValidateOnStart();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.Authority = $"{entra.Instance.TrimEnd('/')}/{entra.TenantId}/v2.0";
                options.Audience = string.IsNullOrWhiteSpace(entra.Audience) ? entra.ClientId : entra.Audience;
                options.RequireHttpsMetadata = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidIssuers = entra.ValidIssuers.Length == 0 ? null : entra.ValidIssuers,
                    NameClaimType = "preferred_username",
                    RoleClaimType = "roles",
                    ClockSkew = TimeSpan.FromMinutes(1)
                };
            });

        services.AddAuthorization();

        return services;
    }
}

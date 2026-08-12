using FluentValidation;
using GBWeb.Implementation.Application.Common.Behaviors;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace GBWeb.Implementation.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;
        services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssembly(assembly);
            config.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });
        foreach (var validatorType in assembly.DefinedTypes.Where(x => !x.IsAbstract && !x.IsInterface))
        {
            foreach (var serviceType in validatorType.ImplementedInterfaces.Where(x => x.IsGenericType && x.GetGenericTypeDefinition() == typeof(IValidator<>)))
                services.AddScoped(serviceType, validatorType);
        }
        return services;
    }
}

using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using SmartMedicationDispenser.Application.Common.Behaviors;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.Common.Services;
using SmartMedicationDispenser.Application.Validators;
using System.Reflection;

namespace SmartMedicationDispenser.Application;

/// <summary>Registers MediatR (commands/queries), pipeline behaviors, and FluentValidation from this assembly.</summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IDeviceAccessService, DeviceAccessService>();

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        });

        services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

        return services;
    }
}

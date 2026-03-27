using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace SmartMedicationDispenser.Api.Configuration;

/// <summary>
/// Marks board-test steps 2–4 as requiring <c>X-API-Key</c> in OpenAPI (Swagger Authorize → DeviceApiKey).
/// </summary>
public sealed class DeviceBoardTestSwaggerOperationFilter : IOperationFilter
{
    private static readonly HashSet<string> RequiresDeviceApiKey = new(StringComparer.Ordinal)
    {
        "Step2ValidateApiKey",
        "Step3Schedule",
        "Step4Heartbeat",
    };

    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (context.ApiDescription.ActionDescriptor is not ControllerActionDescriptor cad)
            return;

        if (!string.Equals(cad.ControllerName, "DeviceBoardTest", StringComparison.Ordinal))
            return;

        if (!RequiresDeviceApiKey.Contains(cad.ActionName))
            return;

        operation.Security =
        [
            new OpenApiSecurityRequirement
            {
                [new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "DeviceApiKey" },
                }] = Array.Empty<string>(),
            },
        ];
    }
}

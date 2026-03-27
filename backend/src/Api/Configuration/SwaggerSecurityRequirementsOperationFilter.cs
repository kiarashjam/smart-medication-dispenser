using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace SmartMedicationDispenser.Api.Configuration;

/// <summary>
/// Adds OpenAPI security only for endpoints that require auth, so health and anonymous routes stay unlocked in Swagger UI.
/// Uses controller + action attributes so class-level [Authorize] is respected.
/// </summary>
public sealed class SwaggerSecurityRequirementsOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (context.ApiDescription.ActionDescriptor is not ControllerActionDescriptor cad)
            return;

        var method = cad.MethodInfo;
        var type = cad.ControllerTypeInfo;

        // DeviceBoardTestController: steps 2–4 require X-API-Key in Swagger (see DeviceBoardTestSwaggerOperationFilter).
        if (string.Equals(cad.ControllerName, "DeviceBoardTest", StringComparison.Ordinal))
            return;

        if (method.GetCustomAttributes(inherit: true).OfType<AllowAnonymousAttribute>().Any()
            || type.GetCustomAttributes(inherit: true).OfType<AllowAnonymousAttribute>().Any())
            return;

        var needsAuth = method.GetCustomAttributes(inherit: true).OfType<AuthorizeAttribute>().Any()
            || type.GetCustomAttributes(inherit: true).OfType<AuthorizeAttribute>().Any();

        if (!needsAuth)
            return;

        operation.Security =
        [
            new OpenApiSecurityRequirement
            {
                [new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" },
                }] = Array.Empty<string>(),
            },
        ];
    }
}

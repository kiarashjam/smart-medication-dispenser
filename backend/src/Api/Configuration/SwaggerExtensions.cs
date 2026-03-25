using System.Reflection;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerUI;

namespace SmartMedicationDispenser.Api.Configuration;

/// <summary>
/// Registers OpenAPI/Swashbuckle with XML comments, JWT bearer scheme, and MVP-oriented documentation text.
/// </summary>
public static class SwaggerExtensions
{
    public static IServiceCollection AddSmartDispenserSwagger(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc(
                "v1",
                new OpenApiInfo
                {
                    Title = "Smart Medication Dispenser API",
                    Version = "v1",
                    Description = """
                        **MVP REST API** for medication devices, schedules, caregivers, notifications, and integrations.

                        ### Authentication
                        - **Caregiver / patient / admin (JWT):** Call **POST /api/auth/login** (or **register**). Click **Authorize**, choose **Bearer**, and paste **only the JWT** (Swagger adds the `Bearer ` prefix).
                        - **Device firmware (`/api/v1/...`):** Send header **`X-API-Key`** with the device key from Integrations (some routes are anonymous for inbound webhooks—see controller docs).

                        ### Product documentation (repo)
                        - `software-docs/MVP_APPLICATION.md` — scope and flows
                        - `software-docs/02_BACKEND_API.md` — endpoint overview
                        - `software-docs/WEBHOOKS_JSON_REFERENCE.md` — outbound webhook payloads

                        ### Rate limiting
                        Global and per-route limits apply (e.g. stricter **auth** policy on login/register). Expect **429** when exceeded.
                        """,
                    Contact = new OpenApiContact
                    {
                        Name = "Repository",
                        Url = new Uri("https://github.com/kiarashjam/smart-medication-dispenser"),
                    },
                });

            options.AddSecurityDefinition(
                "Bearer",
                new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    Description = "JWT from **POST /api/auth/login**. Paste the token only (no `Bearer ` prefix).",
                });

            options.OperationFilter<SwaggerSecurityRequirementsOperationFilter>();

            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
                options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);

            options.OrderActionsBy(desc =>
            {
                _ = desc.ActionDescriptor.RouteValues.TryGetValue("controller", out var controller);
                return $"{controller}_{desc.RelativePath}_{desc.HttpMethod}";
            });

            options.UseAllOfToExtendReferenceSchemas();
        });

        return services;
    }

    /// <summary>Swagger UI options: title, timing, deep links, default try-it-out.</summary>
    public static void UseSmartDispenserSwaggerUi(this WebApplication app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Smart Medication Dispenser API v1");
            c.DocumentTitle = "Smart Medication Dispenser — API reference";
            c.DisplayRequestDuration();
            c.EnableDeepLinking();
            c.EnableTryItOutByDefault();
            c.DefaultModelsExpandDepth(2);
            c.DocExpansion(DocExpansion.List);
        });
    }
}

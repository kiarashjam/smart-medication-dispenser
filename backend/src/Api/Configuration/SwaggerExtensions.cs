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
                        ## What this API is
                        REST API for **smart dispensers**, **schedules**, **caregivers**, **notifications**, and **integrations** (webhooks, device keys). Use this page to explore routes and try requests.

                        ---

                        ## Main auth — **Bearer JWT** (start here for web / caregiver / patient)
                        Almost all **`/api/...`** portal routes use a **JSON Web Token** in the `Authorization` header.

                        1. Open **POST /api/auth/login** → **Try it out**.
                        2. Body example: `{ "email": "patient@demo.com", "password": "Demo123!" }` (or `caregiver@demo.com`).
                        3. Copy the **`token`** string from the response (long text, no quotes).
                        4. Click **Authorize** at the top → scheme **Bearer (http, Bearer)**.
                        5. Paste **only the token** — Swagger adds the word `Bearer ` for you. Do **not** type `Bearer` yourself.
                        6. **Authorize**, then try **GET /api/auth/me** or any other locked endpoint.

                        **Logout / switch user:** **Authorize** → **Logout**, then login again with another account.

                        ---

                        ## Second auth — **Device API key** (`X-API-Key`)
                        Used for **device firmware** routes under **`/api/v1/...`** and for **board-test** steps 2–4.

                        1. In the portal, create a **device API key** (Integrations / device keys — see repo docs).
                        2. **Authorize** → **DeviceApiKey** → paste the **full secret key** once.
                        3. That value is sent as header **`X-API-Key`** on each Try-it-out request that requires it.

                        **Board bring-up:** open the **DeviceBoardTest** tag — start with **`GET /api/v1/board-test/flow`** (full checklist + URLs). Steps **0-hello** and **1-connectivity** need **no** key; from **2-api-key** onward use **Authorize → DeviceApiKey**.

                        ---

                        ## No auth
                        **Health** checks and some **auth** actions (login/register) and selected **webhook** endpoints are public unless marked otherwise.

                        ---

                        ### Repo documentation
                        - `software-docs/MVP_APPLICATION.md` — scope and flows  
                        - `software-docs/02_BACKEND_API.md` — endpoint overview  
                        - `software-docs/WEBHOOKS_JSON_REFERENCE.md` — outbound webhook payloads  

                        ### Rate limiting
                        Global and per-route limits apply (e.g. **auth** policy on login/register). Expect **429** when exceeded.
                        """,
                    Contact = new OpenApiContact
                    {
                        Name = "Repository",
                        Url = new Uri("https://github.com/kiarashjam/smart-medication-dispenser"),
                    },
                });

            // "Bearer" is the primary key name Swagger UI shows; description below explains JWT vs device key.
            options.AddSecurityDefinition(
                "Bearer",
                new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    Description = """
                        **Main key for portal & mobile API** — JWT from **POST /api/auth/login** (or register).

                        Paste **only** the `token` value from the JSON response. Do not add the word `Bearer`.

                        **Demo:** `patient@demo.com` or `caregiver@demo.com` with password `Demo123!`.
                        """,
                });

            options.AddSecurityDefinition(
                "DeviceApiKey",
                new OpenApiSecurityScheme
                {
                    Name = "X-API-Key",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Description = """
                        **Device / firmware key** — not the same as the JWT above.

                        Create this in the portal (**Integrations** → device API keys). Used for **`/api/v1/...`** device routes and **board-test** steps 2–4.

                        Paste the full key; Swagger sends it as the **`X-API-Key`** header.
                        """,
                });

            options.OperationFilter<SwaggerSecurityRequirementsOperationFilter>();
            options.OperationFilter<DeviceBoardTestSwaggerOperationFilter>();
            options.OperationFilter<DeviceBoardTestDocumentationOperationFilter>();
            options.DocumentFilter<SwaggerTagDescriptionsDocumentFilter>();

            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
                options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);

            options.OrderActionsBy(desc =>
            {
                _ = desc.ActionDescriptor.RouteValues.TryGetValue("controller", out var controller);
                // List board-bring-up endpoints first in Swagger UI for discoverability.
                var group = string.Equals(controller, "DeviceBoardTest", StringComparison.Ordinal) ? "0" : "1";
                return $"{group}_{controller}_{desc.RelativePath}_{desc.HttpMethod}";
            });

            options.UseAllOfToExtendReferenceSchemas();
        });

        return services;
    }

    /// <summary>Swagger UI: clearer layout, search, persisted auth, and light styling.</summary>
    public static void UseSmartDispenserSwaggerUi(this WebApplication app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Smart Medication Dispenser — v1");
            c.DocumentTitle = "Smart Medication Dispenser — API docs";
            c.DisplayRequestDuration();
            c.EnableDeepLinking();
            c.EnableTryItOutByDefault();
            c.EnablePersistAuthorization();
            c.EnableFilter();
            c.ShowExtensions();
            c.DefaultModelExpandDepth(2);
            c.DefaultModelsExpandDepth(1);
            c.DocExpansion(DocExpansion.List);

            c.InjectStylesheet("/css/swagger-theme.css");

            c.HeadContent = """
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
                <meta name="theme-color" content="#0f766e">
                """;
        });
    }
}

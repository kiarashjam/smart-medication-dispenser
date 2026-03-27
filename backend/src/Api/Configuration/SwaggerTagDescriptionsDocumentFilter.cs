using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace SmartMedicationDispenser.Api.Configuration;

/// <summary>Adds short explanations to Swagger UI tag groups so endpoints are easier to navigate.</summary>
public sealed class SwaggerTagDescriptionsDocumentFilter : IDocumentFilter
{
    private static readonly Dictionary<string, string> TagHelp = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Auth"] = "Login and registration. Start here: call **POST /api/auth/login**, copy `token` from the response, then **Authorize → Bearer** (paste token only). Demo: `patient@demo.com` / `caregiver@demo.com` / `Demo123!`.",
        ["Devices"] = "Patient/caregiver devices (JWT). List, create, pause/resume, heartbeat from the portal context.",
        ["Containers"] = "Medication slots on a device (JWT).",
        ["Schedules"] = "Dose schedules per container (JWT).",
        ["Dispensing"] = "Dispense events, confirm, delay (JWT).",
        ["Patients"] = "Patient adherence summary (JWT).",
        ["Caregivers"] = "Linked patients for caregiver role (JWT).",
        ["Notifications"] = "In-app notifications (JWT).",
        ["Travel"] = "Travel / portable sessions (JWT).",
        ["History"] = "Dispense history (JWT).",
        ["Integrations"] = "Webhooks and device API keys — portal admin/caregiver flows (JWT).",
        ["Webhooks"] = "Inbound webhook receiver (often anonymous — see action docs).",
        ["Health"] = "Liveness/readiness — no auth.",
        ["DeviceApi"] = "Firmware integration under **/api/v1**. Most calls need header **X-API-Key** (use **Authorize → DeviceApiKey**). Registration may be anonymous.",
        ["DeviceBoardTest"] = """
            **Hardware / firmware bring-up & connection testing** — run these in order before trusting production **`/api/v1/devices/...`** calls.

            ### Order (summary)
            1. **`GET .../board-test/flow`** — download the full machine-readable plan + URLs for *this* server.
            2. **`GET .../step/0-hello`** — smallest JSON; proves **TLS/DNS/HTTP/JSON** (no headers).
            3. **`GET .../step/1-connectivity`** — clock + richer payload (no headers).
            4. **`GET /api/v1/ping`** — optional official ping (no key).
            5. **`GET .../step/2-api-key`** — set **Authorize → DeviceApiKey** in Swagger; proves **X-API-Key** → **`device_id`**.
            6. **`GET .../step/3-schedule/{deviceId}`** — same **`deviceId`** as step 5 response; real schedule handler (**403** if GUID wrong).
            7. **`POST .../step/4-heartbeat/{deviceId}`** — real heartbeat pipeline; optional body (see **`GET .../samples`**).
            8. Production examples are listed inside **`flow`** (`prod` block).

            ### Swagger tips
            - Use **Try it out** on **`flow`** first; copy URLs if needed.
            - **Persist authorization** keeps **DeviceApiKey** between steps (if enabled in UI).
            - Steps **5–7** accept **X-API-Key** or, for advanced setups, **Bearer** device JWT (same as production).

            ### If something fails
            - **401** on key steps → key missing/wrong or not **Authorize**d in Swagger.
            - **403** on schedule/heartbeat → **`deviceId` in URL ≠ device for that key**.
            - **404** on heartbeat → device not in DB (register device / portal first).
            """,
    };

    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var path in swaggerDoc.Paths.Values)
        {
            foreach (var op in path.Operations.Values)
            {
                foreach (var tag in op.Tags)
                    seen.Add(tag.Name);
            }
        }

        var ordered = seen.OrderBy(x => x, StringComparer.OrdinalIgnoreCase).ToList();
        // Surface board-bring-up docs at the top of the Swagger tag list when present.
        var boardIx = ordered.FindIndex(x => string.Equals(x, "DeviceBoardTest", StringComparison.OrdinalIgnoreCase));
        if (boardIx > 0)
        {
            ordered.RemoveAt(boardIx);
            ordered.Insert(0, "DeviceBoardTest");
        }

        swaggerDoc.Tags = ordered
            .Select(name => TagHelp.TryGetValue(name, out var desc)
                ? new OpenApiTag { Name = name, Description = desc }
                : new OpenApiTag { Name = name })
            .ToList();
    }
}

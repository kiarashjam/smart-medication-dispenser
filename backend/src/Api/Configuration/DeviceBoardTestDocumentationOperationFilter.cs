using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace SmartMedicationDispenser.Api.Configuration;

/// <summary>
/// Rich Swagger descriptions for board bring-up: connectivity, API key, schedule, heartbeat — so humans can test end-to-end in order.
/// </summary>
public sealed class DeviceBoardTestDocumentationOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (context.ApiDescription.ActionDescriptor is not ControllerActionDescriptor cad)
            return;
        if (!string.Equals(cad.ControllerName, "DeviceBoardTest", StringComparison.Ordinal))
            return;

        if (!Docs.TryGetValue(cad.ActionName, out var doc))
            return;

        operation.Summary = doc.Summary;
        var fromXml = operation.Description?.Trim();
        operation.Description = string.IsNullOrEmpty(fromXml)
            ? doc.Detail
            : $"{doc.Detail}\n\n---\n\n{fromXml}";
    }

    private sealed record Doc(string Summary, string Detail);

    private static readonly Dictionary<string, Doc> Docs = new(StringComparer.Ordinal)
    {
        ["GetFlow"] = new(
            "Master checklist — call this first",
            """
            Returns a **ordered bring-up plan** with full URLs for your host (copy into browser, curl, or firmware).

            **Use it to:**
            - See every step in sequence (0 → production examples).
            - Copy `quick_start` URLs for smoke tests without reading docs.
            - Know which steps need **`X-API-Key`** and where **`deviceId`** appears in the path.

            **Typical order:** `flow` → `0-hello` → `1-connectivity` → optional `GET /api/v1/ping` → `2-api-key` (Authorize **DeviceApiKey** in Swagger) → `3-schedule/{deviceId}` → `4-heartbeat/{deviceId}`.

            **Prerequisites for steps 4+:** A device API key created in the portal (**Integrations** → device). Step **2-api-key** response includes **`device_id`** — use that exact GUID in steps 5–6.
            """),

        ["Step0Hello"] = new(
            "Step 1 — Minimal JSON (no auth)",
            """
            **What this proves:** The board (or your PC) can reach this API over **DNS + TLS + HTTP**, and the response is valid **JSON**.

            **Headers:** none.

            **In Swagger:** **Try it out** → **Execute** → you should see `ok: true` and `server_time`.

            **If it fails:** Check base URL, firewall, certificate trust (dev may use HTTP). Compare with curling the same URL from the same network as the device.

            **Next:** Follow **`next_url`** in the response, or continue the list from **`GET .../flow`**.
            """),

        ["Step1Connectivity"] = new(
            "Step 2 — Connectivity + server clock (no auth)",
            """
            **What this proves:** Same as step 1, plus a slightly larger payload and explicit **`server_time`** (useful to compare device RTC/NTP vs cloud).

            **Headers:** none.

            **Next steps (in order):**
            1. Optional: **`GET /api/v1/ping`** — official device API ping (still no key).
            2. **`GET .../step/2-api-key`** with header **`X-API-Key`** — validates your portal device key.

            **In Swagger:** Click **Authorize** → **DeviceApiKey** → paste your key **before** trying step 2-api-key.
            """),

        ["Step2ValidateApiKey"] = new(
            "Step 3 — Validate device API key",
            """
            **What this proves:** Your **`X-API-Key`** is known to the server and maps to a **device row** (same resolver as production device routes).

            **Headers (required):** `X-API-Key: <secret>` — use Swagger **Authorize → DeviceApiKey** so every Try-it-out sends it.

            **Success:** JSON includes **`device_id`** (GUID) and **`next_url`** for the schedule step.

            **401:** Missing/invalid key — create or rotate a key in the portal; no extra spaces in the header.

            **Next:** `GET .../step/3-schedule/{deviceId}` with **`deviceId` = `device_id` from this response** (must match the key).
            """),

        ["Step3Schedule"] = new(
            "Step 4 — Load schedule (production handler)",
            """
            **What this proves:** The same **authorization and schedule query** path as **`GET /api/v1/devices/{deviceId}/schedule`** (MediatR + DB).

            **Auth (one of):**
            - **`X-API-Key`** for the device (Swagger **DeviceApiKey**), **or**
            - **`Authorization: Bearer <device JWT>`** if you use device tokens (advanced).

            **Path:** `deviceId` must be the **GUID** returned from **step 2-api-key** for that key.

            **403:** Key is valid but **URL deviceId ≠ device for that key** — fix the GUID in the path.

            **401:** No/invalid credential.

            **Next:** `POST .../step/4-heartbeat/{deviceId}` with the **same** `deviceId`.
            """),

        ["Step4Heartbeat"] = new(
            "Step 5 — Heartbeat (production pipeline)",
            """
            **What this proves:** End-to-end **heartbeat processing** like **`POST /api/v1/devices/{deviceId}/heartbeat`** (validation, DB update, optional commands in response).

            **Auth:** Same as schedule step — **`X-API-Key`** (Swagger **DeviceApiKey**) or device **Bearer** JWT.

            **Body:** Optional JSON. Empty body → server uses **defaults** (battery, Wi-Fi, firmware label `board-test`). For real shapes see **`GET .../board-test/samples`**.

            **404:** Device row missing — register the device in the portal or run **device registration** flow first.

            **Success:** Check **`commands`**, **`next_heartbeat`**, **`server_time`** — firmware should apply the same logic as production.

            **After this:** Use **`GET .../flow`** section **`prod`** for canonical URLs (`/api/v1/devices/...`, `/api/v1/events`).
            """),

        ["GetSampleBodies"] = new(
            "Reference — JSON samples for register & heartbeat",
            """
            **Not part of the numbered path** — open anytime after you understand steps 0–2.

            **Contains:** Example **`DeviceRegistrationRequest`** and **`HeartbeatPayload`** for copy-paste into firmware or Postman.

            **Register** uses **`SMD-XXXXXXXX`** style **`device_id`**; **heartbeat** should use your **portal device GUID** string in the payload where applicable.

            **No authentication required** for this endpoint.
            """),
    };
}

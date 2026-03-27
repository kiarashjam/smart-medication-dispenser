using System.Text;
using System.Text.Json;

namespace SmartMedicationDispenser.DeviceSimulator.Services;

/// <summary>Reads device GUID from JWT payload without validating signature (dev / onboarding helper only).</summary>
public static class DeviceJwtPayloadReader
{
    private const string NameIdClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

    public static string? TryGetNameIdentifier(string? jwt)
    {
        if (string.IsNullOrWhiteSpace(jwt))
            return null;
        var parts = jwt.Split('.');
        if (parts.Length < 2)
            return null;
        try
        {
            var payload = PadBase64(parts[1].Replace('-', '+').Replace('_', '/'));
            var json = Encoding.UTF8.GetString(Convert.FromBase64String(payload));
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            if (root.TryGetProperty(NameIdClaim, out var n))
                return n.GetString();
            if (root.TryGetProperty("sub", out var s))
                return s.GetString();
            if (root.TryGetProperty("nameid", out var nid))
                return nid.GetString();
        }
        catch
        {
            /* ignore */
        }

        return null;
    }

    private static string PadBase64(string s)
    {
        var pad = s.Length % 4;
        return pad switch
        {
            2 => s + "==",
            3 => s + "=",
            _ => s,
        };
    }
}

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace IntegrationTests;

/// <summary>Integration tests for notification endpoints including preferences.</summary>
public class NotificationEndpointTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public NotificationEndpointTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> RegisterAndGetTokenAsync()
    {
        var email = $"notif_{Guid.NewGuid():N}@example.com";
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password = "SecurePassword123!",
            fullName = "Notification Test",
            role = "Patient"
        });
        var body = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        return body!["token"]?.ToString()!;
    }

    [Fact]
    public async Task GetNotifications_WithToken_ReturnsEmptyList()
    {
        var token = await RegisterAndGetTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync("/api/notifications");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetPreferences_ReturnsDefaults()
    {
        var token = await RegisterAndGetTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync("/api/notifications/preferences");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("missedDoseAlerts", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task UpdatePreferences_PersistsChanges()
    {
        var token = await RegisterAndGetTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var updateResponse = await _client.PutAsJsonAsync("/api/notifications/preferences", new
        {
            missedDoseAlerts = false,
            lowStockWarnings = true,
            deviceOfflineAlerts = true,
            dailySummary = true,
            caregiverUpdates = false,
            emailNotifications = true,
            pushNotifications = false
        });
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        // Read back
        var getResponse = await _client.GetAsync("/api/notifications/preferences");
        var content = await getResponse.Content.ReadAsStringAsync();
        Assert.Contains("true", content); // dailySummary = true
    }
}

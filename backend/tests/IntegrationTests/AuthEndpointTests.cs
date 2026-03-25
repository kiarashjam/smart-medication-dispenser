using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace IntegrationTests;

/// <summary>Integration tests for authentication endpoints.</summary>
public class AuthEndpointTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthEndpointTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsToken()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email = $"test_{Guid.NewGuid():N}@example.com",
            password = "SecurePassword123!",
            fullName = "Test User",
            role = "Patient"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        Assert.NotNull(body);
        Assert.True(body.ContainsKey("token"));
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "nonexistent@example.com",
            password = "WrongPassword"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Me_WithoutToken_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Me_WithValidToken_ReturnsUserInfo()
    {
        // Register first
        var email = $"me_test_{Guid.NewGuid():N}@example.com";
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password = "SecurePassword123!",
            fullName = "Me Test User",
            role = "Patient"
        });
        var registerBody = await registerResponse.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        var token = registerBody!["token"]?.ToString();

        // Call /me with token
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var meResponse = await _client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);

        var meBody = await meResponse.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        Assert.NotNull(meBody);
        Assert.Equal(email, meBody["email"]?.ToString());
    }

    [Fact]
    public async Task MeExport_WithValidToken_ReturnsExportData()
    {
        // Register
        var email = $"export_{Guid.NewGuid():N}@example.com";
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password = "SecurePassword123!",
            fullName = "Export Test",
            role = "Patient"
        });
        var registerBody = await registerResponse.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        var token = registerBody!["token"]?.ToString();

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var exportResponse = await _client.GetAsync("/api/auth/me/export");
        Assert.Equal(HttpStatusCode.OK, exportResponse.StatusCode);

        var content = await exportResponse.Content.ReadAsStringAsync();
        Assert.Contains("profile", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task UpdateProfile_WithValidToken_UpdatesName()
    {
        // Register
        var email = $"update_{Guid.NewGuid():N}@example.com";
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password = "SecurePassword123!",
            fullName = "Original Name",
            role = "Patient"
        });
        var registerBody = await registerResponse.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        var token = registerBody!["token"]?.ToString();

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var updateResponse = await _client.PutAsJsonAsync("/api/auth/me", new
        {
            fullName = "Updated Name"
        });
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var body = await updateResponse.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        Assert.Equal("Updated Name", body!["fullName"]?.ToString());
    }
}

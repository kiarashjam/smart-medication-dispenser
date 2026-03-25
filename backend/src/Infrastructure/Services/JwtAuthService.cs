using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Enums;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCryptNet = BCrypt.Net.BCrypt;

namespace SmartMedicationDispenser.Infrastructure.Services;

public class JwtAuthService : IAuthService
{
    private readonly JwtSettings _settings;

    public JwtAuthService(IOptions<JwtSettings> settings) => _settings = settings.Value;

    public string GenerateJwt(Guid userId, string email, UserRole role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role.ToString())
        };
        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>Returns BCrypt hash and salt for storing password.</summary>
    public (string Hash, string Salt)? HashPassword(string password)
    {
        var salt = BCryptNet.GenerateSalt();
        var hash = BCryptNet.HashPassword(password, salt);
        return (hash, salt);
    }

    /// <summary>Verifies plain password against stored BCrypt hash.</summary>
    public bool VerifyPassword(string password, string hash) =>
        BCryptNet.Verify(password, hash);
}

/// <summary>JWT configuration (secret, issuer, audience) from appsettings.</summary>
public class JwtSettings
{
    public const string SectionName = "Jwt";
    public string SecretKey { get; set; } = "";
    public string Issuer { get; set; } = "SmartMedicationDispenser";
    public string Audience { get; set; } = "SmartMedicationDispenser";
}

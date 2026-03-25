namespace SmartMedicationDispenser.Application.DTOs;

// Auth request/response DTOs for login, register, and me.
public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Email, string Password, string FullName, string Role);
public record AuthResponse(string Token, string Email, string FullName, string Role, Guid UserId);
public record MeResponse(Guid Id, string Email, string FullName, string Role);
/// <summary>Current user with their IDs: user Id and list of devices they own (each device has its own Id).</summary>
public record MeProfileResponse(Guid UserId, string Email, string FullName, string Role, IReadOnlyList<UserDeviceSummaryDto> Devices);
public record UserDeviceSummaryDto(Guid DeviceId, string Name, string Type, string Status);

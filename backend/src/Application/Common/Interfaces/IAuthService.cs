using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Common.Interfaces;

public interface IAuthService
{
    string GenerateJwt(Guid userId, string email, UserRole role);
    (string Hash, string Salt)? HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

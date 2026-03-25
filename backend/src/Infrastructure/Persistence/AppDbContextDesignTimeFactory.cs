using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SmartMedicationDispenser.Infrastructure.Persistence;

/// <summary>
/// Forces <c>dotnet ef migrations add</c> to scaffold PostgreSQL types. The connection string is not used unless the tool opens a connection.
/// </summary>
public sealed class AppDbContextDesignTimeFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var builder = new DbContextOptionsBuilder<AppDbContext>();
        builder.UseNpgsql("Host=127.0.0.1;Database=efdesign;Username=ef;Password=ef;SSL Mode=Disable");
        return new AppDbContext(builder.Options);
    }
}

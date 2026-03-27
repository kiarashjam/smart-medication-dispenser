using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SmartMedicationDispenser.DeviceSimulator.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services =>
    {
        services.AddHttpClient(nameof(DeviceApiSimulationService), client =>
        {
            client.Timeout = TimeSpan.FromSeconds(120);
        });
        services.AddTransient<DeviceApiSimulationService>();
    })
    .Build();

host.Run();

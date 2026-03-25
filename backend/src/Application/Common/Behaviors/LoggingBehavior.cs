using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace SmartMedicationDispenser.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior that logs request execution time and warns on slow requests.
/// </summary>
public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        _logger.LogDebug("Handling {RequestName}", requestName);

        var sw = Stopwatch.StartNew();
        var response = await next();
        sw.Stop();

        if (sw.ElapsedMilliseconds > 500)
        {
            _logger.LogWarning("Long running request: {RequestName} ({ElapsedMs}ms)", requestName, sw.ElapsedMilliseconds);
        }
        else
        {
            _logger.LogDebug("Handled {RequestName} in {ElapsedMs}ms", requestName, sw.ElapsedMilliseconds);
        }

        return response;
    }
}

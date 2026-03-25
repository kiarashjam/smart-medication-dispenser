# Monitoring & Observability

**Smart Medication Dispenser — Monitoring, Logging, Alerting & Observability Strategy**

**Version 1.0 — February 2026**

---

## Document Information

| Field | Value |
|:------|:------|
| **Document Version** | 1.0 |
| **Last Updated** | February 2026 |
| **Author** | Smart Medication Dispenser Engineering Team |
| **Audience** | DevOps, Backend Engineers, SRE, Operations |
| **Related Documents** | [04_CLOUD_DEPLOYMENT.md](./04_CLOUD_DEPLOYMENT.md), [02_BACKEND_API.md](./02_BACKEND_API.md), [03_DATABASE.md](./03_DATABASE.md) |

---

## 1. Monitoring Strategy Overview

The Smart Medication Dispenser platform requires comprehensive observability to meet business SLAs (99.9% uptime Year 1, 99.95% Year 5) and performance targets (API <200ms p95, event-to-alert <30s). Our monitoring strategy covers three pillars: **Metrics**, **Logs**, and **Traces**.

### 1.1 Observability Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MONITORING DATA FLOW ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    APPLICATION LAYER                                  │    │
│  │                                                                      │    │
│  │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐           │    │
│  │   │ ASP.NET Core │   │   React Web  │   │ React Native │           │    │
│  │   │     API      │   │    Portal    │   │  Mobile App  │           │    │
│  │   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘           │    │
│  │          │                  │                   │                   │    │
│  │          │ OpenTelemetry    │ Custom Events     │ Custom Events     │    │
│  │          │ Application      │ (User Actions)    │ (User Actions)    │    │
│  │          │ Insights         │                   │                   │    │
│  │          │                  │                   │                   │    │
│  └──────────┼──────────────────┼───────────────────┼───────────────────┘    │
│             │                  │                   │                        │
│             ▼                  ▼                   ▼                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    INSTRUMENTATION LAYER                             │    │
│  │                                                                      │    │
│  │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐           │    │
│  │   │  Serilog     │   │ OpenTelemetry│   │  Custom      │           │    │
│  │   │  (Logging)   │   │  (Metrics &  │   │  Counters    │           │    │
│  │   │              │   │   Traces)    │   │              │           │    │
│  │   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘           │    │
│  │          │                  │                   │                   │    │
│  └──────────┼──────────────────┼───────────────────┼───────────────────┘    │
│             │                  │                   │                        │
│             ▼                  ▼                   ▼                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    COLLECTION & STORAGE LAYER                         │    │
│  │                                                                      │    │
│  │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐           │    │
│  │   │     Seq      │   │ Application  │   │  Prometheus   │           │    │
│  │   │  (Logs)      │   │  Insights    │   │  (Metrics)    │           │    │
│  │   │              │   │  (APM)       │   │               │           │    │
│  │   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘           │    │
│  │          │                  │                   │                   │    │
│  └──────────┼──────────────────┼───────────────────┼───────────────────┘    │
│             │                  │                   │                        │
│             ▼                  ▼                   ▼                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    VISUALIZATION & ALERTING LAYER                    │    │
│  │                                                                      │    │
│  │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐           │    │
│  │   │   Grafana    │   │   Azure       │   │  PagerDuty   │           │    │
│  │   │ (Dashboards) │   │  Monitor     │   │  (Alerts)    │           │    │
│  │   │              │   │  (Alerts)    │   │              │           │    │
│  │   └──────────────┘   └──────────────┘   └──────────────┘           │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    DEVICE FLEET MONITORING                            │    │
│  │                                                                      │    │
│  │   ┌──────────────┐                                                  │    │
│  │   │   ESP32-S3   │                                                  │    │
│  │   │   Devices    │                                                  │    │
│  │   │              │                                                  │    │
│  │   │ Heartbeat    │                                                  │    │
│  │   │ Telemetry    │                                                  │    │
│  │   │ Error Codes  │                                                  │    │
│  │   └──────┬───────┘                                                  │    │
│  │          │ Device API (/api/v1/heartbeat)                           │    │
│  │          ▼                                                           │    │
│  │   ┌──────────────┐                                                  │    │
│  │   │   Backend    │                                                  │    │
│  │   │   Processing │                                                  │    │
│  │   │   & Storage  │                                                  │    │
│  │   └──────┬───────┘                                                  │    │
│  │          │                                                           │    │
│  │          ▼                                                           │    │
│  │   Device Metrics Aggregation → Grafana Dashboard                      │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Monitoring Objectives

| Objective | Target | Measurement |
|:----------|:-------|:------------|
| **Uptime SLA** | 99.9% Year 1, 99.95% Year 5 | Monthly uptime calculation |
| **API Performance** | <200ms p95 response time | Request duration percentiles |
| **Error Rate** | <0.1% of requests | HTTP 5xx / total requests |
| **Device Connectivity** | <5min offline detection | Heartbeat interval (60s) × 3 |
| **Alert Latency** | Event-to-alert <30s | Time from event to notification |
| **Database Performance** | <100ms p95 query time | PostgreSQL query duration |

---

## 2. Application Monitoring

### 2.1 ASP.NET Core Health Checks

Health checks provide readiness and liveness probes for Kubernetes/Docker orchestration and load balancers.

#### 2.1.1 Health Check Endpoints

| Endpoint | Purpose | Check Type | Frequency |
|:---------|:--------|:-----------|:----------|
| `/health` | Overall health | Readiness | 10s |
| `/health/live` | Liveness probe | Liveness | 30s |
| `/health/ready` | Readiness probe | Readiness | 10s |
| `/health/db` | Database connectivity | Readiness | 10s |

#### 2.1.2 Health Check Implementation

```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddNpgSql(
        connectionString: builder.Configuration.GetConnectionString("DefaultConnection"),
        name: "postgresql",
        failureStatus: HealthStatus.Unhealthy,
        tags: new[] { "db", "sql", "postgresql" })
    .AddCheck<DeviceHeartbeatHealthCheck>(
        name: "device_heartbeat",
        failureStatus: HealthStatus.Degraded,
        tags: new[] { "devices", "fleet" });

app.MapHealthChecks("/health");
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false // No checks for liveness
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("db") || check.Tags.Contains("devices")
});
```

#### 2.1.3 Health Check Response Format

**Healthy Response (200):**
```json
{
  "status": "Healthy",
  "totalDuration": "00:00:00.0123456",
  "entries": {
    "postgresql": {
      "status": "Healthy",
      "duration": "00:00:00.0054321",
      "tags": ["db", "sql", "postgresql"]
    },
    "device_heartbeat": {
      "status": "Healthy",
      "duration": "00:00:00.0012345",
      "tags": ["devices", "fleet"]
    }
  }
}
```

**Unhealthy Response (503):**
```json
{
  "status": "Unhealthy",
  "totalDuration": "00:00:00.0123456",
  "entries": {
    "postgresql": {
      "status": "Unhealthy",
      "duration": "00:00:05.0000000",
      "exception": "Connection timeout",
      "tags": ["db", "sql", "postgresql"]
    }
  }
}
```

### 2.2 Request Metrics

#### 2.2.1 Key Metrics Tracked

| Metric | Description | Unit | Aggregation |
|:-------|:------------|:-----|:------------|
| `http_request_duration_seconds` | Request response time | seconds | histogram (p50, p95, p99) |
| `http_requests_total` | Total HTTP requests | count | counter |
| `http_request_errors_total` | HTTP 4xx/5xx errors | count | counter |
| `http_request_size_bytes` | Request payload size | bytes | histogram |
| `http_response_size_bytes` | Response payload size | bytes | histogram |
| `active_requests` | Currently processing requests | count | gauge |

#### 2.2.2 OpenTelemetry Instrumentation

```csharp
// Program.cs
builder.Services.AddOpenTelemetry()
    .WithTracing(builder => builder
        .AddAspNetCoreInstrumentation(options =>
        {
            options.RecordException = true;
            options.EnrichWithHttpRequest = (activity, request) =>
            {
                activity.SetTag("http.user_agent", request.Headers.UserAgent.ToString());
                activity.SetTag("http.client_ip", request.HttpContext.Connection.RemoteIpAddress?.ToString());
            };
        })
        .AddEntityFrameworkCoreInstrumentation(options =>
        {
            options.SetDbStatementForText = true;
            options.EnrichWithIDbCommand = (activity, command) =>
            {
                activity.SetTag("db.operation", command.CommandText.Substring(0, Math.Min(50, command.CommandText.Length)));
            };
        })
        .AddSource("SmartMedicationDispenser.*")
        .AddAzureMonitorTraceExporter())
    .WithMetrics(builder => builder
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddRuntimeInstrumentation()
        .AddProcessInstrumentation()
        .AddAzureMonitorMetricExporter());
```

#### 2.2.3 Custom Business Metrics

```csharp
// Application/Monitoring/MetricsService.cs
public class MetricsService
{
    private readonly Counter<int> _dosesDispensedCounter;
    private readonly Counter<int> _dosesConfirmedCounter;
    private readonly Counter<int> _dosesMissedCounter;
    private readonly Histogram<double> _adherenceRateHistogram;
    private readonly Gauge<int> _activeDevicesGauge;
    private readonly Gauge<int> _offlineDevicesGauge;

    public MetricsService(IMeterFactory meterFactory)
    {
        var meter = meterFactory.Create("SmartMedicationDispenser.Business");
        
        _dosesDispensedCounter = meter.CreateCounter<int>(
            "doses_dispensed_total",
            "count",
            "Total number of doses dispensed");
        
        _dosesConfirmedCounter = meter.CreateCounter<int>(
            "doses_confirmed_total",
            "count",
            "Total number of doses confirmed as taken");
        
        _dosesMissedCounter = meter.CreateCounter<int>(
            "doses_missed_total",
            "count",
            "Total number of missed doses");
        
        _adherenceRateHistogram = meter.CreateHistogram<double>(
            "adherence_rate",
            "percentage",
            "Patient adherence rate (0-100)");
        
        _activeDevicesGauge = meter.CreateGauge<int>(
            "active_devices",
            "count",
            "Number of devices that sent heartbeat in last 5 minutes");
        
        _offlineDevicesGauge = meter.CreateGauge<int>(
            "offline_devices",
            "count",
            "Number of devices offline (>3x heartbeat interval)");
    }

    public void RecordDoseDispensed(string deviceId, string medicationName)
    {
        _dosesDispensedCounter.Add(1, new KeyValuePair<string, object?>("device_id", deviceId),
            new KeyValuePair<string, object?>("medication", medicationName));
    }

    public void RecordDoseConfirmed(string deviceId, string medicationName)
    {
        _dosesConfirmedCounter.Add(1, new KeyValuePair<string, object?>("device_id", deviceId),
            new KeyValuePair<string, object?>("medication", medicationName));
    }

    public void RecordDoseMissed(string deviceId, string medicationName)
    {
        _dosesMissedCounter.Add(1, new KeyValuePair<string, object?>("device_id", deviceId),
            new KeyValuePair<string, object?>("medication", medicationName));
    }

    public void RecordAdherenceRate(string userId, double rate)
    {
        _adherenceRateHistogram.Record(rate, new KeyValuePair<string, object?>("user_id", userId));
    }

    public void UpdateActiveDevices(int count)
    {
        _activeDevicesGauge.Record(count);
    }

    public void UpdateOfflineDevices(int count)
    {
        _offlineDevicesGauge.Record(count);
    }
}
```

### 2.3 Exception Tracking and Error Logging

#### 2.3.1 Exception Categories

| Category | Examples | Severity | Alert Threshold |
|:---------|:----------|:---------|:----------------|
| **Database Errors** | Connection timeout, query timeout, deadlock | Critical | >5 in 5min |
| **Authentication Errors** | Invalid JWT, expired token, unauthorized | Warning | >100 in 5min |
| **Validation Errors** | Invalid request payload, missing fields | Info | N/A |
| **Business Logic Errors** | Device not found, schedule conflict | Warning | >50 in 5min |
| **External Service Errors** | Webhook delivery failure, third-party API timeout | Warning | >10 in 5min |

#### 2.3.2 Global Exception Handler

```csharp
// Api/Middleware/GlobalExceptionHandler.cs
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IHostEnvironment _environment;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, 
            "Unhandled exception: {ExceptionType} | Path: {Path} | Method: {Method}",
            exception.GetType().Name,
            httpContext.Request.Path,
            httpContext.Request.Method);

        var problemDetails = new ProblemDetails
        {
            Status = exception switch
            {
                ValidationException => StatusCodes.Status400BadRequest,
                NotFoundException => StatusCodes.Status404NotFound,
                UnauthorizedException => StatusCodes.Status401Unauthorized,
                _ => StatusCodes.Status500InternalServerError
            },
            Title = exception.GetType().Name,
            Detail = _environment.IsDevelopment() ? exception.ToString() : "An error occurred"
        };

        // Add correlation ID for tracing
        problemDetails.Extensions["correlationId"] = Activity.Current?.Id ?? httpContext.TraceIdentifier;
        problemDetails.Extensions["timestamp"] = DateTime.UtcNow;

        httpContext.Response.StatusCode = problemDetails.Status.Value;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
```

---

## 3. Infrastructure Monitoring

### 3.1 Docker Container Metrics

#### 3.1.1 Container Health Metrics

| Metric | Description | Threshold | Alert Level |
|:-------|:------------|:----------|:------------|
| `container_cpu_usage_percent` | CPU utilization | >80% for 5min | Warning |
| `container_memory_usage_bytes` | Memory consumption | >90% of limit | Critical |
| `container_restart_count` | Container restart count | >3 in 1 hour | Critical |
| `container_uptime_seconds` | Container uptime | <300s (frequent restarts) | Warning |

#### 3.1.2 Prometheus Container Exporter

```yaml
# docker-compose.yml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    ports:
      - "9090:9090"

  node-exporter:
    image: prom/node-exporter:latest
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    ports:
      - "9100:9100"

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    ports:
      - "8080:8080"
```

### 3.2 PostgreSQL Monitoring

#### 3.2.1 Database Metrics Tracked

| Metric | Description | Threshold | Alert Level |
|:-------|:------------|:----------|:------------|
| `postgresql_connections_active` | Active connections | >80% of max_connections | Warning |
| `postgresql_connections_idle` | Idle connections | >100 | Info |
| `postgresql_query_duration_seconds` | Query execution time | p95 >100ms | Warning |
| `postgresql_transactions_total` | Transaction count | N/A | Info |
| `postgresql_replication_lag_seconds` | Replication lag (if replicated) | >5s | Critical |
| `postgresql_database_size_bytes` | Database size | >80% of disk | Warning |
| `postgresql_cache_hit_ratio` | Cache hit ratio | <95% | Warning |

#### 3.2.2 PostgreSQL Exporter Configuration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'postgresql'
    static_configs:
      - targets: ['postgres-exporter:9187']
    scrape_interval: 15s
```

#### 3.2.3 Slow Query Logging

```sql
-- Enable slow query logging in PostgreSQL
ALTER SYSTEM SET log_min_duration_statement = 100; -- Log queries >100ms
ALTER SYSTEM SET log_statement = 'all'; -- Optional: log all statements
SELECT pg_reload_conf();
```

### 3.3 Network Monitoring

#### 3.3.1 Network Metrics

| Metric | Description | Threshold | Alert Level |
|:-------|:------------|:----------|:------------|
| `network_latency_ms` | Round-trip time to database | >50ms | Warning |
| `network_dns_resolution_ms` | DNS lookup time | >100ms | Warning |
| `network_packet_loss_percent` | Packet loss rate | >1% | Critical |
| `network_bandwidth_usage_bytes` | Network throughput | >80% of capacity | Warning |

---

## 4. Device Fleet Monitoring

### 4.1 Device Heartbeat Monitoring

#### 4.1.1 Heartbeat Interval and Detection

| Parameter | Value | Description |
|:----------|:------|:------------|
| **Heartbeat Interval** | 60 seconds | Expected time between heartbeats |
| **Offline Threshold** | 180 seconds (3× interval) | Device considered offline if no heartbeat for 3 intervals |
| **Stale Threshold** | 300 seconds (5 minutes) | Device considered stale if offline >5min (warning alert) |
| **Heartbeat Endpoint** | `POST /api/v1/heartbeat` | Device API endpoint |

#### 4.1.2 Heartbeat Payload

```json
{
  "deviceId": "ESP32-ABC123",
  "firmwareVersion": "1.2.3",
  "batteryLevel": 85,
  "wifiSignalStrength": -65,
  "cellularSignalStrength": -75,
  "temperature": 22.5,
  "errorCodes": [],
  "lastDispenseTime": "2026-02-10T14:30:00Z",
  "containerStatus": [
    { "containerId": 1, "quantity": 25, "status": "ok" },
    { "containerId": 2, "quantity": 0, "status": "empty" }
  ]
}
```

#### 4.1.3 Device Status Calculation

```csharp
// Application/Devices/Queries/GetDeviceStatus.cs
public class DeviceStatus
{
    public string DeviceId { get; set; }
    public DeviceOnlineStatus Status { get; set; }
    public DateTime? LastHeartbeat { get; set; }
    public TimeSpan? TimeSinceLastHeartbeat { get; set; }
    public int BatteryLevel { get; set; }
    public string FirmwareVersion { get; set; }
}

public enum DeviceOnlineStatus
{
    Online,        // Last heartbeat < 180s
    Offline,       // Last heartbeat >= 180s and < 300s
    Stale          // Last heartbeat >= 300s
}

// Handler logic
var timeSinceLastHeartbeat = DateTime.UtcNow - device.LastHeartbeatAt;
var status = timeSinceLastHeartbeat.TotalSeconds switch
{
    < 180 => DeviceOnlineStatus.Online,
    < 300 => DeviceOnlineStatus.Offline,
    _ => DeviceOnlineStatus.Stale
};
```

### 4.2 Firmware Version Tracking

#### 4.2.1 Firmware Distribution Dashboard

Track firmware versions across the fleet to identify:
- Devices requiring updates
- Rollout progress for new firmware versions
- Compatibility issues with specific versions

| Firmware Version | Device Count | Percentage | Status |
|:-----------------|:-------------|:-----------|:-------|
| 1.2.3 (latest) | 8,500 | 87.6% | Current |
| 1.2.2 | 950 | 9.8% | Update available |
| 1.2.1 | 250 | 2.6% | Update available |
| <1.2.0 | 0 | 0% | Critical update |

### 4.3 Battery Level Aggregation

#### 4.3.1 Battery Monitoring Metrics

| Metric | Description | Threshold | Alert Level |
|:-------|:------------|:----------|:------------|
| `device_battery_level_percent` | Individual device battery | <20% | Warning |
| `device_battery_level_percent` | Individual device battery | <10% | Critical |
| `fleet_battery_average` | Average battery across fleet | <30% | Info |
| `devices_low_battery_count` | Count of devices <20% | >100 | Warning |

### 4.4 Error Code Frequency Analysis

#### 4.4.1 Common Device Error Codes

| Error Code | Description | Severity | Action |
|:-----------|:------------|:---------|:-------|
| `E001` | Container jammed | Critical | Alert caregiver, schedule maintenance |
| `E002` | Low battery | Warning | Notify user to charge |
| `E003` | WiFi connection lost | Warning | Check network connectivity |
| `E004` | Cellular connection lost | Warning | Check SIM card, signal strength |
| `E005` | Container empty | Info | Low stock alert already triggered |
| `E006` | Temperature out of range | Warning | Check device location |
| `E007` | Motor failure | Critical | Schedule device replacement |

#### 4.4.2 Error Code Aggregation Query

```sql
-- Error code frequency analysis
SELECT 
    error_code,
    COUNT(*) as occurrence_count,
    COUNT(DISTINCT device_id) as affected_devices,
    MAX(occurred_at) as last_occurrence
FROM device_event_logs
WHERE error_code IS NOT NULL
  AND occurred_at >= NOW() - INTERVAL '24 hours'
GROUP BY error_code
ORDER BY occurrence_count DESC;
```

### 4.5 Connectivity Quality Tracking

#### 4.5.1 Signal Strength Metrics

| Metric | Description | Threshold | Alert Level |
|:-------|:------------|:----------|:------------|
| `device_wifi_signal_dbm` | WiFi signal strength | <-80 dBm | Warning |
| `device_cellular_signal_dbm` | Cellular signal strength | <-100 dBm | Warning |
| `device_connectivity_quality` | Calculated quality score | <50/100 | Warning |

#### 4.5.2 Connectivity Quality Score

```csharp
public int CalculateConnectivityQuality(int? wifiSignal, int? cellularSignal, bool isWifiConnected)
{
    if (isWifiConnected && wifiSignal.HasValue)
    {
        // WiFi signal: -30 (excellent) to -90 (poor)
        return wifiSignal.Value switch
        {
            >= -50 => 100,
            >= -60 => 90,
            >= -70 => 75,
            >= -80 => 50,
            _ => 25
        };
    }
    
    if (cellularSignal.HasValue)
    {
        // Cellular signal: -50 (excellent) to -120 (poor)
        return cellularSignal.Value switch
        {
            >= -70 => 100,
            >= -80 => 90,
            >= -90 => 75,
            >= -100 => 50,
            _ => 25
        };
    }
    
    return 0; // No connectivity data
}
```

---

## 5. Alerting Rules

### 5.1 Critical Alerts

Critical alerts require immediate response and may impact SLA compliance.

| Alert Name | Condition | Threshold | Notification Channels | Escalation |
|:-----------|:----------|:----------|:---------------------|:-----------|
| **API Down** | Health check `/health` returns 503 | 1 failure | Slack, Email, PagerDuty | Immediate |
| **Database Unreachable** | PostgreSQL connection timeout | 3 failures in 1min | Slack, Email, PagerDuty | Immediate |
| **High Error Rate** | HTTP 5xx error rate | >1% for 5min | Slack, Email | 10min → PagerDuty |
| **Missed Dose Cascade** | >10 missed doses in 5min | 10 events | Slack, Email | 5min → PagerDuty |
| **Device Offline Critical** | >50 devices offline simultaneously | 50 devices | Slack, Email | 15min → PagerDuty |
| **Database Disk Full** | Disk usage >95% | 95% | Slack, Email, PagerDuty | Immediate |
| **Container Crash Loop** | Container restarts >5 in 10min | 5 restarts | Slack, Email, PagerDuty | Immediate |

### 5.2 Warning Alerts

Warning alerts indicate potential issues that should be investigated.

| Alert Name | Condition | Threshold | Notification Channels | Escalation |
|:-----------|:----------|:----------|:---------------------|:-----------|
| **High Error Rate** | HTTP 5xx error rate | >0.5% for 10min | Slack | 30min → Email |
| **Slow API Response** | p95 response time | >200ms for 10min | Slack | 30min → Email |
| **Slow Database Queries** | p95 query time | >100ms for 10min | Slack | 30min → Email |
| **Device Offline** | Device offline >5min | 1 device | Slack | N/A |
| **High CPU Usage** | Container CPU | >80% for 15min | Slack | 30min → Email |
| **High Memory Usage** | Container memory | >85% for 15min | Slack | 30min → Email |
| **Low Battery** | Device battery <20% | 1 device | Slack | N/A |
| **Replication Lag** | PostgreSQL replication lag | >5s for 5min | Slack | 15min → Email |

### 5.3 Info Alerts

Info alerts provide visibility into system state and trends.

| Alert Name | Condition | Threshold | Notification Channels |
|:-----------|:----------|:----------|:---------------------|
| **Firmware Update Available** | New firmware version released | N/A | Slack (daily digest) |
| **Low Stock Trend** | Multiple devices low stock | >20 devices | Slack (daily digest) |
| **High Adherence Rate** | Patient adherence >95% | N/A | Slack (weekly report) |
| **Scheduled Maintenance** | Planned maintenance window | N/A | Email, Slack |

### 5.4 Escalation Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ALERT ESCALATION MATRIX                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Level 1: Slack Notification                                                 │
│  ├─ Immediate for all alerts                                                │
│  ├─ Channel: #alerts-production                                            │
│  └─ Format: @here [SEVERITY] Alert: {message}                              │
│                                                                              │
│  Level 2: Email Notification                                                │
│  ├─ Triggered after: 10-30min (based on severity)                          │
│  ├─ Recipients: devops@smartdispenser.ch, oncall@smartdispenser.ch         │
│  └─ Format: [ALERT] {alert_name} - {details}                               │
│                                                                              │
│  Level 3: PagerDuty                                                         │
│  ├─ Triggered for: Critical alerts immediately, warnings after escalation   │
│  ├─ On-call rotation: Primary → Secondary → Manager                         │
│  └─ Escalation: 15min → 30min → 1hour                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.5 Alert Configuration Example (Prometheus)

```yaml
# prometheus-alerts.yml
groups:
  - name: critical_alerts
    interval: 30s
    rules:
      - alert: APIDown
        expr: up{job="api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "API is down"
          description: "API health check failed for {{ $labels.instance }}"

      - alert: DatabaseUnreachable
        expr: pg_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL database is unreachable"
          description: "Database connection failed for {{ $labels.instance }}"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} (threshold: 1%)"

  - name: warning_alerts
    interval: 1m
    rules:
      - alert: SlowAPIResponse
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[10m])) > 0.2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow API response time"
          description: "p95 response time is {{ $value }}s (threshold: 200ms)"

      - alert: DeviceOffline
        expr: time() - device_last_heartbeat_timestamp > 300
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Device offline"
          description: "Device {{ $labels.device_id }} has been offline for {{ $value }}s"
```

---

## 6. Logging Strategy

### 6.1 Structured Logging with Serilog

#### 6.1.1 Serilog Configuration

```csharp
// Program.cs
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("System", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "SmartMedicationDispenser")
    .Enrich.WithProperty("Environment", builder.Environment.EnvironmentName)
    .Enrich.WithMachineName()
    .Enrich.WithThreadId()
    .WriteTo.Console(outputTemplate: 
        "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .WriteTo.Seq(serverUrl: builder.Configuration["Seq:ServerUrl"])
    .WriteTo.File(
        path: "logs/app-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();
```

#### 6.1.2 Log Levels and Usage

| Log Level | When to Use | Examples | Retention |
|:----------|:------------|:---------|:----------|
| **Trace** | Detailed diagnostic information | Method entry/exit, variable values | 7 days |
| **Debug** | Diagnostic information for debugging | SQL queries, intermediate calculations | 30 days |
| **Information** | General application flow | User login, dose dispensed, API calls | 90 days |
| **Warning** | Unexpected but handled situations | Retry attempts, validation failures | 90 days |
| **Error** | Errors that don't stop execution | Exception caught and handled | 7 years |
| **Critical** | Critical failures requiring immediate attention | Database down, security breach | 7 years |

#### 6.1.3 Logging Examples

```csharp
// Information log
_logger.LogInformation(
    "Dose dispensed: DeviceId={DeviceId}, ContainerId={ContainerId}, Medication={Medication}, UserId={UserId}",
    deviceId, containerId, medicationName, userId);

// Warning log
_logger.LogWarning(
    "Device heartbeat delayed: DeviceId={DeviceId}, ExpectedInterval={ExpectedInterval}s, ActualInterval={ActualInterval}s",
    deviceId, 60, actualInterval);

// Error log with exception
_logger.LogError(exception,
    "Failed to deliver webhook: WebhookId={WebhookId}, Endpoint={Endpoint}, Attempt={Attempt}",
    webhookId, endpoint, attempt);

// Critical log
_logger.LogCritical(
    "Database connection pool exhausted: ActiveConnections={ActiveConnections}, MaxConnections={MaxConnections}",
    activeConnections, maxConnections);
```

### 6.2 Correlation IDs for Request Tracing

#### 6.2.1 Correlation ID Middleware

```csharp
// Api/Middleware/CorrelationIdMiddleware.cs
public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;
    private const string CorrelationIdHeader = "X-Correlation-ID";

    public CorrelationIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers[CorrelationIdHeader].FirstOrDefault() 
            ?? context.TraceIdentifier 
            ?? Guid.NewGuid().ToString();

        context.Items["CorrelationId"] = correlationId;
        context.Response.Headers[CorrelationIdHeader] = correlationId;

        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}

// Usage in Program.cs
app.UseMiddleware<CorrelationIdMiddleware>();
```

#### 6.2.2 Correlation ID Propagation

```csharp
// Application layer automatically includes correlation ID in logs
public class DispenseDoseCommandHandler : IRequestHandler<DispenseDoseCommand, DispenseDoseResult>
{
    private readonly ILogger<DispenseDoseCommandHandler> _logger;

    public async Task<DispenseDoseResult> Handle(DispenseDoseCommand request, CancellationToken cancellationToken)
    {
        // Correlation ID automatically included via LogContext
        _logger.LogInformation("Processing dispense request: DeviceId={DeviceId}", request.DeviceId);
        
        // All subsequent logs in this request will include the same correlation ID
        // ...
    }
}
```

### 6.3 Log Retention Policy

| Log Type | Retention Period | Storage Location | Reason |
|:---------|:-----------------|:-----------------|:-------|
| **Debug Logs** | 30 days | File system, Seq | Short-term debugging |
| **Application Logs** | 90 days | Seq, Azure Blob Storage | Operational analysis |
| **Error Logs** | 7 years | Azure Blob Storage (cold tier) | Compliance, audit |
| **Audit Logs** | 7 years | Azure Blob Storage (archive tier) | Regulatory compliance |
| **Access Logs** | 1 year | Azure Blob Storage | Security analysis |

### 6.4 PII Redaction in Logs

#### 6.4.1 PII Redaction Middleware

```csharp
// Api/Middleware/PiiRedactionMiddleware.cs
public class PiiRedactionMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly Regex EmailRegex = new Regex(@"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b");
    private static readonly Regex PhoneRegex = new Regex(@"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b");
    private static readonly Regex SsnRegex = new Regex(@"\b\d{3}-\d{2}-\d{4}\b");

    public async Task InvokeAsync(HttpContext context)
    {
        // Redact PII from request/response before logging
        // Implementation details...
        await _next(context);
    }

    private string RedactPii(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;

        input = EmailRegex.Replace(input, "[EMAIL_REDACTED]");
        input = PhoneRegex.Replace(input, "[PHONE_REDACTED]");
        input = SsnRegex.Replace(input, "[SSN_REDACTED]");
        
        return input;
    }
}
```

#### 6.4.2 PII Fields to Redact

| Field Type | Example | Redacted Format |
|:-----------|:--------|:----------------|
| Email | `user@example.com` | `[EMAIL_REDACTED]` |
| Phone Number | `+41 21 123 4567` | `[PHONE_REDACTED]` |
| SSN | `123-45-6789` | `[SSN_REDACTED]` |
| Credit Card | `4532-1234-5678-9010` | `[CARD_REDACTED]` |
| Password | Any password field | `[PASSWORD_REDACTED]` |

---

## 7. Dashboards

### 7.1 Operations Dashboard

The operations dashboard provides real-time visibility into system health and performance.

#### 7.1.1 Key Metrics Displayed

| Panel | Metric | Refresh Interval |
|:------|:-------|:-----------------|
| **System Uptime** | Current uptime percentage | 1min |
| **API Response Time** | p50, p95, p99 response times | 30s |
| **Error Rate** | HTTP 5xx errors per minute | 30s |
| **Request Throughput** | Requests per second | 30s |
| **Active Connections** | Database active connections | 30s |
| **Container Health** | CPU, memory, restart count | 30s |
| **Recent Alerts** | Last 20 alerts | 1min |

#### 7.1.2 Grafana Dashboard JSON Structure

```json
{
  "dashboard": {
    "title": "Smart Medication Dispenser - Operations",
    "panels": [
      {
        "title": "API Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "p95"
          }
        ],
        "yaxes": [{"format": "s", "label": "Response Time"}]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx Errors/sec"
          }
        ],
        "yaxes": [{"format": "reqps", "label": "Errors/sec"}]
      }
    ]
  }
}
```

### 7.2 Business Dashboard

The business dashboard tracks key business metrics and user engagement.

#### 7.2.1 Key Metrics Displayed

| Panel | Metric | Description |
|:------|:-------|:------------|
| **Active Users** | Users logged in last 24h | Daily active users |
| **Active Devices** | Devices online in last 5min | Fleet connectivity |
| **Doses Dispensed Today** | Total doses dispensed | Daily dispensing volume |
| **Doses Confirmed** | Confirmed doses today | User adherence |
| **Doses Missed** | Missed doses today | Adherence gaps |
| **Adherence Rate** | Percentage of doses taken | Overall adherence |
| **Low Stock Alerts** | Devices with low stock | Inventory management |

### 7.3 Device Fleet Dashboard

The device fleet dashboard provides comprehensive visibility into device health and status.

#### 7.3.1 Key Metrics Displayed

| Panel | Metric | Description |
|:------|:-------|:------------|
| **Online/Offline Status** | Count by status | Real-time device connectivity |
| **Firmware Distribution** | Devices by firmware version | Update tracking |
| **Battery Levels** | Average and distribution | Power management |
| **Error Code Frequency** | Top error codes last 24h | Issue identification |
| **Connectivity Quality** | WiFi/Cellular signal strength | Network health |
| **Geographic Distribution** | Devices by region (if available) | Geographic insights |

### 7.4 B2B Partner Dashboard

The B2B partner dashboard provides tenant-specific metrics for multi-tenant deployments.

#### 7.4.1 Per-Tenant Metrics

| Metric | Description | Aggregation |
|:-------|:------------|:------------|
| **Tenant Active Users** | Users per tenant | Count |
| **Tenant Device Count** | Devices per tenant | Count |
| **Tenant Adherence Rate** | Average adherence per tenant | Percentage |
| **Tenant API Usage** | API calls per tenant | Count, rate |
| **Tenant Error Rate** | Errors per tenant | Percentage |

---

## 8. Tools & Stack

### 8.1 Application Performance Monitoring (APM)

#### 8.1.1 Azure Application Insights

**Purpose:** APM, distributed tracing, exception tracking

**Configuration:**
```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
    options.EnableAdaptiveSampling = true;
    options.EnableQuickPulseMetricStream = true;
});

builder.Services.ConfigureTelemetryModule<DependencyTrackingTelemetryModule>((module, o) =>
{
    module.EnableSqlCommandTextInstrumentation = true;
});
```

**Features Used:**
- Request tracking and performance metrics
- Dependency tracking (database, HTTP calls)
- Exception tracking and stack traces
- Custom events and metrics
- Live metrics stream
- Application map

### 8.2 Infrastructure Monitoring

#### 8.2.1 Grafana + Prometheus

**Purpose:** Infrastructure metrics, alerting, dashboards

**Stack Components:**

| Component | Purpose | Port |
|:----------|:--------|:-----|
| **Prometheus** | Metrics collection and storage | 9090 |
| **Grafana** | Visualization and dashboards | 3000 |
| **Node Exporter** | Host metrics (CPU, memory, disk) | 9100 |
| **cAdvisor** | Container metrics | 8080 |
| **PostgreSQL Exporter** | Database metrics | 9187 |

**Prometheus Configuration:**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'api'
    static_configs:
      - targets: ['api:5000']
    metrics_path: '/metrics'

  - job_name: 'postgresql'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
```

### 8.3 Logging Stack

#### 8.3.1 Serilog + Seq

**Purpose:** Structured logging, log aggregation, search

**Seq Configuration:**
```csharp
.WriteTo.Seq(
    serverUrl: "https://seq.smartdispenser.ch",
    apiKey: builder.Configuration["Seq:ApiKey"],
    controlLevelSwitch: new LoggingLevelSwitch(LogEventLevel.Information))
```

**Features:**
- Structured log search and filtering
- Real-time log streaming
- Log correlation and analysis
- Alerting on log patterns
- Retention policies

#### 8.3.2 Alternative: ELK Stack (Elasticsearch, Logstash, Kibana)

For larger deployments or if Seq is not available:

| Component | Purpose |
|:----------|:--------|
| **Elasticsearch** | Log storage and indexing |
| **Logstash** | Log processing and enrichment |
| **Kibana** | Log visualization and search |
| **Filebeat** | Log shipping from containers |

### 8.4 Azure Monitor

**Purpose:** Cloud resource monitoring, Azure-specific metrics

**Resources Monitored:**
- Azure Container Instances (if used)
- Azure Database for PostgreSQL (if used)
- Azure Storage accounts
- Azure Networking (latency, throughput)
- Azure Key Vault access logs

**Azure Monitor Alerts:**
- Resource health alerts
- Metric alerts (CPU, memory, disk)
- Activity log alerts
- Log query alerts

---

## 9. SLA Monitoring

### 9.1 Uptime Calculation Methodology

#### 9.1.1 Uptime Formula

```
Uptime % = (Total Time - Downtime) / Total Time × 100

Where:
- Total Time = Minutes in month (e.g., 43,200 for 30-day month)
- Downtime = Sum of all downtime periods where:
  - Health check returns 503 for >1 minute
  - OR API is completely unreachable
  - OR Database is unreachable causing API failures
```

#### 9.1.2 Excluded from Downtime

| Scenario | Exclusion Reason |
|:---------|:-----------------|
| **Planned maintenance** | Scheduled maintenance windows (<4 hours/month) |
| **Third-party outages** | Azure, DNS provider outages |
| **DDoS attacks** | External attacks mitigated by Azure DDoS Protection |
| **User errors** | Invalid requests, authentication failures |

#### 9.1.3 Uptime Tracking Implementation

```csharp
// Infrastructure/Monitoring/UptimeTracker.cs
public class UptimeTracker
{
    private readonly ILogger<UptimeTracker> _logger;
    private readonly IHealthCheckService _healthCheckService;
    private DateTime? _downtimeStart;
    private readonly List<DowntimePeriod> _downtimePeriods = new();

    public async Task RecordHealthCheckAsync()
    {
        var result = await _healthCheckService.CheckHealthAsync();
        
        if (result.Status == HealthStatus.Unhealthy)
        {
            if (_downtimeStart == null)
            {
                _downtimeStart = DateTime.UtcNow;
                _logger.LogWarning("Downtime started at {StartTime}", _downtimeStart);
            }
        }
        else
        {
            if (_downtimeStart != null)
            {
                var downtimeDuration = DateTime.UtcNow - _downtimeStart.Value;
                if (downtimeDuration.TotalMinutes >= 1) // Only count >1min downtime
                {
                    _downtimePeriods.Add(new DowntimePeriod
                    {
                        Start = _downtimeStart.Value,
                        End = DateTime.UtcNow,
                        Duration = downtimeDuration
                    });
                    _logger.LogWarning("Downtime ended. Duration: {Duration} minutes", downtimeDuration.TotalMinutes);
                }
                _downtimeStart = null;
            }
        }
    }

    public double CalculateMonthlyUptime(DateTime monthStart, DateTime monthEnd)
    {
        var totalMinutes = (monthEnd - monthStart).TotalMinutes;
        var downtimeMinutes = _downtimePeriods
            .Where(d => d.Start >= monthStart && d.End <= monthEnd)
            .Sum(d => d.Duration.TotalMinutes);
        
        return ((totalMinutes - downtimeMinutes) / totalMinutes) * 100;
    }
}
```

### 9.2 Error Budget Tracking

#### 9.2.1 Error Budget Calculation

```
Error Budget = 100% - SLA Target

Year 1: Error Budget = 100% - 99.9% = 0.1% (43.2 minutes/month)
Year 5: Error Budget = 100% - 99.95% = 0.05% (21.6 minutes/month)

Remaining Budget = Error Budget - Actual Downtime
```

#### 9.2.2 Error Budget Dashboard

| Month | SLA Target | Error Budget | Actual Downtime | Remaining Budget | Status |
|:------|:-----------|:-------------|:----------------|:-----------------|:-------|
| January 2026 | 99.9% | 43.2 min | 12.5 min | 30.7 min | ✅ Within budget |
| February 2026 | 99.9% | 43.2 min | 8.3 min | 34.9 min | ✅ Within budget |
| March 2026 | 99.9% | 43.2 min | 52.1 min | -8.9 min | ❌ Budget exceeded |

### 9.3 Monthly SLA Reports

#### 9.3.1 Report Contents

1. **Executive Summary**
   - Uptime percentage vs. target
   - Error budget status
   - Critical incidents summary

2. **Detailed Metrics**
   - Daily uptime breakdown
   - Downtime incidents (duration, cause, resolution)
   - Performance metrics (p95 response time, error rate)
   - Device fleet health metrics

3. **Trends and Analysis**
   - Month-over-month comparison
   - Performance trends
   - Capacity planning insights

4. **Action Items**
   - Remediation plans for SLA misses
   - Infrastructure improvements
   - Process improvements

#### 9.3.2 Report Generation

```csharp
// Application/Reporting/Queries/GenerateSlaReport.cs
public class GenerateSlaReportQuery : IRequest<SlaReportDto>
{
    public DateTime MonthStart { get; set; }
    public DateTime MonthEnd { get; set; }
}

public class SlaReportDto
{
    public double UptimePercentage { get; set; }
    public double TargetUptime { get; set; }
    public TimeSpan TotalDowntime { get; set; }
    public TimeSpan ErrorBudget { get; set; }
    public TimeSpan RemainingBudget { get; set; }
    public List<DowntimeIncidentDto> Incidents { get; set; }
    public PerformanceMetricsDto Performance { get; set; }
    public DeviceFleetMetricsDto DeviceFleet { get; set; }
}
```

---

## 10. Incident Response Integration

### 10.1 Alert → Incident Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      INCIDENT RESPONSE WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Alert Triggered                                                         │
│     ├─ Prometheus/Grafana detects threshold breach                          │
│     └─ Alert sent to Slack (#alerts-production)                             │
│                                                                              │
│  2. Alert Triage (0-5 minutes)                                              │
│     ├─ On-call engineer acknowledges alert                                  │
│     ├─ Assess severity (Critical/Warning/Info)                              │
│     └─ Create incident ticket (if Critical)                                   │
│                                                                              │
│  3. Incident Investigation (5-15 minutes)                                 │
│     ├─ Check dashboards (Operations, Infrastructure)                        │
│     ├─ Review logs (Seq/Kibana) with correlation ID                         │
│     ├─ Check runbooks for known issues                                      │
│     └─ Identify root cause                                                  │
│                                                                              │
│  4. Incident Resolution (15-60 minutes)                                     │
│     ├─ Execute remediation steps                                            │
│     ├─ Verify fix (health checks, metrics)                                  │
│     └─ Update incident ticket with resolution                                │
│                                                                              │
│  5. Post-Incident Review (within 48 hours)                                  │
│     ├─ Document incident timeline                                           │
│     ├─ Root cause analysis                                                  │
│     ├─ Action items for prevention                                          │
│     └─ Update runbooks if needed                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Runbooks for Common Issues

#### 10.2.1 Runbook: API High Error Rate

**Symptoms:**
- Error rate >1% for 5 minutes
- HTTP 5xx responses increasing
- Alert: "HighErrorRate"

**Investigation Steps:**
1. Check `/health` endpoint status
2. Review Application Insights for exception patterns
3. Check database connectivity (`/health/db`)
4. Review recent deployments or configuration changes
5. Check container resource usage (CPU, memory)

**Resolution Steps:**
1. **If database issue:** Check PostgreSQL logs, connection pool, restart if needed
2. **If memory issue:** Scale up container memory, check for memory leaks
3. **If code issue:** Rollback recent deployment if applicable
4. **If external dependency:** Check third-party service status, implement circuit breaker

**Verification:**
- Monitor error rate for 10 minutes
- Confirm `/health` returns 200
- Verify p95 response time <200ms

#### 10.2.2 Runbook: Database Connection Pool Exhausted

**Symptoms:**
- Database health check failing
- Errors: "too many connections" or "connection timeout"
- Alert: "DatabaseUnreachable"

**Investigation Steps:**
1. Check active connections: `SELECT count(*) FROM pg_stat_activity;`
2. Check max connections: `SHOW max_connections;`
3. Identify long-running queries: `SELECT * FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '5 minutes';`

**Resolution Steps:**
1. **Kill idle connections:** `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND now() - state_change > interval '10 minutes';`
2. **Kill long-running queries** (if safe): `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE query_start < now() - interval '30 minutes';`
3. **Increase connection pool** in application configuration
4. **Scale database** if consistently hitting limits

**Verification:**
- Confirm active connections <80% of max
- Verify `/health/db` returns Healthy
- Monitor connection count for 15 minutes

#### 10.2.3 Runbook: Device Offline Cascade

**Symptoms:**
- >50 devices offline simultaneously
- Alert: "DeviceOfflineCritical"
- No recent firmware updates

**Investigation Steps:**
1. Check if devices share common characteristics (region, firmware version, network provider)
2. Review device event logs for error patterns
3. Check network connectivity (DNS, internet gateway)
4. Verify device API endpoint is accessible

**Resolution Steps:**
1. **If API issue:** Resolve API downtime (see API High Error Rate runbook)
2. **If network issue:** Check ISP/cloud provider status, DNS resolution
3. **If firmware issue:** Check for firmware bugs, prepare hotfix
4. **If regional issue:** Contact network provider, check regional infrastructure

**Verification:**
- Monitor device online count increasing
- Check device heartbeat logs
- Verify no new offline devices

### 10.3 Post-Incident Review Process

#### 10.3.1 Incident Review Template

**Incident Details:**
- **Incident ID:** INC-2026-001
- **Title:** API High Error Rate - Database Connection Pool Exhausted
- **Severity:** Critical
- **Start Time:** 2026-02-10 14:30:00 UTC
- **End Time:** 2026-02-10 14:45:00 UTC
- **Duration:** 15 minutes
- **Impact:** 0.02% downtime (within error budget)

**Timeline:**
1. **14:30:00** - Alert triggered: DatabaseUnreachable
2. **14:32:00** - On-call engineer acknowledged, started investigation
3. **14:35:00** - Root cause identified: Connection pool exhausted (200/200 connections)
4. **14:38:00** - Terminated 50 idle connections
5. **14:40:00** - Error rate returned to normal
6. **14:45:00** - Incident resolved, monitoring stable

**Root Cause:**
Connection pool configuration was set to 200 max connections, but a background job was creating long-lived connections that weren't being properly disposed, causing pool exhaustion.

**Action Items:**
1. ✅ **Immediate:** Increase connection pool to 300 (completed)
2. 🔄 **Short-term:** Fix background job connection disposal (assigned to Backend Team, due: 2026-02-17)
3. 🔄 **Medium-term:** Implement connection pool monitoring alert (assigned to DevOps, due: 2026-02-24)
4. 🔄 **Long-term:** Review all background jobs for proper connection handling (assigned to Backend Team, due: 2026-03-10)

**Lessons Learned:**
- Need better connection pool monitoring
- Background jobs need connection lifecycle management review
- Alert threshold should be lower (warn at 80% instead of 100%)

---

## 11. Monitoring Checklist

### 11.1 Pre-Production Checklist

- [ ] Health checks configured (`/health`, `/health/live`, `/health/ready`)
- [ ] OpenTelemetry/Application Insights configured
- [ ] Serilog configured with Seq/ELK
- [ ] Prometheus + Grafana deployed
- [ ] Alert rules configured in Prometheus/Grafana
- [ ] Notification channels configured (Slack, Email, PagerDuty)
- [ ] Dashboards created (Operations, Business, Device Fleet)
- [ ] Correlation ID middleware implemented
- [ ] PII redaction middleware implemented
- [ ] Log retention policies configured
- [ ] Uptime tracking implemented
- [ ] Runbooks documented

### 11.2 Production Monitoring Checklist

- [ ] All critical alerts tested
- [ ] Alert escalation paths verified
- [ ] On-call rotation configured
- [ ] Dashboards accessible to operations team
- [ ] Log access controls configured
- [ ] Monitoring documentation reviewed by team
- [ ] Incident response process documented
- [ ] SLA reporting automated

---

## 12. Future Enhancements

### 12.1 Planned Improvements

| Enhancement | Priority | Target Date | Description |
|:------------|:---------|:------------|:------------|
| **Distributed Tracing** | High | Q2 2026 | Full request tracing across services |
| **Synthetic Monitoring** | Medium | Q2 2026 | Automated health checks from external locations |
| **Anomaly Detection** | Medium | Q3 2026 | ML-based anomaly detection for metrics |
| **Cost Monitoring** | Low | Q3 2026 | Track cloud resource costs per tenant |
| **User Experience Monitoring** | High | Q2 2026 | Real User Monitoring (RUM) for web/mobile |

---

## Document History

| Version | Date | Changes | Author |
|:--------|:-----|:--------|:-------|
| 1.0 | February 2026 | Initial monitoring and observability documentation | Engineering Team |

---

## References

- [Azure Application Insights Documentation](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)
- [OpenTelemetry .NET Documentation](https://opentelemetry.io/docs/instrumentation/net/)
- [Serilog Documentation](https://serilog.net/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PostgreSQL Monitoring Best Practices](https://www.postgresql.org/docs/current/monitoring.html)

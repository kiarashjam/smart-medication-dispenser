# Compliance & Data Governance

**Smart Medication Dispenser — GDPR, nDSG, CE MDR, IEC 62304 Compliance & Data Protection**

**Version 1.0** | **February 2026**

---

## Document Information

| Field | Value |
|:------|:------|
| **Document Title** | Compliance & Data Governance |
| **Version** | 1.0 |
| **Date** | February 2026 |
| **Classification** | Confidential |
| **Device Classification** | CE MDR Class IIa Medical Device |
| **Regulatory Scope** | EU (GDPR), Switzerland (nDSG), CE MDR 2017/745 |
| **Standards** | IEC 62304, ISO 13485, ISO 14971 |
| **Hosting Region** | Azure Switzerland North (Zurich) |
| **Backend Framework** | ASP.NET Core 8 |

---

## 1. Regulatory Overview

The Smart Medication Dispenser operates as a **CE MDR Class IIa medical device** in Switzerland and the European Union. Compliance is required across multiple regulatory frameworks:

### 1.1 GDPR (EU General Data Protection Regulation)

| Requirement | Implementation |
|:------------|:---------------|
| **Legal Basis** | Art. 6(1)(b) - Contract performance; Art. 9(2)(h) - Health data processing |
| **Data Subject Rights** | Access, Rectification, Erasure, Portability, Restriction, Object (see Section 4) |
| **Data Protection Officer** | Required (DPO contact: dpo@company.com) |
| **Breach Notification** | 72 hours to supervisory authority (Art. 33) |
| **Data Protection Impact Assessment** | Completed (DPIA-2025-001) |
| **Records of Processing** | Maintained per Art. 30 |

### 1.2 Swiss nDSG (new Data Protection Act)

| Requirement | Implementation |
|:------------|:---------------|
| **Effective Date** | September 1, 2023 |
| **Legal Basis** | Art. 6(1) - Contract; Art. 8(2) - Health data |
| **FDPIC Notification** | Required for health data processing |
| **Breach Notification** | 24 hours to FDPIC (Art. 24) |
| **Data Subject Rights** | Aligned with GDPR (see Section 4) |
| **Cross-Border Transfers** | Prohibited for health data (Art. 16) |

### 1.3 CE MDR (Medical Device Regulation 2017/745)

| Requirement | Implementation |
|:------------|:---------------|
| **Device Class** | Class IIa (Rule 10 - Active therapeutic device) |
| **Notified Body** | [Notified Body Name] (NB-XXXX) |
| **CE Certificate** | [Certificate Number] |
| **Technical Documentation** | Maintained per Annex II |
| **Post-Market Surveillance** | PMS Plan (PMS-2025-001) |
| **Clinical Evaluation** | CER-2025-001 (Class B software per IEC 62304) |
| **UDI** | UDI-DI: [Device Identifier], UDI-PI: [Production Identifier] |

### 1.4 IEC 62304 (Medical Device Software Lifecycle)

| Requirement | Implementation |
|:------------|:---------------|
| **Software Safety Class** | Class B (moderate risk) |
| **Software Development Plan** | SDP-2025-001 |
| **Software Requirements Specification** | SRS-2025-001 |
| **Software Architecture** | See `01_SOFTWARE_ARCHITECTURE.md` |
| **Software Verification** | Test plans per Section 5.7 |
| **Software Release** | Release process per Section 5.8 |
| **Software Maintenance** | Maintenance plan per Section 5.9 |
| **Traceability** | Requirements → Design → Code → Tests |

### 1.5 ISO 13485 (Quality Management)

| Requirement | Implementation |
|:------------|:---------------|
| **QMS Scope** | Design, development, manufacturing, post-market |
| **Quality Manual** | QM-2025-001 |
| **Design Controls** | Design and development plan (DDP-2025-001) |
| **Risk Management** | ISO 14971 process (see Section 1.6) |
| **Corrective Actions** | CAPA system (CAPA-2025-001) |
| **Management Review** | Quarterly reviews |

### 1.6 ISO 14971 (Risk Management)

| Requirement | Implementation |
|:------------|:---------------|
| **Risk Management Plan** | RMP-2025-001 |
| **Hazard Identification** | HAZID-2025-001 |
| **Risk Analysis** | FMEA per IEC 60812 |
| **Risk Evaluation** | Acceptability matrix (ALARP principle) |
| **Risk Control** | Design controls, software mitigations |
| **Residual Risk** | Evaluated and documented |
| **Post-Market Surveillance** | Risk monitoring in PMS Plan |

### 1.7 Swissmedic Requirements

| Requirement | Implementation |
|:------------|:---------------|
| **Medical Device Registration** | Swissmedic registration [Number] |
| **Authorized Representative** | [Swiss AR Name] |
| **Labeling** | German, French, Italian (Swiss languages) |
| **Incident Reporting** | Swissmedic incident reporting system |
| **Vigilance** | Per MEDDEV 2.12-1 rev. 8 |

---

## 2. Data Classification

Data is classified into four categories based on sensitivity and regulatory requirements:

### 2.1 Classification Levels

| Level | Description | Examples (This Product) |
|:------|:------------|:------------------------|
| **Public** | No confidentiality impact if disclosed | Product documentation, public API endpoints, marketing materials |
| **Internal** | Limited confidentiality impact | Internal documentation, non-sensitive configuration, aggregated statistics (anonymized) |
| **Confidential** | Significant confidentiality impact | User account data (email, name), device identifiers, API keys, system logs |
| **Restricted** | Severe confidentiality impact | Health data (medication schedules, dispensing events), authentication credentials, audit logs |

### 2.2 Health Data Classification

Under **GDPR Article 9** and **Swiss nDSG Article 8**, health data is classified as **"special category"** data requiring enhanced protection:

| Data Type | Classification | Legal Basis |
|:----------|:---------------|:------------|
| **Medication schedules** | Restricted (Health data) | GDPR Art. 9(2)(h) - Health purposes |
| **Dispensing events** | Restricted (Health data) | GDPR Art. 9(2)(h) - Health purposes |
| **Medication adherence data** | Restricted (Health data) | GDPR Art. 9(2)(h) - Health purposes |
| **Device telemetry** (if linked to health) | Restricted (Health data) | GDPR Art. 9(2)(h) - Health purposes |

### 2.3 Medication Adherence Data

Medication adherence data is classified as **Restricted** because:

- It reveals health conditions (medications taken)
- It indicates treatment compliance
- It can be used to infer medical diagnoses
- It requires explicit consent under GDPR Art. 9

### 2.4 Device Telemetry Data

| Telemetry Type | Classification | Rationale |
|:---------------|:---------------|:----------|
| **Battery level, WiFi signal** | Confidential | Not directly health-related, but device-specific |
| **Temperature, humidity** | Confidential | Environmental data, not health data |
| **Dispensing mechanism status** | Restricted | Linked to medication dispensing (health data) |
| **Error codes** | Confidential | Technical diagnostics, unless linked to health events |

---

## 3. Data Processing Inventory

Comprehensive inventory of all personal data processed by the system:

| Data Type | Purpose | Legal Basis | Retention Period | Storage Location | Recipients |
|:----------|:--------|:-------------|:-----------------|:------------------|:-----------|
| **User account data** (email, name, password hash) | User authentication, account management | GDPR Art. 6(1)(b) - Contract | Lifetime + 30 days | Azure Switzerland North (PostgreSQL) | User, support team (authorized) |
| **Medication schedules** (medication name, dosage, time, frequency) | Core device functionality - medication dispensing | GDPR Art. 9(2)(h) - Health purposes | Active + 1 year archive | Azure Switzerland North (PostgreSQL) | User, authorized caregivers, device firmware |
| **Dispensing events** (timestamp, medication, dose, confirmation status) | Adherence tracking, audit trail | GDPR Art. 9(2)(h) - Health purposes | 7 years (regulatory) | Azure Switzerland North (PostgreSQL) | User, authorized caregivers, regulatory authorities (on request) |
| **Device telemetry** (battery, WiFi, temperature, humidity, status) | Device monitoring, diagnostics | GDPR Art. 6(1)(b) - Contract | 90 days | Azure Switzerland North (PostgreSQL) | User, support team (authorized) |
| **Caregiver relationships** (user ID, caregiver ID, permissions) | Caregiver access management | GDPR Art. 6(1)(b) - Contract | Lifetime + 30 days | Azure Switzerland North (PostgreSQL) | User, caregiver |
| **Notification preferences** (email, SMS, push settings) | User communication preferences | GDPR Art. 6(1)(b) - Contract | Lifetime + 30 days | Azure Switzerland North (PostgreSQL) | User |
| **Audit logs** (login, data access, modifications, deletions) | Security, compliance, incident investigation | GDPR Art. 6(1)(f) - Legitimate interest | 7 years (immutable) | Azure Switzerland North (Blob Storage) | Security team, regulators (on request) |
| **Support tickets** (user ID, issue description, communications) | Customer support | GDPR Art. 6(1)(b) - Contract | 3 years | Azure Switzerland North (PostgreSQL) | User, support team |
| **API keys** (hashed API keys for device authentication) | Device authentication | GDPR Art. 6(1)(b) - Contract | Lifetime + 30 days | Azure Switzerland North (PostgreSQL) | Device firmware, API service |
| **Consent records** (consent type, timestamp, withdrawal) | Consent management | GDPR Art. 7 - Consent | 7 years | Azure Switzerland North (PostgreSQL) | User, DPO |

### 3.1 Data Minimization

**We DO NOT collect:**

- ❌ Medical diagnoses
- ❌ Doctor/physician information
- ❌ GPS location data
- ❌ Biometric data
- ❌ Genetic data
- ❌ Insurance information
- ❌ Payment card details (handled by third-party payment processor)

---

## 4. Data Subject Rights Implementation

Implementation of GDPR Article 15-22 and Swiss nDSG data subject rights:

### 4.1 Right of Access (GDPR Art. 15, nDSG Art. 25)

**Implementation:** Data export feature via API endpoint `/api/auth/me/export`

**Export Formats:**
- JSON (machine-readable)
- CSV (human-readable)
- Planned: FHIR R4 format for interoperability

**Code Example:**

```csharp
// Application/Users/ExportUserDataQuery.cs
public class ExportUserDataQuery : IRequest<UserDataExportDto>
{
    public Guid UserId { get; set; }
}

public class ExportUserDataHandler : IRequestHandler<ExportUserDataQuery, UserDataExportDto>
{
    public async Task<UserDataExportDto> Handle(ExportUserDataQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId);
        var schedules = await _scheduleRepository.GetByUserIdAsync(request.UserId);
        var dispensingEvents = await _dispensingRepository.GetByUserIdAsync(request.UserId);
        var devices = await _deviceRepository.GetByUserIdAsync(request.UserId);
        
        return new UserDataExportDto
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            CreatedAt = user.CreatedAtUtc,
            Schedules = schedules.Select(s => new ScheduleExportDto
            {
                MedicationName = s.MedicationName,
                Dosage = s.Dosage,
                Time = s.Time,
                Frequency = s.Frequency
            }).ToList(),
            DispensingEvents = dispensingEvents.Select(d => new DispensingEventExportDto
            {
                Timestamp = d.Timestamp,
                MedicationName = d.MedicationName,
                Dosage = d.Dosage,
                Confirmed = d.Confirmed
            }).ToList(),
            Devices = devices.Select(d => new DeviceExportDto
            {
                Name = d.Name,
                Type = d.Type,
                CreatedAt = d.CreatedAtUtc
            }).ToList()
        };
    }
}
```

### 4.2 Right to Rectification (GDPR Art. 16, nDSG Art. 26)

**Implementation:** Profile editing via `/api/users/me` PUT endpoint

**Allowed Fields:**
- Full name
- Email address
- Notification preferences
- Timezone

**Restricted Fields (require support ticket):**
- Password (use password reset flow)
- User ID (immutable)

### 4.3 Right to Erasure (GDPR Art. 17, nDSG Art. 27)

**Implementation:** Account deletion workflow with 30-day soft delete

**Process:**

```
┌─────────────────────────────────────────────────────────────┐
│              ACCOUNT DELETION WORKFLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User requests deletion via /api/users/me DELETE        │
│     ↓                                                       │
│  2. System sets DeletionRequestedAtUtc = DateTime.UtcNow  │
│     ↓                                                       │
│  3. Account enters "Pending Deletion" state                │
│     ↓                                                       │
│  4. User receives confirmation email                       │
│     ↓                                                       │
│  5. 30-day grace period begins                             │
│     ↓                                                       │
│  6. User can cancel deletion within 30 days               │
│     ↓                                                       │
│  7. After 30 days:                                         │
│     - User account: Soft delete (IsDeleted = true)        │
│     - Dispensing events: Retain (regulatory 7-year req)   │
│     - Schedules: Delete                                    │
│     - Devices: Unlink from user                           │
│     - Audit logs: Retain (immutable)                      │
│     ↓                                                       │
│  8. Hard delete after regulatory retention expires        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Code Example:**

```csharp
// Application/Users/DeleteUserCommand.cs
public class DeleteUserCommand : IRequest<Unit>
{
    public Guid UserId { get; set; }
}

public class DeleteUserHandler : IRequestHandler<DeleteUserCommand, Unit>
{
    public async Task<Unit> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId);
        
        // Set deletion timestamp
        user.DeletionRequestedAtUtc = DateTime.UtcNow;
        user.IsDeleted = false; // Soft delete flag
        
        await _userRepository.UpdateAsync(user);
        
        // Schedule hard delete after 30 days
        await _backgroundJobService.ScheduleHardDelete(user.Id, DateTime.UtcNow.AddDays(30));
        
        // Send confirmation email
        await _emailService.SendDeletionConfirmationAsync(user.Email);
        
        // Audit log
        await _auditService.LogAsync(new AuditLog
        {
            UserId = request.UserId,
            Action = "AccountDeletionRequested",
            ResourceType = "User",
            ResourceId = user.Id.ToString(),
            Timestamp = DateTime.UtcNow
        });
        
        return Unit.Value;
    }
}
```

### 4.4 Right to Data Portability (GDPR Art. 20)

**Implementation:** 
- Current: JSON/CSV export (see Section 4.1)
- Planned: FHIR R4 format for healthcare interoperability

**FHIR Export Schema (Planned):**

```json
{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    {
      "resource": {
        "resourceType": "MedicationStatement",
        "status": "active",
        "medicationCodeableConcept": {
          "text": "Aspirin 100mg"
        },
        "dosage": [
          {
            "timing": {
              "repeat": {
                "frequency": 1,
                "period": 1,
                "periodUnit": "d"
              }
            },
            "doseQuantity": {
              "value": 100,
              "unit": "mg"
            }
          }
        ]
      }
    }
  ]
}
```

### 4.5 Right to Restriction (GDPR Art. 18)

**Implementation:** Processing pause feature via `/api/users/me/restrict-processing`

**Effect:**
- Account remains active
- Data processing paused (no dispensing, no notifications)
- Data retained but not processed
- User can resume processing at any time

### 4.6 Right to Object (GDPR Art. 21)

**Implementation:** Marketing opt-out via `/api/users/me/preferences`

**Scope:**
- Marketing emails: Opt-out available
- Essential communications: Cannot opt-out (safety notifications, account alerts)
- Analytics: Opt-out via consent management (see Section 7)

---

## 5. Data Retention Policy

Automated data retention enforcement with scheduled purge jobs:

| Data Type | Active Retention | Archive Retention | Deletion Method | Regulatory Basis |
|:----------|:-----------------|:------------------|:-----------------|:------------------|
| **User account data** | Lifetime (while account active) | 30 days after deletion request | Soft delete → Hard delete after 30 days | GDPR Art. 5(1)(e) |
| **Medication schedules** | Active (while schedule active) | 1 year after schedule end | Automated purge job (daily) | Business requirement |
| **Dispensing events** | 7 years | N/A (deleted after 7 years) | Automated purge job (monthly) | Medical device regulatory (EU/Swiss) |
| **Device telemetry** | 90 days | N/A | Automated purge job (daily) | GDPR Art. 5(1)(e) - Storage limitation |
| **Device logs** | 90 days | N/A | Automated purge job (daily) | GDPR Art. 5(1)(e) |
| **Audit logs** | 7 years (immutable) | N/A | Immutable storage (cannot delete) | Regulatory compliance, security |
| **Backups** | 90 days | N/A | Automated backup rotation | GDPR Art. 5(1)(e) |
| **Support tickets** | 3 years | N/A | Automated purge job (monthly) | Business requirement |
| **Consent records** | 7 years | N/A | Retained (legal requirement) | GDPR Art. 7 |

### 5.1 Automated Retention Enforcement

**Implementation:** Background job service with scheduled retention checks

**Code Example:**

```csharp
// Infrastructure/BackgroundJobs/DataRetentionJob.cs
public class DataRetentionJob : IJob
{
    public async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        var cutoffDate = DateTime.UtcNow.AddYears(-7);
        
        // Delete dispensing events older than 7 years
        var oldDispensingEvents = await _dispensingRepository
            .GetOlderThanAsync(cutoffDate);
        
        foreach (var evt in oldDispensingEvents)
        {
            await _dispensingRepository.DeleteAsync(evt.Id);
            
            // Audit log
            await _auditService.LogAsync(new AuditLog
            {
                Action = "DataRetentionPurge",
                ResourceType = "DispensingEvent",
                ResourceId = evt.Id.ToString(),
                Timestamp = DateTime.UtcNow,
                Metadata = JsonSerializer.Serialize(new { RetentionPolicy = "7Years" })
            });
        }
        
        // Delete device telemetry older than 90 days
        var telemetryCutoff = DateTime.UtcNow.AddDays(-90);
        var oldTelemetry = await _telemetryRepository
            .GetOlderThanAsync(telemetryCutoff);
        
        await _telemetryRepository.DeleteBatchAsync(oldTelemetry.Select(t => t.Id));
        
        // Hard delete users with deletion requested > 30 days ago
        var deletionCutoff = DateTime.UtcNow.AddDays(-30);
        var usersToHardDelete = await _userRepository
            .GetPendingHardDeletionAsync(deletionCutoff);
        
        foreach (var user in usersToHardDelete)
        {
            await HardDeleteUserAsync(user.Id);
        }
    }
    
    private async Task HardDeleteUserAsync(Guid userId)
    {
        // Delete user account (but retain dispensing events per regulatory requirement)
        var user = await _userRepository.GetByIdAsync(userId);
        
        // Unlink devices
        var devices = await _deviceRepository.GetByUserIdAsync(userId);
        foreach (var device in devices)
        {
            device.UserId = null;
            await _deviceRepository.UpdateAsync(device);
        }
        
        // Delete schedules
        var schedules = await _scheduleRepository.GetByUserIdAsync(userId);
        await _scheduleRepository.DeleteBatchAsync(schedules.Select(s => s.Id));
        
        // Hard delete user
        await _userRepository.HardDeleteAsync(userId);
        
        // Audit log
        await _auditService.LogAsync(new AuditLog
        {
            Action = "UserHardDeleted",
            ResourceType = "User",
            ResourceId = userId.ToString(),
            Timestamp = DateTime.UtcNow
        });
    }
}
```

**Scheduling:**

```csharp
// Infrastructure/BackgroundJobs/BackgroundJobService.cs
public void ScheduleRetentionJobs()
{
    // Daily: Device telemetry, device logs
    RecurringJob.AddOrUpdate<DataRetentionJob>(
        "daily-retention",
        job => job.ExecuteAsync(CancellationToken.None),
        Cron.Daily(2, 0)); // 2 AM UTC
    
    // Monthly: Dispensing events (7-year check), support tickets
    RecurringJob.AddOrUpdate<DataRetentionJob>(
        "monthly-retention",
        job => job.ExecuteAsync(CancellationToken.None),
        Cron.Monthly(1, 2, 0)); // 1st of month, 2 AM UTC
}
```

---

## 6. Data Residency & Transfer

### 6.1 Primary Hosting

| Component | Location | Region | Rationale |
|:----------|:---------|:-------|:----------|
| **Backend API** | Azure Switzerland North | Zurich, Switzerland | Data residency requirement |
| **PostgreSQL Database** | Azure Switzerland North | Zurich, Switzerland | Health data must remain in Switzerland/EU |
| **Blob Storage (Audit Logs)** | Azure Switzerland North | Zurich, Switzerland | Immutable audit logs |
| **Application Insights** | Azure Switzerland North | Zurich, Switzerland | Telemetry data |
| **CDN** | Azure Switzerland North | Zurich, Switzerland | Static assets |

### 6.2 Cross-Border Transfers

**Policy:** No cross-border transfers of health data outside Switzerland/EU.

**Exceptions:** None. All health data (medication schedules, dispensing events) remains in Azure Switzerland North.

### 6.3 Sub-Processors

| Sub-Processor | Service | Location | DPA Status | Purpose |
|:--------------|:-------|:---------|:-----------|:---------|
| **Microsoft Azure** | Cloud infrastructure | Switzerland North | DPA signed | Hosting, database, storage |
| **SendGrid** (if used) | Email delivery | EU (Frankfurt) | DPA signed | Transactional emails |
| **Twilio** (if used) | SMS delivery | EU (Dublin) | DPA signed | SMS notifications |

**Note:** All sub-processors have signed Data Processing Agreements (DPAs) and are GDPR-compliant.

### 6.4 Adequacy Decisions

- **Switzerland → EU:** Adequacy decision (2000/518/EC, extended)
- **EU → Switzerland:** Adequacy decision (Swiss nDSG alignment with GDPR)
- **No transfers to third countries** (US, etc.) for health data

---

## 7. Consent Management

### 7.1 Consent Types

| Consent Type | Purpose | Legal Basis | Required | Withdrawable |
|:-------------|:--------|:------------|:---------|:-------------|
| **Essential processing** | Account creation, device functionality | GDPR Art. 6(1)(b) - Contract | Yes | No (required for service) |
| **Caregiver sharing** | Share medication data with authorized caregivers | GDPR Art. 9(2)(h) - Health purposes | Yes (if caregiver used) | Yes |
| **Analytics** | Usage analytics, performance monitoring | GDPR Art. 6(1)(a) - Consent | No | Yes |
| **Marketing** | Marketing emails, product updates | GDPR Art. 6(1)(a) - Consent | No | Yes |

### 7.2 Consent Collection

**During Registration:**

```csharp
// Application/Auth/RegisterCommand.cs
public class RegisterCommand : IRequest<AuthResponseDto>
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string FullName { get; set; }
    public bool ConsentEssential { get; set; } // Required
    public bool ConsentAnalytics { get; set; } // Optional
    public bool ConsentMarketing { get; set; } // Optional
}

public class RegisterHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // Validate essential consent
        if (!request.ConsentEssential)
        {
            throw new ValidationException("Essential processing consent is required");
        }
        
        // Create user
        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.HashPassword(request.Password),
            FullName = request.FullName
        };
        
        await _userRepository.CreateAsync(user);
        
        // Record consents
        await _consentService.RecordConsentAsync(new ConsentRecord
        {
            UserId = user.Id,
            ConsentType = ConsentType.Essential,
            Granted = true,
            GrantedAt = DateTime.UtcNow,
            IpAddress = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            UserAgent = _httpContextAccessor.HttpContext.Request.Headers["User-Agent"].ToString()
        });
        
        if (request.ConsentAnalytics)
        {
            await _consentService.RecordConsentAsync(new ConsentRecord
            {
                UserId = user.Id,
                ConsentType = ConsentType.Analytics,
                Granted = true,
                GrantedAt = DateTime.UtcNow
            });
        }
        
        // ... marketing consent similar ...
        
        return new AuthResponseDto { Token = GenerateJwt(user) };
    }
}
```

**In Settings:** Users can update consent preferences via `/api/users/me/consent`

### 7.3 Consent Withdrawal

**One-click withdrawal** via settings UI or API:

```csharp
// Application/Users/WithdrawConsentCommand.cs
public class WithdrawConsentCommand : IRequest<Unit>
{
    public Guid UserId { get; set; }
    public ConsentType ConsentType { get; set; }
}

public class WithdrawConsentHandler : IRequestHandler<WithdrawConsentCommand, Unit>
{
    public async Task<Unit> Handle(WithdrawConsentCommand request, CancellationToken cancellationToken)
    {
        // Record withdrawal
        await _consentService.RecordConsentAsync(new ConsentRecord
        {
            UserId = request.UserId,
            ConsentType = request.ConsentType,
            Granted = false,
            GrantedAt = DateTime.UtcNow,
            WithdrawnAt = DateTime.UtcNow
        });
        
        // Stop processing if analytics/marketing
        if (request.ConsentType == ConsentType.Analytics)
        {
            await _analyticsService.DisableForUserAsync(request.UserId);
        }
        
        if (request.ConsentType == ConsentType.Marketing)
        {
            await _emailService.UnsubscribeAsync(request.UserId);
        }
        
        // Audit log
        await _auditService.LogAsync(new AuditLog
        {
            UserId = request.UserId,
            Action = "ConsentWithdrawn",
            ResourceType = "Consent",
            Metadata = JsonSerializer.Serialize(new { ConsentType = request.ConsentType.ToString() }),
            Timestamp = DateTime.UtcNow
        });
        
        return Unit.Value;
    }
}
```

### 7.4 Consent Audit Trail

**Schema:**

```csharp
// Domain/Entities/ConsentRecord.cs
public class ConsentRecord
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public ConsentType ConsentType { get; set; }
    public bool Granted { get; set; }
    public DateTime GrantedAt { get; set; }
    public DateTime? WithdrawnAt { get; set; }
    public string IpAddress { get; set; }
    public string UserAgent { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public enum ConsentType
{
    Essential,
    CaregiverSharing,
    Analytics,
    Marketing
}
```

**Retention:** 7 years (legal requirement)

---

## 8. Privacy by Design Implementation

### 8.1 Data Minimization

**What we DON'T collect:**

- ❌ Medical diagnoses
- ❌ Doctor/physician information
- ❌ GPS location data
- ❌ Biometric data
- ❌ Genetic data
- ❌ Insurance information
- ❌ Payment card details

**What we DO collect (minimal necessary):**

- ✅ User account (email, name) - Required for account management
- ✅ Medication schedules - Required for device functionality
- ✅ Dispensing events - Required for adherence tracking
- ✅ Device telemetry - Required for device monitoring

### 8.2 Purpose Limitation

**Principle:** Data used only for stated purpose at collection time.

**Implementation:**

| Data Type | Stated Purpose | Actual Use | Restrictions |
|:----------|:---------------|:------------|:-------------|
| Medication schedules | Device dispensing | Device dispensing, adherence tracking | ❌ Not used for marketing, ❌ Not shared with third parties |
| Dispensing events | Adherence tracking | Adherence statistics, regulatory compliance | ❌ Not used for advertising |
| Device telemetry | Device monitoring | Diagnostics, support | ❌ Not used for profiling |

### 8.3 Storage Limitation

**Implementation:** Automated purge jobs (see Section 5.1)

- Dispensing events: 7 years (regulatory minimum)
- Device telemetry: 90 days (no longer needed)
- Schedules: Active + 1 year (business requirement)

### 8.4 Pseudonymization

**Device IDs:** Device identifiers are not directly linkable to user identity without database access.

**Implementation:**

```csharp
// Device ID is GUID, not sequential
public class Device
{
    public Guid Id { get; set; } // Pseudonymized identifier
    public Guid UserId { get; set; } // Linkable only via database
    public string MacAddress { get; set; } // Hardware identifier (hashed in logs)
}
```

**Telemetry Logging:** Device telemetry logs use device GUID, not user email/name.

### 8.5 Access Control

**RBAC (Role-Based Access Control):**

| Role | Permissions | Principle |
|:-----|:------------|:----------|
| **User** | Own data only | Least privilege |
| **Caregiver** | Authorized user's data only | Explicit authorization |
| **Support** | Read-only access (with audit) | Need-to-know |
| **Admin** | Full access (with audit) | Restricted to authorized personnel |

**Code Example:**

```csharp
// Application/Common/Authorization/RequireOwnershipAttribute.cs
[AttributeUsage(AttributeTargets.Method)]
public class RequireOwnershipAttribute : Attribute, IAuthorizationRequirement
{
    public string ResourceParameter { get; set; } // e.g., "userId"
}

// Infrastructure/Authorization/OwnershipAuthorizationHandler.cs
public class OwnershipAuthorizationHandler : AuthorizationHandler<RequireOwnershipAttribute>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        RequireOwnershipAttribute requirement)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var resourceUserId = GetResourceUserId(context, requirement.ResourceParameter);
        
        if (userId == resourceUserId || context.User.IsInRole("Admin"))
        {
            context.Succeed(requirement);
        }
        
        return Task.CompletedTask;
    }
}
```

---

## 9. IEC 62304 Software Lifecycle

### 9.1 Software Safety Classification

**Classification:** **Class B** (moderate risk)

**Rationale:**
- Software failure could cause injury but not death
- Incorrect medication dispensing could lead to health complications
- Mitigations: User confirmation, caregiver oversight, error handling

### 9.2 Software Development Plan (SDP)

**Document:** SDP-2025-001

**Contents:**
- Development lifecycle model (Agile/Scrum with IEC 62304 phases)
- Roles and responsibilities
- Development tools and environments
- Configuration management
- Problem resolution process
- Software release process

### 9.3 Software Requirements Specification (SRS)

**Document:** SRS-2025-001

**Structure:**
- Functional requirements (FR-001 to FR-XXX)
- Non-functional requirements (NFR-001 to NFR-XXX)
- Safety requirements (SR-001 to SR-XXX)
- Interface requirements (IR-001 to IR-XXX)

**Example Requirements:**

| ID | Requirement | Safety Class |
|:---|:------------|:-------------|
| FR-001 | System shall allow user to create medication schedule | Class B |
| FR-002 | System shall dispense medication at scheduled time | Class B |
| SR-001 | System shall require user confirmation before dispensing | Class B |
| SR-002 | System shall log all dispensing events (immutable) | Class B |

### 9.4 Software Architecture Documentation

**Document:** `01_SOFTWARE_ARCHITECTURE.md`

**Contents:**
- System architecture (Clean Architecture + CQRS)
- Component diagrams
- Data flow diagrams
- Security architecture
- Error handling architecture

### 9.5 Software Detailed Design

**Documents:**
- `02_BACKEND_API.md` - API design
- `03_DATABASE.md` - Database schema
- `07_AUTHENTICATION.md` - Authentication design

**Contents:**
- Class diagrams
- Sequence diagrams
- Database schema
- API endpoints
- Error codes

### 9.6 Software Verification (Testing)

**Test Levels:**

| Level | Scope | Documents |
|:------|:------|:----------|
| **Unit Tests** | Individual components | Test plans: TP-UNIT-001 |
| **Integration Tests** | Component interactions | Test plans: TP-INT-001 |
| **System Tests** | End-to-end functionality | Test plans: TP-SYS-001 |
| **Acceptance Tests** | User acceptance | Test plans: TP-ACC-001 |

**Code Coverage Requirements:**
- Unit tests: ≥ 80% code coverage
- Critical paths (dispensing, authentication): ≥ 95% coverage

**Test Documentation:**
- Test plans (TP-XXX-001)
- Test cases (TC-XXX-001)
- Test reports (TR-XXX-001)

### 9.7 Software Release Process

**Release Workflow:**

```
┌─────────────────────────────────────────────────────────────┐
│              SOFTWARE RELEASE PROCESS                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Development complete → Code review                     │
│     ↓                                                       │
│  2. All tests pass (unit, integration, system)             │
│     ↓                                                       │
│  3. Risk assessment updated (ISO 14971)                    │
│     ↓                                                       │
│  4. Release notes prepared                                  │
│     ↓                                                       │
│  5. Technical documentation updated                        │
│     ↓                                                       │
│  6. Release candidate tagged (vX.Y.Z-rc1)                 │
│     ↓                                                       │
│  7. QA testing on release candidate                        │
│     ↓                                                       │
│  8. Final release tag (vX.Y.Z)                             │
│     ↓                                                       │
│  9. Deploy to staging environment                          │
│     ↓                                                       │
│  10. Staging validation                                    │
│     ↓                                                       │
│  11. Deploy to production (Azure Switzerland North)        │
│     ↓                                                       │
│  12. Post-deployment verification                          │
│     ↓                                                       │
│  13. Release notification to users                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Release Documentation:**
- Release notes (RN-vX.Y.Z)
- Deployment checklist (DC-vX.Y.Z)
- Post-deployment report (PDR-vX.Y.Z)

### 9.8 Software Maintenance Plan

**Document:** SMP-2025-001

**Maintenance Activities:**
- Bug fixes (CAPA system)
- Security patches (see Section 12)
- Feature enhancements (change control process)
- Performance optimizations

**Change Control Process:**

| Change Type | Approval Required | Documentation |
|:------------|:------------------|:---------------|
| **Bug fix** | Development Lead | Bug report, fix description |
| **Security patch** | Security Team + DPO | CVE details, patch plan |
| **Feature enhancement** | Product Owner + Regulatory | Change request, impact assessment |
| **Architecture change** | Architecture Review Board | Architecture change proposal |

### 9.9 Traceability Matrix

**Requirement:** Traceability from requirements → design → code → tests

**Example:**

| Requirement ID | Design Document | Code Location | Test Case ID |
|:---------------|:----------------|:---------------|:-------------|
| FR-001 | `02_BACKEND_API.md` Section 3.1 | `Application/Schedules/CreateScheduleCommand.cs` | TC-001 |
| FR-002 | `02_BACKEND_API.md` Section 4.1 | `Application/Dispensing/DispenseCommand.cs` | TC-002 |
| SR-001 | `07_AUTHENTICATION.md` Section 2.3 | `Application/Dispensing/ConfirmDispensingCommand.cs` | TC-003 |

**Tool:** Requirements traceability matrix maintained in Excel/Confluence (RTM-2025-001)

---

## 10. Audit Logging

### 10.1 Audit Events

All security-relevant events are logged in immutable audit logs:

| Event Type | Description | Trigger |
|:-----------|:------------|:--------|
| **Login** | User authentication | Successful/failed login |
| **Data Access** | Data retrieval | User exports data, API access |
| **Data Modification** | Data changes | Create/update/delete operations |
| **Data Deletion** | Data deletion | Account deletion, data purge |
| **Consent Changes** | Consent granted/withdrawn | Consent management |
| **Authorization Failures** | Access denied | Unauthorized access attempts |
| **Configuration Changes** | System configuration | Admin changes settings |

### 10.2 Audit Log Schema

```csharp
// Domain/Entities/AuditLog.cs
public class AuditLog
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; } // Nullable for system events
    public string Action { get; set; } // e.g., "Login", "DataAccess", "DataModification"
    public string ResourceType { get; set; } // e.g., "User", "Schedule", "DispensingEvent"
    public string ResourceId { get; set; } // ID of affected resource
    public string Result { get; set; } // "Success", "Failure", "Denied"
    public string IpAddress { get; set; }
    public string UserAgent { get; set; }
    public string Metadata { get; set; } // JSON metadata (optional)
    public DateTime Timestamp { get; set; }
    
    // Immutable - no Update method, only Create
}
```

### 10.3 Immutable Audit Storage

**Implementation:** Audit logs stored in Azure Blob Storage with immutability policy

```csharp
// Infrastructure/Audit/AuditService.cs
public class AuditService : IAuditService
{
    private readonly BlobServiceClient _blobClient;
    
    public async Task LogAsync(AuditLog auditLog)
    {
        // Generate blob name: audit-YYYY-MM-DD-{guid}.json
        var blobName = $"audit-{DateTime.UtcNow:yyyy-MM-dd}-{Guid.NewGuid()}.json";
        var containerClient = _blobClient.GetBlobContainerClient("audit-logs");
        
        // Ensure container exists with immutability policy
        await containerClient.CreateIfNotExistsAsync();
        
        // Set immutability policy (7 years)
        var immutabilityPolicy = new BlobImmutabilityPolicy
        {
            PolicyMode = BlobImmutabilityPolicyMode.Locked,
            ExpiresOn = DateTimeOffset.UtcNow.AddYears(7)
        };
        
        // Write audit log (append-only)
        var blobClient = containerClient.GetBlobClient(blobName);
        var json = JsonSerializer.Serialize(auditLog);
        await blobClient.UploadAsync(new BinaryData(json));
        
        // Set immutability policy (cannot be modified/deleted for 7 years)
        await blobClient.SetImmutabilityPolicyAsync(immutabilityPolicy);
    }
}
```

### 10.4 Audit Log Search and Export

**API Endpoint:** `/api/admin/audit-logs` (Admin only)

**Query Parameters:**
- `userId` - Filter by user ID
- `action` - Filter by action type
- `resourceType` - Filter by resource type
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)

**Export Format:** JSON, CSV

**Code Example:**

```csharp
// Application/Admin/GetAuditLogsQuery.cs
public class GetAuditLogsQuery : IRequest<PagedResult<AuditLogDto>>
{
    public Guid? UserId { get; set; }
    public string Action { get; set; }
    public string ResourceType { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public class GetAuditLogsHandler : IRequestHandler<GetAuditLogsQuery, PagedResult<AuditLogDto>>
{
    public async Task<PagedResult<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        // Query Azure Blob Storage for audit logs
        var logs = await _auditRepository.SearchAsync(
            userId: request.UserId,
            action: request.Action,
            resourceType: request.ResourceType,
            startDate: request.StartDate,
            endDate: request.EndDate,
            page: request.Page,
            pageSize: request.PageSize
        );
        
        return new PagedResult<AuditLogDto>
        {
            Items = logs.Select(log => new AuditLogDto
            {
                Id = log.Id,
                UserId = log.UserId,
                Action = log.Action,
                ResourceType = log.ResourceType,
                ResourceId = log.ResourceId,
                Result = log.Result,
                IpAddress = log.IpAddress,
                Timestamp = log.Timestamp
            }).ToList(),
            TotalCount = await _auditRepository.CountAsync(...),
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
```

### 10.5 Audit Middleware

**Automatic audit logging for API requests:**

```csharp
// Api/Middleware/AuditMiddleware.cs
public class AuditMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IAuditService _auditService;
    
    public async Task InvokeAsync(HttpContext context)
    {
        var userId = context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        var action = $"{context.Request.Method} {context.Request.Path}";
        var resourceType = GetResourceType(context.Request.Path);
        var resourceId = GetResourceId(context.Request.Path, context.Request.Query);
        
        var auditLog = new AuditLog
        {
            UserId = userId != null ? Guid.Parse(userId) : null,
            Action = action,
            ResourceType = resourceType,
            ResourceId = resourceId,
            IpAddress = context.Connection.RemoteIpAddress?.ToString(),
            UserAgent = context.Request.Headers["User-Agent"].ToString(),
            Timestamp = DateTime.UtcNow
        };
        
        try
        {
            await _next(context);
            
            auditLog.Result = context.Response.StatusCode < 400 ? "Success" : "Failure";
        }
        catch (Exception ex)
        {
            auditLog.Result = "Error";
            auditLog.Metadata = JsonSerializer.Serialize(new { Error = ex.Message });
            throw;
        }
        finally
        {
            await _auditService.LogAsync(auditLog);
        }
    }
}
```

---

## 11. Breach Response Plan

### 11.1 Detection Mechanisms

| Mechanism | Description | Alert Threshold |
|:----------|:------------|:----------------|
| **Security monitoring** | Azure Security Center alerts | Critical/High severity |
| **Audit log anomalies** | Unusual access patterns | > 10 failed logins in 5 min |
| **Database monitoring** | Unusual query patterns | Large data exports, bulk deletions |
| **Network monitoring** | Suspicious network traffic | Unauthorized API access |
| **User reports** | User-reported incidents | Any user report |

### 11.2 Classification Criteria

| Severity | Criteria | Examples |
|:---------|:---------|:----------|
| **Critical** | Health data breach, > 1000 users affected | Unauthorized access to medication schedules, database breach |
| **High** | Personal data breach, < 1000 users affected | Unauthorized access to user accounts |
| **Medium** | Limited data exposure, no health data | API key leak (no user data) |
| **Low** | No data exposure, security incident | Failed brute force attack (blocked) |

### 11.3 72-Hour Notification Timeline

**GDPR Art. 33** (EU): 72 hours to supervisory authority  
**Swiss nDSG Art. 24** (Switzerland): 24 hours to FDPIC

**Timeline:**

```
┌─────────────────────────────────────────────────────────────┐
│              BREACH RESPONSE TIMELINE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  T+0h:   Breach detected                                    │
│     ↓                                                       │
│  T+0.5h: Incident response team activated                  │
│     ↓                                                       │
│  T+1h:   Initial assessment and classification              │
│     ↓                                                       │
│  T+2h:   Containment measures implemented                   │
│     ↓                                                       │
│  T+4h:   Impact assessment (affected users, data types)    │
│     ↓                                                       │
│  T+8h:   Notification to DPO                               │
│     ↓                                                       │
│  T+12h:  Notification to FDPIC (Switzerland) - 24h req     │
│     ↓                                                       │
│  T+24h:  Notification to EU supervisory authority - 72h    │
│     ↓                                                       │
│  T+48h:  User notification (if high risk)                  │
│     ↓                                                       │
│  T+72h:  Final breach report to authorities                │
│     ↓                                                       │
│  Ongoing: Remediation, post-incident review                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 11.4 Notification to Authorities

**FDPIC (Switzerland):**

- **Contact:** FDPIC, Feldeggweg 1, 3003 Bern
- **Email:** contact@edoeb.admin.ch
- **Timeline:** 24 hours (nDSG Art. 24)
- **Content:** Breach description, affected users, data types, mitigation measures

**EU Supervisory Authority:**

- **Contact:** [Lead Supervisory Authority] (e.g., CNIL for France, BfDI for Germany)
- **Timeline:** 72 hours (GDPR Art. 33)
- **Content:** Per GDPR Art. 33(3) - nature of breach, categories of data, approximate number of data subjects, likely consequences, measures taken

### 11.5 User Notification Procedures

**When to notify users:**

- ✅ Health data breach (always)
- ✅ High-risk breach (> 100 users affected)
- ✅ Breach likely to result in high risk to rights and freedoms (GDPR Art. 34)

**Notification content (GDPR Art. 34):**

- Nature of the breach
- Name and contact details of DPO
- Likely consequences
- Measures taken/proposed to address the breach

**Notification method:**

- Email (primary)
- In-app notification (secondary)
- Public notice (if email unavailable)

### 11.6 Documentation Requirements

**Breach documentation:**

- Incident report (IR-YYYY-MM-DD-XXX)
- Timeline of events
- Affected users/data inventory
- Root cause analysis
- Mitigation measures
- Notification records (authorities, users)
- Post-incident review

**Retention:** 7 years (regulatory requirement)

---

## 12. Software Bill of Materials (SBOM)

### 12.1 Backend Dependencies

| Package | Version | License | Purpose | Vulnerability Status |
|:--------|:--------|:--------|:--------|:---------------------|
| **Microsoft.AspNetCore.App** | 8.0.x | MIT | ASP.NET Core framework | ✅ Scanned weekly |
| **EntityFrameworkCore** | 8.0.x | Apache 2.0 | ORM | ✅ Scanned weekly |
| **MediatR** | 12.x | Apache 2.0 | CQRS pattern | ✅ Scanned weekly |
| **FluentValidation** | 11.x | Apache 2.0 | Request validation | ✅ Scanned weekly |
| **BCrypt.Net-Next** | 4.x | MIT | Password hashing | ✅ Scanned weekly |
| **System.IdentityModel.Tokens.Jwt** | 7.x | MIT | JWT handling | ✅ Scanned weekly |
| **Azure.Storage.Blobs** | 12.x | MIT | Blob storage | ✅ Scanned weekly |
| **Npgsql.EntityFrameworkCore.PostgreSQL** | 8.0.x | PostgreSQL | PostgreSQL provider | ✅ Scanned weekly |
| **Hangfire.Core** | 1.8.x | LGPL | Background jobs | ✅ Scanned weekly |
| **Serilog.AspNetCore** | 8.x | Apache 2.0 | Logging | ✅ Scanned weekly |

**SBOM File:** `backend/src/Api/SBOM.json` (generated via `dotnet list package --include-transitive --format json`)

### 12.2 Frontend Dependencies

| Package | Version | License | Purpose | Vulnerability Status |
|:--------|:--------|:--------|:--------|:---------------------|
| **react** | 18.x | MIT | UI framework | ✅ Scanned weekly |
| **react-dom** | 18.x | MIT | React DOM | ✅ Scanned weekly |
| **vite** | 5.x | MIT | Build tool | ✅ Scanned weekly |
| **tailwindcss** | 3.x | MIT | CSS framework | ✅ Scanned weekly |
| **axios** | 1.x | MIT | HTTP client | ✅ Scanned weekly |
| **react-router-dom** | 6.x | MIT | Routing | ✅ Scanned weekly |
| **zustand** | 4.x | MIT | State management | ✅ Scanned weekly |

**SBOM File:** `frontend/SBOM.json` (generated via `npm list --json`)

### 12.3 Mobile Dependencies

| Package | Version | License | Purpose | Vulnerability Status |
|:--------|:--------|:--------|:--------|:---------------------|
| **react-native** | 0.73.x | MIT | Mobile framework | ✅ Scanned weekly |
| **expo** | 50.x | MIT | Expo SDK | ✅ Scanned weekly |
| **@react-navigation/native** | 6.x | MIT | Navigation | ✅ Scanned weekly |
| **expo-notifications** | 0.27.x | MIT | Push notifications | ✅ Scanned weekly |
| **@react-native-async-storage/async-storage** | 1.x | MIT | Local storage | ✅ Scanned weekly |

**SBOM File:** `mobile/SBOM.json` (generated via `npm list --json`)

### 12.4 Firmware Dependencies

| Component | Version | License | Purpose | Vulnerability Status |
|:-----------|:--------|:--------|:---------|:---------------------|
| **ESP-IDF** | 5.1.x | Apache 2.0 | ESP32 framework | ✅ Scanned weekly |
| **FreeRTOS** | 10.x | MIT | RTOS | ✅ Scanned weekly |
| **LVGL** | 8.x | MIT | Graphics library | ✅ Scanned weekly |
| **mbedTLS** | 3.x | Apache 2.0 | TLS/SSL | ✅ Scanned weekly |
| **cJSON** | 1.x | MIT | JSON parsing | ✅ Scanned weekly |
| **WiFi** | ESP-IDF | Apache 2.0 | WiFi stack | ✅ Scanned weekly |
| **HTTP Client** | ESP-IDF | Apache 2.0 | HTTP client | ✅ Scanned weekly |

**SBOM File:** `firmware/SBOM.json` (manually maintained)

### 12.5 Vulnerability Scanning Schedule

**Automated Scanning:**

| Component | Tool | Frequency | Action on Findings |
|:----------|:-----|:----------|:-------------------|
| **Backend (.NET)** | GitHub Dependabot, Snyk | Weekly | Auto-create issue for Critical/High |
| **Frontend (npm)** | npm audit, Snyk | Weekly | Auto-create issue for Critical/High |
| **Mobile (npm)** | npm audit, Snyk | Weekly | Auto-create issue for Critical/High |
| **Firmware (C/C++)** | Manual CVE checks | Weekly | Manual review |

**Scanning Tools:**

- **GitHub Dependabot:** Integrated into repository
- **Snyk:** External scanning service
- **npm audit:** Built into npm
- **CVE Database:** National Vulnerability Database (NVD)

### 12.6 Patching SLAs

| Severity | Definition | SLA | Process |
|:---------|:------------|:----|:--------|
| **Critical** | Remote code execution, authentication bypass | 72 hours | Emergency patch, immediate deployment |
| **High** | Data exposure, privilege escalation | 30 days | Next release cycle |
| **Medium** | Denial of service, information disclosure | Next release | Included in next release |
| **Low** | Limited impact | Next release | Included in next release |

**Critical Vulnerability Process:**

```
┌─────────────────────────────────────────────────────────────┐
│         CRITICAL VULNERABILITY RESPONSE PROCESS              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Vulnerability detected (Dependabot/Snyk alert)         │
│     ↓                                                       │
│  2. Security team assesses severity                        │
│     ↓                                                       │
│  3. If Critical: Emergency patch branch created            │
│     ↓                                                       │
│  4. Patch applied and tested (regression tests)            │
│     ↓                                                       │
│  5. Security review                                        │
│     ↓                                                       │
│  6. Deploy to staging (immediate)                          │
│     ↓                                                       │
│  7. Staging validation (smoke tests)                        │
│     ↓                                                       │
│  8. Deploy to production (within 72 hours)                │
│     ↓                                                       │
│  9. Post-deployment monitoring                             │
│     ↓                                                       │
│  10. Documentation updated (security advisory)             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Patch Documentation:**

- Security advisory (SA-YYYY-MM-DD-XXX)
- CVE reference
- Affected versions
- Patched versions
- Mitigation steps (if patch delayed)

---

## 13. Security Testing & Penetration Testing

### 13.1 Security Testing Schedule

| Test Type | Frequency | Performed By | Scope |
|:----------|:----------|:-------------|:------|
| **SAST** (Static Analysis) | Every PR | Automated (SonarQube) | All source code |
| **DAST** (Dynamic Analysis) | Weekly | Automated (OWASP ZAP) | API endpoints |
| **Dependency Scan** | Daily | Automated (Snyk/npm audit/dotnet) | All dependencies |
| **Container Scan** | Every build | Automated (Trivy) | Docker images |
| **Penetration Test** | Annually | External firm (Swiss-based) | Full platform |
| **Red Team Exercise** | Bi-annually | External firm | Social engineering + technical |

### 13.2 OWASP Top 10 Compliance

| # | Risk | Mitigation | Test Method | Status |
|:--|:-----|:-----------|:-----------|:-------|
| A01 | Broken Access Control | RBAC, ownership checks, JWT claims | Manual + automated | ✅ Implemented |
| A02 | Cryptographic Failures | BCrypt passwords, AES-256-GCM, TLS 1.3 | Automated scan | ✅ Implemented |
| A03 | Injection | FluentValidation, parameterized queries (EF Core) | SAST + DAST | ✅ Implemented |
| A04 | Insecure Design | Threat modeling, security reviews | Manual review | ✅ Architecture |
| A05 | Security Misconfiguration | Secure defaults, no debug in prod, CORS config | Automated scan | ⚠️ MVP (AllowAny CORS) |
| A06 | Vulnerable Components | Dependency scanning, automated updates | Weekly scan | ✅ Process in place |
| A07 | Auth Failures | Rate limiting, strong passwords, token expiry | DAST | ⚠️ Rate limiting planned |
| A08 | Software/Data Integrity | Docker image signing, NuGet package verification | Build pipeline | ⚠️ Planned |
| A09 | Logging Failures | Structured logging, audit trail, log monitoring | Log review | ✅ Implemented |
| A10 | SSRF | No user-controlled URLs in server requests (except webhooks) | DAST | ✅ Low risk |

### 13.3 Vulnerability Patching SLAs

| Severity | CVSS Score | Patch Deadline | Notification |
|:---------|:----------|:---------------|:-------------|
| **Critical** | 9.0-10.0 | 72 hours | Immediate team alert |
| **High** | 7.0-8.9 | 30 days | Weekly security report |
| **Medium** | 4.0-6.9 | Next release cycle | Monthly report |
| **Low** | 0.1-3.9 | Best effort | Quarterly report |

### 13.4 Penetration Test Scope

| Area | Includes | Excludes |
|:-----|:---------|:---------|
| **API** | All endpoints, auth bypass, injection, rate limiting | DDoS testing |
| **Web Portal** | XSS, CSRF, auth flows, session management | Browser exploits |
| **Mobile App** | Binary analysis, API communication, storage | Jailbreak attacks |
| **Infrastructure** | Docker config, network segmentation | Physical access |
| **Device API** | Token forgery, replay attacks, command injection | RF attacks |

---

## 14. Expanded Audit Trail

### 14.1 Complete Audit Event Catalog

| Event Category | Events | Fields Captured |
|:---------------|:-------|:---------------|
| **Authentication** | Login, Logout, Failed login, Token refresh, Password change | userId, email, IP, userAgent, result |
| **User Management** | Register, Update profile, Delete account, Role change | userId, changedFields, previousValues |
| **Device Management** | Create device, Delete device, Pause/Resume, Link to user | deviceId, userId, action |
| **Medication** | Create/Update/Delete container, Refill | containerId, medicationName, quantity |
| **Scheduling** | Create/Update/Delete schedule | scheduleId, timeOfDay, daysOfWeek |
| **Dispensing** | Dispense triggered, Dose confirmed, Dose delayed, Dose missed | eventId, deviceId, slot, status |
| **Notifications** | Notification created, Marked read, Push sent, Email sent | notificationId, type, channel |
| **Integrations** | Webhook created/deleted, API key created/revoked, Sync executed | endpointId, keyId, eventType |
| **Data Access** | Data export requested, Adherence report generated | userId, exportFormat, dateRange |
| **Admin Actions** | User role change, System config change, Maintenance mode | adminId, action, targetResource |
| **Consent** | Consent given, Consent withdrawn, Privacy setting changed | userId, consentType, previousValue |
| **Security** | MFA enabled/disabled, Suspicious login, Account locked | userId, reason, IP |

### 14.2 Audit Log Schema (Detailed)

```sql
CREATE TABLE AuditLogs (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Actor
    ActorType VARCHAR(20) NOT NULL,     -- 'user', 'device', 'system', 'admin'
    ActorId VARCHAR(100),               -- userId, deviceId, or 'system'
    ActorEmail VARCHAR(256),            -- For user actors
    ActorRole VARCHAR(50),              -- 'Patient', 'Caregiver', 'Admin'
    
    -- Action
    Category VARCHAR(50) NOT NULL,      -- 'authentication', 'dispensing', etc.
    Action VARCHAR(100) NOT NULL,       -- 'login', 'dose_confirmed', etc.
    Result VARCHAR(20) NOT NULL,        -- 'success', 'failure', 'denied'
    
    -- Resource
    ResourceType VARCHAR(50),           -- 'User', 'Device', 'DispenseEvent', etc.
    ResourceId VARCHAR(100),            -- Entity ID
    
    -- Context
    IpAddress VARCHAR(45),              -- IPv4 or IPv6
    UserAgent VARCHAR(500),             -- Browser/device info
    RequestId VARCHAR(100),             -- Correlation ID
    
    -- Changes (for update/delete)
    PreviousValues JSONB,               -- Before state
    NewValues JSONB,                    -- After state
    
    -- Metadata
    AdditionalData JSONB,               -- Extra context
    
    -- Constraints
    CONSTRAINT chk_result CHECK (Result IN ('success', 'failure', 'denied'))
);

-- Immutability: No UPDATE or DELETE allowed (enforced by DB triggers)
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_immutable_update BEFORE UPDATE ON AuditLogs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER audit_immutable_delete BEFORE DELETE ON AuditLogs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- Indexes for common queries
CREATE INDEX IX_AuditLogs_ActorId_Timestamp ON AuditLogs(ActorId, Timestamp DESC);
CREATE INDEX IX_AuditLogs_Category_Timestamp ON AuditLogs(Category, Timestamp DESC);
CREATE INDEX IX_AuditLogs_ResourceType_ResourceId ON AuditLogs(ResourceType, ResourceId);
CREATE INDEX IX_AuditLogs_Timestamp ON AuditLogs(Timestamp DESC);
```

### 14.3 Audit Middleware Implementation

```csharp
// Infrastructure/Services/AuditService.cs
public class AuditService : IAuditService
{
    private readonly AppDbContext _db;
    private readonly IHttpContextAccessor _http;
    
    public async Task LogAsync(AuditEntry entry, CancellationToken ct)
    {
        var context = _http.HttpContext;
        
        var log = new AuditLog
        {
            Id = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            ActorType = entry.ActorType,
            ActorId = context?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            ActorEmail = context?.User.FindFirst(ClaimTypes.Email)?.Value,
            ActorRole = context?.User.FindFirst(ClaimTypes.Role)?.Value,
            Category = entry.Category,
            Action = entry.Action,
            Result = entry.Result,
            ResourceType = entry.ResourceType,
            ResourceId = entry.ResourceId,
            IpAddress = context?.Connection.RemoteIpAddress?.ToString(),
            UserAgent = context?.Request.Headers.UserAgent.ToString(),
            RequestId = context?.TraceIdentifier,
            PreviousValues = entry.PreviousValues != null ? JsonSerializer.Serialize(entry.PreviousValues) : null,
            NewValues = entry.NewValues != null ? JsonSerializer.Serialize(entry.NewValues) : null,
            AdditionalData = entry.AdditionalData != null ? JsonSerializer.Serialize(entry.AdditionalData) : null,
        };
        
        _db.AuditLogs.Add(log);
        await _db.SaveChangesAsync(ct);
    }
}
```

### 14.4 Audit Log Retention & Export

| Requirement | Implementation |
|:-----------|:-------------|
| Retention | 7 years (immutable, no deletion) |
| Storage | PostgreSQL → Archive to Azure Cool Blob after 1 year |
| Export format | JSON Lines, CSV (for regulators) |
| Search API | GET `/api/admin/audit?actor=&category=&from=&to=` (Admin only) |
| GDPR export | Included in user data export (own audit entries only) |
| Compliance | Presented during ISO 13485 audits and regulatory inspections |

---

## 15. Subscription & Billing Architecture (Planned)

### 15.1 Subscription Tiers

| Tier | Monthly | Annual | Features |
|:-----|:--------|:-------|:---------|
| **Essential** (B2C) | CHF 34.99 | CHF 349.90 | 1 home device, 4 languages, standard support (24h) |
| **Premium** (B2C) | CHF 49.99 | CHF 499.90 | Home + travel device, priority support (4h) |
| **Family** (B2C) | CHF 69.99 | CHF 699.90 | Both devices, 3 caregiver accounts |
| **Device Purchase** | CHF 449 (home) | CHF 649 (both) | Reduced monthly: CHF 14.99-19.99 |
| **Pharmacy** (B2B) | CHF 12/patient/mo | — | Min 10 patients, setup CHF 1,500 |
| **Home Care** (B2B) | CHF 15/patient/mo | — | Min 20 patients, setup CHF 2,500 |
| **Care Home** (B2B) | CHF 18/resident/mo | — | Min 30 residents, setup CHF 5,000 |
| **Insurer** (B2B) | CHF 8/member/mo | — | Min 100 members, setup CHF 10,000 |

### 15.2 Feature Gating

| Feature | Essential | Premium | Family | B2B |
|:--------|:----------|:--------|:-------|:----|
| Home device (SMD-100) | ✅ | ✅ | ✅ | ✅ |
| Travel device (SMD-200) | ❌ | ✅ | ✅ | ✅ |
| Caregiver accounts | 1 | 1 | 3 | Unlimited |
| Push notifications | ✅ | ✅ | ✅ | ✅ |
| Email notifications | ✅ | ✅ | ✅ | ✅ |
| SMS notifications | ❌ | ❌ | ❌ | ✅ |
| Adherence reports | Basic | Detailed | Detailed | Advanced |
| Data export | JSON | JSON + CSV | JSON + CSV | JSON + CSV + FHIR |
| API access | ❌ | ❌ | ❌ | ✅ |
| EHR integration | ❌ | ❌ | ❌ | ✅ (Phase 2) |
| Support SLA | 24h | 4h | 4h | 1h (24/7) |

---

## Appendix A: Regulatory Contacts

| Authority | Contact | Purpose |
|:----------|:--------|:---------|
| **FDPIC (Switzerland)** | contact@edoeb.admin.ch | Data protection, breach notifications |
| **EU Supervisory Authority** | [Lead Authority] | GDPR compliance, breach notifications |
| **Swissmedic** | info@swissmedic.ch | Medical device registration, incidents |
| **Notified Body** | [NB Contact] | CE MDR certification, technical documentation |

## Appendix B: Document References

| Document | Reference |
|:---------|:----------|
| **GDPR** | Regulation (EU) 2016/679 |
| **Swiss nDSG** | Federal Act on Data Protection (FADP), SR 235.1 |
| **CE MDR** | Regulation (EU) 2017/745 |
| **IEC 62304** | Medical device software — Software life cycle processes |
| **ISO 13485** | Medical devices — Quality management systems |
| **ISO 14971** | Medical devices — Application of risk management to medical devices |

---

**Document End**

**Version History:**

| Version | Date | Author | Changes |
|:--------|:-----|:-------|:--------|
| 1.0 | February 2026 | Compliance Team | Initial release |

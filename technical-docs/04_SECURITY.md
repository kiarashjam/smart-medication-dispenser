# Security Requirements

**Comprehensive Security & Compliance Guide**

**GDPR, Swiss nDSG, CE MDR Compliant**

**Version 3.0**

---

## Document Information

| | |
|:--|:--|
| Version | 3.0 |
| Last Updated | February 2026 |
| Classification | Confidential — Engineering Team |
| Compliance | GDPR, nDSG, CE MDR, ISO 27001 |

---

## 1. Security Overview

### 1.1 Security Principles

| Principle | Implementation |
|:----------|:---------------|
| **Defense in Depth** | Multiple security layers |
| **Least Privilege** | Minimum necessary access |
| **Zero Trust** | Verify everything, trust nothing |
| **Security by Design** | Built-in from the start |
| **Data Minimization** | Collect only what's needed |
| **Privacy by Default** | Most private settings default |

### 1.2 Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURITY ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   DEVICE SECURITY                    COMMUNICATION                       │
│   ┌─────────────────┐               ┌─────────────────┐                 │
│   │ Secure Boot     │               │ TLS 1.3         │                 │
│   │ Encrypted Store │ ──────────────│ Certificate Pin │                 │
│   │ Secure Element  │               │ JWT Auth        │                 │
│   │ Tamper Detect   │               │ Mutual TLS      │                 │
│   └─────────────────┘               └─────────────────┘                 │
│           │                                  │                           │
│           │                                  │                           │
│           ▼                                  ▼                           │
│   ┌─────────────────────────────────────────────────────────┐          │
│   │                     CLOUD SECURITY                       │          │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │          │
│   │  │ WAF      │  │ API GW   │  │ IAM      │  │ Encrypt  │ │          │
│   │  │          │  │          │  │          │  │          │ │          │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │          │
│   │                                                          │          │
│   │  ┌──────────────────────────────────────────────────┐   │          │
│   │  │              DATABASE (Swiss/EU)                  │   │          │
│   │  │  • Encryption at rest (AES-256)                   │   │          │
│   │  │  • Row-level security                             │   │          │
│   │  │  • Audit logging                                  │   │          │
│   │  └──────────────────────────────────────────────────┘   │          │
│   └─────────────────────────────────────────────────────────┘          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Data Classification

| Classification | Examples | Protection Level |
|:---------------|:---------|:-----------------|
| **Public** | Marketing materials, public docs | None required |
| **Internal** | Employee info, internal processes | Access control |
| **Confidential** | Device data, schedules | Encryption + access control |
| **Restricted** | Health data, personal info | Full encryption + audit + minimization |

---

## 2. Device Security

### 2.1 Secure Boot Chain

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURE BOOT PROCESS                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. ROM Bootloader                                           │
│     │                                                        │
│     ▼                                                        │
│  2. Verify Second-Stage Bootloader Signature                 │
│     │ (RSA-2048 / ECDSA P-256)                              │
│     │                                                        │
│     ├── VALID ──────────────────────────────────────┐       │
│     │                                                │       │
│     ▼                                                ▼       │
│  3. Load Second-Stage Bootloader         INVALID: HALT      │
│     │                                                        │
│     ▼                                                        │
│  4. Verify Application Firmware Signature                    │
│     │                                                        │
│     ├── VALID ──────────────────────────────────────┐       │
│     │                                                │       │
│     ▼                                                ▼       │
│  5. Load & Execute Application           INVALID: ROLLBACK  │
│     │                                                        │
│     ▼                                                        │
│  6. Application Self-Test                                    │
│     │                                                        │
│     ├── PASS ───────────────────────────────────────┐       │
│     │                                                │       │
│     ▼                                                ▼       │
│  7. Normal Operation                     FAIL: SAFE MODE    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Secure Boot Implementation

| Component | Specification |
|:----------|:--------------|
| Root of Trust | ESP32 eFuse (one-time programmable) |
| Signing Algorithm | RSA-3072 or ECDSA P-256 |
| Hash Algorithm | SHA-256 |
| Key Storage | Hardware eFuse (cannot be read) |
| Verification | Every boot |
| Rollback Protection | Version counter in eFuse |

### 2.3 Secure Element Usage

| Data | Storage | Protection |
|:-----|:--------|:-----------|
| Device private key | Secure element | Hardware protected |
| Device certificate | Secure element | Hardware protected |
| API token | Encrypted NVS | AES-256-GCM |
| WiFi credentials | Encrypted NVS | AES-256-GCM |
| User data | Encrypted flash | AES-256-GCM |
| Schedules | Encrypted flash | AES-256-GCM |
| Event queue | Encrypted flash | AES-256-GCM |

### 2.4 Encryption Specifications

| Purpose | Algorithm | Key Length | Mode |
|:--------|:----------|:-----------|:-----|
| Data at rest | AES | 256-bit | GCM |
| Key derivation | PBKDF2 | — | SHA-256 |
| Random generation | TRNG | — | Hardware |
| Hashing | SHA | 256-bit | — |
| Signing | ECDSA | P-256 | — |

### 2.5 Physical Security

| Measure | Implementation |
|:--------|:---------------|
| **Tamper detection** | Reed switch on case |
| **JTAG disabled** | eFuse burned in production |
| **Debug disabled** | UART debug disabled |
| **Enclosure** | Tamper-evident screws |
| **Factory reset** | Physical button + software |
| **Data wipe** | On tamper or 10 failed logins |

### 2.6 Tamper Response

| Trigger | Response |
|:--------|:---------|
| Case opened | Log event, optional wipe |
| Multiple failed auths | Lock out, notify admin |
| Firmware tampering | Refuse boot, notify |
| Debug port probe | Ignore, log attempt |

---

## 3. Communication Security

### 3.1 TLS Configuration

| Parameter | Requirement |
|:----------|:------------|
| **Protocol** | TLS 1.3 only |
| **Cipher Suites** | TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256 |
| **Key Exchange** | X25519, P-256 |
| **Certificate Validation** | Required |
| **Certificate Pinning** | SHA-256 pin of leaf certificate |
| **OCSP Stapling** | Supported |
| **Session Resumption** | TLS 1.3 0-RTT disabled |

### 3.2 Certificate Pinning

```c
// Certificate pin (SHA-256 of Subject Public Key Info)
const char* CERT_PIN = "sha256//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

// Backup pin (for certificate rotation)
const char* BACKUP_PIN = "sha256//BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=";
```

**Pin Rotation Process:**

1. Generate new certificate 60 days before expiry
2. Add new pin to firmware (backup pin slot)
3. Release firmware update
4. Wait 30 days for device updates
5. Deploy new certificate to server
6. Remove old pin in next firmware release

### 3.3 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  DEVICE                              SERVER                  │
│    │                                    │                    │
│    │  1. TLS Handshake                  │                    │
│    │ ──────────────────────────────────>│                    │
│    │                                    │                    │
│    │  2. Server Certificate             │                    │
│    │ <──────────────────────────────────│                    │
│    │                                    │                    │
│    │  3. Validate Cert + Pin            │                    │
│    │ ──────────────────────────────────>│                    │
│    │                                    │                    │
│    │  4. Client Certificate (mTLS)      │                    │
│    │ ──────────────────────────────────>│                    │
│    │                                    │                    │
│    │  5. Validate Device Cert           │                    │
│    │ <──────────────────────────────────│                    │
│    │                                    │                    │
│    │  6. JWT Request                    │                    │
│    │    {device_id, timestamp, nonce}   │                    │
│    │ ──────────────────────────────────>│                    │
│    │                                    │                    │
│    │  7. JWT Token                      │                    │
│    │    {token, expires, refresh}       │                    │
│    │ <──────────────────────────────────│                    │
│    │                                    │                    │
│    │  8. API Request with JWT           │                    │
│    │    Authorization: Bearer {token}   │                    │
│    │ ──────────────────────────────────>│                    │
│    │                                    │                    │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 JWT Token Structure

The platform uses **two JWT token types** for different authentication layers:

#### User JWT (for Mobile/Web Applications)

Algorithm: **HS256** (HMAC-SHA256 symmetric key)

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "iss": "SmartMedicationDispenser",
    "aud": "SmartMedicationDispenser",
    "iat": 1707206400,
    "exp": 1707292800,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "a1b2c3d4-...",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": "patient@example.com",
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Patient"
  }
}
```

**Configuration (from `appsettings.json`):**

```json
{
  "Jwt": {
    "SecretKey": "SmartMedicationDispenser_MVP_SecretKey_AtLeast32Characters!",
    "Issuer": "SmartMedicationDispenser",
    "Audience": "SmartMedicationDispenser"
  }
}
```

> **Production Note:** The symmetric secret key must be at least 32 characters and stored securely (environment variable or Azure Key Vault). Never commit to source control.

#### Device JWT (for Firmware-to-Cloud)

Algorithm: **RS256** (RSA asymmetric) — planned for production

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-2026-01"
  },
  "payload": {
    "iss": "smartdispenser.ch",
    "sub": "SMD-00A1B2C3",
    "aud": "api.smartdispenser.ch",
    "iat": 1707206400,
    "exp": 1707292800,
    "jti": "unique-token-id",
    "device_type": "main",
    "permissions": ["heartbeat", "events", "schedule"]
  }
}
```

### 3.5 X-API-Key Authentication

For **device integrations and webhooks**, the platform supports API key authentication as an alternative to JWT:

| Feature | Description |
|:--------|:------------|
| **Creation** | Via `POST /api/integrations/devices/{id}/api-keys` |
| **Storage** | SHA-256 hash stored in database; plain key shown once |
| **Header** | `X-API-Key: smd_live_abc123...` |
| **Scope** | Per-device; key is bound to a specific device |
| **Endpoints** | `/api/webhooks/incoming`, `/api/integrations/sync` |
| **Revocation** | Via `DELETE /api/integrations/devices/{id}/api-keys/{keyId}` |

```
Device/External System                      API Server
        │                                       │
        │  POST /api/webhooks/incoming          │
        │  X-API-Key: smd_live_abc123...        │
        │ ────────────────────────────────────→ │
        │                                       │
        │                     SHA-256(key) →     │
        │                     Lookup in DB →     │
        │                     Resolve DeviceId → │
        │                                       │
        │  202 Accepted                         │
        │ ←──────────────────────────────────── │
```

### 3.6 Token Lifecycle

| Stage | Duration | Action |
|:------|:---------|:-------|
| Validity | 24 hours | Normal operation |
| Refresh window | Last 6 hours | Refresh automatically |
| Grace period | 1 hour after expiry | Allow refresh |
| Expired | Beyond grace | Re-authenticate |
| Revoked | Immediate | Re-authenticate |

---

## 4. Data Protection (GDPR & nDSG)

### 4.1 Regulatory Framework

| Regulation | Jurisdiction | Key Requirements |
|:-----------|:-------------|:-----------------|
| **GDPR** | EU/EEA | Data protection, consent, rights |
| **Swiss nDSG** | Switzerland | Similar to GDPR, local requirements |
| **CE MDR** | EU | Medical device cybersecurity |
| **ISO 27001** | International | Information security management |

### 4.2 GDPR Compliance Matrix

| Article | Requirement | Implementation |
|:--------|:------------|:---------------|
| Art. 5 | Data processing principles | Minimization, purpose limitation |
| Art. 6 | Lawful basis | Consent + legitimate interest |
| Art. 7 | Consent conditions | Clear opt-in, easy withdrawal |
| Art. 12-14 | Transparency | Privacy policy, data notice |
| Art. 15 | Right of access | Data export feature |
| Art. 16 | Right to rectification | Self-service + support |
| Art. 17 | Right to erasure | Data deletion feature |
| Art. 18 | Right to restriction | Processing pause |
| Art. 20 | Data portability | JSON/CSV export |
| Art. 25 | Privacy by design | Built-in from start |
| Art. 30 | Records of processing | Processing register |
| Art. 32 | Security measures | This document |
| Art. 33 | Breach notification | 72-hour process |
| Art. 35 | DPIA | Completed for high-risk processing |

### 4.3 Data Minimization

| Data Category | Collected | Justification |
|:--------------|:----------|:--------------|
| Device ID | Yes | Device identification |
| Schedule | Yes | Core functionality |
| Dose events | Yes | Adherence tracking |
| Medication names | Yes | User convenience |
| Patient name | **No** | Not required |
| Patient address | **No** | Not required |
| Medical diagnosis | **No** | Not required |
| Doctor information | **No** | Not required |
| GPS location | **No** | Not required |

### 4.4 Data Storage Location

| Data | Location | Justification |
|:-----|:---------|:--------------|
| User accounts | Switzerland | Legal requirement |
| Device data | Switzerland | Legal requirement |
| Event history | Switzerland | Legal requirement |
| Backups | Switzerland (secondary DC) | Business continuity |
| Logs | Switzerland | Legal requirement |
| Analytics | EU (anonymized only) | GDPR compliant |

### 4.5 Data Retention Policy

| Data Type | Retention Period | Deletion Method |
|:----------|:-----------------|:----------------|
| Account data | Account lifetime + 30 days | Automated purge |
| Dose events | 2 years | Automated purge |
| Schedules | Active + 1 year | Automated purge |
| Device logs | 90 days | Automated purge |
| Support tickets | 3 years | Manual review |
| Audit logs | 7 years | Archived, then purge |
| Backups | 90 days | Automated purge |

### 4.6 Data Subject Rights Implementation

| Right | Feature | Response Time |
|:------|:--------|:--------------|
| **Access** | Export button in app/portal | Immediate |
| **Rectification** | Edit profile in app/portal | Immediate |
| **Erasure** | Delete account feature | 30 days |
| **Restriction** | Pause processing toggle | Immediate |
| **Portability** | JSON/CSV export | Immediate |
| **Objection** | Contact support | 30 days |

### 4.7 Consent Management

```json
{
  "consent_record": {
    "user_id": "usr_123456",
    "consents": [
      {
        "type": "essential_processing",
        "granted": true,
        "timestamp": "2026-01-15T10:00:00Z",
        "version": "1.0",
        "method": "app_signup"
      },
      {
        "type": "caregiver_sharing",
        "granted": true,
        "timestamp": "2026-01-15T10:05:00Z",
        "caregivers": ["user_789"],
        "version": "1.0"
      },
      {
        "type": "analytics",
        "granted": false,
        "timestamp": "2026-01-15T10:00:00Z",
        "version": "1.0"
      },
      {
        "type": "marketing",
        "granted": false,
        "timestamp": "2026-01-15T10:00:00Z",
        "version": "1.0"
      }
    ]
  }
}
```

---

## 5. CE MDR Cybersecurity

### 5.1 MDR Cybersecurity Requirements

| Requirement | Article | Implementation |
|:------------|:--------|:---------------|
| Risk management | Annex I, 17.1 | ISO 14971 + cybersecurity risks |
| Security measures | Annex I, 17.2 | This document |
| SOUP management | IEC 62304 | Software BOM, vulnerability tracking |
| Update capability | Annex I, 17.3 | OTA update system |
| Incident handling | Art. 87 | Incident response plan |

### 5.2 Threat Model (STRIDE)

| Threat | Example | Mitigation |
|:-------|:--------|:-----------|
| **Spoofing** | Fake device registration | Device certificates, mTLS |
| **Tampering** | Modified firmware | Secure boot, code signing |
| **Repudiation** | Denied dose event | Audit logs, signatures |
| **Information Disclosure** | Data leak | Encryption, access control |
| **Denial of Service** | API flooding | Rate limiting, WAF |
| **Elevation of Privilege** | Unauthorized access | RBAC, JWT scopes |

### 5.3 Risk Assessment Summary

| Risk | Likelihood | Impact | Risk Level | Mitigation |
|:-----|:-----------|:-------|:-----------|:-----------|
| Unauthorized device access | Low | High | Medium | mTLS, device auth |
| Data interception | Low | High | Medium | TLS 1.3, pinning |
| Firmware tampering | Very Low | Critical | Medium | Secure boot |
| API compromise | Low | Critical | High | WAF, monitoring |
| Physical tampering | Low | Medium | Low | Tamper detection |
| Insider threat | Low | High | Medium | Access controls, audit |

### 5.4 Software Bill of Materials (SBOM)

| Component | Version | License | Vulnerability Check |
|:----------|:--------|:--------|:-------------------|
| ESP-IDF | 5.x | Apache 2.0 | Monthly |
| FreeRTOS | 10.x | MIT | Monthly |
| mbedTLS | 3.x | Apache 2.0 | Monthly |
| LVGL | 8.x | MIT | Monthly |
| cJSON | 1.x | MIT | Monthly |

**Vulnerability Management:**
- Automated CVE scanning weekly
- Critical vulnerabilities: patch within 72 hours
- High vulnerabilities: patch within 30 days
- Medium/Low: next scheduled release

---

## 6. Firmware Security

### 6.1 OTA Update Security

```
┌─────────────────────────────────────────────────────────────┐
│                    OTA UPDATE PROCESS                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. API announces update available                           │
│     │                                                        │
│     ▼                                                        │
│  2. Device checks conditions                                 │
│     • Battery > 30%                                          │
│     • No dose scheduled within 1 hour                        │
│     • WiFi signal adequate                                   │
│     │                                                        │
│     ▼                                                        │
│  3. Download firmware (HTTPS)                                │
│     • Chunked transfer                                       │
│     • Resume on failure                                      │
│     │                                                        │
│     ▼                                                        │
│  4. Verify integrity                                         │
│     • SHA-256 checksum                                       │
│     • RSA-3072 signature                                     │
│     • Version > current                                      │
│     │                                                        │
│     ├── PASS ────────────────────────────────────────┐      │
│     │                                                 │      │
│     ▼                                                 ▼      │
│  5. Write to inactive partition           FAIL: Delete,     │
│     │                                     report error       │
│     ▼                                                        │
│  6. Set boot flag                                            │
│     │                                                        │
│     ▼                                                        │
│  7. Reboot                                                   │
│     │                                                        │
│     ▼                                                        │
│  8. New firmware self-test                                   │
│     │                                                        │
│     ├── PASS ────────────────────────────────────────┐      │
│     │                                                 │      │
│     ▼                                                 ▼      │
│  9. Confirm update to API             FAIL: Rollback to old │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Firmware Signing Process

| Step | Tool | Output |
|:-----|:-----|:-------|
| 1. Build firmware | ESP-IDF | firmware.bin |
| 2. Calculate hash | SHA-256 | firmware.sha256 |
| 3. Sign hash | RSA-3072 private key | firmware.sig |
| 4. Package | Custom script | firmware.pkg |
| 5. Upload | CI/CD | Server storage |

### 6.3 Key Management

| Key | Purpose | Storage | Rotation |
|:----|:--------|:--------|:---------|
| Signing key (private) | Sign firmware | HSM (offline) | Never (unless compromised) |
| Signing key (public) | Verify firmware | Device eFuse | With firmware update |
| API TLS certificate | Server auth | ACM/HSM | Annual |
| Device certificate | Device auth | Secure element | 2 years |
| JWT signing key | Token signing | HSM | Annual |

---

## 7. Access Control

### 7.1 Role-Based Access Control (RBAC)

| Role | Permissions |
|:-----|:------------|
| **Patient** | View own data, confirm doses, manage preferences |
| **Caregiver** | View patient data, manage schedules, receive alerts |
| **Admin (B2B)** | Manage multiple patients, view reports |
| **Support** | View device data, run diagnostics |
| **Engineer** | Access logs, debug info (no PII) |

### 7.2 API Permissions

| Endpoint | Patient | Caregiver | Admin | Support |
|:---------|:--------|:----------|:------|:--------|
| GET /devices | Own | Assigned | All org | All |
| POST /events | Own | — | — | — |
| GET /schedule | Own | Assigned | All org | All |
| PUT /schedule | — | Assigned | All org | — |
| GET /reports | Own | Assigned | All org | All |
| DELETE /account | Own | — | — | — |

### 7.3 Multi-Factor Authentication

| User Type | Factors |
|:----------|:--------|
| **Patients** | Password + Email OTP (optional) |
| **Caregivers** | Password + Email/SMS OTP |
| **Admin (B2B)** | Password + Authenticator app |
| **Support** | Password + Hardware key |
| **Engineers** | Password + Hardware key + VPN |

---

## 8. Incident Response

### 8.1 Security Incident Classification

| Severity | Description | Response Time | Notification |
|:---------|:------------|:--------------|:-------------|
| **Critical** | Active breach, data loss | 1 hour | Immediate |
| **High** | Vulnerability exploited | 4 hours | 24 hours |
| **Medium** | Vulnerability discovered | 24 hours | 72 hours |
| **Low** | Policy violation | 72 hours | As needed |

### 8.2 Incident Response Process

```
1. DETECT
   • Monitoring alerts
   • User reports
   • Security scanning
        │
        ▼
2. CONTAIN
   • Isolate affected systems
   • Revoke compromised credentials
   • Block malicious IPs
        │
        ▼
3. INVESTIGATE
   • Collect evidence
   • Determine scope
   • Identify root cause
        │
        ▼
4. REMEDIATE
   • Patch vulnerabilities
   • Restore from backups
   • Strengthen defenses
        │
        ▼
5. RECOVER
   • Resume normal operations
   • Verify integrity
   • Monitor for recurrence
        │
        ▼
6. REPORT
   • Internal documentation
   • Regulatory notification (if required)
   • Customer notification (if required)
```

### 8.3 Data Breach Notification

| Jurisdiction | Authority | Timeline |
|:-------------|:----------|:---------|
| GDPR (EU) | Supervisory Authority | 72 hours |
| Swiss nDSG | FDPIC | 72 hours |
| Users | Direct notification | Without undue delay |

---

## 9. Audit & Logging

### 9.1 Audit Log Events

| Category | Events |
|:---------|:-------|
| **Authentication** | Login, logout, failed login, password change |
| **Authorization** | Permission granted, denied, changed |
| **Data Access** | Read, create, update, delete |
| **Configuration** | Settings changed, device registered |
| **Security** | MFA enabled, session terminated |
| **Compliance** | Data export, deletion request |

### 9.2 Log Format

```json
{
  "timestamp": "2026-02-06T08:00:00Z",
  "event_type": "authentication.login",
  "actor": {
    "type": "user",
    "id": "usr_123456",
    "ip": "192.168.1.1",
    "user_agent": "SmartDispenser/1.2.0 iOS/17.0"
  },
  "resource": {
    "type": "account",
    "id": "acc_123456"
  },
  "action": "login",
  "result": "success",
  "details": {
    "method": "password",
    "mfa_used": true,
    "session_id": "sess_abc123"
  }
}
```

### 9.3 Log Retention

| Log Type | Retention | Storage |
|:---------|:----------|:--------|
| Security events | 7 years | Immutable storage |
| Access logs | 2 years | Standard storage |
| Application logs | 90 days | Standard storage |
| Debug logs | 30 days | Temporary storage |

---

## 10. Compliance Checklist

### 10.1 Device Security Checklist

| Item | Status | Notes |
|:-----|:------:|:------|
| Secure boot enabled | ☐ | |
| eFuse configured (JTAG disabled) | ☐ | |
| Debug ports disabled | ☐ | |
| Certificate pinning implemented | ☐ | |
| Secure element provisioned | ☐ | |
| Encryption at rest enabled | ☐ | |
| Tamper detection active | ☐ | |
| Factory reset clears all data | ☐ | |

### 10.2 Communication Security Checklist

| Item | Status | Notes |
|:-----|:------:|:------|
| TLS 1.3 only | ☐ | |
| Certificate validation | ☐ | |
| Certificate pinning | ☐ | |
| JWT authentication | ☐ | |
| Token rotation | ☐ | |
| Rate limiting | ☐ | |
| Input validation | ☐ | |

### 10.3 Data Protection Checklist

| Item | Status | Notes |
|:-----|:------:|:------|
| Privacy policy published | ☐ | |
| Consent management | ☐ | |
| Data minimization verified | ☐ | |
| Data export feature | ☐ | |
| Data deletion feature | ☐ | |
| Retention policy automated | ☐ | |
| Data location documented | ☐ | |
| DPIA completed | ☐ | |

### 10.4 CE MDR Cybersecurity Checklist

| Item | Status | Notes |
|:-----|:------:|:------|
| Threat model documented | ☐ | |
| Risk assessment completed | ☐ | |
| SBOM maintained | ☐ | |
| Vulnerability process defined | ☐ | |
| OTA update mechanism | ☐ | |
| Incident response plan | ☐ | |
| Penetration test completed | ☐ | |
| Security audit completed | ☐ | |

---

## 11. Security Testing

### 11.1 Testing Schedule

| Test Type | Frequency | Scope |
|:----------|:----------|:------|
| Vulnerability scan | Weekly | All systems |
| Penetration test | Annually | Full scope |
| Security audit | Annually | Policies, processes |
| Code review | Every PR | Security-relevant code |
| Dependency scan | Daily | All dependencies |

### 11.2 Penetration Test Scope

| Area | Tests |
|:-----|:------|
| **Device** | Firmware extraction, side-channel, physical |
| **API** | OWASP Top 10, authentication bypass |
| **Mobile app** | OWASP MASVS, data leakage |
| **Web portal** | OWASP ASVS, session management |
| **Infrastructure** | Network, cloud configuration |

---

## Revision History

| Version | Date | Changes |
|:--------|:-----|:--------|
| 1.0 | Jan 2026 | Initial release |
| 2.0 | Feb 2026 | Complete expansion with GDPR, CE MDR, detailed specifications |
| 3.0 | Feb 2026 | Updated JWT implementation (HS256 user + RS256 device), added X-API-Key auth, aligned with codebase |
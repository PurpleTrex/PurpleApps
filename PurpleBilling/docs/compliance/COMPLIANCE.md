# PurpleBilling Compliance Guide

## Regulatory Compliance Overview

PurpleBilling is designed to comply with major data protection and financial regulations:

- **PCI-DSS Level 1**: Payment Card Industry Data Security Standard
- **GDPR**: General Data Protection Regulation (EU)
- **CCPA**: California Consumer Privacy Act
- **SOC 2 Type II**: Service Organization Control
- **HIPAA-ready**: Health Insurance Portability and Accountability Act (optional module)

---

## PCI-DSS Compliance

### Overview

PCI-DSS (Payment Card Industry Data Security Standard) is mandatory for any organization that stores, processes, or transmits credit card information.

### Level Classification

**PurpleBilling Target**: Level 1 (>6 million transactions/year)

### 12 Requirements

#### Requirement 1: Install and Maintain Firewall Configuration

✅ **Implementation**:
```bash
# UFW firewall configuration
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirects to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Network segmentation
# - Public subnet: Load balancer only
# - Private subnet: Application servers
# - Database subnet: Database servers only
```

✅ **Documentation**: Network diagram in `/docs/architecture/network-diagram.pdf`

#### Requirement 2: Do Not Use Vendor-Supplied Defaults

✅ **Implementation**:
- Changed default PostgreSQL port and passwords
- Disabled default admin accounts
- Custom error pages (no system information disclosure)
- Removed default test accounts

#### Requirement 3: Protect Stored Cardholder Data

✅ **Implementation**:
- **NO CARD DATA STORED** - Only tokens from payment processors
- Tokenization via Stripe/PayPal/Square
- PII encrypted with AES-256-GCM
- Encryption keys in Azure Key Vault/AWS KMS

```csharp
// Token storage (SAFE)
public class PaymentMethod
{
    public string Token { get; set; }        // tok_xxxxx from Stripe
    public string LastFour { get; set; }     // 4242 (for display only)
    public string Brand { get; set; }        // visa, mastercard
    // NO FULL CARD NUMBER
    // NO CVV
}
```

#### Requirement 4: Encrypt Transmission of Cardholder Data

✅ **Implementation**:
- TLS 1.3 (minimum TLS 1.2)
- Strong cipher suites only
- HSTS enabled
- Certificate pinning in mobile apps

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
```

#### Requirement 5: Protect All Systems Against Malware

✅ **Implementation**:
- ClamAV antivirus on all servers
- File upload scanning
- Regular malware scans
- IDS/IPS (Suricata)

```bash
# Automated scanning
0 2 * * * clamscan -r /opt/purplebilling --log=/var/log/clamav/scan.log
```

#### Requirement 6: Develop and Maintain Secure Systems

✅ **Implementation**:
- Secure SDLC
- Code review required
- SAST (Static Application Security Testing)
- DAST (Dynamic Application Security Testing)
- Dependency vulnerability scanning
- Security training for developers

```yaml
# GitHub Actions security scan
- name: Security Scan
  run: |
    dotnet tool install --global security-scan
    security-scan *.sln
    
- name: Dependency Check
  run: dotnet list package --vulnerable
```

#### Requirement 7: Restrict Access to Cardholder Data

✅ **Implementation**:
- Role-Based Access Control (RBAC)
- Principle of least privilege
- Access requires business justification
- Regular access reviews

```csharp
[Authorize(Roles = "BillingManager,Admin")]
[RequirePermission(Permission.ViewAllInvoices)]
public async Task<IActionResult> GetInvoices() { }
```

#### Requirement 8: Identify and Authenticate Access

✅ **Implementation**:
- Unique user IDs
- Strong password policy (12+ chars, complexity)
- Two-factor authentication (2FA) required for admin
- Session timeout after 15 minutes of inactivity
- Password history (last 4 passwords)
- Account lockout after 6 failed attempts

```csharp
public class PasswordPolicy
{
    public const int MinLength = 12;
    public const int MaxAge = 90; // days
    public const int HistorySize = 4;
    public const int MaxFailedAttempts = 6;
    public const int LockoutMinutes = 30;
}
```

#### Requirement 9: Restrict Physical Access

✅ **Implementation**:
- Secure datacenter with badge access
- Video surveillance
- Visitor logs
- Media destruction policy
- Server decommissioning procedure

#### Requirement 10: Track and Monitor All Network Access

✅ **Implementation**:
- Comprehensive audit logging
- Centralized log management (ELK Stack)
- Log retention: 1 year
- Daily log review
- Automated alerting

```csharp
// All actions logged
AuditLog:
- User authentication (success/failure)
- Authorization failures
- All payment transactions
- Admin actions
- Configuration changes
- Data access
```

#### Requirement 11: Regularly Test Security Systems

✅ **Implementation**:
- Quarterly external penetration testing
- Annual internal penetration testing
- Vulnerability scanning (weekly)
- IDS/IPS monitoring
- File integrity monitoring (AIDE)

```bash
# Automated vulnerability scanning
0 2 * * 0 /opt/purplebilling/scripts/vulnerability-scan.sh
```

#### Requirement 12: Maintain Information Security Policy

✅ **Implementation**:
- Written information security policy
- Annual security awareness training
- Security incident response plan
- Risk assessment procedures
- Vendor security policy

---

## GDPR Compliance

### Principles

1. **Lawfulness, fairness, and transparency**
2. **Purpose limitation**
3. **Data minimization**
4. **Accuracy**
5. **Storage limitation**
6. **Integrity and confidentiality**
7. **Accountability**

### Data Subject Rights

#### Right to Access (Article 15)

```csharp
[HttpGet("api/v1/gdpr/data-export")]
[Authorize]
public async Task<IActionResult> ExportPersonalData()
{
    var userId = User.GetUserId();
    var data = await _gdprService.ExportUserDataAsync(userId);
    
    return File(
        Encoding.UTF8.GetBytes(JsonSerializer.Serialize(data)),
        "application/json",
        $"personal-data-{userId}.json"
    );
}
```

#### Right to Erasure (Article 17)

```csharp
[HttpDelete("api/v1/gdpr/delete-account")]
[Authorize]
public async Task<IActionResult> DeleteAccount()
{
    var userId = User.GetUserId();
    
    // Anonymize or delete personal data
    await _gdprService.DeleteUserDataAsync(userId);
    
    // Keep transaction records for legal/tax purposes
    await _gdprService.AnonymizeTransactionDataAsync(userId);
    
    return NoContent();
}
```

#### Right to Data Portability (Article 20)

```csharp
// Export in machine-readable format (JSON)
public async Task<PersonalDataExport> ExportUserDataAsync(Guid userId)
{
    return new PersonalDataExport
    {
        Profile = await GetUserProfile(userId),
        Invoices = await GetInvoices(userId),
        Transactions = await GetTransactions(userId),
        PaymentMethods = await GetPaymentMethods(userId), // Tokens only
        ExportDate = DateTime.UtcNow
    };
}
```

#### Right to Rectification (Article 16)

```csharp
[HttpPut("api/v1/users/profile")]
[Authorize]
public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
{
    var userId = User.GetUserId();
    await _userService.UpdateProfileAsync(userId, request);
    return Ok();
}
```

### Data Processing Records

```csharp
public class DataProcessingRecord
{
    public string Purpose { get; set; }
    public string LegalBasis { get; set; }
    public List<string> DataCategories { get; set; }
    public List<string> Recipients { get; set; }
    public string RetentionPeriod { get; set; }
    public string SecurityMeasures { get; set; }
}

// Example
var billingProcessing = new DataProcessingRecord
{
    Purpose = "Process payments and generate invoices",
    LegalBasis = "Contract (GDPR Article 6(1)(b))",
    DataCategories = new[] { "Name", "Email", "Address", "Payment tokens" },
    Recipients = new[] { "Stripe", "PayPal", "Email service provider" },
    RetentionPeriod = "7 years (tax requirements)",
    SecurityMeasures = "AES-256 encryption, TLS 1.3, access controls"
};
```

### Consent Management

```csharp
public class ConsentRecord
{
    public Guid UserId { get; set; }
    public string Purpose { get; set; }
    public bool Granted { get; set; }
    public DateTime Timestamp { get; set; }
    public string IpAddress { get; set; }
    public string Method { get; set; } // "explicit", "implicit"
}

// Marketing consent
[HttpPost("api/v1/consent/marketing")]
[Authorize]
public async Task<IActionResult> UpdateMarketingConsent([FromBody] bool consent)
{
    await _consentService.UpdateConsentAsync(
        User.GetUserId(),
        "marketing_emails",
        consent
    );
    return Ok();
}
```

### Breach Notification

**Timeline**: 72 hours to notify supervisory authority

```csharp
public class BreachNotificationService
{
    public async Task NotifyBreachAsync(SecurityBreach breach)
    {
        // 1. Assess severity
        var severity = AssessSeverity(breach);
        
        if (severity == BreachSeverity.High)
        {
            // 2. Notify supervisory authority within 72 hours
            await NotifySupervisoryAuthorityAsync(breach);
            
            // 3. Notify affected data subjects
            await NotifyAffectedUsersAsync(breach);
        }
        
        // 4. Document the breach
        await DocumentBreachAsync(breach);
    }
}
```

---

## CCPA Compliance

### Consumer Rights

1. **Right to Know**: What personal information is collected
2. **Right to Delete**: Request deletion of personal information
3. **Right to Opt-Out**: Sale of personal information (N/A - we don't sell data)
4. **Right to Non-Discrimination**: Equal service regardless of privacy rights exercise

### Implementation

```csharp
[HttpGet("api/v1/ccpa/disclosure")]
public IActionResult GetDataCollectionDisclosure()
{
    return Ok(new
    {
        Categories = new[]
        {
            new { Category = "Identifiers", Examples = "Name, email, address" },
            new { Category = "Financial", Examples = "Payment tokens, transaction history" },
            new { Category = "Commercial", Examples = "Purchase history, subscriptions" }
        },
        Purposes = new[]
        {
            "Process payments",
            "Provide customer support",
            "Detect fraud",
            "Comply with legal obligations"
        },
        ThirdParties = new[]
        {
            "Payment processors (Stripe, PayPal)",
            "Email service provider (SendGrid)",
            "Analytics (self-hosted only)"
        },
        DataSale = "We do not sell your personal information"
    });
}
```

---

## SOC 2 Type II Compliance

### Trust Service Criteria

#### Security
- ✅ Access controls (MFA, RBAC)
- ✅ Logical and physical access restrictions
- ✅ System monitoring
- ✅ Change management

#### Availability
- ✅ 99.95% uptime SLA
- ✅ Redundancy and failover
- ✅ Disaster recovery plan
- ✅ Incident management

#### Processing Integrity
- ✅ Data validation
- ✅ Error handling
- ✅ Monitoring and alerting
- ✅ Quality assurance

#### Confidentiality
- ✅ Encryption at rest and in transit
- ✅ NDAs with employees and vendors
- ✅ Data classification
- ✅ Secure disposal

#### Privacy
- ✅ Privacy notice
- ✅ Consent management
- ✅ Data subject rights
- ✅ Data retention policies

---

## Data Retention Policy

```csharp
public class RetentionPolicy
{
    public static readonly Dictionary<string, TimeSpan> Policies = new()
    {
        // Financial records (tax requirements)
        { "Invoices", TimeSpan.FromDays(365 * 7) },
        { "Transactions", TimeSpan.FromDays(365 * 7) },
        
        // Audit logs
        { "AuditLogs", TimeSpan.FromDays(365 * 1) },
        
        // Customer data
        { "CustomerProfiles", TimeSpan.MaxValue }, // Until account deletion
        
        // Session data
        { "Sessions", TimeSpan.FromHours(24) },
        
        // Temporary data
        { "OTPs", TimeSpan.FromMinutes(5) },
        { "PasswordResetTokens", TimeSpan.FromHours(1) }
    };
}

// Automated cleanup job
public class DataRetentionJob : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        // Run daily at 3 AM
        while (!cancellationToken.IsCancellationRequested)
        {
            await CleanupExpiredDataAsync();
            await Task.Delay(TimeSpan.FromDays(1), cancellationToken);
        }
    }
    
    private async Task CleanupExpiredDataAsync()
    {
        // Delete expired sessions
        await _context.Sessions
            .Where(s => s.ExpiresAt < DateTime.UtcNow)
            .DeleteAsync();
        
        // Archive old audit logs
        var archiveDate = DateTime.UtcNow.AddYears(-1);
        var oldLogs = await _context.AuditLogs
            .Where(l => l.CreatedAt < archiveDate)
            .ToListAsync();
        
        await ArchiveLogsAsync(oldLogs);
        await _context.AuditLogs
            .Where(l => l.CreatedAt < archiveDate)
            .DeleteAsync();
    }
}
```

---

## Compliance Checklist

### Pre-Launch

- [ ] PCI-DSS SAQ (Self-Assessment Questionnaire) completed
- [ ] Data Processing Agreement signed with all vendors
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Cookie Policy published (if applicable)
- [ ] GDPR Data Protection Impact Assessment
- [ ] Security audit completed
- [ ] Penetration testing completed
- [ ] Employee training completed
- [ ] Incident response plan documented

### Ongoing

- [ ] Quarterly: Access review
- [ ] Quarterly: Vulnerability scanning
- [ ] Quarterly: External penetration testing
- [ ] Annually: Internal penetration testing
- [ ] Annually: PCI-DSS re-assessment
- [ ] Annually: SOC 2 audit
- [ ] Annually: Employee security training
- [ ] As needed: Breach notification procedures

---

## Contact Information

**Data Protection Officer**: dpo@purplebilling.com  
**Security Officer**: security@purplebilling.com  
**Compliance Officer**: compliance@purplebilling.com

**Supervisory Authority** (EU):
[Your local data protection authority]

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Next Review**: March 2026

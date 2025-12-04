# PurpleBilling Security Guide

## Security Overview

PurpleBilling implements defense-in-depth security with multiple layers of protection to ensure PCI-DSS Level 1 compliance and protect sensitive customer data.

## Security Principles

1. **Never Store Raw Card Data**: All payment information is tokenized
2. **Encrypt Everything**: Data encrypted at rest and in transit
3. **Least Privilege**: Minimum necessary permissions
4. **Zero Trust**: Verify every request
5. **Audit Everything**: Complete audit trails
6. **Defense in Depth**: Multiple security layers

---

## Data Security

### Encryption at Rest

**Algorithm**: AES-256-GCM  
**Key Management**: Azure Key Vault / AWS KMS / Local HSM

```csharp
// Encryption Service Implementation
using System.Security.Cryptography;

public class EncryptionService : IEncryptionService
{
    private readonly byte[] _masterKey;
    private const int NonceSize = 12;
    private const int TagSize = 16;

    public EncryptionService(IConfiguration configuration)
    {
        // Master key from secure key management system
        _masterKey = Convert.FromBase64String(configuration["Encryption:MasterKey"]);
    }

    public string Encrypt(string plaintext)
    {
        if (string.IsNullOrEmpty(plaintext))
            return plaintext;

        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var nonce = new byte[NonceSize];
        var tag = new byte[TagSize];
        var ciphertext = new byte[plaintextBytes.Length];

        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(nonce);
        }

        using (var aesGcm = new AesGcm(_masterKey))
        {
            aesGcm.Encrypt(nonce, plaintextBytes, ciphertext, tag);
        }

        // Combine: nonce + tag + ciphertext
        var result = new byte[nonce.Length + tag.Length + ciphertext.Length];
        Buffer.BlockCopy(nonce, 0, result, 0, nonce.Length);
        Buffer.BlockCopy(tag, 0, result, nonce.Length, tag.Length);
        Buffer.BlockCopy(ciphertext, 0, result, nonce.Length + tag.Length, ciphertext.Length);

        return Convert.ToBase64String(result);
    }

    public string Decrypt(string ciphertext)
    {
        if (string.IsNullOrEmpty(ciphertext))
            return ciphertext;

        var combined = Convert.FromBase64String(ciphertext);
        var nonce = new byte[NonceSize];
        var tag = new byte[TagSize];
        var encrypted = new byte[combined.Length - NonceSize - TagSize];
        var plaintext = new byte[encrypted.Length];

        Buffer.BlockCopy(combined, 0, nonce, 0, NonceSize);
        Buffer.BlockCopy(combined, NonceSize, tag, 0, TagSize);
        Buffer.BlockCopy(combined, NonceSize + TagSize, encrypted, 0, encrypted.Length);

        using (var aesGcm = new AesGcm(_masterKey))
        {
            aesGcm.Decrypt(nonce, encrypted, tag, plaintext);
        }

        return Encoding.UTF8.GetString(plaintext);
    }
}
```

### Sensitive Data Fields

**Encrypted in Database**:
- Customer SSN/Tax ID
- Bank account numbers
- Personal identifiable information (PII)
- Authentication tokens (refresh tokens)

**Never Stored**:
- Credit card numbers (use tokens from payment processors)
- CVV/CVC codes
- Full bank account routing numbers (store last 4 digits only)

---

## Transport Security

### TLS Configuration

**Minimum Version**: TLS 1.2  
**Recommended**: TLS 1.3

```nginx
# Nginx TLS Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/billing.purpleapps.com/chain.pem;

# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### Certificate Management

```bash
# Automated renewal with Certbot
0 0,12 * * * certbot renew --quiet --deploy-hook "systemctl reload nginx"

# Certificate monitoring
0 0 * * * /opt/purplebilling/scripts/check-cert-expiry.sh
```

---

## Authentication & Authorization

### JWT Token Security

```csharp
// JWT Configuration
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = configuration["Jwt:Issuer"],
            ValidAudience = configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["Jwt:Secret"])),
            ClockSkew = TimeSpan.Zero, // No tolerance for expired tokens
            RequireExpirationTime = true,
            RequireSignedTokens = true
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                {
                    context.Response.Headers.Add("Token-Expired", "true");
                }
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                // Check if token is in blacklist (revoked)
                var tokenService = context.HttpContext.RequestServices
                    .GetRequiredService<ITokenService>();
                var token = context.SecurityToken as JwtSecurityToken;
                
                if (tokenService.IsTokenRevoked(token.RawData))
                {
                    context.Fail("Token has been revoked");
                }
                
                return Task.CompletedTask;
            }
        };
    });
```

### Two-Factor Authentication

```csharp
// TOTP Implementation
public class TwoFactorAuthService : ITwoFactorAuthService
{
    public string GenerateSecret()
    {
        var key = KeyGeneration.GenerateRandomKey(20);
        return Base32Encoding.ToString(key);
    }

    public string GetQrCodeUrl(string secret, string userEmail)
    {
        var encodedSecret = Uri.EscapeDataString(secret);
        var encodedIssuer = Uri.EscapeDataString("PurpleBilling");
        var encodedUser = Uri.EscapeDataString(userEmail);
        
        return $"otpauth://totp/{encodedIssuer}:{encodedUser}?secret={encodedSecret}&issuer={encodedIssuer}";
    }

    public bool ValidateCode(string secret, string code)
    {
        var key = Base32Encoding.ToBytes(secret);
        var totp = new Totp(key);
        
        // Allow 1 time step before and after for clock skew
        var window = new VerificationWindow(previous: 1, future: 1);
        return totp.VerifyTotp(code, out _, window);
    }
}

// SMS OTP via Twilio
public class SmsOtpService : ISmsOtpService
{
    private readonly TwilioRestClient _client;
    private readonly IDistributedCache _cache;

    public async Task<bool> SendOtpAsync(string phoneNumber)
    {
        var otp = GenerateOtp();
        var expiryMinutes = 5;
        
        // Store OTP in Redis with expiry
        await _cache.SetStringAsync(
            $"otp:{phoneNumber}",
            otp,
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(expiryMinutes)
            }
        );

        // Send SMS
        var message = await MessageResource.CreateAsync(
            to: new PhoneNumber(phoneNumber),
            from: new PhoneNumber(configuration["Twilio:PhoneNumber"]),
            body: $"Your PurpleBilling verification code is: {otp}. Valid for {expiryMinutes} minutes."
        );

        return message.Status != MessageResource.StatusEnum.Failed;
    }

    public async Task<bool> VerifyOtpAsync(string phoneNumber, string otp)
    {
        var storedOtp = await _cache.GetStringAsync($"otp:{phoneNumber}");
        
        if (storedOtp == null)
            return false;

        if (storedOtp == otp)
        {
            // Remove OTP after successful verification
            await _cache.RemoveAsync($"otp:{phoneNumber}");
            return true;
        }

        return false;
    }

    private string GenerateOtp()
    {
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[4];
        rng.GetBytes(bytes);
        var number = BitConverter.ToUInt32(bytes, 0);
        return (number % 1000000).ToString("D6");
    }
}
```

### Role-Based Access Control (RBAC)

```csharp
// Define roles and permissions
public enum Role
{
    SuperAdmin,
    Admin,
    BillingManager,
    CustomerSupport,
    ReadOnly,
    Customer
}

public enum Permission
{
    // Customer permissions
    ViewOwnInvoices,
    ManageOwnPaymentMethods,
    ViewOwnTransactions,
    
    // Admin permissions
    ViewAllInvoices,
    CreateInvoices,
    ProcessRefunds,
    ManageCustomers,
    ViewReports,
    ManageUsers,
    ViewAuditLogs,
    ManageSettings,
    ProcessPayments
}

// Authorization handler
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var userPermissions = context.User.Claims
            .Where(c => c.Type == "permission")
            .Select(c => c.Value)
            .ToList();

        if (userPermissions.Contains(requirement.Permission.ToString()))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}

// Usage in controllers
[Authorize(Policy = "RequireProcessPaymentPermission")]
[HttpPost("process")]
public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequest request)
{
    // Only users with ProcessPayments permission can access
}
```

---

## PCI-DSS Compliance

### Compliance Requirements

✅ **Requirement 1**: Install and maintain firewall configuration
✅ **Requirement 2**: Do not use vendor-supplied defaults
✅ **Requirement 3**: Protect stored cardholder data (tokenization)
✅ **Requirement 4**: Encrypt transmission of cardholder data (TLS 1.3)
✅ **Requirement 5**: Protect against malware (antivirus, IDS)
✅ **Requirement 6**: Develop secure systems (code review, security testing)
✅ **Requirement 7**: Restrict access by business need (RBAC)
✅ **Requirement 8**: Identify and authenticate access (2FA, strong passwords)
✅ **Requirement 9**: Restrict physical access (datacenter security)
✅ **Requirement 10**: Track and monitor network access (audit logs)
✅ **Requirement 11**: Regularly test security systems (pentesting)
✅ **Requirement 12**: Maintain information security policy

### Tokenization Strategy

**Never store card data**. Always use payment processor tokens:

```csharp
// Stripe tokenization example
public async Task<string> TokenizeCardAsync(CardDetails card)
{
    var options = new TokenCreateOptions
    {
        Card = new TokenCardOptions
        {
            Number = card.Number,
            ExpMonth = card.ExpiryMonth,
            ExpYear = card.ExpiryYear,
            Cvc = card.Cvc,
            Name = card.HolderName
        }
    };

    var service = new TokenService();
    var token = await service.CreateAsync(options);
    
    // Return token ID (tok_xxxxx), NEVER store the actual card
    return token.Id;
}

// Store in database
var paymentMethod = new PaymentMethod
{
    CustomerId = customerId,
    Type = "card",
    Token = tokenId,  // Only store the token
    LastFour = card.Number.Substring(card.Number.Length - 4),
    Brand = DetermineCardBrand(card.Number),
    ExpiryMonth = card.ExpiryMonth,
    ExpiryYear = card.ExpiryYear
    // CVV is NEVER stored
};
```

### Scope Reduction

The PurpleBilling system uses tokenization to minimize PCI-DSS scope:

1. **Customer Frontend**: Uses Stripe.js/PayPal SDK (card data never touches our servers)
2. **API Layer**: Only handles tokens, never raw card data
3. **Database**: Only stores tokens and last 4 digits
4. **Payment Processing**: Delegated to certified payment processors

---

## API Security

### Rate Limiting

```csharp
// Rate limiting middleware
public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IDistributedCache _cache;

    public async Task InvokeAsync(HttpContext context)
    {
        var clientId = GetClientIdentifier(context);
        var endpoint = context.Request.Path;
        var cacheKey = $"ratelimit:{clientId}:{endpoint}";
        
        var requests = await _cache.GetStringAsync(cacheKey);
        var requestCount = requests == null ? 0 : int.Parse(requests);
        
        if (requestCount >= 100) // 100 requests per minute
        {
            context.Response.StatusCode = 429; // Too Many Requests
            context.Response.Headers.Add("Retry-After", "60");
            await context.Response.WriteAsync("Rate limit exceeded");
            return;
        }
        
        requestCount++;
        await _cache.SetStringAsync(cacheKey, requestCount.ToString(),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(1)
            });
        
        context.Response.Headers.Add("X-RateLimit-Limit", "100");
        context.Response.Headers.Add("X-RateLimit-Remaining", (100 - requestCount).ToString());
        
        await _next(context);
    }

    private string GetClientIdentifier(HttpContext context)
    {
        // Try API key first
        if (context.Request.Headers.TryGetValue("X-API-Key", out var apiKey))
            return apiKey;
        
        // Fall back to IP address
        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}
```

### Input Validation

```csharp
// Request validation
public class CreateInvoiceRequest
{
    [Required]
    [EmailAddress]
    public string CustomerEmail { get; set; }

    [Required]
    [Range(0.01, 1000000)]
    public decimal Amount { get; set; }

    [Required]
    [RegularExpression("^[A-Z]{3}$")]
    public string Currency { get; set; } = "USD";

    [Required]
    [MinLength(1)]
    [MaxLength(100)]
    public List<InvoiceLineItem> LineItems { get; set; }
}

// Custom validation
public class InvoiceValidator : AbstractValidator<CreateInvoiceRequest>
{
    public InvoiceValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Amount must be greater than 0");
        
        RuleFor(x => x.LineItems)
            .NotEmpty()
            .WithMessage("At least one line item is required");
        
        RuleFor(x => x.Currency)
            .Must(BeValidCurrency)
            .WithMessage("Invalid currency code");
    }

    private bool BeValidCurrency(string currency)
    {
        var validCurrencies = new[] { "USD", "EUR", "GBP", "CAD", "AUD" };
        return validCurrencies.Contains(currency);
    }
}
```

### SQL Injection Prevention

```csharp
// ALWAYS use parameterized queries
public async Task<Invoice> GetInvoiceAsync(Guid invoiceId)
{
    // SAFE - using EF Core parameterization
    return await _context.Invoices
        .Where(i => i.Id == invoiceId)
        .FirstOrDefaultAsync();
}

// SAFE - using Dapper with parameters
public async Task<Invoice> GetInvoiceRawAsync(Guid invoiceId)
{
    const string sql = "SELECT * FROM invoices WHERE id = @InvoiceId";
    return await _connection.QueryFirstOrDefaultAsync<Invoice>(
        sql,
        new { InvoiceId = invoiceId }
    );
}

// DANGEROUS - NEVER DO THIS
// var sql = $"SELECT * FROM invoices WHERE id = '{invoiceId}'";
```

### XSS Prevention

```csharp
// Output encoding (automatic in Razor)
@Model.CustomerName  // Automatically HTML encoded

// For JavaScript context
<script>
    var customerName = @Html.Raw(Json.Serialize(Model.CustomerName));
</script>

// Content Security Policy
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://js.stripe.com; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https://api.stripe.com; " +
        "frame-src https://js.stripe.com;"
    );
    await next();
});
```

---

## Audit Logging

### Comprehensive Audit Trail

```csharp
public class AuditLog
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string Action { get; set; }
    public string EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public string OldValues { get; set; } // JSON
    public string NewValues { get; set; } // JSON
    public string IpAddress { get; set; }
    public string UserAgent { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Audit logging interceptor
public class AuditInterceptor : SaveChangesInterceptor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        var context = eventData.Context;
        var entries = context.ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added ||
                       e.State == EntityState.Modified ||
                       e.State == EntityState.Deleted);

        foreach (var entry in entries)
        {
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = GetCurrentUserId(),
                Action = entry.State.ToString(),
                EntityType = entry.Entity.GetType().Name,
                EntityId = GetEntityId(entry.Entity),
                OldValues = GetOldValues(entry),
                NewValues = GetNewValues(entry),
                IpAddress = GetClientIpAddress(),
                UserAgent = GetUserAgent(),
                CreatedAt = DateTime.UtcNow
            };

            context.Set<AuditLog>().Add(auditLog);
        }

        return base.SavingChanges(eventData, result);
    }
}
```

### Security Events to Log

✅ All authentication attempts (success/failure)  
✅ Authorization failures  
✅ Password changes  
✅ 2FA enrollment/removal  
✅ Payment processing  
✅ Refunds and chargebacks  
✅ Customer data access  
✅ Administrative actions  
✅ API key creation/revocation  
✅ Configuration changes  

---

## Security Testing

### Automated Security Scanning

```bash
# OWASP Dependency Check
dotnet restore
dotnet list package --vulnerable --include-transitive

# Static Application Security Testing (SAST)
# Using Security Code Scan
dotnet tool install --global security-scan
security-scan /path/to/PurpleBilling.sln

# Dynamic Application Security Testing (DAST)
# Using OWASP ZAP
docker run -t owasp/zap2docker-stable zap-baseline.py \
    -t https://api.billing.purpleapps.com \
    -r zap-report.html
```

### Penetration Testing Checklist

- [ ] SQL Injection testing
- [ ] XSS testing
- [ ] CSRF testing
- [ ] Authentication bypass
- [ ] Authorization bypass
- [ ] Session management
- [ ] Cryptography validation
- [ ] API security
- [ ] Infrastructure security
- [ ] Social engineering

---

## Incident Response

### Security Incident Procedure

1. **Detection**: Automated alerts + manual monitoring
2. **Containment**: Isolate affected systems
3. **Eradication**: Remove threat
4. **Recovery**: Restore from clean backups
5. **Lessons Learned**: Post-incident review

### Breach Notification

**GDPR**: 72 hours to notify authorities  
**PCI-DSS**: Immediate notification to payment brands  
**State Laws**: Varies by jurisdiction

---

## Security Checklist

### Pre-Deployment

- [ ] All dependencies up to date
- [ ] Security scan passed
- [ ] Penetration test completed
- [ ] SSL/TLS configured correctly
- [ ] Firewall rules in place
- [ ] Strong passwords enforced
- [ ] 2FA enabled for admin accounts
- [ ] Encryption keys rotated
- [ ] Backup and restore tested
- [ ] Incident response plan documented

### Regular Maintenance

- [ ] Weekly: Security updates applied
- [ ] Monthly: Access review
- [ ] Quarterly: Penetration testing
- [ ] Annually: Full security audit
- [ ] Annually: PCI-DSS assessment

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Security Contact**: security@purplebilling.com

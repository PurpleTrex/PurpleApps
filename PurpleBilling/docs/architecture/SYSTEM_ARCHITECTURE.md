# PurpleBilling System Architecture

## Overview

PurpleBilling is an enterprise-grade, full-stack credit card billing system designed for high-security, high-availability environments. This document describes the complete system architecture.

## Architecture Principles

- **Microservices**: Modular, independently deployable services
- **Security-First**: PCI-DSS Level 1 compliant from ground up
- **Scalability**: Horizontal scaling with load balancing
- **Resilience**: Fault-tolerant with automatic failover
- **Observability**: Comprehensive logging, monitoring, and alerting

## System Components

### 1. Frontend Layer

#### Customer Portal (React + TypeScript)
- **Technology**: React 18.2+, TypeScript 5.3+, Tailwind CSS
- **Features**:
  - Customer dashboard
  - Payment method management
  - Invoice viewing and download
  - Subscription management
  - Payment history
  - 2FA enrollment
- **Security**: 
  - CSP headers
  - XSS protection
  - CSRF tokens
  - Secure session management

#### Admin Dashboard (React + TypeScript)
- **Technology**: React 18.2+, TypeScript 5.3+, Material-UI
- **Features**:
  - Customer management
  - Transaction monitoring
  - Dispute resolution
  - Analytics and reporting
  - System configuration
  - Audit log viewer
- **Security**:
  - RBAC with granular permissions
  - Activity logging
  - IP whitelisting support

### 2. API Gateway Layer

#### Kong API Gateway
- **Features**:
  - Rate limiting (configurable per client)
  - API key management
  - JWT validation
  - Request/response logging
  - Circuit breaker pattern
  - API versioning
- **Alternative**: Tyk API Gateway (configuration provided)

```yaml
# Kong Configuration Example
services:
  - name: billing-api
    url: http://billing-service:5000
    routes:
      - name: billing-route
        paths:
          - /api/v1/billing
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          hour: 1000
      - name: jwt
```

### 3. Backend Services (.NET 9)

#### Billing API Service
- **Technology**: ASP.NET Core 9.0, C# 12
- **Responsibilities**:
  - Invoice generation
  - Billing cycle management
  - Subscription handling
  - Payment scheduling
  - Receipt generation
- **Database**: PostgreSQL (primary), Redis (cache)
- **API**: RESTful + GraphQL

```csharp
// Example Service Structure
namespace PurpleBilling.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;
        private readonly ILogger<InvoicesController> _logger;
        
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(InvoiceDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetInvoice(Guid id)
        {
            // Implementation
        }
    }
}
```

#### Payment Processing Service
- **Technology**: ASP.NET Core 9.0, C# 12
- **Responsibilities**:
  - Payment gateway integration
  - Transaction processing
  - Refund handling
  - Chargeback management
  - Payment tokenization
- **Integrations**:
  - Stripe API v2023-10-16
  - PayPal REST API
  - Square Payment API
  - Braintree SDK

```csharp
// Payment Processing Interface
public interface IPaymentProcessor
{
    Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request);
    Task<RefundResult> ProcessRefundAsync(RefundRequest request);
    Task<string> TokenizeCardAsync(CardDetails card);
    Task<bool> Verify3DSecureAsync(string transactionId);
}
```

#### Customer Management Service
- **Technology**: ASP.NET Core 9.0, C# 12
- **Responsibilities**:
  - Customer CRUD operations
  - Payment method storage (tokenized)
  - Customer profile management
  - Communication preferences
  - Subscription associations

#### Notification Service
- **Technology**: ASP.NET Core 9.0, C# 12
- **Responsibilities**:
  - Email notifications (SendGrid)
  - SMS notifications (Twilio)
  - Push notifications
  - Notification templates
  - Delivery tracking
- **Queue**: RabbitMQ for async processing

#### Analytics & Reporting Service
- **Technology**: ASP.NET Core 9.0, C# 12
- **Responsibilities**:
  - Transaction analytics
  - Revenue reporting
  - Customer metrics
  - Financial reports
  - Tax calculations
  - Export to CSV/PDF/Excel

### 4. Data Layer

#### PostgreSQL Database (Primary)
```sql
-- Core Tables Schema

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB
);

-- Payment Methods (Tokenized)
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    type VARCHAR(50) NOT NULL, -- 'card', 'bank_account'
    token VARCHAR(255) NOT NULL, -- From payment processor
    last_four VARCHAR(4),
    brand VARCHAR(50), -- 'visa', 'mastercard', etc.
    expiry_month INT,
    expiry_year INT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active'
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    plan_id UUID REFERENCES subscription_plans(id),
    payment_method_id UUID REFERENCES payment_methods(id),
    status VARCHAR(50) NOT NULL,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    subscription_id UUID REFERENCES subscriptions(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    subtotal DECIMAL(19,4) NOT NULL,
    tax DECIMAL(19,4) DEFAULT 0,
    total DECIMAL(19,4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    due_date TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id),
    payment_method_id UUID REFERENCES payment_methods(id),
    amount DECIMAL(19,4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    processor VARCHAR(50) NOT NULL, -- 'stripe', 'paypal', etc.
    processor_transaction_id VARCHAR(255),
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    metadata JSONB
);

-- Audit Logs (immutable)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_payment_methods_customer ON payment_methods(customer_id);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_transactions_invoice ON transactions(invoice_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

#### Redis Cache Layer
- **Purpose**: High-speed caching
- **Data Cached**:
  - Active sessions (JWT tokens)
  - Recent transactions
  - Customer profiles
  - API rate limiting counters
  - Frequently accessed invoices
- **TTL Strategy**: 
  - Sessions: 24 hours
  - Transactions: 1 hour
  - Profiles: 15 minutes
  - Rate limits: 1 minute

```csharp
// Redis Cache Service
public class CacheService : ICacheService
{
    private readonly IConnectionMultiplexer _redis;
    
    public async Task<T> GetAsync<T>(string key)
    {
        var db = _redis.GetDatabase();
        var value = await db.StringGetAsync(key);
        return value.HasValue ? JsonSerializer.Deserialize<T>(value) : default;
    }
    
    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        var db = _redis.GetDatabase();
        var serialized = JsonSerializer.Serialize(value);
        await db.StringSetAsync(key, serialized, expiry);
    }
}
```

### 5. Message Queue Layer

#### RabbitMQ
- **Purpose**: Asynchronous task processing
- **Queues**:
  - `payments.processing` - Payment processing tasks
  - `notifications.email` - Email notifications
  - `notifications.sms` - SMS notifications
  - `reports.generation` - Report generation
  - `invoices.generation` - Invoice generation
  - `webhooks.outbound` - Webhook delivery

```csharp
// Message Queue Publisher
public class MessagePublisher : IMessagePublisher
{
    private readonly IConnection _connection;
    
    public async Task PublishAsync<T>(string queue, T message)
    {
        using var channel = _connection.CreateModel();
        channel.QueueDeclare(queue, durable: true, exclusive: false, autoDelete: false);
        
        var json = JsonSerializer.Serialize(message);
        var body = Encoding.UTF8.GetBytes(json);
        
        var properties = channel.CreateBasicProperties();
        properties.Persistent = true;
        
        channel.BasicPublish("", queue, properties, body);
    }
}
```

### 6. Authentication & Authorization

#### OAuth 2.0 / OpenID Connect
- **Identity Provider**: Auth0 (configurable)
- **Alternative**: IdentityServer (self-hosted)
- **Flows**:
  - Authorization Code Flow (web apps)
  - PKCE Flow (mobile apps)
  - Client Credentials (API-to-API)

```csharp
// Authentication Configuration
services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.Authority = configuration["Auth:Authority"];
    options.Audience = configuration["Auth:Audience"];
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.Zero
    };
});
```

#### Two-Factor Authentication
- **Methods**:
  - TOTP (Time-based One-Time Password) - Google Authenticator
  - SMS OTP via Twilio
  - Email OTP
- **Library**: OtpNet

```csharp
// 2FA Implementation
public class TwoFactorService : ITwoFactorService
{
    public string GenerateSecret()
    {
        return Base32Encoding.ToString(KeyGeneration.GenerateRandomKey(20));
    }
    
    public bool ValidateTotp(string secret, string code)
    {
        var totp = new Totp(Base32Encoding.ToBytes(secret));
        return totp.VerifyTotp(code, out _, new VerificationWindow(2, 2));
    }
}
```

### 7. Payment Gateway Integration

#### Stripe Integration
```csharp
public class StripePaymentProcessor : IPaymentProcessor
{
    private readonly StripeClient _client;
    
    public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
    {
        var service = new PaymentIntentService(_client);
        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(request.Amount * 100), // cents
            Currency = request.Currency.ToLower(),
            PaymentMethod = request.PaymentMethodToken,
            Confirm = true,
            Metadata = new Dictionary<string, string>
            {
                { "invoice_id", request.InvoiceId.ToString() }
            }
        };
        
        var paymentIntent = await service.CreateAsync(options);
        
        return new PaymentResult
        {
            Success = paymentIntent.Status == "succeeded",
            TransactionId = paymentIntent.Id,
            Status = paymentIntent.Status
        };
    }
}
```

#### PayPal Integration
```csharp
public class PayPalPaymentProcessor : IPaymentProcessor
{
    private readonly PayPalHttpClient _client;
    
    public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
    {
        var orderRequest = new OrdersCreateRequest();
        orderRequest.Prefer("return=representation");
        orderRequest.RequestBody(new OrderRequest
        {
            CheckoutPaymentIntent = "CAPTURE",
            PurchaseUnits = new List<PurchaseUnitRequest>
            {
                new PurchaseUnitRequest
                {
                    AmountWithBreakdown = new AmountWithBreakdown
                    {
                        CurrencyCode = request.Currency,
                        Value = request.Amount.ToString("F2")
                    }
                }
            }
        });
        
        var response = await _client.Execute(orderRequest);
        var result = response.Result<Order>();
        
        return new PaymentResult
        {
            Success = result.Status == "APPROVED",
            TransactionId = result.Id
        };
    }
}
```

### 8. Security Layer

#### Encryption at Rest
- **Algorithm**: AES-256-GCM
- **Key Management**: Azure Key Vault / AWS KMS (or local HSM)
- **Encrypted Fields**:
  - Customer PII
  - Payment tokens
  - SSN/Tax IDs
  - Bank account details

```csharp
public class EncryptionService : IEncryptionService
{
    private readonly byte[] _key;
    
    public string Encrypt(string plaintext)
    {
        using var aes = Aes.Create();
        aes.Key = _key;
        aes.GenerateIV();
        
        using var encryptor = aes.CreateEncryptor();
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var ciphertext = encryptor.TransformFinalBlock(plaintextBytes, 0, plaintextBytes.Length);
        
        var result = new byte[aes.IV.Length + ciphertext.Length];
        Buffer.BlockCopy(aes.IV, 0, result, 0, aes.IV.Length);
        Buffer.BlockCopy(ciphertext, 0, result, aes.IV.Length, ciphertext.Length);
        
        return Convert.ToBase64String(result);
    }
}
```

#### TLS/SSL Configuration
- **Protocol**: TLS 1.3 (minimum TLS 1.2)
- **Cipher Suites**: Only strong ciphers
- **Certificate**: Let's Encrypt or commercial CA

```nginx
# Nginx SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;
```

### 9. Monitoring & Logging

#### ELK Stack (Elasticsearch, Logstash, Kibana)
- **Elasticsearch**: Log storage and search
- **Logstash**: Log aggregation and processing
- **Kibana**: Visualization and dashboards

#### Prometheus + Grafana
- **Metrics Collected**:
  - API response times
  - Database query performance
  - Payment success/failure rates
  - Cache hit ratios
  - Queue depths
  - Error rates

```csharp
// Metrics Collection
public class MetricsService : IMetricsService
{
    private readonly Counter _paymentCounter;
    private readonly Histogram _apiDuration;
    
    public MetricsService()
    {
        _paymentCounter = Metrics.CreateCounter(
            "payments_total", 
            "Total payments processed",
            new CounterConfiguration { LabelNames = new[] { "status", "processor" } }
        );
        
        _apiDuration = Metrics.CreateHistogram(
            "api_duration_seconds",
            "API request duration"
        );
    }
}
```

### 10. Backup & Disaster Recovery

#### Automated Backups
- **PostgreSQL**: Daily full backups, hourly incrementals
- **Retention**: 30 days rolling
- **Storage**: Encrypted S3 bucket (or local encrypted storage)
- **Testing**: Monthly restore tests

```bash
#!/bin/bash
# Backup Script
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/postgresql"
DB_NAME="purplebilling"

pg_dump -U postgres -F c -b -v -f "$BACKUP_DIR/backup_$TIMESTAMP.dump" $DB_NAME
gpg --encrypt --recipient backup@purplebilling.com "$BACKUP_DIR/backup_$TIMESTAMP.dump"
aws s3 cp "$BACKUP_DIR/backup_$TIMESTAMP.dump.gpg" s3://purplebilling-backups/
```

## Scalability Architecture

### Horizontal Scaling
- **Load Balancer**: HAProxy/Nginx
- **API Instances**: Multiple replicas behind load balancer
- **Database**: PostgreSQL with read replicas
- **Cache**: Redis cluster with sentinel
- **Queue**: RabbitMQ cluster

### Auto-Scaling
```yaml
# Kubernetes HPA Example
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: billing-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: billing-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## AWS Infrastructure (Commented - Ready for Migration)

```typescript
// AWS CDK Infrastructure (TypeScript)
/*
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as ecs from 'aws-cdk-lib/aws-ecs';

export class PurpleBillingStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // VPC
    const vpc = new ec2.Vpc(this, 'PurpleBillingVPC', {
      maxAzs: 3,
      natGateways: 2
    });
    
    // RDS PostgreSQL
    const database = new rds.DatabaseCluster(this, 'Database', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_4
      }),
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      instanceProps: {
        vpc,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.R6G, ec2.InstanceSize.XLARGE),
      },
      instances: 2,
      storageEncrypted: true
    });
    
    // ElastiCache Redis
    const redis = new elasticache.CfnReplicationGroup(this, 'Redis', {
      replicationGroupDescription: 'PurpleBilling Cache',
      engine: 'redis',
      cacheNodeType: 'cache.r6g.large',
      numNodeGroups: 2,
      replicasPerNodeGroup: 1,
      atRestEncryptionEnabled: true,
      transitEncryptionEnabled: true
    });
    
    // ECS Fargate Cluster
    const cluster = new ecs.Cluster(this, 'Cluster', { vpc });
    
    // Task Definitions and Services would be defined here
  }
}
*/
```

## Compliance Architecture

### PCI-DSS Compliance
- ✅ No card data stored (tokenization only)
- ✅ Encrypted transmission (TLS 1.3)
- ✅ Access controls (RBAC)
- ✅ Regular security audits
- ✅ Vulnerability scanning
- ✅ Penetration testing
- ✅ Audit logging
- ✅ Network segmentation

### GDPR Compliance
- ✅ Data encryption
- ✅ Right to erasure (data deletion)
- ✅ Data portability
- ✅ Consent management
- ✅ Breach notification
- ✅ Privacy by design
- ✅ Data processing agreements

## Deployment Architecture

### Production Environment
```
┌─────────────────────────────────────────────────────────┐
│                    Internet/CDN                          │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Load Balancer (HAProxy/Nginx)               │
│              SSL Termination / DDoS Protection           │
└──────┬───────────────┬───────────────┬──────────────────┘
       │               │               │
┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
│  API Node 1  │ │ API Node 2 │ │ API Node 3 │
│  .NET 9      │ │ .NET 9     │ │ .NET 9     │
└──────┬───────┘ └─────┬──────┘ └─────┬──────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
│ PostgreSQL  │ │   Redis    │ │ RabbitMQ   │
│  Primary    │ │  Cluster   │ │  Cluster   │
│  + Replicas │ │            │ │            │
└─────────────┘ └────────────┘ └────────────┘
```

## Performance Targets

- **API Response Time**: < 200ms (p95)
- **Payment Processing**: < 3 seconds
- **Database Queries**: < 50ms (p95)
- **Cache Hit Ratio**: > 85%
- **Uptime**: 99.95% SLA
- **Concurrent Users**: 10,000+
- **Transactions/Second**: 1,000+

## Technology Versions

- .NET: 9.0
- PostgreSQL: 15.4+
- Redis: 7.2+
- RabbitMQ: 3.12+
- Node.js: 20 LTS
- React: 18.2+
- TypeScript: 5.3+
- Docker: 24+
- Kubernetes: 1.28+ (optional)

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Next Review**: March 2026

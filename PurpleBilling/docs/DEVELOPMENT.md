# PurpleBilling Development Guide

## Getting Started

### Prerequisites

- .NET 9 SDK
- Node.js 20 LTS
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)
- Git

### Quick Start

```bash
# Clone repository
git clone https://github.com/PurpleTrex/Apps.git
cd Apps/PurpleBilling

# Start infrastructure with Docker
docker-compose up -d postgres redis rabbitmq

# Restore .NET dependencies
dotnet restore

# Run database migrations
cd src/PurpleBilling.Api
dotnet ef database update

# Start API
dotnet run

# In another terminal, start frontend
cd src/PurpleBilling.Frontend
npm install
npm start
```

## Project Structure

```
PurpleBilling/
├── src/
│   ├── PurpleBilling.Api/          # .NET 9 Web API
│   ├── PurpleBilling.Core/         # Domain entities & interfaces
│   ├── PurpleBilling.Data/         # Data access layer
│   ├── PurpleBilling.Services/     # Business logic layer
│   ├── PurpleBilling.Integrations/ # External service integrations
│   ├── PurpleBilling.Frontend/     # React customer portal
│   └── PurpleBilling.Admin/        # React admin dashboard
├── tests/                          # Test suites
├── infrastructure/                 # Infrastructure as code
├── docs/                           # Documentation
└── scripts/                        # Automation scripts
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Follow coding standards and best practices outlined below.

### 3. Run Tests

```bash
dotnet test
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add payment processing"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

## Coding Standards

### C# Style Guide

- Use PascalCase for class names and public members
- Use camelCase for private fields
- Use async/await for asynchronous operations
- Add XML documentation comments for public APIs

```csharp
/// <summary>
/// Processes a payment transaction
/// </summary>
/// <param name="request">Payment request details</param>
/// <returns>Payment result</returns>
public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
{
    // Implementation
}
```

### TypeScript/React Style Guide

- Use PascalCase for component names
- Use camelCase for functions and variables
- Use TypeScript interfaces for props
- Add JSDoc comments for complex logic

```typescript
interface InvoiceProps {
  invoiceId: string;
  onPayment: (amount: number) => void;
}

export const InvoiceDetails: React.FC<InvoiceProps> = ({ invoiceId, onPayment }) => {
  // Implementation
};
```

## Testing

### Unit Tests

```csharp
[Fact]
public async Task ProcessPayment_ValidRequest_ReturnsSuccess()
{
    // Arrange
    var service = new PaymentService();
    var request = new PaymentRequest { Amount = 100 };
    
    // Act
    var result = await service.ProcessPaymentAsync(request);
    
    // Assert
    Assert.True(result.Success);
}
```

### Integration Tests

```csharp
public class PaymentIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    
    [Fact]
    public async Task CreateInvoice_ReturnsCreated()
    {
        // Test implementation
    }
}
```

## Database Migrations

### Create Migration

```bash
cd src/PurpleBilling.Api
dotnet ef migrations add AddPaymentMethods
```

### Apply Migration

```bash
dotnet ef database update
```

### Rollback Migration

```bash
dotnet ef database update PreviousMigrationName
```

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
DB_PASSWORD=your_secure_password
STRIPE_SECRET_KEY=sk_test_xxxxx
REDIS_PASSWORD=your_redis_password
```

## Debugging

### Visual Studio Code

1. Open the project in VS Code
2. Press F5 to start debugging
3. Set breakpoints as needed

### Visual Studio

1. Open `PurpleBilling.sln`
2. Set `PurpleBilling.Api` as startup project
3. Press F5 to debug

## Common Tasks

### Add New Entity

1. Create entity class in `PurpleBilling.Core/Entities/`
2. Add DbSet to `ApplicationDbContext`
3. Create migration
4. Apply migration

### Add New API Endpoint

1. Create controller in `PurpleBilling.Api/Controllers/`
2. Add service interface in `PurpleBilling.Core/Interfaces/`
3. Implement service in `PurpleBilling.Services/`
4. Register service in `Program.cs`

### Add Payment Gateway Integration

1. Create processor class in `PurpleBilling.Integrations/`
2. Implement `IPaymentProcessor` interface
3. Add configuration in appsettings.json
4. Register in DI container

## Performance Optimization

- Use caching for frequently accessed data
- Implement pagination for large datasets
- Use async/await for I/O operations
- Optimize database queries with indexes
- Use Redis for session storage

## Security Best Practices

- Never commit secrets or passwords
- Use parameterized queries (Entity Framework does this)
- Validate all user input
- Implement rate limiting
- Use HTTPS in production
- Enable CORS only for trusted origins

## Troubleshooting

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection string
echo $DB_PASSWORD
```

### Build Errors

```bash
# Clean and rebuild
dotnet clean
dotnet restore
dotnet build
```

### Port Already in Use

```bash
# Find and kill process using port
lsof -ti:5000 | xargs kill -9
```

## Resources

- [.NET Documentation](https://docs.microsoft.com/dotnet/)
- [Entity Framework Core](https://docs.microsoft.com/ef/core/)
- [React Documentation](https://react.dev/)
- [Stripe API Reference](https://stripe.com/docs/api)

## Support

- Internal Wiki: https://wiki.purplebilling.com
- Slack Channel: #purplebilling-dev
- Email: dev@purplebilling.com

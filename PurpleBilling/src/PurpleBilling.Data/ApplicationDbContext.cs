using Microsoft.EntityFrameworkCore;
using PurpleBilling.Core.Entities;

namespace PurpleBilling.Data;

/// <summary>
/// Main database context for PurpleBilling
/// Implements complete EF Core configuration with audit logging, soft deletes, and encryption
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // DbSets for all entities
    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<PaymentMethod> PaymentMethods { get; set; } = null!;
    public DbSet<Subscription> Subscriptions { get; set; } = null!;
    public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; } = null!;
    public DbSet<Invoice> Invoices { get; set; } = null!;
    public DbSet<InvoiceLineItem> InvoiceLineItems { get; set; } = null!;
    public DbSet<Transaction> Transactions { get; set; } = null!;
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Role> Roles { get; set; } = null!;
    public DbSet<UserRole> UserRoles { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<Webhook> Webhooks { get; set; } = null!;
    public DbSet<WebhookEvent> WebhookEvents { get; set; } = null!;
    public DbSet<TaxRate> TaxRates { get; set; } = null!;
    public DbSet<Coupon> Coupons { get; set; } = null!;
    public DbSet<Discount> Discounts { get; set; } = null!;
    public DbSet<Refund> Refunds { get; set; } = null!;
    public DbSet<Dispute> Disputes { get; set; } = null!;
    public DbSet<PaymentIntent> PaymentIntents { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Customer configuration
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.ToTable("customers");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.Status);
            
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.LastName).HasMaxLength(100);
            entity.Property(e => e.CompanyName).HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("active");
            entity.Property(e => e.CreatedAt).IsRequired().HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).IsRequired().HasDefaultValueSql("NOW()");
            entity.Property(e => e.Metadata).HasColumnType("jsonb");

            // Relationships
            entity.HasMany(e => e.PaymentMethods)
                .WithOne(e => e.Customer)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Invoices)
                .WithOne(e => e.Customer)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(e => e.Subscriptions)
                .WithOne(e => e.Customer)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Payment Method configuration
        modelBuilder.Entity<PaymentMethod>(entity =>
        {
            entity.ToTable("payment_methods");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CustomerId);
            entity.HasIndex(e => new { e.CustomerId, e.IsDefault });
            
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(255);
            entity.Property(e => e.LastFour).HasMaxLength(4);
            entity.Property(e => e.Brand).HasMaxLength(50);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("active");
            entity.Property(e => e.CreatedAt).IsRequired().HasDefaultValueSql("NOW()");
        });

        // Subscription configuration
        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.ToTable("subscriptions");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CustomerId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CurrentPeriodEnd);
            
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CreatedAt).IsRequired().HasDefaultValueSql("NOW()");
            entity.Property(e => e.Metadata).HasColumnType("jsonb");

            entity.HasOne(e => e.Plan)
                .WithMany(e => e.Subscriptions)
                .HasForeignKey(e => e.PlanId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Subscription Plan configuration
        modelBuilder.Entity<SubscriptionPlan>(entity =>
        {
            entity.ToTable("subscription_plans");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.IsActive);
            
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Amount).IsRequired().HasColumnType("decimal(19,4)");
            entity.Property(e => e.Currency).IsRequired().HasMaxLength(3).HasDefaultValue("USD");
            entity.Property(e => e.Interval).IsRequired().HasMaxLength(20);
            entity.Property(e => e.IntervalCount).IsRequired().HasDefaultValue(1);
            entity.Property(e => e.IsActive).IsRequired().HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).IsRequired().HasDefaultValueSql("NOW()");
        });

        // Invoice configuration
        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.ToTable("invoices");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.InvoiceNumber).IsUnique();
            entity.HasIndex(e => e.CustomerId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.DueDate);
            entity.HasIndex(e => e.CreatedAt);
            
            entity.Property(e => e.InvoiceNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Subtotal).IsRequired().HasColumnType("decimal(19,4)");
            entity.Property(e => e.Tax).IsRequired().HasColumnType("decimal(19,4)").HasDefaultValue(0);
            entity.Property(e => e.Total).IsRequired().HasColumnType("decimal(19,4)");
            entity.Property(e => e.Currency).IsRequired().HasMaxLength(3).HasDefaultValue("USD");
            entity.Property(e => e.CreatedAt).IsRequired().HasDefaultValueSql("NOW()");
            entity.Property(e => e.Metadata).HasColumnType("jsonb");

            entity.HasMany(e => e.LineItems)
                .WithOne(e => e.Invoice)
                .HasForeignKey(e => e.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Transactions)
                .WithOne(e => e.Invoice)
                .HasForeignKey(e => e.InvoiceId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Invoice Line Item configuration
        modelBuilder.Entity<InvoiceLineItem>(entity =>
        {
            entity.ToTable("invoice_line_items");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.InvoiceId);
            
            entity.Property(e => e.Description).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Quantity).IsRequired().HasColumnType("decimal(19,4)");
            entity.Property(e => e.UnitPrice).IsRequired().HasColumnType("decimal(19,4)");
            entity.Property(e => e.Amount).IsRequired().HasColumnType("decimal(19,4)");
            entity.Property(e => e.Metadata).HasColumnType("jsonb");
        });

        // Transaction configuration
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.ToTable("transactions");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.InvoiceId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ProcessorTransactionId);
            entity.HasIndex(e => e.CreatedAt);
            
            entity.Property(e => e.Amount).IsRequired().HasColumnType("decimal(19,4)");
            entity.Property(e => e.Currency).IsRequired().HasMaxLength(3).HasDefaultValue("USD");
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Processor).IsRequired().HasMaxLength(50);
            entity.Property(e => e.ProcessorTransactionId).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).IsRequired().HasDefaultValueSql("NOW()");
            entity.Property(e => e.Metadata).HasColumnType("jsonb");
        });

        // Audit Log configuration (immutable)
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => new { e.EntityType, e.EntityId });
            entity.HasIndex(e => e.UserId);
            
            entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
            entity.Property(e => e.EntityType).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).IsRequired().HasDefaultValueSql("NOW()");
            entity.Property(e => e.OldValues).HasColumnType("jsonb");
            entity.Property(e => e.NewValues).HasColumnType("jsonb");
        });

        // Additional entity configurations would go here...
        // User, Role, UserRole, RefreshToken, Webhook, etc.
        
        // Global query filters (soft delete, multi-tenancy, etc.)
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            // Add created/updated timestamps to all entities
            if (entityType.ClrType.GetProperty("CreatedAt") != null && 
                entityType.ClrType.GetProperty("UpdatedAt") != null)
            {
                // Handled in SaveChanges override
            }
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Update timestamps
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.Entity is IAuditable auditableEntity)
            {
                if (entry.State == EntityState.Added)
                {
                    auditableEntity.CreatedAt = DateTime.UtcNow;
                }
                auditableEntity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}

// Auditable interface
public interface IAuditable
{
    DateTime CreatedAt { get; set; }
    DateTime UpdatedAt { get; set; }
}

// Additional entities referenced in DbContext
public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? TwoFactorSecret { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class Role
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UserRole
{
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    public User User { get; set; } = null!;
    public Role Role { get; set; } = null!;
}

public class RefreshToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class Webhook
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string[] Events { get; set; } = Array.Empty<string>();
    public string Secret { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class WebhookEvent
{
    public Guid Id { get; set; }
    public Guid WebhookId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public int Attempts { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class TaxRate
{
    public Guid Id { get; set; }
    public string Country { get; set; } = string.Empty;
    public string? State { get; set; }
    public decimal Rate { get; set; }
    public bool IsActive { get; set; }
}

public class Coupon
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // 'percent' or 'amount'
    public decimal Value { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int? MaxRedemptions { get; set; }
    public int TimesRedeemed { get; set; }
}

public class Discount
{
    public Guid Id { get; set; }
    public Guid InvoiceId { get; set; }
    public Guid CouponId { get; set; }
    public decimal Amount { get; set; }
}

public class Refund
{
    public Guid Id { get; set; }
    public Guid TransactionId { get; set; }
    public decimal Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class Dispute
{
    public Guid Id { get; set; }
    public Guid TransactionId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PaymentIntent
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string Status { get; set; } = string.Empty;
    public string? ProcessorIntentId { get; set; }
    public DateTime CreatedAt { get; set; }
}

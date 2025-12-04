using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PurpleBilling.Core.Entities;

[Table("customers")]
public class Customer
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required, MaxLength(255)]
    public string Email { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? FirstName { get; set; }
    
    [MaxLength(100)]
    public string? LastName { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "active";
    
    public virtual ICollection<PaymentMethod> PaymentMethods { get; set; } = new List<PaymentMethod>();
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}

[Table("payment_methods")]
public class PaymentMethod
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid CustomerId { get; set; }
    
    [Required, MaxLength(50)]
    public string Type { get; set; } = string.Empty;
    
    [Required, MaxLength(255)]
    public string Token { get; set; } = string.Empty;
    
    [MaxLength(4)]
    public string? LastFour { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Customer Customer { get; set; } = null!;
}

[Table("invoices")]
public class Invoice
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid CustomerId { get; set; }
    
    [Required, MaxLength(50)]
    public string InvoiceNumber { get; set; } = string.Empty;
    
    [Required]
    public decimal Total { get; set; }
    
    [Required, MaxLength(3)]
    public string Currency { get; set; } = "USD";
    
    public string Status { get; set; } = "draft";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Customer Customer { get; set; } = null!;
}

using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JQZHomeCareProject.Persistence.Configurations
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.Property(p => p.DefaultAmount).HasPrecision(18, 2);
            builder.Property(p => p.Amount).HasPrecision(18, 2);
            builder.Property(p => p.AmountPaid).HasPrecision(18, 2);
            builder.Property(p => p.DefaultPShareAmount).HasPrecision(18, 2);
            builder.Property(p => p.PShareAmount).HasPrecision(18, 2);

            builder.HasOne(p => p.Visit)
                .WithOne(v => v.Payment)
                .HasForeignKey<Payment>(p => p.VisitId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(p => p.VisitId).IsUnique();

            builder.HasOne(p => p.PatientPackage)
                .WithMany(pp => pp.Payments)
                .HasForeignKey(p => p.PatientPackageId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(p => p.Practitioner)
                .WithMany()
                .HasForeignKey(p => p.PractitionerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(p => new { p.PractitionerId, p.IsSettled });
        }
    }
}
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JQZHomeCareProject.Persistence.Configurations
{
    public class InstallmentPaymentConfiguration : IEntityTypeConfiguration<InstallmentPayment>
    {
        public void Configure(EntityTypeBuilder<InstallmentPayment> builder)
        {
            builder.ToTable("InstallmentPayments");

            builder.HasKey(ip => ip.Id);

            builder.Property(ip => ip.Amount)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(ip => ip.ReceivedBy)
                .IsRequired();

            builder.Property(ip => ip.Date)
                .IsRequired();

            // A payment always belongs to a package. If the package is deleted, its payment history goes with it.
            builder.HasOne(ip => ip.PatientPackage)
                .WithMany(pp => pp.InstallmentPayments)
                .HasForeignKey(ip => ip.PatientPackageId)
                .OnDelete(DeleteBehavior.Cascade);

            // VisitId is nullable — null means the office collected it directly, not tied to any visit.
            // Restrict delete: don't let deleting a Visit silently wipe out payment history collected during it.
            builder.HasOne(ip => ip.Visit)
                .WithMany(v => v.InstallmentPayments)
                .HasForeignKey(ip => ip.VisitId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            // Speeds up "give me this package's full payment history, in order" and
            // "give me everything collected during this visit."
            builder.HasIndex(ip => new { ip.PatientPackageId, ip.Date });
            builder.HasIndex(ip => ip.VisitId);
        }
    }
}
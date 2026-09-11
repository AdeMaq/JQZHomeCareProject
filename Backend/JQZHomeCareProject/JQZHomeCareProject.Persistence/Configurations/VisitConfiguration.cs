using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JQZHomeCareProject.Persistence.Configurations
{
    public class VisitConfiguration : IEntityTypeConfiguration<Visit>
    {
        public void Configure(EntityTypeBuilder<Visit> builder)
        {
            builder.Property(v => v.PatientNameSnapshot).HasMaxLength(200);
            builder.Property(v => v.PatientAddressSnapshot).HasMaxLength(500);
            builder.Property(v => v.PatientDescriptionSnapshot).HasMaxLength(1000);
            builder.Property(v => v.CheckInLocation).HasMaxLength(100);
            builder.Property(v => v.CheckOutLocation).HasMaxLength(100);

            builder.HasOne(v => v.Patient)
                .WithMany(p => p.Visits)
                .HasForeignKey(v => v.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.Practitioner)
                .WithMany(p => p.Visits)
                .HasForeignKey(v => v.PractitionerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.Area)
                .WithMany(a => a.Visits)
                .HasForeignKey(v => v.AreaId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.Service)
                .WithMany()
                .HasForeignKey(v => v.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.PatientPackage)
                .WithMany(pp => pp.Visits)
                .HasForeignKey(v => v.PatientPackageId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.CreatedByUser)
                .WithMany()
                .HasForeignKey(v => v.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Payment is the 1-to-1 dependent side; FK lives on Payment (see PaymentConfiguration).
            // SettlementId / settlement index REMOVED — settlement state now lives on Payment.IsSettled.

            builder.HasIndex(v => v.PractitionerId);
            builder.HasIndex(v => v.PatientPackageId);
            builder.HasIndex(v => v.ScheduledDate);
            builder.HasIndex(v => new { v.PractitionerId, v.ScheduledDate });
        }
    }
}
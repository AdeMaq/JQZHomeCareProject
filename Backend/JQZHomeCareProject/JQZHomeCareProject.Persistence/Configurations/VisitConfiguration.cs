using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JQZHomeCareProject.Persistence.Configurations
{
    public class VisitConfiguration : IEntityTypeConfiguration<Visit>
    {
        public void Configure(EntityTypeBuilder<Visit> builder)
        {
            builder.ToTable("Visits");

            builder.HasKey(v => v.Id);

            builder.Property(v => v.SlotStart).HasColumnType("time");
            builder.Property(v => v.SlotEnd).HasColumnType("time");
            builder.Property(v => v.CheckInLocation).HasMaxLength(500);
            builder.Property(v => v.CheckOutLocation).HasMaxLength(500);
            builder.Property(v => v.AmountDue).HasColumnType("decimal(12,2)");
            builder.Property(v => v.AmountReceived).HasColumnType("decimal(12,2)");

            builder.HasOne(v => v.Patient)
                .WithMany(p => p.Visits)
                .HasForeignKey(v => v.PatientId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.Practitioner)
                .WithMany(p => p.Visits)
                .HasForeignKey(v => v.PractitionerId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.Area)
                .WithMany(a => a.Visits)
                .HasForeignKey(v => v.AreaId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.Service)
                .WithMany()
                .HasForeignKey(v => v.ServiceId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.CreatedByUser)
                .WithMany()
                .HasForeignKey(v => v.CreatedByUserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.PatientPackage)
                .WithMany(pp => pp.Visits)
                .HasForeignKey(v => v.PatientPackageId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(v => v.Settlement)
                .WithMany(s => s.Visits)
                .HasForeignKey(v => v.SettlementId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(v => v.Refusals)
                .WithOne(r => r.Visit)
                .HasForeignKey(r => r.VisitId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(v => new { v.PractitionerId, v.SettlementId });
        }
    }
}
using System;
using System.Collections.Generic;
using System.Text;
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

            builder.Property(v => v.TimeSlot)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(v => v.Status)
                .HasConversion<string>()
                .IsRequired();

            builder.Property(v => v.CheckInLocation)
                .HasMaxLength(500);

            builder.Property(v => v.CheckOutLocation)
                .HasMaxLength(500);

            builder.Property(v => v.AmountDue)
                .HasColumnType("decimal(18,2)");

            builder.Property(v => v.AmountReceived)
                .HasColumnType("decimal(18,2)");

            builder.Property(v => v.ReceivedBy)
                .HasConversion<string>()
                .IsRequired(false);

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
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.Package)
                .WithMany(p => p.Visits)
                .HasForeignKey(v => v.PackageId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.CreatedByUser)
                .WithMany()
                .HasForeignKey(v => v.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(v => v.Refusals)
                .WithOne(r => r.Visit)
                .HasForeignKey(r => r.VisitId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JQZHomeCareProject.Persistence.Configurations
{
    public class PractitionerConfiguration : IEntityTypeConfiguration<Practitioner>
    {
        public void Configure(EntityTypeBuilder<Practitioner> builder)
        {
            builder.ToTable("Practitioners");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Type)
                .HasConversion<string>()
                .IsRequired();

            builder.Property(p => p.Education)
                .HasMaxLength(500);

            builder.Property(p => p.Priority)
                .IsRequired();

            builder.HasOne(p => p.CreatedByUser)
                .WithMany()
                .HasForeignKey(p => p.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.PractitionerAreas)
                .WithOne(pa => pa.Practitioner)
                .HasForeignKey(pa => pa.PractitionerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(p => p.Visits)
                .WithOne(v => v.Practitioner)
                .HasForeignKey(v => v.PractitionerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.Ratings)
                .WithOne(r => r.Practitioner)
                .HasForeignKey(r => r.PractitionerId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

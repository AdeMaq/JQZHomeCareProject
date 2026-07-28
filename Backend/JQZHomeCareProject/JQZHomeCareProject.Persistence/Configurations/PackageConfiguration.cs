using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JQZHomeCareProject.Persistence.Configurations
{
    public class PackageConfiguration : IEntityTypeConfiguration<Package>
    {
        public void Configure(EntityTypeBuilder<Package> builder)
        {
            builder.ToTable("Packages");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Name).IsRequired().HasMaxLength(150);
            builder.Property(p => p.Amount).HasColumnType("decimal(12,2)");

            builder.HasOne(p => p.Service)
                .WithMany(s => s.Packages)
                .HasForeignKey(p => p.ServiceId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

        }
    }
}

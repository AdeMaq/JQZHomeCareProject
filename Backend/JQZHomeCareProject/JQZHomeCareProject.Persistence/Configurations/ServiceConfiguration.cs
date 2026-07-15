using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JQZHomeCareProject.Persistence.Configurations
{
    public class ServiceConfiguration : IEntityTypeConfiguration<Service>
    {
        public void Configure(EntityTypeBuilder<Service> builder)
        {
            builder.ToTable("Services");

            builder.HasKey(s => s.Id);

            builder.Property(s => s.Name)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(s => s.Category)
                .HasConversion<string>()
                .IsRequired();

            builder.Property(s => s.Description)
                .HasMaxLength(1000);

            builder.HasMany(s => s.Visits)
                .WithOne(v => v.Service)
                .HasForeignKey(v => v.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

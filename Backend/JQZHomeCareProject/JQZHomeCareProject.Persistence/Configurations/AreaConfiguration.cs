using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JQZHomeCareProject.Persistence.Configurations
{
    public class AreaConfiguration : IEntityTypeConfiguration<Area>
    {
        public void Configure(EntityTypeBuilder<Area> builder)
        {
            builder.ToTable("Areas");

            builder.HasKey(a => a.Id);

            builder.Property(a => a.Name)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(a => a.GeoBoundary)
                .HasColumnType("nvarchar(max)");

            builder.HasMany(a => a.Visits)
                .WithOne(v => v.Area)
                .HasForeignKey(v => v.AreaId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

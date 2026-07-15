using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JQZHomeCareProject.Persistence.Configurations
{
    public class RefusalConfiguration : IEntityTypeConfiguration<Refusal>
    {
        public void Configure(EntityTypeBuilder<Refusal> builder)
        {
            builder.ToTable("Refusals");

            builder.HasKey(r => r.Id);

            builder.Property(r => r.RefusedBy)
                .HasConversion<string>()
                .IsRequired();

            builder.Property(r => r.Reason)
                .IsRequired()
                .HasMaxLength(1000);

            builder.HasOne(r => r.Visit)
                .WithMany(v => v.Refusals)
                .HasForeignKey(r => r.VisitId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JQZHomeCareProject.Persistence.Configurations
{
    public class RatingConfiguration : IEntityTypeConfiguration<Rating>
    {
        public void Configure(EntityTypeBuilder<Rating> builder)
        {
            builder.ToTable("Ratings");

            builder.HasKey(r => r.Id);

            builder.Property(r => r.Month)
                .IsRequired();

            builder.Property(r => r.Score)
                .IsRequired();

            builder.Property(r => r.Comments)
                .HasMaxLength(1000);

            builder.HasOne(r => r.Practitioner)
                .WithMany(p => p.Ratings)
                .HasForeignKey(r => r.PractitionerId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

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

            builder.Property(p => p.Education).IsRequired().HasMaxLength(300);
            builder.Property(p => p.Phone).IsRequired().HasMaxLength(20);
            builder.Property(p => p.SharePercentage).HasColumnType("decimal(5,2)");

            builder.HasIndex(p => p.Phone).IsUnique();

            builder.HasOne(p => p.Service)
                .WithMany(s => s.Practitioners)
                .HasForeignKey(p => p.ServiceId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.CreatedByUser)
                .WithMany()
                .HasForeignKey(p => p.CreatedByUserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.Ratings)
                .WithOne(r => r.Practitioner)
                .HasForeignKey(r => r.PractitionerId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
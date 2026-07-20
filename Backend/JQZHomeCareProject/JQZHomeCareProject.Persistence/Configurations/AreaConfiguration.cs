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

            builder.HasIndex(a => a.Name)
                .IsUnique();

            builder.HasMany(a => a.Visits)
                .WithOne(v => v.Area)
                .HasForeignKey(v => v.AreaId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
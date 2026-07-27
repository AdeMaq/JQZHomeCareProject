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

            builder.Property(s => s.Name).IsRequired().HasMaxLength(100);
            builder.Property(s => s.Description).HasMaxLength(1000);

            builder.HasOne(s => s.ServiceCategory)
                .WithMany(sc => sc.Services)
                .HasForeignKey(s => s.ServiceCategoryId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
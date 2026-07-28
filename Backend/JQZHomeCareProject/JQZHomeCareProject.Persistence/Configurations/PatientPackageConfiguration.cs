using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JQZHomeCareProject.Persistence.Configurations
{
    public class PatientPackageConfiguration : IEntityTypeConfiguration<PatientPackage>
    {
        public void Configure(EntityTypeBuilder<PatientPackage> builder)
        {
            builder.ToTable("PatientPackages");

            builder.HasKey(pp => pp.Id);

            builder.Property(pp => pp.TotalAmount).HasColumnType("decimal(12,2)");
            builder.Property(pp => pp.AmountPaid).HasColumnType("decimal(12,2)");
            builder.Property(pp => pp.AmountPending).HasColumnType("decimal(12,2)");

            builder.HasOne(pp => pp.Patient)
                .WithMany(p => p.PatientPackages)
                .HasForeignKey(pp => pp.PatientId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(pp => pp.Package)
                .WithMany(p => p.PatientPackages)
                .HasForeignKey(pp => pp.PackageId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

        }
    }
}
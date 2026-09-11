using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JQZHomeCareProject.Persistence.Configurations
{
    public class PatientPackageConfiguration : IEntityTypeConfiguration<PatientPackage>
    {
        public void Configure(EntityTypeBuilder<PatientPackage> builder)
        {
            builder.Property(pp => pp.DefaultAmount).HasPrecision(18, 2);
            builder.Property(pp => pp.Amount).HasPrecision(18, 2);

            // AmountPaid / AmountPending are [NotMapped] computed properties — EF ignores them
            // automatically, no explicit Ignore() call needed, but left here for clarity/safety.
            builder.Ignore(pp => pp.AmountPaid);
            builder.Ignore(pp => pp.AmountPending);

            builder.HasOne(pp => pp.Patient)
                .WithMany(p => p.PatientPackages)
                .HasForeignKey(pp => pp.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(pp => pp.Package)
                .WithMany(p => p.PatientPackages)
                .HasForeignKey(pp => pp.PackageId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(pp => pp.PatientId);
            builder.HasIndex(pp => pp.Status);
            builder.HasIndex(pp => pp.CollectionStatus);
        }
    }
}
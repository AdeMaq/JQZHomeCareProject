using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JQZHomeCareProject.Persistence.Configurations
{
    public class PractitionerAreaConfiguration : IEntityTypeConfiguration<PractitionerArea>
    {
        public void Configure(EntityTypeBuilder<PractitionerArea> builder)
        {
            builder.ToTable("PractitionerAreas");

            builder.HasKey(pa => new { pa.PractitionerId, pa.AreaId });

            builder.HasOne(pa => pa.Practitioner)
                .WithMany(p => p.PractitionerAreas)
                .HasForeignKey(pa => pa.PractitionerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(pa => pa.Area)
                .WithMany(a => a.PractitionerAreas)
                .HasForeignKey(pa => pa.AreaId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
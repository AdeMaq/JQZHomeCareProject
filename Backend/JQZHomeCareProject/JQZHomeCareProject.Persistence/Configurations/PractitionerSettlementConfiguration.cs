using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JQZHomeCareProject.Persistence.Configurations
{
    public class PractitionerSettlementConfiguration : IEntityTypeConfiguration<PractitionerSettlement>
    {
        public void Configure(EntityTypeBuilder<PractitionerSettlement> builder)
        {
            builder.ToTable("PractitionerSettlements");

            builder.HasKey(ps => ps.Id);

            builder.Property(ps => ps.TotalVisitAmount).HasColumnType("decimal(12,2)");
            builder.Property(ps => ps.PractitionerShareAmount).HasColumnType("decimal(12,2)");
            builder.Property(ps => ps.CompanyShareAmount).HasColumnType("decimal(12,2)");

            builder.HasOne(ps => ps.Practitioner)
                .WithMany(p => p.Settlements)
                .HasForeignKey(ps => ps.PractitionerId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(ps => ps.ReceivedByUser)
                .WithMany()
                .HasForeignKey(ps => ps.ReceivedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(ps => new { ps.PractitionerId, ps.WeekStartDate, ps.WeekEndDate });
        }
    }
}
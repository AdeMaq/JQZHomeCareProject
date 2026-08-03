using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JQZHomeCareProject.Persistence.Configurations;

public class ApiClientConfiguration : IEntityTypeConfiguration<ApiClient>
{
    public void Configure(EntityTypeBuilder<ApiClient> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.ClientName).IsRequired().HasMaxLength(200);
        builder.Property(c => c.ApiKeyHash).IsRequired();
        builder.HasIndex(c => c.ApiKeyHash).IsUnique();
        builder.Property(c => c.ApiKeyPrefix).IsRequired().HasMaxLength(16);

        var scopesComparer = new ValueComparer<string[]>(
            (a, b) => (a ?? Array.Empty<string>()).SequenceEqual(b ?? Array.Empty<string>()),
            v => v.Aggregate(0, (hash, s) => HashCode.Combine(hash, s.GetHashCode())),
            v => v.ToArray());

        builder.Property(c => c.AllowedScopes)
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries))
            .Metadata.SetValueComparer(scopesComparer);
    }
}
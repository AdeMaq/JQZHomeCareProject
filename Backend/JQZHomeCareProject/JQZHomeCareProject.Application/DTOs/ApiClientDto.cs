using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.DTOs
{
    public record CreateApiClientDto(string ClientName, string[] AllowedScopes);
    public record ApiClientDto(
        Guid Id,
        string ClientName,
        string ApiKeyPrefix,
        bool IsActive,
        string[] AllowedScopes,
        DateTime CreatedAt,
        DateTime? LastUsedAt);
    public record ApiKeyCreatedDto(Guid Id, string ClientName, string RawApiKey);
}

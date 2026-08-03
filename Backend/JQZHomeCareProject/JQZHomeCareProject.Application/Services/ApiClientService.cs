using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;
using System.Security.Cryptography;

namespace JQZHomeCareProject.Application.Services;

public class ApiClientService : IApiClientService
{
    private readonly IApiClientRepository _repo;
    private readonly IApiKeyHasher _hasher;

    public ApiClientService(IApiClientRepository repo, IApiKeyHasher hasher)
    {
        _repo = repo;
        _hasher = hasher;
    }

    public async Task<ApiKeyCreatedDto> CreateAsync(CreateApiClientDto dto)
    {
        var prefix = Convert.ToHexString(RandomNumberGenerator.GetBytes(4)).ToLower();
        var secret = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "").Replace("/", "").Replace("=", "");
        var rawKey = $"{prefix}.{secret}";

        var client = new ApiClient
        {
            Id = Guid.NewGuid(),
            ClientName = dto.ClientName,
            ApiKeyPrefix = prefix,
            ApiKeyHash = _hasher.Hash(rawKey),
            AllowedScopes = dto.AllowedScopes,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(client);
        return new ApiKeyCreatedDto(client.Id, client.ClientName, rawKey);
    }

    public async Task<List<ApiClientDto>> GetAllAsync()
    {
        var clients = await _repo.GetAllAsync();
        return clients.Select(c => new ApiClientDto(
            c.Id, c.ClientName, c.ApiKeyPrefix, c.IsActive, c.AllowedScopes, c.CreatedAt, c.LastUsedAt)
        ).ToList();
    }

    public async Task RevokeAsync(Guid id)
    {
        var client = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("API client not found.");
        client.IsActive = false;
        client.RevokedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(client);
    }
}
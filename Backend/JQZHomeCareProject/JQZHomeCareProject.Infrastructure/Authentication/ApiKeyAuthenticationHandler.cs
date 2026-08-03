using System.Security.Claims;
using System.Text.Encodings.Web;
using JQZHomeCareProject.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace JQZHomeCareProject.Infrastructure.Authentication;

public class ApiKeyAuthenticationHandler : AuthenticationHandler<ApiKeyAuthenticationOptions>
{
    private readonly IApiClientRepository _repo;
    private readonly IApiKeyHasher _hasher;

    public ApiKeyAuthenticationHandler(
        IOptionsMonitor<ApiKeyAuthenticationOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        IApiClientRepository repo,
        IApiKeyHasher hasher,
        ISystemClock clock)
        : base(options, logger, encoder ,clock)
    {
        _repo = repo;
        _hasher = hasher;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(ApiKeyAuthenticationOptions.HeaderName, out var headerValues))
        {
            return AuthenticateResult.NoResult();
        }

        var rawKey = headerValues.ToString();
        if (string.IsNullOrWhiteSpace(rawKey) || !rawKey.Contains('.'))
        {
            return AuthenticateResult.Fail("Invalid API key format.");
        }

        var hash = _hasher.Hash(rawKey);
        var client = await _repo.GetByKeyHashAsync(hash);

        if (client is null)
        {
            return AuthenticateResult.Fail("Invalid API key.");
        }

        if (!client.IsActive)
        {
            return AuthenticateResult.Fail("This API key has been revoked.");
        }

        client.LastUsedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(client);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, client.Id.ToString()),
            new(ClaimTypes.Name, client.ClientName),
            new("client_type", "external_partner")
        };
        claims.AddRange(client.AllowedScopes.Select(s => new Claim("scope", s)));

        var identity = new ClaimsIdentity(claims, ApiKeyAuthenticationOptions.SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, ApiKeyAuthenticationOptions.SchemeName);

        return AuthenticateResult.Success(ticket);
    }
}
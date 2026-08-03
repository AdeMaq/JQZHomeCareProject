using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JQZHomeCareProject.Persistence.Repositories;

public class ApiClientRepository : IApiClientRepository
{
    private readonly AppDbContext _db;
    public ApiClientRepository(AppDbContext db)
    {
        _db = db;
    }

    public Task<ApiClient?> GetByIdAsync(Guid id)
    {
        return _db.ApiClients.FirstOrDefaultAsync(c => c.Id == id);
    }

    public Task<ApiClient?> GetByKeyHashAsync(string apiKeyHash)
    {
        return _db.ApiClients.FirstOrDefaultAsync(c => c.ApiKeyHash == apiKeyHash);
    }

    public Task<List<ApiClient>> GetAllAsync()
    {
        return _db.ApiClients.OrderByDescending(c => c.CreatedAt).ToListAsync();
    }

    public async Task AddAsync(ApiClient client)
    {
        _db.ApiClients.Add(client);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(ApiClient client)
    {
        _db.ApiClients.Update(client);
        await _db.SaveChangesAsync();
    }
}
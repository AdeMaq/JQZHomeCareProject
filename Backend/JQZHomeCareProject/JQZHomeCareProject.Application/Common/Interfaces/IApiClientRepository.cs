using JQZHomeCareProject.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IApiClientRepository
    {
        Task<ApiClient?> GetByIdAsync(Guid id);
        Task<ApiClient?> GetByKeyHashAsync(string apiKeyHash);
        Task<List<ApiClient>> GetAllAsync();
        Task AddAsync(ApiClient client);
        Task UpdateAsync(ApiClient client);
    }
}

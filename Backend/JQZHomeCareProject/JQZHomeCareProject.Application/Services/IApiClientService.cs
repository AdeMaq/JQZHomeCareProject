using JQZHomeCareProject.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Services
{
    public interface IApiClientService
    {
        Task<ApiKeyCreatedDto> CreateAsync(CreateApiClientDto dto);
        Task<List<ApiClientDto>> GetAllAsync();
        Task RevokeAsync(Guid id);
    }
}

using JQZHomeCareProject.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface ILocationRepository
    {
        Task<Location?> GetLocationAsync(Guid id);
        Task AddAsync(Location location);
        Task UpdateAsync(Location location);
    }
}

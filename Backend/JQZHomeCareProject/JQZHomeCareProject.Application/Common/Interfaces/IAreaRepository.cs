using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IAreaRepository
    {
        Task<Area?> GetByIdAsync(Guid id);
        Task<IEnumerable<Area>> GetAllAsync();
        Task<IEnumerable<Area>> GetByCityIdAsync(Guid cityId);
        Task AddAsync(Area area);
        Task UpdateAsync(Area area);
        Task DeleteAsync(Guid id);
    }
}
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface ICityRepository
    {
        Task<City?> GetByIdAsync(Guid id);
        Task<IEnumerable<City>> GetAllAsync(); 
        Task AddAsync(City city);
        Task UpdateAsync(City city);
        Task DeleteAsync(Guid id);
    }
}
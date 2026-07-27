using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByPractitionerIdAsync(Guid practitionerId);
        Task<bool> EmailExistsAsync(string email);
        Task AddAsync(User user);
        Task UpdateAsync(User user);

        Task<IEnumerable<User>> GetAllPractitionerUsersAsync();
        Task<IEnumerable<User>> SearchPractitionerUsersByNameAsync(string name);
    }
}

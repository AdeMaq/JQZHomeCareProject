using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using JQZHomeCareProject.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;


namespace JQZHomeCareProject.Persistence.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            return await _context.Users
                .Include(u => u.Practitioner)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.Practitioner)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<User?> GetByPractitionerIdAsync(Guid practitionerId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.PractitionerId == practitionerId);
        }

        public async Task<IEnumerable<User>> GetAllPractitionerUsersAsync()
        {
            return await _context.Users
                .Where(u => u.Role == UserRole.Practitioner)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> SearchPractitionerUsersByNameAsync(string name)
        {
            return await _context.Users
                .Where(u => u.Role == UserRole.Practitioner
                         && u.PractitionerId != null
                         && u.Name.Contains(name))
                .AsNoTracking()
                .ToListAsync();
        }
    }
}

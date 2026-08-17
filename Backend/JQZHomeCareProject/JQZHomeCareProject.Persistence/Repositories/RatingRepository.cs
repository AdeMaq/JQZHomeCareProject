using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class RatingRepository : IRatingRepository
    {
        private readonly AppDbContext _context;

        public RatingRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Rating rating)
        {
            await _context.Ratings.AddAsync(rating);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Rating>> GetByPractitionerAsync(Guid practitionerId)
        {
            return await _context.Ratings
                .Where(r => r.PractitionerId == practitionerId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Rating?> GetByIdAsync(Guid ratingId)
        {
            return await _context.Ratings
                .Include(r => r.Practitioner)
                .FirstOrDefaultAsync(r => r.Id == ratingId);
        }

        public async Task<IEnumerable<Rating>> GetAllAsync()
        {
            return await _context.Ratings
                .Include(r => r.Practitioner)
                .OrderByDescending(r => r.Month)
                .ToListAsync();
        }

        public async Task<IEnumerable<Rating>> GetByMonthAsync(int year, int month)
        {
            return await _context.Ratings
                .Where(r => r.Month.Year == year && r.Month.Month == month)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task UpdateAsync(Rating rating)
        {
            _context.Ratings.Update(rating);
            await _context.SaveChangesAsync();
        }
    }
}

using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class RefusalRepository : IRefusalRepository
    {
        private readonly AppDbContext _context;

        public RefusalRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Refusal refusal)
        {
            await _context.Refusals.AddAsync(refusal);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Refusal>> GetByDateRangeAsync(DateTime from, DateTime to)
        {
            return await _context.Refusals
                .Include(r => r.Visit)
                .ThenInclude(v => v!.Patient)
                .Where(r => r.Date.Date >= from.Date && r.Date.Date <= to.Date)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}

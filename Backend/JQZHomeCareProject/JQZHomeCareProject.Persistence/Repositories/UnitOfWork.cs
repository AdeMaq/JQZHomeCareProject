using JQZHomeCareProject.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        public UnitOfWork(AppDbContext context) => _context = context;

        public async Task ExecuteInTransactionAsync(Func<Task> operation)
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    await operation();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }
    }
}

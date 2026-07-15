using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IRatingRepository
    {
        Task AddAsync(Rating rating);
        Task<IEnumerable<Rating>> GetByPractitionerAsync(Guid practitionerId);
        Task<IEnumerable<Rating>> GetByMonthAsync(int year, int month);
    }
}

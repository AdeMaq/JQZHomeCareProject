using JQZHomeCareProject.Mobile.Models.Visits;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Services.Api
{
    public interface IVisitsApi
    {
        Task<List<VisitDto>> GetTodayAsync(Guid practitionerId, CancellationToken cancellationToken = default);
        Task<List<VisitDto>> GetAllAsync(CancellationToken cancellationToken = default);
    }
}

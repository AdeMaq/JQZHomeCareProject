using JQZHomeCareProject.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Services
{
    public interface IVisitService
    {
        Task<VisitDto> CreateVisitAsync(CreateVisitDto dto, Guid createdByUserId);
        Task<IEnumerable<VisitDto>> GetTodayVisitsAsync(Guid? practitionerId);
        Task<IEnumerable<VisitDto>> GetByDateAsync(DateTime date);
        Task<VisitDto> GetByIdAsync(Guid id);
        Task AcceptVisitAsync(Guid visitId, Guid practitionerId);
        Task CheckInAsync(Guid visitId, CheckInDto dto);
        Task CheckOutAsync(Guid visitId, CheckOutDto dto);
        Task CancelVisitAsync(Guid visitId, CancelVisitDto dto);
    }
}

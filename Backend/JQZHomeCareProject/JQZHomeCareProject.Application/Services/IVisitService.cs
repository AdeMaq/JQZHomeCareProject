using JQZHomeCareProject.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Services
{
    public interface IVisitService
    {
        Task<PatientPackageDto> CreateVisitAsync(CreateVisitDto dto, Guid createdByUserId);

        Task RecordInstallmentAsync(Guid patientPackageId, RecordInstallmentDto dto);

        Task ScheduleVisitAsync(Guid visitId, ScheduleVisitDto dto);
        Task<IEnumerable<VisitDto>> GetTodayVisitsAsync(Guid? practitionerId);
        Task<IEnumerable<VisitDto>> GetByDateAsync(DateTime date);
        Task<IEnumerable<VisitDto>> GetAllAsync();
        Task<VisitDto> GetByIdAsync(Guid id);
        Task AcceptVisitAsync(Guid visitId, Guid practitionerId);
        Task CheckInAsync(Guid visitId, CheckInDto dto);
        Task CheckOutAsync(Guid visitId, CheckOutDto dto);
        Task CancelVisitAsync(Guid visitId, CancelVisitDto dto);
        Task ReassignPractitionerAsync(Guid visitId, ReassignPractitionerDto dto);
        Task AssignAsync(Guid visitId, AssignVisitDto dto);
    }
}

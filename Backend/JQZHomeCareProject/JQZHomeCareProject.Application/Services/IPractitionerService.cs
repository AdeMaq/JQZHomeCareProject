using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.DTOs;

namespace JQZHomeCareProject.Application.Services
{
    public interface IPractitionerService
    {
        Task<PractitionerDto> CreatePractitionerAsync(CreatePractitionerDto dto, Guid createdByUserId);
        Task<IEnumerable<PractitionerDto>> GetAllAsync();
        Task<PractitionerDto> GetByIdAsync(Guid id);
        Task UpdateAsync(Guid id, UpdatePractitionerDto dto);
        Task SetPriorityAsync(Guid id, int priority);
        Task SetSharePercentageAsync(Guid id, decimal sharePercentage);
        Task<IEnumerable<AreaDto>> GetAreasAsync(Guid id);
        Task AssignAreaAsync(Guid practitionerId, Guid areaId);
        Task RemoveAreaAsync(Guid practitionerId, Guid areaId);
        Task<IEnumerable<PractitionerDto>> FindAvailableAsync(Guid serviceId, Guid patientAreaId);
        Task<IEnumerable<PractitionerDto>> SearchByNameAsync(string name);

        Task ResetPasswordAsync(Guid practitionerId, ResetPractitionerPasswordDto dto);  
    }
}

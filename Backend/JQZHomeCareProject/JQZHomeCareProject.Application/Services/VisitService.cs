using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.Services
{
    public class VisitService : IVisitService
    {
        private readonly IVisitRepository _visitRepository;

        public VisitService(IVisitRepository visitRepository)
        {
            _visitRepository = visitRepository;
        }

        public async Task ScheduleVisitAsync(Guid visitId, ScheduleVisitDto dto)
        {
            var visit = await GetVisitOrThrow(visitId);

            if (visit.Status != VisitStatus.Scheduled)
                throw new ValidationException("Only visits in Scheduled status can have their date/time set.");

            visit.ScheduledDate = dto.ScheduledDate;
            visit.TimeSlot = dto.TimeSlot;
            visit.UpdatedAt = DateTime.UtcNow;

            await _visitRepository.UpdateAsync(visit);
        }

        public async Task<IEnumerable<VisitDto>> GetTodayVisitsAsync(Guid? practitionerId)
        {
            var visits = await _visitRepository.GetTodayAsync(practitionerId);
            return visits.Select(Map);
        }

        public async Task<IEnumerable<VisitDto>> GetByDateAsync(DateTime date)
        {
            var visits = await _visitRepository.GetByDateAsync(date);
            return visits.Select(Map);
        }

        public async Task<IEnumerable<VisitDto>> GetAllAsync()
        {
            var visits = await _visitRepository.GetAllAsync();
            return visits.Select(Map);
        }

        public async Task<VisitDto> GetByIdAsync(Guid id)
        {
            var visit = await GetVisitOrThrow(id);
            return Map(visit);
        }

        public async Task AcceptVisitAsync(Guid visitId, Guid practitionerId)
        {
            var visit = await GetVisitOrThrow(visitId);

            if (visit.Status != VisitStatus.Scheduled)
                throw new ValidationException("Only Scheduled visits can be accepted.");

            visit.PractitionerId = practitionerId;
            visit.Status = VisitStatus.Accepted;
            visit.UpdatedAt = DateTime.UtcNow;

            await _visitRepository.UpdateAsync(visit);
        }

        public async Task CheckInAsync(Guid visitId, CheckInDto dto)
        {
            var visit = await GetVisitOrThrow(visitId);

            if (visit.Status != VisitStatus.Accepted)
                throw new ValidationException("Only Accepted visits can be checked in.");

            visit.CheckInTime = dto.Timestamp;
            visit.CheckInLocation = $"{dto.Latitude},{dto.Longitude}";
            visit.UpdatedAt = DateTime.UtcNow;

            await _visitRepository.UpdateAsync(visit);
        }

        public async Task CheckOutAsync(Guid visitId, CheckOutDto dto)
        {
            var visit = await GetVisitOrThrow(visitId);

            if (visit.CheckInTime is null)
                throw new ValidationException("Visit must be checked in before it can be checked out.");

            if (dto.ReceivedBy == ReceivedByType.Practitioner && dto.AmountReceived is null)
                throw new ValidationException("AmountReceived is required when ReceivedBy = Practitioner.");

            visit.CheckOutTime = dto.Timestamp;
            visit.CheckOutLocation = $"{dto.Latitude},{dto.Longitude}";
            visit.ReceivedBy = dto.ReceivedBy;
            visit.AmountReceived = dto.ReceivedBy == ReceivedByType.Practitioner ? dto.AmountReceived!.Value : 0;
            visit.CollectionStatus = CollectionStatus.Pending; // settled only via weekly settlement
            visit.Status = VisitStatus.Completed;
            visit.UpdatedAt = DateTime.UtcNow;

            await _visitRepository.UpdateAsync(visit);
        }

        public async Task CancelVisitAsync(Guid visitId, CancelVisitDto dto)
        {
            var visit = await GetVisitOrThrow(visitId);

            if (visit.Status is VisitStatus.Completed or VisitStatus.Cancelled)
                throw new ValidationException($"Cannot cancel a visit that is already {visit.Status}.");

            visit.Status = VisitStatus.Cancelled;
            visit.UpdatedAt = DateTime.UtcNow;
            visit.Refusals.Add(new Refusal
            {
                VisitId = visit.Id,
                RefusedBy = dto.RefusedBy,
                Reason = dto.Reason,
                Date = DateTime.UtcNow
            });

            await _visitRepository.UpdateAsync(visit);
        }

        private async Task<Visit> GetVisitOrThrow(Guid id) =>
            await _visitRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Visit with id {id} was not found.");

        public async Task ReassignPractitionerAsync(Guid visitId, ReassignPractitionerDto dto)
        {
            var visit = await GetVisitOrThrow(visitId);

            if (visit.Status is VisitStatus.Completed or VisitStatus.Cancelled)
                throw new ValidationException($"Cannot reassign a visit that is already {visit.Status}.");

            if (visit.PractitionerId == dto.NewPractitionerId)
                throw new ValidationException("New practitioner is the same as the currently assigned practitioner.");

            visit.Refusals.Add(new Refusal
            {
                VisitId = visit.Id,
                RefusedBy = dto.RefusedBy,
                Reason = dto.Reason,
                Date = DateTime.UtcNow
            });

            visit.PractitionerId = dto.NewPractitionerId;
            if (dto.AreaId.HasValue)
                visit.AreaId = dto.AreaId.Value;

            visit.Status = VisitStatus.Scheduled;

            visit.CheckInTime = null;
            visit.CheckInLocation = null;

            visit.UpdatedAt = DateTime.UtcNow;

            await _visitRepository.UpdateAsync(visit);
        }

        private static VisitDto Map(Visit v) => new()
        {
            Id = v.Id,
            PatientId = v.PatientId,
            PatientName = v.Patient?.Name ?? string.Empty,
            PractitionerId = v.PractitionerId,
            PractitionerName = v.Practitioner?.User?.Name,
            AreaId = v.AreaId,
            AreaName = v.Area?.Name,
            ServiceId = v.ServiceId,
            ServiceName = v.Service?.Name,
            PatientPackageId = v.PatientPackageId,
            PackageName = v.PatientPackage?.Package?.Name,
            ScheduledDate = v.ScheduledDate,
            TimeSlot = v.TimeSlot,
            Status = v.Status,
            AmountDue = v.AmountDue,
            AmountReceived = v.AmountReceived,
            ReceivedBy = v.ReceivedBy,
            CollectionStatus = v.CollectionStatus,
            SettlementId = v.SettlementId
        };
    }
}
using System;
using System.Collections.Generic;
using System.Text;
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
        private readonly IPatientRepository _patientRepository;
        private readonly ILocationRepository _locationRepository;
        private readonly IPractitionerRepository _practitionerRepository;
        private readonly IUserRepository _userRepository;
        private readonly IAreaRepository _areaRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IPackageRepository _packageRepository;
        private readonly IRefusalRepository _refusalRepository;
        private readonly IMapsService _mapsService;

        public VisitService(
            IMapsService mapsService,
            IVisitRepository visitRepository,
            IPatientRepository patientRepository,
            ILocationRepository locationRepository,
            IPractitionerRepository practitionerRepository,
            IUserRepository userRepository,
            IAreaRepository areaRepository,
            IServiceRepository serviceRepository,
            IPackageRepository packageRepository,
            IRefusalRepository refusalRepository)
        {
            _visitRepository = visitRepository;
            _patientRepository = patientRepository;
            _locationRepository = locationRepository;
            _practitionerRepository = practitionerRepository;
            _userRepository = userRepository;
            _areaRepository = areaRepository;
            _serviceRepository = serviceRepository;
            _packageRepository = packageRepository;
            _refusalRepository = refusalRepository;
            _mapsService = mapsService;
        }

        public async Task<VisitDto> CreateVisitAsync(CreateVisitDto dto, Guid createdByUserId)
        {
            if (string.IsNullOrWhiteSpace(dto.PatientName))
            {
                throw new ValidationException("Patient name is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.PatientPhone))
            {
                throw new ValidationException("Patient phone is required.");
            }

            if (dto.AmountDue < 0)
            {
                throw new ValidationException("Amount due cannot be negative.");
            }

            var practitioner = await _practitionerRepository.GetByIdAsync(dto.PractitionerId);
            if (practitioner is null)
            {
                throw new NotFoundException($"Practitioner with id '{dto.PractitionerId}' was not found.");
            }

            var area = await _areaRepository.GetByIdAsync(dto.AreaId);
            if (area is null)
            {
                throw new NotFoundException($"Area with id '{dto.AreaId}' was not found.");
            }

            var service = await _serviceRepository.GetByIdAsync(dto.ServiceId);
            if (service is null)
            {
                throw new NotFoundException($"Service with id '{dto.ServiceId}' was not found.");
            }

            if (dto.PackageId.HasValue)
            {
                var package = await _packageRepository.GetByIdAsync(dto.PackageId.Value);
                if (package is null)
                {
                    throw new NotFoundException($"Package with id '{dto.PackageId}' was not found.");
                }
            }

            var patient = await _patientRepository.GetByPhoneAsync(dto.PatientPhone);

            if (patient is null)
            {
                var (latitude, longitude) = await _mapsService.GeocodeAsync(dto.LocationAddress);
                var location = new Location
                {
                    Id = Guid.NewGuid(),
                    Address = dto.LocationAddress,
                    Latitude = latitude,
                    Longitude = longitude,
                    CreatedAt = DateTime.UtcNow
                };

                await _locationRepository.AddAsync(location);

                patient = new Patient
                {
                    Id = Guid.NewGuid(),
                    Name = dto.PatientName,
                    Phone = dto.PatientPhone,
                    LocationId = location.Id,
                    CreatedAt = DateTime.UtcNow
                };

                await _patientRepository.AddAsync(patient);
            }

            var visit = new Visit
            {
                Id = Guid.NewGuid(),
                PatientId = patient.Id,
                PractitionerId = dto.PractitionerId,
                AreaId = dto.AreaId,
                ServiceId = dto.ServiceId,
                PackageId = dto.PackageId,
                ScheduledDate = dto.ScheduledDate,
                TimeSlot = dto.TimeSlot,
                Status = VisitStatus.Scheduled,
                AmountDue = dto.AmountDue,
                AmountReceived = 0,
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            };

            await _visitRepository.AddAsync(visit);

            return await MapToDtoAsync(visit);
        }

        public async Task<IEnumerable<VisitDto>> GetTodayVisitsAsync(Guid? practitionerId)
        {
            var visits = await _visitRepository.GetTodayAsync(practitionerId);
            return await MapManyToDtoAsync(visits);
        }

        public async Task<IEnumerable<VisitDto>> GetByDateAsync(DateTime date)
        {
            var visits = await _visitRepository.GetByDateAsync(date);
            return await MapManyToDtoAsync(visits);
        }

        public async Task<VisitDto> GetByIdAsync(Guid id)
        {
            var visit = await _visitRepository.GetByIdAsync(id);
            if (visit is null)
            {
                throw new NotFoundException($"Visit with id '{id}' was not found.");
            }

            return await MapToDtoAsync(visit);
        }

        public async Task AcceptVisitAsync(Guid visitId, Guid practitionerId)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId);
            if (visit is null)
            {
                throw new NotFoundException($"Visit with id '{visitId}' was not found.");
            }

            if (visit.PractitionerId != practitionerId)
            {
                throw new ValidationException("This visit is not assigned to you.");
            }

            if (visit.Status != VisitStatus.Scheduled)
            {
                throw new ValidationException($"Visit cannot be accepted from status '{visit.Status}'.");
            }

            visit.Status = VisitStatus.Accepted;
            visit.UpdatedAt = DateTime.UtcNow;

            await _visitRepository.UpdateAsync(visit);
        }

        public async Task CheckInAsync(Guid visitId, CheckInDto dto)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId);
            if (visit is null)
            {
                throw new NotFoundException($"Visit with id '{visitId}' was not found.");
            }

            if (visit.Status != VisitStatus.Accepted)
            {
                throw new ValidationException("Visit must be accepted before check-in.");
            }

            visit.CheckInTime = dto.Timestamp;
            visit.CheckInLocation = $"{dto.Latitude},{dto.Longitude}";
            visit.UpdatedAt = DateTime.UtcNow;

            await _visitRepository.UpdateAsync(visit);
        }

        public async Task CheckOutAsync(Guid visitId, CheckOutDto dto)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId);
            if (visit is null)
            {
                throw new NotFoundException($"Visit with id '{visitId}' was not found.");
            }

            if (visit.CheckInTime is null)
            {
                throw new ValidationException("Visit must be checked in before check-out.");
            }

            if (visit.Status != VisitStatus.Accepted)
            {
                throw new ValidationException("Visit is not in a state that allows check-out.");
            }

            if (dto.ReceivedBy == ReceivedByType.Practitioner)
            {
                if (!dto.AmountReceived.HasValue)
                {
                    throw new ValidationException("AmountReceived is required when ReceivedBy is Practitioner.");
                }

                visit.AmountReceived = dto.AmountReceived.Value;
            }
            else
            {
                // Company-received visits are treated as already settled for the full amount due
                visit.AmountReceived = visit.AmountDue;
            }

            visit.ReceivedBy = dto.ReceivedBy;
            visit.CheckOutTime = dto.Timestamp;
            visit.CheckOutLocation = $"{dto.Latitude},{dto.Longitude}";
            visit.Status = VisitStatus.Completed;
            visit.UpdatedAt = DateTime.UtcNow;

            await _visitRepository.UpdateAsync(visit);
        }

        public async Task CancelVisitAsync(Guid visitId, CancelVisitDto dto)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId);
            if (visit is null)
            {
                throw new NotFoundException($"Visit with id '{visitId}' was not found.");
            }

            if (visit.Status is VisitStatus.Completed or VisitStatus.Cancelled)
            {
                throw new ValidationException($"Visit cannot be cancelled from status '{visit.Status}'.");
            }

            if (string.IsNullOrWhiteSpace(dto.Reason))
            {
                throw new ValidationException("A reason is required to cancel a visit.");
            }

            visit.Status = VisitStatus.Cancelled;
            visit.UpdatedAt = DateTime.UtcNow;

            await _visitRepository.UpdateAsync(visit);

            var refusal = new Refusal
            {
                Id = Guid.NewGuid(),
                VisitId = visit.Id,
                RefusedBy = dto.RefusedBy,
                Reason = dto.Reason,
                Date = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            await _refusalRepository.AddAsync(refusal);
        }

        private async Task<IEnumerable<VisitDto>> MapManyToDtoAsync(IEnumerable<Visit> visits)
        {
            var result = new List<VisitDto>();
            foreach (var visit in visits)
            {
                result.Add(await MapToDtoAsync(visit));
            }
            return result;
        }

        private async Task<VisitDto> MapToDtoAsync(Visit visit)
        {
            var practitionerUser = await _userRepository.GetByPractitionerIdAsync(visit.PractitionerId);

            return new VisitDto
            {
                Id = visit.Id,
                PatientName = visit.Patient?.Name ?? string.Empty,
                PractitionerName = practitionerUser?.Name ?? string.Empty,
                AreaName = visit.Area?.Name ?? string.Empty,
                ServiceName = visit.Service?.Name ?? string.Empty,
                PackageName = visit.Package?.Name,
                ScheduledDate = visit.ScheduledDate,
                TimeSlot = visit.TimeSlot,
                Status = visit.Status,
                AmountDue = visit.AmountDue,
                AmountReceived = visit.AmountReceived,
                ReceivedBy = visit.ReceivedBy
            };
        }
    }
}

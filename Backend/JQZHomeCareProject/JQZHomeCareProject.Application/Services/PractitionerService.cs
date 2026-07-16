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
    public class PractitionerService : IPractitionerService
    {
        private readonly IPractitionerRepository _practitionerRepository;
        private readonly IUserRepository _userRepository;
        private readonly IAreaRepository _areaRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IPasswordHasher _passwordHasher;

        public PractitionerService(
            IPractitionerRepository practitionerRepository,
            IUserRepository userRepository,
            IAreaRepository areaRepository,
            IVisitRepository visitRepository,
            IPasswordHasher passwordHasher)
        {
            _practitionerRepository = practitionerRepository;
            _userRepository = userRepository;
            _areaRepository = areaRepository;
            _visitRepository = visitRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<PractitionerDto> CreatePractitionerAsync(CreatePractitionerDto dto, Guid createdByUserId)
        {
            var emailExists = await _userRepository.EmailExistsAsync(dto.Email);
            if (emailExists)
            {
                throw new ValidationException("A user with this email already exists.");
            }

            var practitioner = new Practitioner
            {
                Id = Guid.NewGuid(),
                Type = dto.Type,
                Education = dto.Education,
                Priority = dto.Priority,
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            };

            await _practitionerRepository.AddAsync(practitioner);

            foreach (var areaId in dto.AreaIds.Distinct())
            {
                var area = await _areaRepository.GetByIdAsync(areaId);
                if (area is null)
                {
                    throw new NotFoundException($"Area with id '{areaId}' was not found.");
                }

                await _practitionerRepository.AssignAreaAsync(practitioner.Id, areaId);
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = _passwordHasher.Hash(dto.Password),
                Role = UserRole.Practitioner,
                PractitionerId = practitioner.Id,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);

            return await MapToDtoAsync(practitioner, user);
        }

        public async Task<IEnumerable<PractitionerDto>> GetAllAsync()
        {
            var practitioners = await _practitionerRepository.GetAllAsync();
            var result = new List<PractitionerDto>();

            foreach (var practitioner in practitioners)
            {
                var user = await _userRepository.GetByPractitionerIdAsync(practitioner.Id);
                result.Add(await MapToDtoAsync(practitioner, user));
            }

            return result;
        }

        public async Task<PractitionerDto> GetByIdAsync(Guid id)
        {
            var practitioner = await _practitionerRepository.GetByIdAsync(id);
            if (practitioner is null)
            {
                throw new NotFoundException($"Practitioner with id '{id}' was not found.");
            }

            var user = await _userRepository.GetByPractitionerIdAsync(practitioner.Id);
            return await MapToDtoAsync(practitioner, user);
        }

        public async Task UpdateAsync(Guid id, UpdatePractitionerDto dto)
        {
            var practitioner = await _practitionerRepository.GetByIdAsync(id);
            if (practitioner is null)
            {
                throw new NotFoundException($"Practitioner with id '{id}' was not found.");
            }

            practitioner.Type = dto.Type;
            practitioner.Education = dto.Education;
            practitioner.UpdatedAt = DateTime.UtcNow;

            await _practitionerRepository.UpdateAsync(practitioner);

            var user = await _userRepository.GetByPractitionerIdAsync(practitioner.Id);
            if (user is not null)
            {
                user.Name = dto.Name;
                user.UpdatedAt = DateTime.UtcNow;
                await _userRepository.UpdateAsync(user);
            }
        }

        public async Task SetPriorityAsync(Guid id, int priority)
        {
            if (priority is < 1 or > 5)
            {
                throw new ValidationException("Priority must be between 1 and 5.");
            }

            var practitioner = await _practitionerRepository.GetByIdAsync(id);
            if (practitioner is null)
            {
                throw new NotFoundException($"Practitioner with id '{id}' was not found.");
            }

            practitioner.Priority = priority;
            practitioner.UpdatedAt = DateTime.UtcNow;

            await _practitionerRepository.UpdateAsync(practitioner);
        }

        public async Task<IEnumerable<AreaDto>> GetAreasAsync(Guid id)
        {
            var practitioner = await _practitionerRepository.GetByIdAsync(id);
            if (practitioner is null)
            {
                throw new NotFoundException($"Practitioner with id '{id}' was not found.");
            }

            var areas = await _practitionerRepository.GetAreasAsync(id);

            return areas.Select(a => new AreaDto
            {
                Id = a.Id,
                Name = a.Name
            });
        }

        public async Task AssignAreaAsync(Guid practitionerId, Guid areaId)
        {
            var practitioner = await _practitionerRepository.GetByIdAsync(practitionerId);
            if (practitioner is null)
            {
                throw new NotFoundException($"Practitioner with id '{practitionerId}' was not found.");
            }

            var area = await _areaRepository.GetByIdAsync(areaId);
            if (area is null)
            {
                throw new NotFoundException($"Area with id '{areaId}' was not found.");
            }

            await _practitionerRepository.AssignAreaAsync(practitionerId, areaId);
        }

        public async Task RemoveAreaAsync(Guid practitionerId, Guid areaId)
        {
            var practitioner = await _practitionerRepository.GetByIdAsync(practitionerId);
            if (practitioner is null)
            {
                throw new NotFoundException($"Practitioner with id '{practitionerId}' was not found.");
            }

            await _practitionerRepository.RemoveAreaAsync(practitionerId, areaId);
        }

        private async Task<PractitionerDto> MapToDtoAsync(Practitioner practitioner, User? user)
        {
            var visits = await _visitRepository.GetByPractitionerAsync(practitioner.Id);
            var visitList = visits.ToList();

            return new PractitionerDto
            {
                Id = practitioner.Id,
                Name = user?.Name ?? string.Empty,
                Email = user?.Email ?? string.Empty,
                Type = practitioner.Type,
                Education = practitioner.Education,
                Priority = practitioner.Priority,
                Areas = practitioner.PractitionerAreas
                    .Where(pa => pa.Area is not null)
                    .Select(pa => new AreaDto { Id = pa.Area!.Id, Name = pa.Area!.Name })
                    .ToList(),
                VisitCount = visitList.Count,
                CancellationCount = visitList.Count(v => v.Status == VisitStatus.Cancelled)
            };
        }
    }
}

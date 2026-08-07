using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.Common.Validation;
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
        private readonly IServiceRepository _serviceRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IUnitOfWork _unitOfWork;

        public PractitionerService(
            IPractitionerRepository practitionerRepository,
            IUserRepository userRepository,
            IAreaRepository areaRepository,
            IServiceRepository serviceRepository,
            IPasswordHasher passwordHasher,
            IUnitOfWork unitOfWork)
        {
            _practitionerRepository = practitionerRepository;
            _userRepository = userRepository;
            _areaRepository = areaRepository;
            _serviceRepository = serviceRepository;
            _passwordHasher = passwordHasher;
            _unitOfWork = unitOfWork;
        }

        public async Task<PractitionerDto> CreatePractitionerAsync(CreatePractitionerDto dto, Guid createdByUserId)
        {
            var name = NameValidator.NormalizeRequired(dto.Name, "Name", 150);
            Guard.EnsureValidEmail(dto.Email);
            var phone = Guard.NormalizePhone(dto.Phone);
            var education = NameValidator.NormalizeRequired(dto.Education, "Education", 200);
            Guard.EnsureInRange(dto.Priority, 1, 5, "Priority");
            Guard.EnsureInRange(dto.SharePercentage, 0, 100, "SharePercentage");
            ValidatePasswordStrength(dto.Password);

            if (await _userRepository.EmailExistsAsync(dto.Email))
                throw new ValidationException("A user with this email already exists.");

            var phoneOwner = await _practitionerRepository.GetByPhoneAsync(phone);
            if (phoneOwner is not null)
                throw new ValidationException($"Phone '{phone}' is already in use by another practitioner.");

            var service = await _serviceRepository.GetByIdAsync(dto.ServiceId)
                ?? throw new ValidationException("ServiceId does not reference an existing service.");

            var distinctAreaIds = dto.AreaIds.Distinct().ToList();
            foreach (var areaId in distinctAreaIds)
            {
                _ = await _areaRepository.GetByIdAsync(areaId)
                    ?? throw new NotFoundException($"Area {areaId} not found.");
            }

            Practitioner practitioner = null!;
            User user = null!;

            await _unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                practitioner = new Practitioner
                {
                    ServiceId = dto.ServiceId,
                    Education = education,
                    Priority = dto.Priority,
                    Phone = phone,
                    SharePercentage = dto.SharePercentage,
                    CreatedByUserId = createdByUserId
                };
                await _practitionerRepository.AddAsync(practitioner);

                user = new User
                {
                    Name = name,
                    Email = dto.Email.Trim(),
                    PasswordHash = _passwordHasher.Hash(dto.Password),
                    Role = UserRole.Practitioner,
                    PractitionerId = practitioner.Id
                };
                await _userRepository.AddAsync(user);

                foreach (var areaId in distinctAreaIds)
                {
                    await _practitionerRepository.AssignAreaAsync(practitioner.Id, areaId);
                }
            });

            practitioner.Service = service;
            var areas = await _practitionerRepository.GetAreasAsync(practitioner.Id);

            return MapToDto(practitioner, user, areas);
        }

        public async Task<IEnumerable<PractitionerDto>> GetAllAsync()
        {
            var practitioners = await _practitionerRepository.GetAllAsync();
            var practitionerUsers = await _userRepository.GetAllPractitionerUsersAsync();

            var usersByPractitionerId = practitionerUsers
                .Where(u => u.PractitionerId.HasValue)
                .ToDictionary(u => u.PractitionerId!.Value, u => u);

            var result = new List<PractitionerDto>();
            foreach (var practitioner in practitioners)
            {
                usersByPractitionerId.TryGetValue(practitioner.Id, out var user);
                var areas = await _practitionerRepository.GetAreasAsync(practitioner.Id);
                result.Add(MapToDto(practitioner, user, areas));
            }

            return result;
        }

        public async Task<PractitionerDto> GetByIdAsync(Guid id)
        {
            var practitioner = await _practitionerRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Practitioner {id} not found.");

            var user = await _userRepository.GetByPractitionerIdAsync(id);
            var areas = await _practitionerRepository.GetAreasAsync(id);
            return MapToDto(practitioner, user, areas);
        }

        public async Task<IEnumerable<PractitionerDto>> SearchByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return Enumerable.Empty<PractitionerDto>();

            var users = await _userRepository.SearchPractitionerUsersByNameAsync(name.Trim());
            var result = new List<PractitionerDto>();

            foreach (var user in users)
            {
                if (!user.PractitionerId.HasValue) continue;

                var practitioner = await _practitionerRepository.GetByIdAsync(user.PractitionerId.Value);
                if (practitioner is null) continue;

                var areas = await _practitionerRepository.GetAreasAsync(practitioner.Id);
                result.Add(MapToDto(practitioner, user, areas));
            }

            return result;
        }

        public async Task UpdateAsync(Guid id, UpdatePractitionerDto dto)
        {
            var practitioner = await _practitionerRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Practitioner {id} not found.");

            var linkedUser = await _userRepository.GetByPractitionerIdAsync(id)
                ?? throw new NotFoundException($"No linked login found for practitioner {id}.");

            var name = NameValidator.NormalizeRequired(dto.Name, "Name", 150);
            Guard.EnsureValidEmail(dto.Email);
            var phone = Guard.NormalizePhone(dto.Phone);
            var education = NameValidator.NormalizeRequired(dto.Education, "Education", 200);
            Guard.EnsureInRange(dto.Priority, 1, 5, "Priority");
            Guard.EnsureInRange(dto.SharePercentage, 0, 100, "SharePercentage");

            var phoneOwner = await _practitionerRepository.GetByPhoneAsync(phone);
            if (phoneOwner is not null && phoneOwner.Id != id)
                throw new ValidationException($"Phone '{phone}' is already in use by another practitioner.");

            var emailOwner = await _userRepository.GetByEmailAsync(dto.Email);
            if (emailOwner is not null && emailOwner.Id != linkedUser.Id)
                throw new ValidationException($"Email '{dto.Email}' is already in use by another account.");

            var service = await _serviceRepository.GetByIdAsync(dto.ServiceId)
                ?? throw new NotFoundException($"Service {dto.ServiceId} not found.");

            var distinctAreaIds = dto.AreaIds.Distinct().ToList();
            foreach (var areaId in distinctAreaIds)
            {
                _ = await _areaRepository.GetByIdAsync(areaId)
                    ?? throw new NotFoundException($"Area {areaId} not found.");
            }
            var isPasswordChange = !string.IsNullOrWhiteSpace(dto.Password);
            if (isPasswordChange)
                ValidatePasswordStrength(dto.Password!);

            await _unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                linkedUser.Name = name;
                linkedUser.Email = dto.Email.Trim();
                if (isPasswordChange)
                    linkedUser.PasswordHash = _passwordHasher.Hash(dto.Password!);
                await _userRepository.UpdateAsync(linkedUser);

                practitioner.Phone = phone;
                practitioner.ServiceId = dto.ServiceId;
                practitioner.Education = education;
                practitioner.Priority = dto.Priority;
                practitioner.SharePercentage = dto.SharePercentage;
                await _practitionerRepository.UpdateAsync(practitioner);

                var currentAreas = (await _practitionerRepository.GetAreasAsync(id)).Select(a => a.Id).ToList();

                var areasToRemove = currentAreas.Except(distinctAreaIds);
                foreach (var areaId in areasToRemove)
                    await _practitionerRepository.RemoveAreaAsync(id, areaId);

                var areasToAdd = distinctAreaIds.Except(currentAreas);
                foreach (var areaId in areasToAdd)
                    await _practitionerRepository.AssignAreaAsync(id, areaId);
            });
        }

        public async Task SetPriorityAsync(Guid id, int priority)
        {
            Guard.EnsureInRange(priority, 1, 5, "Priority");

            var practitioner = await _practitionerRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Practitioner {id} not found.");

            practitioner.Priority = priority;
            await _practitionerRepository.UpdateAsync(practitioner);
        }

        public async Task SetSharePercentageAsync(Guid id, decimal sharePercentage)
        {
            Guard.EnsureInRange(sharePercentage, 0, 100, "SharePercentage");

            var practitioner = await _practitionerRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Practitioner {id} not found.");

            practitioner.SharePercentage = sharePercentage;
            await _practitionerRepository.UpdateAsync(practitioner);
        }

        public async Task<IEnumerable<AreaDto>> GetAreasAsync(Guid id)
        {
            var areas = await _practitionerRepository.GetAreasAsync(id);
            return areas.Select(a => new AreaDto
            {
                Id = a.Id,
                Name = a.Name,
                CityId = a.CityId,
                CityName = a.City?.Name ?? string.Empty
            });
        }

        public async Task AssignAreaAsync(Guid practitionerId, Guid areaId)
        {
            _ = await _practitionerRepository.GetByIdAsync(practitionerId)
                ?? throw new NotFoundException($"Practitioner {practitionerId} not found.");
            _ = await _areaRepository.GetByIdAsync(areaId)
                ?? throw new NotFoundException($"Area {areaId} not found.");

            await _practitionerRepository.AssignAreaAsync(practitionerId, areaId);
        }

        public async Task RemoveAreaAsync(Guid practitionerId, Guid areaId)
        {
            _ = await _practitionerRepository.GetByIdAsync(practitionerId)
                ?? throw new NotFoundException($"Practitioner {practitionerId} not found.");

            await _practitionerRepository.RemoveAreaAsync(practitionerId, areaId);
        }

        public async Task<IEnumerable<PractitionerDto>> FindAvailableAsync(Guid serviceId, Guid patientAreaId)
        {
            Guard.EnsureNotEmpty(serviceId, "ServiceId");
            Guard.EnsureNotEmpty(patientAreaId, "patientAreaId");

            _ = await _serviceRepository.GetByIdAsync(serviceId)
                ?? throw new ValidationException("serviceId does not reference an existing service.");

            var patientArea = await _areaRepository.GetByIdAsync(patientAreaId)
                ?? throw new ValidationException("patientAreaId does not reference an existing area.");

            var practitioners = await _practitionerRepository.FindAvailableAsync(serviceId, patientAreaId, patientArea.CityId);

            var result = new List<PractitionerDto>();
            foreach (var practitioner in practitioners)
            {
                var user = await _userRepository.GetByPractitionerIdAsync(practitioner.Id);
                var areas = await _practitionerRepository.GetAreasAsync(practitioner.Id);
                result.Add(MapToDto(practitioner, user, areas));
            }
            return result;
        }

        public async Task ResetPasswordAsync(Guid practitionerId, ResetPractitionerPasswordDto dto)
        {
            var linkedUser = await _userRepository.GetByPractitionerIdAsync(practitionerId)
                ?? throw new NotFoundException($"No linked login found for practitioner {practitionerId}.");

            ValidatePasswordStrength(dto.NewPassword);

            linkedUser.PasswordHash = _passwordHasher.Hash(dto.NewPassword);
            await _userRepository.UpdateAsync(linkedUser);
        }

        private static void ValidatePasswordStrength(string password)
        {
            if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
                throw new ValidationException("Password must be at least 8 characters.");
        }

        private static PractitionerDto MapToDto(Practitioner practitioner, User? user, IEnumerable<Area> areas) => new()
        {
            Id = practitioner.Id,
            Name = user?.Name ?? string.Empty,
            Email = user?.Email ?? string.Empty,
            Phone = practitioner.Phone,
            ServiceId = practitioner.ServiceId,
            ServiceName = practitioner.Service?.Name ?? string.Empty,
            Education = practitioner.Education,
            Priority = practitioner.Priority,
            SharePercentage = practitioner.SharePercentage,
            Areas = areas.Select(a => new AreaDto
            {
                Id = a.Id,
                Name = a.Name,
                CityId = a.CityId,
                CityName = a.City?.Name ?? string.Empty
            }).ToList(),
            VisitCount = practitioner.Visits?.Count ?? 0,
            CancellationCount = practitioner.Visits?.Count(v => v.Status == VisitStatus.Cancelled) ?? 0
        };
    }
}
using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.Common.Validation;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Services
{
    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _patientRepository;
        private readonly ILocationRepository _locationRepository;
        private readonly IMapsService _mapsService;

        public PatientService(IPatientRepository patientRepository,ILocationRepository locationRepository,IMapsService mapsService)
        {
            _patientRepository = patientRepository;
            _locationRepository = locationRepository;
            _mapsService = mapsService;
        }

        public async Task<PatientDto> GetOrCreateAsync(string name, string phone, string locationAddress)
        {
            var normalizedPhone = Guard.NormalizePhone(phone);
            var normalizedName = NameValidator.NormalizeRequired(name, "Patient name", 150);
            var normalizedAddress = NameValidator.NormalizeRequired(locationAddress, "Location address", 500);

            var existing = await _patientRepository.GetByPhoneAsync(normalizedPhone);
            if (existing is not null)
            {
                return Map(existing);
            }

            var (latitude, longitude) = await _mapsService.GeocodeAsync(normalizedAddress);

            var location = new Location
            {
                Address = normalizedAddress,
                Latitude = latitude,
                Longitude = longitude
            };
            await _locationRepository.AddAsync(location);

            var patient = new Patient
            {
                Name = normalizedName,
                Phone = normalizedPhone,
                VisitCount = 0,
                LocationId = location.Id,
                Location = location
            };
            await _patientRepository.AddAsync(patient);

            return Map(patient);
        }

        public async Task<PatientDto?> GetByIdAsync(Guid id)
        {
            var patient = await _patientRepository.GetByIdAsync(id);
            return patient is null ? null : Map(patient);
        }

        public async Task<PatientDto?> GetByPhoneAsync(string phone)
        {
            var patient = await _patientRepository.GetByPhoneAsync(phone);
            return patient is null ? null : Map(patient);
        }

        public async Task<IEnumerable<PatientDto>> GetAllAsync()
        {
            var patients = await _patientRepository.GetAllAsync();
            return patients.Select(Map);
        }

        public async Task<PatientDto> UpdateAsync(Guid id, UpdatePatientDto dto)
        {
            var patient = await _patientRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Patient with id {id} was not found.");

            var name = NameValidator.NormalizeRequired(dto.Name, "Patient name", 150);
            var phone = Guard.NormalizePhone(dto.Phone, "Phone");
            var address = NameValidator.NormalizeRequired(dto.LocationAddress, "Location address", 500);

            var byPhone = await _patientRepository.GetByPhoneAsync(phone);
            if (byPhone is not null && byPhone.Id != id)
                throw new ValidationException($"Phone number {phone} is already in use by another patient.");

            patient.Name = name;
            patient.Phone = phone;

            if (!string.Equals(patient.Location?.Address, address, StringComparison.OrdinalIgnoreCase))
            {
                var (latitude, longitude) = await _mapsService.GeocodeAsync(address);

                if (patient.Location is null)
                {
                    var location = new Location
                    {
                        Address = address,
                        Latitude = latitude,
                        Longitude = longitude
                    };
                    await _locationRepository.AddAsync(location);
                    patient.LocationId = location.Id;
                    patient.Location = location;
                }
                else
                {
                    patient.Location.Address = address;
                    patient.Location.Latitude = latitude;
                    patient.Location.Longitude = longitude;
                    await _locationRepository.UpdateAsync(patient.Location);
                }
            }

            patient.UpdatedAt = DateTime.UtcNow;
            await _patientRepository.UpdateAsync(patient);

            return Map(patient);
        }

        private static PatientDto Map(Patient patient) => new()
        {
            Id = patient.Id,
            Name = patient.Name,
            Phone = patient.Phone,
            VisitCount = patient.VisitCount,
            LocationAddress = patient.Location?.Address ?? string.Empty
        };
    }
}
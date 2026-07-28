using JQZHomeCareProject.Application.Common.Interfaces;
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
            var existing = await _patientRepository.GetByPhoneAsync(phone);
            if (existing is not null)
            {
                return MapToDto(existing);
            }

            var (latitude, longitude) = await _mapsService.GeocodeAsync(locationAddress);

            var location = new Location
            {
                Address = locationAddress,
                Latitude = latitude,
                Longitude = longitude
            };
            await _locationRepository.AddAsync(location);

            var patient = new Patient
            {
                Name = name,
                Phone = phone,
                VisitCount = 0,
                LocationId = location.Id,
                Location = location
            };
            await _patientRepository.AddAsync(patient);

            return MapToDto(patient, locationAddress);
        }

        public async Task<PatientDto?> GetByPhoneAsync(string phone)
        {
            var patient = await _patientRepository.GetByPhoneAsync(phone);
            return patient is null ? null : MapToDto(patient);
        }

        public async Task<IEnumerable<PatientDto>> GetAllAsync()
        {
            var patients = await _patientRepository.GetAllAsync();
            return patients.Select(p => MapToDto(p));
        }

        public async Task<PatientDto?> GetByIdAsync(Guid id)
        {
            var patient = await _patientRepository.GetByIdAsync(id);
            return patient is null ? null : MapToDto(patient);
        }

        private static PatientDto MapToDto(Patient patient, string? fallbackAddress = null)
        {
            return new PatientDto
            {
                Id = patient.Id,
                Name = patient.Name,
                Phone = patient.Phone,
                VisitCount = patient.VisitCount,
                LocationAddress = patient.Location?.Address ?? fallbackAddress ?? string.Empty
            };
        }
    }
}
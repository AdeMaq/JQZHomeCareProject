using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/patients")]
    [Authorize]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientService _patientService;

        public PatientsController(IPatientService patientService)
        {
            _patientService = patientService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var patients = await _patientService.GetAllAsync();
            return Ok(patients);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var patient = await _patientService.GetByIdAsync(id);
            return patient is null ? NotFound() : Ok(patient);
        }

        [HttpGet("phone/{phone}")]
        public async Task<IActionResult> GetByPhoneAsync(string phone)
        {
            var patient = await _patientService.GetByPhoneAsync(phone);
            return patient is null ? NotFound() : Ok(patient);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> UpdateAsync(Guid id, [FromBody] UpdatePatientDto dto)
        {
            var updated = await _patientService.UpdateAsync(id, dto);
            return Ok(updated);
        }
    }
}
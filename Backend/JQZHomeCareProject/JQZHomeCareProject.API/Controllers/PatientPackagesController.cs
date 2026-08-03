using System.Security.Claims;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/patient-packages")]
    [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
    public class PatientPackagesController : ControllerBase
    {
        private readonly IPatientPackageService _patientPackageService;
        private readonly IVisitService _visitService; 

        public PatientPackagesController(IPatientPackageService patientPackageService, IVisitService visitService)
        {
            _patientPackageService = patientPackageService;
            _visitService = visitService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync() =>
            Ok(await _patientPackageService.GetAllAsync());

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetByIdAsync(Guid id) =>
            Ok(await _patientPackageService.GetByIdAsync(id));

        [HttpGet("patient/{patientId:guid}")]
        public async Task<IActionResult> GetByPatientAsync(Guid patientId) =>
            Ok(await _patientPackageService.GetByPatientAsync(patientId));

        [HttpGet("{id:guid}/visits")]
        public async Task<IActionResult> GetVisitsAsync(Guid id) =>
            Ok(await _patientPackageService.GetVisitsAsync(id));

        [HttpPost("{id:guid}/installments")]
        public async Task<IActionResult> RecordInstallmentAsync(Guid id, [FromBody] RecordInstallmentDto dto)
        {
            await _visitService.RecordInstallmentAsync(id, dto);
            return NoContent();
        }
    }
}
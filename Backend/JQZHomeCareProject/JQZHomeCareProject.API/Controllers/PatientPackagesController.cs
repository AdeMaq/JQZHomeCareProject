using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/patient-packages")]
    [Authorize]
    public class PatientPackagesController : ControllerBase
    {
        private readonly IPatientPackageService _patientPackageService;

        public PatientPackagesController(IPatientPackageService patientPackageService)
        {
            _patientPackageService = patientPackageService;
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> PurchaseAsync([FromBody] PurchasePackageDto dto)
        {
            var createdByUserId = GetCurrentUserId();
            var patientPackage = await _patientPackageService.PurchaseAsync(dto, createdByUserId);
            return CreatedAtAction(nameof(GetByIdAsync), new { id = patientPackage.Id }, patientPackage);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var patientPackage = await _patientPackageService.GetByIdAsync(id);
            return Ok(patientPackage);
        }

        [HttpGet("patient/{patientId:guid}")]
        public async Task<IActionResult> GetByPatientAsync(Guid patientId)
        {
            var patientPackages = await _patientPackageService.GetByPatientAsync(patientId);
            return Ok(patientPackages);
        }

        [HttpGet("{id:guid}/visits")]
        public async Task<IActionResult> GetVisitsAsync(Guid id)
        {
            var visits = await _patientPackageService.GetVisitsAsync(id);
            return Ok(visits);
        }

        [HttpPost("{id:guid}/installments")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> RecordInstallmentAsync(Guid id, [FromBody] RecordInstallmentDto dto)
        {
            await _patientPackageService.RecordInstallmentAsync(id, dto);
            return NoContent();
        }

        private Guid GetCurrentUserId()
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(idClaim, out var userId) ? userId : Guid.Empty;
        }
    }
}
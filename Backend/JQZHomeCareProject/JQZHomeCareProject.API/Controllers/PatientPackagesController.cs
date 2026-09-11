using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientPackageDto>>> GetAllAsync()
            => Ok(await _patientPackageService.GetAllAsync());

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<PatientPackageDto>> GetByIdAsync(Guid id)
            => Ok(await _patientPackageService.GetByIdAsync(id));

        [HttpGet("patient/{patientId:guid}")]
        public async Task<ActionResult<IEnumerable<PatientPackageDto>>> GetByPatientAsync(Guid patientId)
            => Ok(await _patientPackageService.GetByPatientAsync(patientId));

        [HttpGet("{id:guid}/visits")]
        public async Task<ActionResult<IEnumerable<VisitDto>>> GetVisitsAsync(Guid id)
            => Ok(await _patientPackageService.GetVisitsAsync(id));

        [HttpGet("{id:guid}/payments")]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetPaymentsAsync(Guid id)
            => Ok(await _patientPackageService.GetPaymentsAsync(id));

        [HttpPost("{id:guid}/payments")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> RecordOfficePaymentAsync(Guid id, [FromBody] RecordOfficePaymentDto dto)
        {
            await _patientPackageService.RecordOfficePaymentAsync(id, dto);
            return NoContent();
        }

        [HttpPut("{id:guid}/amount")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin")]
        public async Task<IActionResult> UpdateAmountAsync(Guid id, [FromBody] UpdatePatientPackageAmountDto dto)
        {
            await _patientPackageService.UpdatePatientPackageAmountAsync(id, dto);
            return NoContent();
        }
    }
}
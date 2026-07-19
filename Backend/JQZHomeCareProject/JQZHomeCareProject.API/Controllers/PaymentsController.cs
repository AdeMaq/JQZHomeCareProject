using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpGet("weekly-summary/{practitionerId}")]
        public async Task<ActionResult<WeeklySettlementDto>> GetWeeklySummary(Guid practitionerId, [FromQuery] DateTime weekStart)
        {
            try
            {
                var result = await _paymentService.GetWeeklySummaryAsync(practitionerId, weekStart);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
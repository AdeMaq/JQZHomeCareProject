using System.Security.Claims;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/payments")]
    [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpGet("weekly-summary/{practitionerId:guid}")]
        public async Task<ActionResult<WeeklySettlementSummaryDto>> GetWeeklySummary(Guid practitionerId, [FromQuery] DateTime weekStart)
            => Ok(await _paymentService.GetWeeklySummaryAsync(practitionerId, weekStart));

        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<WeeklySettlementSummaryDto>>> GetPendingSettlements()
            => Ok(await _paymentService.GetPendingSettlementsAsync());

        [HttpPost("{practitionerId:guid}/settle")]
        public async Task<IActionResult> SettleWeek(Guid practitionerId, [FromQuery] DateTime weekStart)
        {
            var adminUserId = ResolveCurrentUserId();
            await _paymentService.MarkWeekSettledAsync(practitionerId, weekStart, adminUserId);
            return NoContent();
        }

        [HttpPut("{paymentId:guid}/share")]
        public async Task<IActionResult> UpdateShare(Guid paymentId, [FromBody] UpdatePaymentShareDto dto)
        {
            await _paymentService.UpdatePaymentShareAsync(paymentId, dto);
            return NoContent();
        }

        private Guid ResolveCurrentUserId()
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            return Guid.TryParse(idClaim, out var id) ? id : throw new UnauthorizedAccessException("Invalid or missing user id claim.");
        }
    }
}
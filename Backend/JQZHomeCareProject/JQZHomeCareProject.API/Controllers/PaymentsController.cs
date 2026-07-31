using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JQZHomeCareProject.API.Controllers
{
    public class GenerateSettlementRequest
    {
        public Guid PractitionerId { get; set; }
        public DateTime WeekStart { get; set; }
    }

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
        public async Task<IActionResult> GetWeeklySummary(Guid practitionerId, [FromQuery] DateTime weekStart)
        {
            var result = await _paymentService.GetWeeklySummaryAsync(practitionerId, weekStart);
            return Ok(result);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingSettlements()
        {
            var result = await _paymentService.GetPendingSettlementsAsync();
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _paymentService.GetByIdAsync(id);
            return Ok(result);
        }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] GenerateSettlementRequest request)
        {
            var result = await _paymentService.GenerateWeeklySettlementAsync(request.PractitionerId, request.WeekStart);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id:guid}/received")]
        public async Task<IActionResult> MarkReceived(Guid id)
        {
            var adminUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _paymentService.MarkSettlementReceivedAsync(id, adminUserId);
            return NoContent();
        }
    }
}
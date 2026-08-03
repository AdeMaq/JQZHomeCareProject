using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/visits")]
    [Authorize]
    public class VisitsController : ControllerBase
    {
        private readonly IVisitService _visitService;
        public VisitsController(IVisitService visitService) => _visitService = visitService;

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> CreateVisitAsync([FromBody] CreateVisitDto dto)
        {
            var createdByUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _visitService.CreateVisitAsync(dto, createdByUserId);
            return CreatedAtAction(nameof(GetByIdAsync), new { id = result.Visits.FirstOrDefault()?.Id }, result);
        }

        [HttpPut("{id:guid}/schedule")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> ScheduleAsync(Guid id, [FromBody] ScheduleVisitDto dto)
        {
            await _visitService.ScheduleVisitAsync(id, dto);
            return NoContent();
        }

        [HttpGet("today")]
        public async Task<IActionResult> GetTodayAsync([FromQuery] Guid? practitionerId) =>
            Ok(await _visitService.GetTodayVisitsAsync(practitionerId));

        [HttpGet("by-date")]
        public async Task<IActionResult> GetByDateFilterAsync([FromQuery] DateTime? date) =>
            Ok(date.HasValue ? await _visitService.GetByDateAsync(date.Value) : await _visitService.GetAllAsync());

        [HttpGet]
        public async Task<IActionResult> GetAllAsync() => Ok(await _visitService.GetAllAsync());

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetByIdAsync(Guid id) => Ok(await _visitService.GetByIdAsync(id));

        [HttpPut("{id:guid}/accept")]
        [Authorize(Roles = "Practitioner")]
        public async Task<IActionResult> AcceptAsync(Guid id, [FromQuery] Guid practitionerId)
        {
            await _visitService.AcceptVisitAsync(id, practitionerId);
            return NoContent();
        }

        [HttpPut("{id:guid}/checkin")]
        [Authorize(Roles = "Practitioner")]
        public async Task<IActionResult> CheckInAsync(Guid id, [FromBody] CheckInDto dto)
        {
            await _visitService.CheckInAsync(id, dto);
            return NoContent();
        }

        [HttpPut("{id:guid}/checkout")]
        [Authorize(Roles = "Practitioner")]
        public async Task<IActionResult> CheckOutAsync(Guid id, [FromBody] CheckOutDto dto)
        {
            await _visitService.CheckOutAsync(id, dto);
            return NoContent();
        }

        [HttpPut("{id:guid}/cancel")]
        public async Task<IActionResult> CancelAsync(Guid id, [FromBody] CancelVisitDto dto)
        {
            await _visitService.CancelVisitAsync(id, dto);
            return NoContent();
        }

        [HttpPut("{id:guid}/reassign")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> ReassignAsync(Guid id, [FromBody] ReassignPractitionerDto dto)
        {
            await _visitService.ReassignPractitionerAsync(id, dto);
            return NoContent();
        }

        [HttpPut("{id:guid}/assign")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> AssignAsync(Guid id, [FromBody] AssignVisitDto dto)
        {
            await _visitService.AssignAsync(id, dto);
            return NoContent();
        }
    }
}
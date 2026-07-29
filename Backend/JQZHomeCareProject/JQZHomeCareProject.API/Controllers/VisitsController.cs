using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/visits")]
    [Authorize]
    public class VisitsController : ControllerBase
    {
        private readonly IVisitService _visitService;

        public VisitsController(IVisitService visitService)
        {
            _visitService = visitService;
        }

        [HttpPut("{id:guid}/schedule")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> ScheduleAsync(Guid id, [FromBody] ScheduleVisitDto dto)
        {
            await _visitService.ScheduleVisitAsync(id, dto);
            return NoContent();
        }

        [HttpGet("today")]
        public async Task<IActionResult> GetTodayAsync([FromQuery] Guid? practitionerId)
        {
            var visits = await _visitService.GetTodayVisitsAsync(practitionerId);
            return Ok(visits);
        }

        [HttpGet("by-date")]
        public async Task<IActionResult> GetAllAsync([FromQuery] DateTime? date)
        {
            var visits = date.HasValue
                ? await _visitService.GetByDateAsync(date.Value)
                : await _visitService.GetAllAsync();
            return Ok(visits);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var visits = await _visitService.GetAllAsync();
            return Ok(visits);
        }



        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var visit = await _visitService.GetByIdAsync(id);
            return Ok(visit);
        }

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
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin,Practitioner")]
        public async Task<IActionResult> CancelAsync(Guid id, [FromBody] CancelVisitDto dto)
        {
            await _visitService.CancelVisitAsync(id, dto);
            return NoContent();
        }

        [HttpPut("{id:guid}/reassign")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin,Practitioner")]
        public async Task<IActionResult> ReassignAsync(Guid id, [FromBody] ReassignPractitionerDto dto)
        {
            await _visitService.ReassignPractitionerAsync(id, dto);
            return NoContent();
        }
    }
}
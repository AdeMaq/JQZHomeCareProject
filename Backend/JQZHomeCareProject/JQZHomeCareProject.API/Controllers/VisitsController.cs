using Microsoft.AspNetCore.Mvc;
using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VisitsController : ControllerBase
    {
        private readonly IVisitService _visitService;

        public VisitsController(IVisitService visitService)
        {
            _visitService = visitService;
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<ActionResult<VisitDto>> Create(CreateVisitDto dto)
        {
            var createdByUserId = GetCurrentUserId();

            try
            {
                var result = await _visitService.CreateVisitAsync(dto, createdByUserId);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("today")]
        public async Task<ActionResult<IEnumerable<VisitDto>>> GetToday([FromQuery] Guid? practitionerId)
        {
            var result = await _visitService.GetTodayVisitsAsync(practitionerId);
            return Ok(result);
        }

        [HttpGet("by-date/{date}")]
        public async Task<ActionResult<IEnumerable<VisitDto>>> GetByDate(DateTime date)
        {
            var result = await _visitService.GetByDateAsync(date);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VisitDto>> GetById(Guid id)
        {
            try
            {
                var result = await _visitService.GetByIdAsync(id);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/accept")]
        [Authorize(Roles = "Practitioner")]
        public async Task<IActionResult> Accept(Guid id)
        {
            var practitionerId = GetCurrentPractitionerId();

            try
            {
                await _visitService.AcceptVisitAsync(id, practitionerId);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/checkin")]
        [Authorize(Roles = "Practitioner")]
        public async Task<IActionResult> CheckIn(Guid id, CheckInDto dto)
        {
            try
            {
                await _visitService.CheckInAsync(id, dto);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/checkout")]
        [Authorize(Roles = "Practitioner")]
        public async Task<IActionResult> CheckOut(Guid id, CheckOutDto dto)
        {
            try
            {
                await _visitService.CheckOutAsync(id, dto);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/cancel")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin,Practitioner")]
        public async Task<IActionResult> Cancel(Guid id, CancelVisitDto dto)
        {
            try
            {
                await _visitService.CancelVisitAsync(id, dto);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private Guid GetCurrentUserId()
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var userId))
            {
                throw new ValidationException("Unable to resolve the current user from the token.");
            }

            return userId;
        }

        private Guid GetCurrentPractitionerId()
        {
            var practitionerIdClaim = User.FindFirstValue("practitionerId");

            if (string.IsNullOrEmpty(practitionerIdClaim) || !Guid.TryParse(practitionerIdClaim, out var practitionerId))
            {
                throw new ValidationException("This action requires a practitioner-linked account.");
            }

            return practitionerId;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VisitDto>>> GetAll()
        {
            var result = await _visitService.GetAllAsync();
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> Update(Guid id, UpdateVisitDto dto)
        {
            try
            {
                await _visitService.UpdateVisitAsync(id, dto);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _visitService.DeleteVisitAsync(id);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}

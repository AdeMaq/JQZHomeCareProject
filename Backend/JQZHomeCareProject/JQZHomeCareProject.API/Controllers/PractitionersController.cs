using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PractitionersController : ControllerBase
    {
        private readonly IPractitionerService _practitionerService;

        public PractitionersController(IPractitionerService practitionerService)
        {
            _practitionerService = practitionerService;
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<ActionResult<PractitionerDto>> Create(CreatePractitionerDto dto)
        {
            var createdByUserId = GetCurrentUserId();

            try
            {
                var result = await _practitionerService.CreatePractitionerAsync(dto, createdByUserId);
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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PractitionerDto>>> GetAll()
        {
            var result = await _practitionerService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PractitionerDto>> GetById(Guid id)
        {
            try
            {
                var result = await _practitionerService.GetByIdAsync(id);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> Update(Guid id, UpdatePractitionerDto dto)
        {
            try
            {
                await _practitionerService.UpdateAsync(id, dto);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/priority")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> SetPriority(Guid id, [FromBody] int priority)
        {
            try
            {
                await _practitionerService.SetPriorityAsync(id, priority);
                return NoContent();
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

        [HttpGet("{id}/areas")]
        public async Task<ActionResult<IEnumerable<AreaDto>>> GetAreas(Guid id)
        {
            try
            {
                var result = await _practitionerService.GetAreasAsync(id);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/areas/{areaId}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> AssignArea(Guid id, Guid areaId)
        {
            try
            {
                await _practitionerService.AssignAreaAsync(id, areaId);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}/areas/{areaId}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> RemoveArea(Guid id, Guid areaId)
        {
            try
            {
                await _practitionerService.RemoveAreaAsync(id, areaId);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
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
    }
}

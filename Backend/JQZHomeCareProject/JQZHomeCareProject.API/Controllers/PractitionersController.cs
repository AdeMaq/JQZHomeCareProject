using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Authentication;
using System.Security.Claims;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/practitioners")]
    [Authorize]
    public class PractitionersController : ControllerBase
    {
        private readonly IPractitionerService _service;
        public PractitionersController(IPractitionerService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<ActionResult<PractitionerDto>> CreateAsync(CreatePractitionerDto dto)
        {
            var createdByUserId = GetCurrentUserId();
            var result = await _service.CreatePractitionerAsync(dto, createdByUserId);
            return CreatedAtAction(nameof(GetByIdAsync), new { id = result.Id }, result);
        }

        [HttpGet]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<ActionResult<IEnumerable<PractitionerDto>>> GetAllAsync()
        {
           return  Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PractitionerDto>> GetByIdAsync(Guid id)
        {
            return Ok(await _service.GetByIdAsync(id));
        }

        [HttpGet("available")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<ActionResult<IEnumerable<PractitionerDto>>> FindAvailableAsync(
            [FromQuery] Guid serviceId, [FromQuery] Guid areaId) =>
            Ok(await _service.FindAvailableAsync(serviceId, areaId));

        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> UpdateAsync(Guid id, UpdatePractitionerDto dto)
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpPut("{id}/priority")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> SetPriorityAsync(Guid id, [FromBody] int priority)
        {
            await _service.SetPriorityAsync(id, priority);
            return NoContent();
        }

        [HttpPut("{id}/share")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> SetSharePercentageAsync(Guid id, [FromBody] decimal sharePercentage)
        {
            await _service.SetSharePercentageAsync(id, sharePercentage);
            return NoContent();
        }

        [HttpGet("{id}/areas")]
        public async Task<ActionResult<IEnumerable<AreaDto>>> GetAreasAsync(Guid id)
        {
            return Ok(await _service.GetAreasAsync(id));
        }

        [HttpPost("{id}/areas")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> AssignAreaAsync(Guid id, [FromBody] Guid areaId)
        {
            await _service.AssignAreaAsync(id, areaId);
            return NoContent();
        }

        [HttpDelete("{id}/areas/{areaId}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> RemoveAreaAsync(Guid id, Guid areaId)
        {
            await _service.RemoveAreaAsync(id, areaId);
            return NoContent();
        }

        private Guid GetCurrentUserId()
        {
            var idClaim = User.FindFirst("sub") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            return idClaim is not null ? Guid.Parse(idClaim.Value) : Guid.Empty;
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<PractitionerDto>>> SearchByNameAsync([FromQuery] string name)
        {
            return Ok(await _service.SearchByNameAsync(name));
        }

        [HttpPut("{id:guid}/reset-password")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin")]
        public async Task<IActionResult> ResetPasswordAsync(Guid id, [FromBody] ResetPractitionerPasswordDto dto)
        {
            await _service.ResetPasswordAsync(id, dto);
            return NoContent();
        }
    }
}
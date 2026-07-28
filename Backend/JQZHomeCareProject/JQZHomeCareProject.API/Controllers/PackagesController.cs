using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/packages")]
    [Authorize]
    public class PackagesController : ControllerBase
    {
        private readonly IPackageService _packageService;

        public PackagesController(IPackageService packageService)
        {
            _packageService = packageService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync([FromQuery] Guid? serviceId)
        {
            var packages = serviceId.HasValue
                ? await _packageService.GetByServiceAsync(serviceId.Value)
                : await _packageService.GetAllAsync();

            return Ok(packages);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var package = await _packageService.GetByIdAsync(id);
            return Ok(package);
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> CreateAsync([FromBody] CreatePackageDto dto)
        {
            var package = await _packageService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetByIdAsync), new { id = package.Id }, package);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> UpdateAsync(Guid id, [FromBody] UpdatePackageDto dto)
        {
            await _packageService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> DeleteAsync(Guid id)
        {
            await _packageService.DeleteAsync(id);
            return NoContent();
        }
    }
}
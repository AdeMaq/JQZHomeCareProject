using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PackagesController : ControllerBase
    {
        private readonly IPackageService _packageService;

        public PackagesController(IPackageService packageService)
        {
            _packageService = packageService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PackageDto>>> GetAll()
        {
            var result = await _packageService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PackageDto>> GetById(Guid id)
        {
            try
            {
                var result = await _packageService.GetByIdAsync(id);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<ActionResult<PackageDto>> Create(CreatePackageDto dto)
        {
            try
            {
                var result = await _packageService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> Update(Guid id, UpdatePackageDto dto)
        {
            try
            {
                await _packageService.UpdateAsync(id, dto);
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
                await _packageService.DeleteAsync(id);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
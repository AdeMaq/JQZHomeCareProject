using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/areas")]
    [Authorize]
    public class AreasController : ControllerBase
    {
        private readonly IAreaService _areaService;

        public AreasController(IAreaService areaService)
        {
            _areaService = areaService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var areas = await _areaService.GetAllAsync();
            return Ok(areas);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var area = await _areaService.GetByIdAsync(id);
            return Ok(area);
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> CreateAsync([FromBody] CreateAreaDto dto)
        {
            var area = await _areaService.CreateAsync(dto);
            return CreatedAtAction("GetById", new { id = area.Id }, area);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> UpdateAsync(Guid id, [FromBody] UpdateAreaDto dto)
        {
            await _areaService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> DeleteAsync(Guid id)
        {
            await _areaService.DeleteAsync(id);
            return NoContent();
        }
    }
}
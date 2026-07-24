using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/cities")]
    [Authorize]
    public class CitiesController : ControllerBase
    {
        private readonly ICityService _cityService;

        public CitiesController(ICityService cityService)
        {
            _cityService = cityService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var cities = await _cityService.GetAllAsync();
            return Ok(cities);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var city = await _cityService.GetByIdAsync(id);
            return Ok(city);
        }

        [HttpGet("{id:guid}/areas")]
        public async Task<IActionResult> GetAreasByCityAsync(Guid id)
        {
            var areas = await _cityService.GetAreasByCityAsync(id);
            return Ok(areas);
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> CreateAsync([FromBody] CreateCityDto dto)
        {
            var city = await _cityService.CreateAsync(dto);
            return CreatedAtAction("GetById", new { id = city.Id }, city);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> UpdateAsync(Guid id, [FromBody] UpdateCityDto dto)
        {
            await _cityService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> DeleteAsync(Guid id)
        {
            await _cityService.DeleteAsync(id);
            return NoContent();
        }
    }
}
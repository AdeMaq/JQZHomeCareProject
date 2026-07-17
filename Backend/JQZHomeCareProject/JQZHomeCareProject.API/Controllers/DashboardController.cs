using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("refusals")]
        public async Task<ActionResult<IEnumerable<RefusalDto>>> GetRefusals([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            try
            {
                var result = await _dashboardService.GetRefusalsAsync(from, to);
                return Ok(result);
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
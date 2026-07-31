using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummaryAsync([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            var result = await _dashboardService.GetSummaryAsync(from, to);
            return Ok(result);
        }

        [HttpGet("refusals")]
        public async Task<IActionResult> GetRefusalsAsync([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            var result = await _dashboardService.GetRefusalsAsync(from, to);
            return Ok(result);
        }
    }
}
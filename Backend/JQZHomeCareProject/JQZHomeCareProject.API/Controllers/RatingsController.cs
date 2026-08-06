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
    public class RatingsController : ControllerBase
    {
        private readonly IRatingService _ratingService;

        public RatingsController(IRatingService ratingService)
        {
            _ratingService = ratingService;
        }

        [HttpPost("{practitionerId}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> AddRating(Guid practitionerId, RatingDto dto)
        {
            try
            {
                await _ratingService.AddRatingAsync(practitionerId, dto);
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

        [HttpGet("practitioner/{practitionerId}")]
        public async Task<ActionResult<IEnumerable<RatingDto>>> GetByPractitioner(Guid practitionerId)
        {
            var result = await _ratingService.GetByPractitionerAsync(practitionerId);
            return Ok(result);
        }

        [HttpGet("monthly")]
        public async Task<ActionResult<IEnumerable<RatingDto>>> GetMonthly([FromQuery] int year, [FromQuery] int month)
        {
            var result = await _ratingService.GetMonthlyAsync(year, month);
            return Ok(result);
        }

        [HttpPut("{ratingId:guid}")]
        [Authorize(Roles = "SuperAdmin,MiddlePowerAdmin,SimpleAdmin")]
        public async Task<IActionResult> UpdateAsync(Guid ratingId, [FromBody] UpdateRatingDto dto)
        {
            var rating = await _ratingService.UpdateAsync(ratingId, dto);
            return Ok(rating);
        }
    }
}
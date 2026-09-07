// API/Controllers/LocationsController.cs
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JQZHomeCareProject.API.Controllers
{
    [ApiController]
    [Route("api/locations")]
    [Authorize]
    public class LocationsController : ControllerBase
    {
        private readonly ILocationLinkParser _linkParser;
        public LocationsController(ILocationLinkParser linkParser) => _linkParser = linkParser;

        [HttpPost("parse-link")]
        public async Task<IActionResult> ParseLinkAsync([FromBody] ParseLocationLinkDto dto)
        {
            var (lat, lng, formatted) = await _linkParser.ParseAsync(dto.Link);
            return Ok(new LocationCoordinatesDto
            {
                Latitude = lat,
                Longitude = lng,
                FormattedAddress = formatted,
                Source = formatted is null ? "link" : "geocoded"
            });
        }
    }
}
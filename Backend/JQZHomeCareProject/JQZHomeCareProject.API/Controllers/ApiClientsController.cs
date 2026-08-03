using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JQZHomeCareProject.API.Controllers;

[ApiController]
[Route("api/api-clients")]
[Authorize(Roles = "SuperAdmin")]
public class ApiClientsController : ControllerBase
{
    private readonly IApiClientService _service;
    public ApiClientsController(IApiClientService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAllAsync() => Ok(await _service.GetAllAsync());

    [HttpPost]
    public async Task<IActionResult> CreateAsync(CreateApiClientDto dto)
    {
        var result = await _service.CreateAsync(dto);
        // Shown once. Tell the partner to store it now — you can't retrieve it again.
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> RevokeAsync(Guid id)
    {
        await _service.RevokeAsync(id);
        return NoContent();
    }
}
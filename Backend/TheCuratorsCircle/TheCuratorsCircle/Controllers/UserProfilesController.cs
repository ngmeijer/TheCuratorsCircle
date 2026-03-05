using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Models.Profiles;
using System.Threading.Tasks;

namespace TheCuratorsCircle.Controllers;

[ApiController]
[Route("userprofiles")]
public class UserProfilesController : ControllerBase
{
    private readonly IUserProfileService _profileService;

    public UserProfilesController(IUserProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet("by-alias/{alias}")]
    public async Task<IActionResult> GetByAlias(string alias)
    {
        var profile = await _profileService.GetByAliasAsync(alias);
        if (profile == null) return NotFound();
        return Ok(profile);
    }

    [HttpGet("{persistentId}")]
    public async Task<IActionResult> GetByPersistentId(string persistentId)
    {
        var profile = await _profileService.GetByPersistentIdAsync(persistentId);
        if (profile == null) return NotFound();
        return Ok(profile);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserProfileRequest request)
    {
        // TODO: Get ownerUid from auth context when properly configured
        var ownerUid = "test-user-id";

        var (profile, error) = await _profileService.CreateAsync(ownerUid, request);
        if (error != null)
            return BadRequest(new { error });

        return CreatedAtAction(nameof(GetByPersistentId), new { persistentId = profile.PersistentId }, profile);
    }

    [HttpPut("{persistentId}")]
    public async Task<IActionResult> Update(string persistentId, [FromBody] UpdateUserProfileRequest request)
    {
        var (profile, error) = await _profileService.UpdateAsync(persistentId, request);
        if (error != null)
            return BadRequest(new { error });

        return Ok(profile);
    }
}

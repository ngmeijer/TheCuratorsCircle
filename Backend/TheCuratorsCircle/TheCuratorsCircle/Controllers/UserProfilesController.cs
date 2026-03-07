using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Models.Profiles;
using System.Threading.Tasks;
using System.Security.Claims;

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
    [AllowAnonymous]
    public async Task<IActionResult> GetByAlias(string alias)
    {
        var profile = await _profileService.GetByAliasAsync(alias);
        if (profile == null) return NotFound();
        return Ok(profile);
    }

    [HttpGet("{persistentId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByPersistentId(string persistentId)
    {
        var profile = await _profileService.GetByPersistentIdAsync(persistentId);
        if (profile == null) return NotFound();
        return Ok(profile);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var ownerUid = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(ownerUid))
            return Unauthorized();

        var profile = await _profileService.GetByOwnerUidAsync(ownerUid);
        if (profile == null) return NotFound();
        return Ok(profile);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateUserProfileRequest request)
    {
        var ownerUid = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(ownerUid))
            return Unauthorized();

        var (profile, error) = await _profileService.CreateAsync(ownerUid, request);
        if (error != null)
            return BadRequest(new { error });

        return CreatedAtAction(nameof(GetByPersistentId), new { persistentId = profile.PersistentId }, profile);
    }

    [HttpPut("{persistentId}")]
    [Authorize]
    public async Task<IActionResult> Update(string persistentId, [FromBody] UpdateUserProfileRequest request)
    {
        var ownerUid = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(ownerUid))
            return Unauthorized();

        var (profile, error) = await _profileService.UpdateAsync(persistentId, ownerUid, request);
        if (error != null)
        {
            if (error == "Profile not found")
                return NotFound(new { error });
            if (error == "You can only update your own profile")
                return Forbidden(new { error });
            return BadRequest(new { error });
        }

        return Ok(profile);
    }

    private IActionResult Forbidden(object error)
    {
        return StatusCode(403, error);
    }
}

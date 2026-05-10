using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Logging;
using Backend.Services;
using Backend.Models.Profiles;
using System.Threading.Tasks;
using System.Security.Claims;
using TheCuratorsCircle.Models;

namespace TheCuratorsCircle.Controllers;

[ApiController]
[Route("userprofiles")]
public class UserProfilesController : ControllerBase
{
    private readonly IUserProfileService _profileService;
    private readonly ILogger<UserProfilesController> _logger;

    public UserProfilesController(IUserProfileService profileService, ILogger<UserProfilesController> logger)
    {
        _profileService = profileService;
        _logger = logger;
    }

    private IActionResult ApiError(int statusCode, string error, string? code = null)
        => StatusCode(statusCode, new ApiErrorResponse { Error = error, Code = code });

    [HttpGet("by-alias/{alias}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByAlias(string alias)
    {
        var profile = await _profileService.GetByAliasAsync(alias);
        if (profile == null) return NotFound(new ApiErrorResponse { Error = "Profile not found" });
        return Ok(profile);
    }

    [HttpGet("{persistentId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByPersistentId(string persistentId)
    {
        var profile = await _profileService.GetByPersistentIdAsync(persistentId);
        if (profile == null) return NotFound(new ApiErrorResponse { Error = "Profile not found" });
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
        if (profile == null) return NotFound(new ApiErrorResponse { Error = "Profile not found" });
        return Ok(profile);
    }

    [HttpPost]
    [Authorize]
    [EnableRateLimiting("write")]
    public async Task<IActionResult> Create([FromBody] CreateUserProfileRequest request)
    {
        var ownerUid = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(ownerUid))
            return Unauthorized();

        var (profile, error) = await _profileService.CreateAsync(ownerUid, request);
        if (error != null)
            return BadRequest(new ApiErrorResponse { Error = error });

        return CreatedAtAction(nameof(GetByPersistentId), new { persistentId = profile.PersistentId }, profile);
    }

    [HttpPut("{persistentId}")]
    [Authorize]
    [EnableRateLimiting("write")]
    public async Task<IActionResult> Update(string persistentId, [FromBody] UpdateUserProfileRequest request)
    {
        var ownerUid = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(ownerUid))
            return Unauthorized();

        var (profile, error) = await _profileService.UpdateAsync(persistentId, ownerUid, request);
        if (error != null)
        {
            if (error == "Profile not found")
                return NotFound(new ApiErrorResponse { Error = error });
            if (error == "You can only update your own profile")
                return ApiError(403, error);
            return BadRequest(new ApiErrorResponse { Error = error });
        }

        return Ok(profile);
    }

    [HttpDelete("{persistentId}")]
    [Authorize]
    [EnableRateLimiting("write")]
    public async Task<IActionResult> Delete(string persistentId)
    {
        var ownerUid = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(ownerUid))
            return Unauthorized();

        var (success, error) = await _profileService.DeleteAsync(persistentId, ownerUid);
        if (!success)
        {
            if (error == "Profile not found")
                return NotFound(new ApiErrorResponse { Error = error });
            if (error == "You can only delete your own profile")
                return ApiError(403, error);
            return BadRequest(new ApiErrorResponse { Error = error });
        }

        return NoContent();
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        _logger.LogInformation("Search called with query: '{Query}'", q);

        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
        {
            _logger.LogInformation("Search query too short, returning empty");
            return Ok(new List<UserProfile>());
        }

        try
        {
            var results = await _profileService.SearchByUsernameAsync(q);
            _logger.LogInformation("Search for '{Query}' returned {Count} results", q, results.Count);
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Search failed for query '{Query}'", q);
            return ApiError(500, "Search failed.");
        }
    }
}

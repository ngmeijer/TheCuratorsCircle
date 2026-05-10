using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Backend.Services;
using TheCuratorsCircle.Models;

namespace TheCuratorsCircle.Controllers;

[ApiController]
[Route("follows")]
[Authorize]
public class FollowsController : ControllerBase
{
    private readonly IFollowService _followService;
    private readonly IUserProfileService _profileService;

    public FollowsController(IFollowService followService, IUserProfileService profileService)
    {
        _followService = followService;
        _profileService = profileService;
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private IActionResult ApiError(int statusCode, string error, string? code = null)
        => StatusCode(statusCode, new ApiErrorResponse { Error = error, Code = code });

    [HttpPost]
    [EnableRateLimiting("write")]
    public async Task<IActionResult> Follow([FromBody] FollowRequest request)
    {
        var currentUserId = GetCurrentUserId();
        var currentProfile = await _profileService.GetByOwnerUidAsync(currentUserId);

        if (currentProfile == null)
            return Unauthorized(new ApiErrorResponse { Error = "Profile not found" });

        var (success, error) = await _followService.FollowAsync(currentProfile.PersistentId, request.TargetUserId);

        if (!success)
            return BadRequest(new ApiErrorResponse { Error = error });

        return Ok(new { message = "Following" });
    }

    [HttpDelete("{targetUserId}")]
    [EnableRateLimiting("write")]
    public async Task<IActionResult> Unfollow(string targetUserId)
    {
        var currentUserId = GetCurrentUserId();
        var currentProfile = await _profileService.GetByOwnerUidAsync(currentUserId);

        if (currentProfile == null)
            return Unauthorized(new ApiErrorResponse { Error = "Profile not found" });

        var (success, error) = await _followService.UnfollowAsync(currentProfile.PersistentId, targetUserId);

        if (!success)
            return BadRequest(new ApiErrorResponse { Error = error });

        return Ok(new { message = "Unfollowed" });
    }

    [HttpGet("me/following")]
    public async Task<IActionResult> GetFollowing([FromQuery] string? startAfter = null, [FromQuery] int limit = 20)
    {
        var currentUserId = GetCurrentUserId();
        var currentProfile = await _profileService.GetByOwnerUidAsync(currentUserId);
        if (currentProfile == null) return Unauthorized(new ApiErrorResponse { Error = "Profile not found" });

        return Ok(ToPagedResponse(await _followService.GetFollowingPagedAsync(currentProfile.PersistentId, startAfter, limit)));
    }

    [HttpGet("me/followers")]
    public async Task<IActionResult> GetFollowers([FromQuery] string? startAfter = null, [FromQuery] int limit = 20)
    {
        var currentUserId = GetCurrentUserId();
        var currentProfile = await _profileService.GetByOwnerUidAsync(currentUserId);
        if (currentProfile == null) return Unauthorized(new ApiErrorResponse { Error = "Profile not found" });

        return Ok(ToPagedResponse(await _followService.GetFollowersPagedAsync(currentProfile.PersistentId, startAfter, limit)));
    }

    [HttpGet("{userId}/following")]
    public async Task<IActionResult> GetFollowingForUser(string userId, [FromQuery] string? startAfter = null, [FromQuery] int limit = 20)
    {
        return Ok(ToPagedResponse(await _followService.GetFollowingPagedAsync(userId, startAfter, limit)));
    }

    [HttpGet("{userId}/followers")]
    public async Task<IActionResult> GetFollowersForUser(string userId, [FromQuery] string? startAfter = null, [FromQuery] int limit = 20)
    {
        return Ok(ToPagedResponse(await _followService.GetFollowersPagedAsync(userId, startAfter, limit)));
    }

    private static object ToPagedResponse<T>(PagedResult<T> result) =>
        new { profiles = result.Items, hasMore = result.HasMore, nextCursor = result.NextCursor };

    [HttpGet("{userId}/following-count")]
    public async Task<IActionResult> GetFollowingCount(string userId)
    {
        var count = await _followService.GetFollowingCountAsync(userId);
        return Ok(new { count });
    }

    [HttpGet("{userId}/followers-count")]
    public async Task<IActionResult> GetFollowersCount(string userId)
    {
        var count = await _followService.GetFollowersCountAsync(userId);
        return Ok(new { count });
    }

    [HttpGet("{userId}/is-following")]
    public async Task<IActionResult> IsFollowing(string userId)
    {
        var currentUserId = GetCurrentUserId();
        var currentProfile = await _profileService.GetByOwnerUidAsync(currentUserId);

        if (currentProfile == null)
            return Unauthorized(new ApiErrorResponse { Error = "Profile not found" });

        var isFollowing = await _followService.IsFollowingAsync(currentProfile.PersistentId, userId);
        return Ok(new { isFollowing });
    }
}

public class FollowRequest
{
    public string TargetUserId { get; set; }
}

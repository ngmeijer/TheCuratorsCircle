using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using Backend.Services;
using TheCuratorsCircle.Clients;
using TheCuratorsCircle.Models.Content;
using TheCuratorsCircle.Repositories;

namespace TheCuratorsCircle.Controllers;

[ApiController]
[Route("collections")]
[Authorize]
public class CollectionsController : ControllerBase
{
    private readonly ICollectionRepository _collectionRepository;
    private readonly ILogger<CollectionsController> _logger;
    private readonly APIHTTPClient _apiClient;
    private readonly IUserProfileService _profileService;

    public CollectionsController(ICollectionRepository collectionRepository, ILogger<CollectionsController> logger, APIHTTPClient apiClient, IUserProfileService profileService)
    {
        _collectionRepository = collectionRepository;
        _logger = logger;
        _apiClient = apiClient;
        _profileService = profileService;
    }

    private async Task<string> GetCurrentUserPersistentIdAsync()
    {
        var ownerUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(ownerUid))
        {
            return "test-user-id";
        }

        var profile = await _profileService.GetByOwnerUidAsync(ownerUid);
        return profile?.PersistentId ?? ownerUid;
    }

    [HttpPost]
    [EnableRateLimiting("write")]
    public async Task<IActionResult> CreateCollection([FromBody] CreateCollectionRequest request)
    {
        _logger.LogInformation("CreateCollection request received - Name: {Name}", request.Name);

        if (!ModelState.IsValid)
        {
            _logger.LogWarning("CreateCollection validation failed");
            return BadRequest(new { message = "Invalid data. Collection name is required." });
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        try
        {
            var collection = new CollectionEntity
            {
                Id = Guid.CreateVersion7().ToString(),
                UserId = persistentId,
                Name = request.Name.Trim(),
                ItemIds = Array.Empty<string>(),
                CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow)
            };

            var createdCollection = await _collectionRepository.CreateCollectionAsync(collection);

            _logger.LogInformation("Collection created successfully - CollectionId: {CollectionId}, UserId: {PersistentId}", collection.Id, persistentId);
            return Ok(createdCollection);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating collection for user {PersistentId}", persistentId);
            return StatusCode(500, new { message = "Failed to create collection.", details = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetCollections([FromQuery] string? userId = null)
    {
        _logger.LogInformation("GetCollections request received - UserId filter: {UserId}", userId);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        try
        {
            var collections = await _collectionRepository.GetCollectionsByUserIdAsync(targetUserId);

            var orderedCollections = collections
                .OrderByDescending(c => c.CreatedAt)
                .ToList();

            // Fetch posts for each collection to get poster info
            var responses = new List<CollectionResponse>();
            
            foreach (var collection in orderedCollections)
            {
                var response = new CollectionResponse
                {
                    Id = collection.Id,
                    Name = collection.Name,
                    UserId = collection.UserId,
                    ItemIds = collection.ItemIds ?? Array.Empty<string>(),
                    CreatedAt = collection.CreatedAt.ToDateTime(),
                    ItemCount = collection.ItemIds?.Length ?? 0
                };

                // Get first post's media for poster
                if (collection.ItemIds != null && collection.ItemIds.Length > 0)
                {
                    var firstPostId = collection.ItemIds[0];
                    try
                    {
                        var post = await _collectionRepository.GetPostByIdAsync(firstPostId);
                        if (post != null)
                        {
                            var mediaInfo = await _apiClient.FetchMediaByIdAsync(post.MediaId);
                            if (mediaInfo != null)
                            {
                                response.PosterUrl = mediaInfo.Poster;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to fetch poster for post {PostId}", firstPostId);
                    }
                }

                responses.Add(response);
            }
                
            _logger.LogInformation("GetCollections returning {Count} collections for user {UserId}", responses.Count, targetUserId);
            return Ok(responses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching collections for user {UserId}", targetUserId);
            
            if (ex.Message.Contains("index"))
            {
                return StatusCode(500, new { message = "Database index error. Please try again later.", details = ex.Message });
            }
            
            return StatusCode(500, new { message = "Failed to retrieve collections.", details = ex.Message });
        }
    }

    [HttpGet("{collectionId}")]
    public async Task<IActionResult> GetCollection(string collectionId)
    {
        _logger.LogInformation("GetCollection request received - CollectionId: {CollectionId}", collectionId);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        try
        {
            var collection = await _collectionRepository.GetCollectionByIdAsync(collectionId);

            if (collection == null)
            {
                _logger.LogWarning("Collection not found - CollectionId: {CollectionId}", collectionId);
                return NotFound(new { message = "Collection not found" });
            }

            if (collection.UserId != persistentId)
            {
                _logger.LogWarning("Unauthorized access attempt - CollectionId: {CollectionId}, UserId: {PersistentId}", collectionId, persistentId);
                return Forbid();
            }

            _logger.LogInformation("GetCollection returning collection - CollectionId: {CollectionId}", collectionId);
            return Ok(collection);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching collection {CollectionId}", collectionId);
            return StatusCode(500, new { message = "Failed to retrieve collection.", details = ex.Message });
        }
    }
}

using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TheCuratorsCircle.Clients;
using TheCuratorsCircle.Models.Content;

namespace TheCuratorsCircle.Controllers;

[ApiController]
[Route("collections")]
public class CollectionsController : ControllerBase
{
    private readonly FirestoreClient _firestore;
    private readonly ILogger<CollectionsController> _logger;
    private readonly APIHTTPClient _apiClient;

    public CollectionsController(FirestoreClient firestore, ILogger<CollectionsController> logger, APIHTTPClient apiClient)
    {
        _firestore = firestore;
        _logger = logger;
        _apiClient = apiClient;
    }

    [HttpPost]
    public async Task<IActionResult> CreateCollection([FromBody] CreateCollectionRequest request)
    {
        _logger.LogInformation("CreateCollection request received - Name: {Name}", request.Name);

        if (!ModelState.IsValid)
        {
            _logger.LogWarning("CreateCollection validation failed");
            return BadRequest(new { message = "Invalid data. Collection name is required." });
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            userId = "test-user-id";
        }

        try
        {
            var collection = new CollectionEntity
            {
                Id = Guid.CreateVersion7().ToString(),
                UserId = userId,
                Name = request.Name.Trim(),
                ItemIds = Array.Empty<string>(),
                CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow)
            };

            var collectionsRef = _firestore.Database.Collection("collections");
            await collectionsRef.Document(collection.Id).SetAsync(collection);

            _logger.LogInformation("Collection created successfully - CollectionId: {CollectionId}, UserId: {UserId}", collection.Id, userId);
            return Ok(collection);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating collection for user {UserId}", userId);
            return StatusCode(500, new { message = "Failed to create collection.", details = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetCollections()
    {
        _logger.LogInformation("GetCollections request received");

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            userId = "test-user-id";
        }

        try
        {
            var collectionsRef = _firestore.Database.Collection("collections");
            
            var snapshot = await collectionsRef
                .WhereEqualTo("userId", userId)
                .GetSnapshotAsync();

            var collections = snapshot.Documents.Select(doc => doc.ConvertTo<CollectionEntity>()).ToList();
            
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
                        var postDoc = await _firestore.Database.Collection("posts").Document(firstPostId).GetSnapshotAsync();
                        if (postDoc.Exists)
                        {
                            var post = postDoc.ConvertTo<Post>();
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
                
            _logger.LogInformation("GetCollections returning {Count} collections for user {UserId}", responses.Count, userId);
            return Ok(responses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching collections for user {UserId}", userId);
            
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

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            userId = "test-user-id";
        }

        try
        {
            var docRef = _firestore.Database.Collection("collections").Document(collectionId);
            var doc = await docRef.GetSnapshotAsync();

            if (!doc.Exists)
            {
                _logger.LogWarning("Collection not found - CollectionId: {CollectionId}", collectionId);
                return NotFound(new { message = "Collection not found" });
            }

            var collection = doc.ConvertTo<CollectionEntity>();

            if (collection.UserId != userId)
            {
                _logger.LogWarning("Unauthorized access attempt - CollectionId: {CollectionId}, UserId: {UserId}", collectionId, userId);
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

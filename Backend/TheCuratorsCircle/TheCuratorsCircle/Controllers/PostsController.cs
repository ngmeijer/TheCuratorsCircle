using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Mvc;
using TheCuratorsCircle.Clients;
using TheCuratorsCircle.Models.Content;

namespace TheCuratorsCircle.Controllers;

[ApiController]
[Route("posts")]
public class PostsController : ControllerBase
{
    private readonly FirestoreClient _firestore;
    private readonly ILogger<PostsController> _logger;

    public PostsController(FirestoreClient firestore, ILogger<PostsController> logger)
    {
        _firestore = firestore;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
    {
        _logger.LogInformation("CreatePost request received - MediaType: {MediaType}, MediaId: {MediaId}, CollectionId: {CollectionId}", request.MediaType, request.MediaId, request.CollectionId);

        if (!ModelState.IsValid)
        {
            _logger.LogWarning("CreatePost validation failed");
            return BadRequest(new { message = "Invalid data. Title, mediaType, mediaId, and collectionId are required." });
        }

        var userId = "test-user-id";

        var post = new Post
        {
            Id = Guid.CreateVersion7().ToString(),
            UserId = userId,
            Title = request.Title,
            Caption = request.Caption,
            MediaType = request.MediaType,
            MediaId = request.MediaId,
            CollectionId = request.CollectionId,
            CreatedAt = DateTime.UtcNow,
            LikeCount = 0,
            CommentCount = 0,
            ShareCount = 0
        };

        var postsRef = _firestore.Database.Collection("posts");
        await postsRef.Document(post.Id).SetAsync(post);

        // Update collection's itemIds
        try
        {
            var collectionRef = _firestore.Database.Collection("collections").Document(request.CollectionId);
            var collectionDoc = await collectionRef.GetSnapshotAsync();
            
            if (collectionDoc.Exists)
            {
                var collection = collectionDoc.ConvertTo<CollectionEntity>();
                var itemIdsList = collection.ItemIds?.ToList() ?? new List<string>();
                itemIdsList.Add(post.Id);
                
                await collectionRef.UpdateAsync(new Dictionary<string, object>
                {
                    { "itemIds", itemIdsList }
                });
                
                _logger.LogInformation("Updated collection {CollectionId} with new post {PostId}", request.CollectionId, post.Id);
            }
            else
            {
                _logger.LogWarning("Collection {CollectionId} not found when updating itemIds", request.CollectionId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update collection itemIds for collection {CollectionId}", request.CollectionId);
        }

        _logger.LogInformation("Post created successfully - PostId: {PostId}, UserId: {UserId}, CollectionId: {CollectionId}", post.Id, userId, post.CollectionId);
        return Ok(post);
    }

    [HttpGet]
    public async Task<IActionResult> GetPosts()
    {
        _logger.LogInformation("GetPosts request received");
        
        var postsRef = _firestore.Database.Collection("posts");
        var snapshot = await postsRef.OrderByDescending("createdAt").Limit(50).GetSnapshotAsync();
        
        var posts = snapshot.Documents.Select(doc => doc.ConvertTo<Post>()).ToList();
        _logger.LogInformation("GetPosts returning {Count} posts", posts.Count);
        return Ok(posts);
    }

    [HttpGet("{postId}")]
    public async Task<IActionResult> GetPost(string postId)
    {
        _logger.LogInformation("GetPost request received - PostId: {PostId}", postId);
        
        var docRef = _firestore.Database.Collection("posts").Document(postId);
        var doc = await docRef.GetSnapshotAsync();

        if (!doc.Exists)
        {
            _logger.LogWarning("Post not found - PostId: {PostId}", postId);
            return NotFound(new { message = "Post not found" });
        }

        var post = doc.ConvertTo<Post>();
        return Ok(post);
    }
}

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
    private readonly OmdbClient _omdbClient;
    private readonly ILogger<PostsController> _logger;

    public PostsController(FirestoreClient firestore, OmdbClient omdbClient, ILogger<PostsController> logger)
    {
        _firestore = firestore;
        _omdbClient = omdbClient;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
    {
        _logger.LogInformation("CreatePost request received - MediaType: {MediaType}, MediaId: {MediaId}", request.MediaType, request.MediaId);

        if (!ModelState.IsValid)
        {
            _logger.LogWarning("CreatePost validation failed");
            return BadRequest(new { message = "Invalid data." });
        }

        var userId = "test-user-id";

        var mediaMetadata = request.MediaMetadata;
        if (mediaMetadata == null && !string.IsNullOrEmpty(request.MediaId))
        {
            var media = await _omdbClient.FetchMediaAsync(request.MediaId);
            if (media != null)
            {
                mediaMetadata = new MediaDto
                {
                    Title = media.Title,
                    Genre = media.Genre,
                    Plot = media.Plot,
                    PosterUrl = media.Poster,
                    ReleaseYear = media.Year,
                    RuntimeInMinutes = media.Runtime,
                    Language = media.Language,
                    Rating = media.ImdbRating,
                    MediaType = media.Type ?? "movie",
                    TotalSeasons = media.TotalSeasons
                };
            }
        }

        var post = new Post
        {
            Id = Guid.CreateVersion7().ToString(),
            UserId = userId,
            ImageUrl = request.ImageUrl,
            Caption = request.Caption,
            MediaType = request.MediaType,
            MediaId = request.MediaId,
            MediaMetadata = mediaMetadata,
            CreatedAt = DateTime.UtcNow,
            LikeCount = 0,
            CommentCount = 0,
            ShareCount = 0
        };

        var postsRef = _firestore.Database.Collection("posts");
        await postsRef.Document(post.Id).SetAsync(post);

        _logger.LogInformation("Post created successfully - PostId: {PostId}, UserId: {UserId}", post.Id, userId);
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

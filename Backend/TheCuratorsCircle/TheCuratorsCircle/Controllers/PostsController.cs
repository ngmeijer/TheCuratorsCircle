using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TheCuratorsCircle.Clients;
using TheCuratorsCircle.Models.Content;
using Backend.Services;
using Backend.Models.Profiles;

namespace TheCuratorsCircle.Controllers;

[ApiController]
[Route("posts")]
public class PostsController : ControllerBase
{
    private readonly FirestoreClient _firestore;
    private readonly ILogger<PostsController> _logger;
    private readonly IUserProfileService _profileService;
    private readonly IFollowService _followService;

    public PostsController(
        FirestoreClient firestore, 
        ILogger<PostsController> logger,
        IUserProfileService profileService,
        IFollowService followService)
    {
        _firestore = firestore;
        _logger = logger;
        _profileService = profileService;
        _followService = followService;
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    [HttpPost]
    [Authorize]
    [EnableRateLimiting("write")]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
    {
        _logger.LogInformation("CreatePost request received - MediaType: {MediaType}, MediaId: {MediaId}, CollectionId: {CollectionId}", request.MediaType, request.MediaId, request.CollectionId);

        if (!ModelState.IsValid)
        {
            _logger.LogWarning("CreatePost validation failed");
            return BadRequest(new { message = "Invalid data. Title, mediaType, mediaId, and collectionId are required." });
        }

        var firebaseUid = GetCurrentUserId();
        var profile = await _profileService.GetByOwnerUidAsync(firebaseUid);
        
        if (profile == null)
            return Unauthorized(new { error = "Profile not found" });

        var userId = profile.PersistentId;

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

    [HttpGet("feed")]
    [Authorize]
    public async Task<IActionResult> GetFeed([FromQuery] string? startAfter = null, [FromQuery] int limit = 20)
    {
        try
        {
            _logger.LogInformation("GetFeed request received with startAfter={StartAfter}, limit={Limit}", startAfter, limit);
            
            var firebaseUid = GetCurrentUserId();
            var currentProfile = await _profileService.GetByOwnerUidAsync(firebaseUid);
            
            if (currentProfile == null)
                return Unauthorized(new { error = "Profile not found" });

            var following = await _followService.GetFollowingAsync(currentProfile.PersistentId);
            
            if (following.Count == 0)
            {
                return Ok(new { posts = new List<PostWithProfile>(), hasMore = false, nextCursor = (string?)null });
            }

            var followingIds = following.Select(p => p.PersistentId).ToList();

            // Build base query
            var baseQuery = _firestore.Database.Collection("posts")
                .WhereIn("userId", followingIds)
                .OrderByDescending("createdAt");

            // Add cursor filter if provided
            Query query;
            if (!string.IsNullOrEmpty(startAfter))
            {
                try
                {
                    var cursorTimestamp = DateTime.Parse(startAfter);
                    query = baseQuery
                        .WhereLessThan("createdAt", cursorTimestamp)
                        .Limit(limit);
                }
                catch
                {
                    query = baseQuery.Limit(limit);
                }
            }
            else
            {
                query = baseQuery.Limit(limit);
            }

            var snapshot = await query.GetSnapshotAsync();
            var posts = snapshot.Documents.Select(doc => doc.ConvertTo<Post>()).ToList();

            var hasMore = posts.Count == limit;

            // Batch fetch all relevant profiles
            var userIds = posts.Select(p => p.UserId).Distinct().ToList();
            var profilesDict = new Dictionary<string, UserProfile>();

            foreach (var userId in userIds)
            {
                var profileDoc = await _firestore.Database.Collection("userProfiles").Document(userId).GetSnapshotAsync();
                if (profileDoc.Exists)
                {
                    var profile = profileDoc.ConvertTo<UserProfile>();
                    profilesDict[userId] = profile;
                }
            }

            var postsWithProfiles = posts.Select(post => new PostWithProfile
            {
                Post = post,
                Profile = profilesDict.GetValueOrDefault(post.UserId)
            }).ToList();

            var lastPost = postsWithProfiles.LastOrDefault();
            string? nextCursor = lastPost?.Post != null ? lastPost.Post.CreatedAt.ToString("o") : null;

            return Ok(new { posts = postsWithProfiles, hasMore, nextCursor });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetFeed");
            return StatusCode(500, new { error = ex.Message });
        }
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

public class PostWithProfile
{
    public Post Post { get; set; }
    public UserProfile Profile { get; set; }
}

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Google.Cloud.Firestore;
using Backend.Models.Follows;
using Backend.Models.Profiles;
using TheCuratorsCircle.Models;

namespace Backend.Services
{
  public interface IFollowService
  {
    Task<(bool Success, string Error)> FollowAsync(string followerId, string followingId);
    Task<(bool Success, string Error)> UnfollowAsync(string followerId, string followingId);
    Task<bool> IsFollowingAsync(string followerId, string followingId);
    Task<List<UserProfile>> GetFollowingAsync(string followerId);
    Task<List<UserProfile>> GetFollowersAsync(string userId);
    Task<PagedResult<UserProfile>> GetFollowingPagedAsync(string followerId, string? startAfter, int limit);
    Task<PagedResult<UserProfile>> GetFollowersPagedAsync(string userId, string? startAfter, int limit);
    Task<int> GetFollowingCountAsync(string userId);
    Task<int> GetFollowersCountAsync(string userId);
  }

  public class FollowService : IFollowService
  {
    private readonly FirestoreDb _db;

    public FollowService(FirestoreDb db)
    {
      _db = db;
    }

    public async Task<bool> IsFollowingAsync(string followerId, string followingId)
    {
      if (followerId == followingId) return false;

      var docRef = _db.Collection("follows").Document($"{followerId}_{followingId}");
      var snap = await docRef.GetSnapshotAsync();
      return snap.Exists;
    }

    public async Task<(bool Success, string Error)> FollowAsync(string followerId, string followingId)
    {
      if (followerId == followingId)
        return (false, "You cannot follow yourself");

      var existingFollow = await IsFollowingAsync(followerId, followingId);
      if (existingFollow)
        return (false, "Already following this user");

      var follow = new Follow
      {
        FollowerId = followerId,
        FollowingId = followingId,
        CreatedAt = DateTime.UtcNow
      };

      var docRef = _db.Collection("follows").Document($"{followerId}_{followingId}");
      await docRef.SetAsync(follow);

      return (true, null);
    }

    public async Task<(bool Success, string Error)> UnfollowAsync(string followerId, string followingId)
    {
      var docRef = _db.Collection("follows").Document($"{followerId}_{followingId}");
      var snap = await docRef.GetSnapshotAsync();
      
      if (!snap.Exists)
        return (false, "Not following this user");

      await docRef.DeleteAsync();
      return (true, null);
    }

    public async Task<List<UserProfile>> GetFollowingAsync(string followerId)
    {
      var snapshot = await _db.Collection("follows")
          .WhereEqualTo("followerId", followerId)
          .GetSnapshotAsync();

      return await BatchGetProfilesAsync(snapshot.Documents.Select(d => d.ConvertTo<Follow>().FollowingId));
    }

    public async Task<List<UserProfile>> GetFollowersAsync(string userId)
    {
      var snapshot = await _db.Collection("follows")
          .WhereEqualTo("followingId", userId)
          .GetSnapshotAsync();

      return await BatchGetProfilesAsync(snapshot.Documents.Select(d => d.ConvertTo<Follow>().FollowerId));
    }

    public async Task<PagedResult<UserProfile>> GetFollowingPagedAsync(string followerId, string? startAfter, int limit)
    {
      var docs = await QueryFollowsPagedAsync("followerId", followerId, startAfter, limit);
      var profiles = await BatchGetProfilesAsync(docs.Take(limit).Select(d => d.ConvertTo<Follow>().FollowingId));
      var hasMore = docs.Count > limit;
      return new PagedResult<UserProfile>
      {
        Items = profiles,
        HasMore = hasMore,
        NextCursor = hasMore ? docs[limit - 1].ConvertTo<Follow>().CreatedAt.ToString("o") : null
      };
    }

    public async Task<PagedResult<UserProfile>> GetFollowersPagedAsync(string userId, string? startAfter, int limit)
    {
      var docs = await QueryFollowsPagedAsync("followingId", userId, startAfter, limit);
      var profiles = await BatchGetProfilesAsync(docs.Take(limit).Select(d => d.ConvertTo<Follow>().FollowerId));
      var hasMore = docs.Count > limit;
      return new PagedResult<UserProfile>
      {
        Items = profiles,
        HasMore = hasMore,
        NextCursor = hasMore ? docs[limit - 1].ConvertTo<Follow>().CreatedAt.ToString("o") : null
      };
    }

    private async Task<List<DocumentSnapshot>> QueryFollowsPagedAsync(string field, string value, string? startAfter, int limit)
    {
      var baseQuery = _db.Collection("follows")
          .WhereEqualTo(field, value)
          .OrderByDescending("createdAt");

      var query = string.IsNullOrEmpty(startAfter)
          ? baseQuery.Limit(limit + 1)
          : baseQuery.WhereLessThan("createdAt", DateTime.Parse(startAfter)).Limit(limit + 1);

      var snapshot = await query.GetSnapshotAsync();
      return snapshot.Documents.ToList();
    }

    public async Task<int> GetFollowingCountAsync(string userId)
    {
      var snapshot = await _db.Collection("follows")
          .WhereEqualTo("followerId", userId)
          .GetSnapshotAsync();
      return snapshot.Documents.Count;
    }

    public async Task<int> GetFollowersCountAsync(string userId)
    {
      var snapshot = await _db.Collection("follows")
          .WhereEqualTo("followingId", userId)
          .GetSnapshotAsync();
      return snapshot.Documents.Count;
    }

    private async Task<List<UserProfile>> BatchGetProfilesAsync(IEnumerable<string> profileIds)
    {
      var ids = profileIds.Distinct().ToList();
      if (ids.Count == 0) return new List<UserProfile>();

      var docRefs = ids.Select(id => _db.Collection("userProfiles").Document(id)).ToList();
      var snapshots = await _db.GetAllSnapshotsAsync(docRefs);
      return snapshots.Where(s => s.Exists).Select(s => s.ConvertTo<UserProfile>()).ToList();
    }
  }
}

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Google.Cloud.Firestore;
using Backend.Models.Follows;
using Backend.Models.Profiles;

namespace Backend.Services
{
  public interface IFollowService
  {
    Task<(bool Success, string Error)> FollowAsync(string followerId, string followingId);
    Task<(bool Success, string Error)> UnfollowAsync(string followerId, string followingId);
    Task<bool> IsFollowingAsync(string followerId, string followingId);
    Task<List<UserProfile>> GetFollowingAsync(string followerId);
    Task<List<UserProfile>> GetFollowersAsync(string userId);
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

      var followingProfiles = new List<UserProfile>();
      
      foreach (var doc in snapshot.Documents)
      {
        var follow = doc.ConvertTo<Follow>();
        var profile = await GetProfileByIdAsync(follow.FollowingId);
        if (profile != null)
          followingProfiles.Add(profile);
      }

      return followingProfiles;
    }

    public async Task<List<UserProfile>> GetFollowersAsync(string userId)
    {
      var snapshot = await _db.Collection("follows")
          .WhereEqualTo("followingId", userId)
          .GetSnapshotAsync();

      var followerProfiles = new List<UserProfile>();
      
      foreach (var doc in snapshot.Documents)
      {
        var follow = doc.ConvertTo<Follow>();
        var profile = await GetProfileByIdAsync(follow.FollowerId);
        if (profile != null)
          followerProfiles.Add(profile);
      }

      return followerProfiles;
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

    private async Task<UserProfile> GetProfileByIdAsync(string persistentId)
    {
      var docRef = _db.Collection("userProfiles").Document(persistentId);
      var snap = await docRef.GetSnapshotAsync();
      
      if (!snap.Exists) return null;
      return snap.ConvertTo<UserProfile>();
    }
  }
}

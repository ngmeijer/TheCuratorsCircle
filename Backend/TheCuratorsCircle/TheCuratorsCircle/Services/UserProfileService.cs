using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Google.Cloud.Firestore;
using Microsoft.Extensions.Logging;
using Backend.Models.Profiles;

namespace Backend.Services
{
  public interface IUserProfileService
  {
    Task<UserProfile> GetByPersistentIdAsync(string persistentId);
    Task<UserProfile> GetByAliasAsync(string alias);
    Task<UserProfile> GetByOwnerUidAsync(string ownerUid);
    Task<(UserProfile Profile, string Error)> CreateAsync(string ownerUid, CreateUserProfileRequest request);
    Task<(UserProfile Profile, string Error)> UpdateAsync(string persistentId, string ownerUid, UpdateUserProfileRequest request);
    Task<(bool Success, string Error)> DeleteAsync(string persistentId, string ownerUid);
    Task<List<UserProfile>> SearchByUsernameAsync(string query);
  }

  public class UserProfileService : IUserProfileService
  {
    private readonly FirestoreDb _db;
    private readonly ILogger<UserProfileService> _logger;

    public UserProfileService(FirestoreDb db, ILogger<UserProfileService> logger)
    {
      _db = db;
      _logger = logger;
    }

    public async Task<UserProfile> GetByPersistentIdAsync(string persistentId)
    {
      var docRef = _db.Collection("userProfiles").Document(persistentId);
      var snap = await docRef.GetSnapshotAsync();
      if (!snap.Exists) return null;
      return snap.ConvertTo<UserProfile>();
    }

    public async Task<UserProfile> GetByAliasAsync(string alias)
    {
      var aliasRef = _db.Collection("usernames").Document(alias);
      var aliasSnap = await aliasRef.GetSnapshotAsync();
      if (!aliasSnap.Exists) return null;

      var mapping = aliasSnap.ConvertTo<AliasMapping>();
      if (mapping == null || string.IsNullOrEmpty(mapping.PersistentId)) return null;

      return await GetByPersistentIdAsync(mapping.PersistentId);
    }

    public async Task<UserProfile> GetByOwnerUidAsync(string ownerUid)
    {
      var snapshot = await _db.Collection("userProfiles")
          .WhereEqualTo("OwnerUid", ownerUid)
          .Limit(1)
          .GetSnapshotAsync();

      if (snapshot.Documents.Count == 0) return null;

      return snapshot.Documents[0].ConvertTo<UserProfile>();
    }

    public async Task<(UserProfile Profile, string Error)> CreateAsync(string ownerUid, CreateUserProfileRequest request)
    {
      var existingProfile = await GetByOwnerUidAsync(ownerUid);
      if (existingProfile != null)
        return (null, "You already have a profile");

      if (string.IsNullOrEmpty(request.Username))
        return (null, "Username is required");

      if (!request.Username.StartsWith("@"))
        return (null, "Username must start with @");

      var username = request.Username;
      var persistentId = Guid.NewGuid().ToString();
      var timestamp = Timestamp.GetCurrentTimestamp();
      var aliasRef = _db.Collection("usernames").Document(username);

      string transactionError = null;

      var profile = new UserProfile
      {
        PersistentId = persistentId,
        OwnerUid = ownerUid,
        UsernamesHistory = new List<string> { username },
        UsernameLower = username.TrimStart('@').ToLowerInvariant(),
        DisplayName = request.DisplayName ?? "",
        Bio = request.Bio ?? "",
        IsPublic = true,
        CreatedAt = timestamp,
        UpdatedAt = timestamp
      };

      await _db.RunTransactionAsync(async transaction =>
      {
        // Availability check inside transaction prevents race conditions
        var aliasSnap = await transaction.GetSnapshotAsync(aliasRef);
        if (aliasSnap.Exists)
        {
          var existingMapping = aliasSnap.ConvertTo<AliasMapping>();
          if (existingMapping.IsActive)
          {
            transactionError = "Username is already taken";
            return;
          }
        }

        transaction.Set(_db.Collection("userProfiles").Document(persistentId), profile);
        transaction.Set(aliasRef, new AliasMapping
        {
          Alias = username,
          PersistentId = persistentId,
          OwnerUid = ownerUid,
          IsActive = true,
          UpdatedAt = timestamp
        });
      });

      if (transactionError != null)
        return (null, transactionError);

      return (profile, null);
    }

    public async Task<(UserProfile Profile, string Error)> UpdateAsync(string persistentId, string ownerUid, UpdateUserProfileRequest request)
    {
      var profileRef = _db.Collection("userProfiles").Document(persistentId);
      var profileSnap = await profileRef.GetSnapshotAsync();
      if (!profileSnap.Exists)
        return (null, "Profile not found");

      var profile = profileSnap.ConvertTo<UserProfile>();

      if (profile.OwnerUid != ownerUid)
        return (null, "You can only update your own profile");

      var timestamp = Timestamp.GetCurrentTimestamp();
      var updates = new Dictionary<string, object>
      {
        { "UpdatedAt", timestamp }
      };

      bool usernameChanged = !string.IsNullOrEmpty(request.Username) && request.Username != profile.UsernamesHistory[0];

      if (usernameChanged)
      {
        if (!request.Username.StartsWith("@"))
          return (null, "Username must start with @");

        var newAliasRef = _db.Collection("usernames").Document(request.Username);
        var oldAlias = profile.UsernamesHistory[0];
        var oldAliasRef = string.IsNullOrEmpty(oldAlias) ? null : _db.Collection("usernames").Document(oldAlias);

        var newHistory = new List<string> { request.Username };
        foreach (var oldUsername in profile.UsernamesHistory)
        {
          if (oldUsername != request.Username)
            newHistory.Add(oldUsername);
        }

        string transactionError = null;

        await _db.RunTransactionAsync(async transaction =>
        {
          // Availability check inside transaction prevents race conditions
          var newAliasSnap = await transaction.GetSnapshotAsync(newAliasRef);
          if (newAliasSnap.Exists)
          {
            var existingMapping = newAliasSnap.ConvertTo<AliasMapping>();
            if (existingMapping.IsActive && existingMapping.PersistentId != persistentId)
            {
              transactionError = "Username is already taken";
              return;
            }
          }

          transaction.Set(newAliasRef, new AliasMapping
          {
            Alias = request.Username,
            PersistentId = persistentId,
            OwnerUid = profile.OwnerUid,
            IsActive = true,
            UpdatedAt = timestamp
          });

          if (oldAliasRef != null)
          {
            transaction.Update(oldAliasRef, new Dictionary<string, object> { { "IsActive", false } });
          }

          var usernameUpdates = new Dictionary<string, object>(updates)
          {
            { "UsernamesHistory", newHistory },
            { "UsernameLower", request.Username.TrimStart('@').ToLowerInvariant() }
          };

          if (!string.IsNullOrEmpty(request.DisplayName))
            usernameUpdates["DisplayName"] = request.DisplayName;
          if (request.Bio != null)
            usernameUpdates["Bio"] = request.Bio;
          if (request.IsPublic.HasValue)
            usernameUpdates["IsPublic"] = request.IsPublic.Value;

          transaction.Update(profileRef, usernameUpdates);
        });

        if (transactionError != null)
          return (null, transactionError);
      }
      else
      {
        if (!string.IsNullOrEmpty(request.DisplayName))
          updates["DisplayName"] = request.DisplayName;
        if (request.Bio != null)
          updates["Bio"] = request.Bio;
        if (request.IsPublic.HasValue)
          updates["IsPublic"] = request.IsPublic.Value;

        await profileRef.UpdateAsync(updates);
      }

      var updatedSnap = await profileRef.GetSnapshotAsync();
      return (updatedSnap.ConvertTo<UserProfile>(), null);
    }

    public async Task<(bool Success, string Error)> DeleteAsync(string persistentId, string ownerUid)
    {
      var profileRef = _db.Collection("userProfiles").Document(persistentId);
      var profileSnap = await profileRef.GetSnapshotAsync();
      if (!profileSnap.Exists)
        return (false, "Profile not found");

      var profile = profileSnap.ConvertTo<UserProfile>();
      if (profile.OwnerUid != ownerUid)
        return (false, "You can only delete your own profile");

      // Delete posts
      await DeleteCollectionBatchAsync("posts", "userId", persistentId);

      // Delete collections
      await DeleteCollectionBatchAsync("collections", "userId", persistentId);

      // Delete follow relationships (follower or following)
      await DeleteCollectionBatchAsync("follows", "followerId", persistentId);
      await DeleteCollectionBatchAsync("follows", "followingId", persistentId);

      // Deactivate all username mappings
      if (profile.UsernamesHistory != null)
      {
        var batch = _db.StartBatch();
        foreach (var username in profile.UsernamesHistory)
        {
          if (!string.IsNullOrEmpty(username))
          {
            var aliasRef = _db.Collection("usernames").Document(username);
            batch.Update(aliasRef, new Dictionary<string, object> { { "IsActive", false } });
          }
        }
        await batch.CommitAsync();
      }

      // Delete the profile itself
      await profileRef.DeleteAsync();

      return (true, null);
    }

    public async Task<List<UserProfile>> SearchByUsernameAsync(string query)
    {
      if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
        return new List<UserProfile>();

      var normalized = query.TrimStart('@').ToLowerInvariant();
      _logger.LogInformation("SearchByUsername: query='{Query}', normalized='{Normalized}'", query, normalized);
      var upperBound = normalized + "";

      var snapshot = await _db.Collection("userProfiles")
          .WhereGreaterThanOrEqualTo("UsernameLower", normalized)
          .WhereLessThanOrEqualTo("UsernameLower", upperBound)
          .Limit(20)
          .GetSnapshotAsync();

      _logger.LogInformation("SearchByUsername: Firestore returned {Count} documents", snapshot.Documents.Count);

      var results = snapshot.Documents.Select(d => d.ConvertTo<UserProfile>()).ToList();

      foreach (var r in results)
        _logger.LogInformation("SearchByUsername: found profile PersistentId={Id}, UsernameLower='{UsernameLower}'", r.PersistentId, r.UsernameLower);

      return results;
    }

    private async Task DeleteCollectionBatchAsync(string collection, string field, string value)
    {
      const int batchSize = 400;
      while (true)
      {
        var snapshot = await _db.Collection(collection)
            .WhereEqualTo(field, value)
            .Limit(batchSize)
            .GetSnapshotAsync();

        if (snapshot.Documents.Count == 0) break;

        var batch = _db.StartBatch();
        foreach (var doc in snapshot.Documents)
          batch.Delete(doc.Reference);

        await batch.CommitAsync();

        if (snapshot.Documents.Count < batchSize) break;
      }
    }
  }
}

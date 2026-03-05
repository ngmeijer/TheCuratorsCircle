using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Google.Cloud.Firestore;
using Backend.Models.Profiles;

namespace Backend.Services
{
  public interface IUserProfileService
  {
    Task<UserProfile> GetByPersistentIdAsync(string persistentId);
    Task<UserProfile> GetByAliasAsync(string alias);
    Task<(UserProfile Profile, string Error)> CreateAsync(string ownerUid, CreateUserProfileRequest request);
  }

  public class UserProfileService : IUserProfileService
  {
    private readonly FirestoreDb _db;

    public UserProfileService(FirestoreDb db)
    {
      _db = db;
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

    public async Task<(UserProfile Profile, string Error)> CreateAsync(string ownerUid, CreateUserProfileRequest request)
    {
      if (string.IsNullOrEmpty(request.Username))
        return (null, "Username is required");
      
      if (!request.Username.StartsWith("@"))
        return (null, "Username must start with @");

      var username = request.Username;
      var aliasRef = _db.Collection("usernames").Document(username);
      var aliasSnap = await aliasRef.GetSnapshotAsync();
      if (aliasSnap.Exists)
      {
        var existingMapping = aliasSnap.ConvertTo<AliasMapping>();
        if (existingMapping.IsActive)
          return (null, "Username is already taken");
      }

      var persistentId = Guid.NewGuid().ToString();
      var timestamp = Timestamp.GetCurrentTimestamp();

      var profile = new UserProfile
      {
        PersistentId = persistentId,
        OwnerUid = ownerUid,
        UsernamesHistory = new List<string> { username },
        DisplayName = request.DisplayName ?? "",
        Bio = request.Bio ?? "",
        IsPublic = true,
        CreatedAt = timestamp,
        UpdatedAt = timestamp
      };

      await _db.RunTransactionAsync(async transaction =>
      {
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

      return (profile, null);
    }
  }
}

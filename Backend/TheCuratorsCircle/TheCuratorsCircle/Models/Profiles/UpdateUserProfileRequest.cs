using System;
using Google.Cloud.Firestore;

namespace Backend.Models.Profiles
{
  [FirestoreData]
  public class UpdateUserProfileRequest
  {
    [FirestoreProperty]
    public string? Username { get; set; }

    [FirestoreProperty]
    public string? DisplayName { get; set; }

    [FirestoreProperty]
    public string? Bio { get; set; }

    [FirestoreProperty]
    public bool? IsPublic { get; set; }
  }
}

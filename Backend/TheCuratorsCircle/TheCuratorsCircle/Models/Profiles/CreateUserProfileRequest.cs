using System;
using System.Collections.Generic;
using Google.Cloud.Firestore;

namespace Backend.Models.Profiles
{
  [FirestoreData]
  public class CreateUserProfileRequest
  {
    [FirestoreProperty]
    public string? DisplayName { get; set; }

    [FirestoreProperty]
    public string? Bio { get; set; }

    [FirestoreProperty]
    public string Username { get; set; }
  }
}

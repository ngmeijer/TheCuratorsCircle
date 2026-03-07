using System;
using System.Collections.Generic;
using Google.Cloud.Firestore;

namespace Backend.Models.Profiles
{
  [FirestoreData]
  public class UserProfile
  {
    [FirestoreDocumentId]
    public string PersistentId { get; set; }

    [FirestoreProperty]
    public string OwnerUid { get; set; }

    [FirestoreProperty]
    public List<string> UsernamesHistory { get; set; } = new List<string>(); // newest first; [0] is current alias

    [FirestoreProperty]
    public string DisplayName { get; set; }

    [FirestoreProperty]
    public string Bio { get; set; }

    [FirestoreProperty]
    public bool IsPublic { get; set; } = true;

    [FirestoreProperty]
    public Google.Cloud.Firestore.Timestamp CreatedAt { get; set; }

    [FirestoreProperty]
    public Google.Cloud.Firestore.Timestamp UpdatedAt { get; set; }
  }
}
     
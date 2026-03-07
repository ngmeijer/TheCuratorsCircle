using Google.Cloud.Firestore;

namespace Backend.Models.Profiles
{
  [FirestoreData]
  public class AliasMapping
  {
    [FirestoreDocumentId]
    public string Alias { get; set; }

    [FirestoreProperty]
    public string PersistentId { get; set; }

    [FirestoreProperty]
    public string OwnerUid { get; set; }

    [FirestoreProperty]
    public bool IsActive { get; set; }

    [FirestoreProperty]
    public Google.Cloud.Firestore.Timestamp UpdatedAt { get; set; }
  }
}

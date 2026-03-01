using Google.Cloud.Firestore;

namespace TheCuratorsCircle.Models.Content;

[FirestoreData]
public class CollectionEntity
{
    [FirestoreProperty("id")]
    public string Id { get; set; }

    [FirestoreProperty("userId")]
    public string UserId { get; set; }

    [FirestoreProperty("name")]
    public string Name { get; set; }

    [FirestoreProperty("itemIds")]
    public string[] ItemIds { get; set; }

    [FirestoreProperty("createdAt")]
    public Timestamp CreatedAt { get; set; }
}
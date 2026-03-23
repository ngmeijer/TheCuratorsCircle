using Google.Cloud.Firestore;

namespace Backend.Models.Follows;

[FirestoreData]
public class Follow
{
    [FirestoreProperty("followerId")]
    public string FollowerId { get; set; }

    [FirestoreProperty("followingId")]
    public string FollowingId { get; set; }

    [FirestoreProperty("createdAt")]
    public DateTime CreatedAt { get; set; }
}

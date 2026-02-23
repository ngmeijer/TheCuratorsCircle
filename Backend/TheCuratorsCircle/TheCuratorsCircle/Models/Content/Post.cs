using Google.Cloud.Firestore;

namespace TheCuratorsCircle.Models.Content;

[FirestoreData]
public class Post
{
    [FirestoreProperty("id")]
    public string Id { get; set; }

    [FirestoreProperty("userId")]
    public string UserId { get; set; }

    [FirestoreProperty("imageUrl")]
    public string ImageUrl { get; set; }

    [FirestoreProperty("caption")]
    public string Caption { get; set; }

    [FirestoreProperty("mediaType")]
    public string MediaType { get; set; }

    [FirestoreProperty("mediaId")]
    public string MediaId { get; set; }

    [FirestoreProperty("mediaMetadata")]
    public MediaDto? MediaMetadata { get; set; }

    [FirestoreProperty("createdAt")]
    public DateTime CreatedAt { get; set; }

    [FirestoreProperty("likeCount")]
    public int LikeCount { get; set; }

    [FirestoreProperty("commentCount")]
    public int CommentCount { get; set; }

    [FirestoreProperty("shareCount")]
    public int ShareCount { get; set; }
}

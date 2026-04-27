using Google.Cloud.Firestore;
using TheCuratorsCircle.Clients;
using TheCuratorsCircle.Models.Content;

namespace TheCuratorsCircle.Repositories;

public class FirestoreCollectionRepository : ICollectionRepository
{
    private readonly FirestoreClient _firestore;

    public FirestoreCollectionRepository(FirestoreClient firestore)
    {
        _firestore = firestore;
    }

    public async Task<CollectionEntity> CreateCollectionAsync(CollectionEntity collection)
    {
        var collectionsRef = _firestore.Database.Collection("collections");
        await collectionsRef.Document(collection.Id).SetAsync(collection);
        return collection;
    }

    public async Task<List<CollectionEntity>> GetCollectionsByUserIdAsync(string userId)
    {
        var collectionsRef = _firestore.Database.Collection("collections");
        var snapshot = await collectionsRef
            .WhereEqualTo("userId", userId)
            .GetSnapshotAsync();

        return snapshot.Documents.Select(doc => doc.ConvertTo<CollectionEntity>()).ToList();
    }

    public async Task<CollectionEntity?> GetCollectionByIdAsync(string collectionId)
    {
        var docRef = _firestore.Database.Collection("collections").Document(collectionId);
        var doc = await docRef.GetSnapshotAsync();

        if (!doc.Exists)
            return null;

        return doc.ConvertTo<CollectionEntity>();
    }

    public async Task<Post?> GetPostByIdAsync(string postId)
    {
        var postDoc = await _firestore.Database.Collection("posts").Document(postId).GetSnapshotAsync();
        if (!postDoc.Exists)
            return null;

        return postDoc.ConvertTo<Post>();
    }
}

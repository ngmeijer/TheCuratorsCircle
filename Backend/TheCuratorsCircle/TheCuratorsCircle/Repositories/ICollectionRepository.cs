using TheCuratorsCircle.Models.Content;

namespace TheCuratorsCircle.Repositories;

public interface ICollectionRepository
{
    Task<CollectionEntity> CreateCollectionAsync(CollectionEntity collection);
    Task<List<CollectionEntity>> GetCollectionsByUserIdAsync(string userId);
    Task<CollectionEntity?> GetCollectionByIdAsync(string collectionId);
    Task<Post?> GetPostByIdAsync(string postId);
}

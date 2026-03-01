namespace TheCuratorsCircle.Models.Content;

public class CollectionResponse
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string UserId { get; set; }
    public string[] ItemIds { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // For frontend display
    public string? PosterUrl { get; set; }
    public int ItemCount { get; set; }
}

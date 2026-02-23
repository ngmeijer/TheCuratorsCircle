namespace TheCuratorsCircle.Clients;

public interface IMediaSearchProvider
{
    string MediaType { get; }
    Task<List<MediaSearchResult>> SearchAsync(string query, string? mediaType = null);
    Task<MediaSearchResult?> GetByIdAsync(string id);
}

public class MediaSearchResult
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Year { get; set; } = "";
    public string Type { get; set; } = "";
    public string PosterUrl { get; set; } = "";
    public string? Plot { get; set; }
    public string? Genre { get; set; }
    public double? Rating { get; set; }
}

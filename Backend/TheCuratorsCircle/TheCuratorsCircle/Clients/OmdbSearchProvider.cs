using System.Text.Json;
using System.Text.Json.Serialization;
using TheCuratorsCircle.Models.Media;

namespace TheCuratorsCircle.Clients;

public class OmdbSearchProvider : IMediaSearchProvider
{
    private readonly HttpClient _client;
    private readonly IConfiguration _config;

    public string MediaType => "movie";

    public OmdbSearchProvider(HttpClient client, IConfiguration config)
    {
        _client = client;
        _config = config;
    }

    public async Task<List<MediaSearchResult>> SearchAsync(string query, string? mediaType = null)
    {
        var apiKey = _config["OMDB_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
            return new List<MediaSearchResult>();

        var response = await _client.GetAsync(
            $"http://www.omdbapi.com/?apikey={apiKey}&s={Uri.EscapeDataString(query)}"
        );

        if (!response.IsSuccessStatusCode)
            return new List<MediaSearchResult>();

        var json = await response.Content.ReadAsStringAsync();
        var searchResult = JsonSerializer.Deserialize<OmdbSearchResponse>(json);

        if (searchResult?.Search == null || searchResult.Response == "False")
            return new List<MediaSearchResult>();

        var results = searchResult.Search.Select(m => new MediaSearchResult
        {
            Id = m.ImdbID ?? "",
            Title = m.Title ?? "",
            Year = m.Year ?? "",
            Type = m.Type ?? "movie",
            PosterUrl = m.Poster ?? ""
        });

        if (!string.IsNullOrEmpty(mediaType))
        {
            results = results.Where(r => r.Type.Equals(mediaType, StringComparison.OrdinalIgnoreCase));
        }

        return results.ToList();
    }

    public async Task<MediaSearchResult?> GetByIdAsync(string id)
    {
        var apiKey = _config["OMDB_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
            return null;

        var response = await _client.GetAsync(
            $"http://www.omdbapi.com/?apikey={apiKey}&i={id}&plot=full"
        );

        if (!response.IsSuccessStatusCode)
            return null;

        var json = await response.Content.ReadAsStringAsync();
        var media = JsonSerializer.Deserialize<MediaResponse>(json);

        if (media == null || media.Response == "False")
            return null;

        return new MediaSearchResult
        {
            Id = media.ImdbID ?? "",
            Title = media.Title ?? "",
            Year = media.Year ?? "",
            Type = media.Type ?? "movie",
            PosterUrl = media.Poster ?? "",
            Plot = media.Plot,
            Genre = media.Genre,
            Rating = double.TryParse(media.ImdbRating, out var r) ? r : null
        };
    }
}

public class OmdbSearchResponse
{
    [JsonPropertyName("Search")]
    public List<OmdbMovieShort> Search { get; set; } = new();

    [JsonPropertyName("totalResults")]
    public string? TotalResults { get; set; }

    [JsonPropertyName("Response")]
    public string Response { get; set; } = "False";
}

public class OmdbMovieShort
{
    [JsonPropertyName("Title")]
    public string? Title { get; set; }

    [JsonPropertyName("Year")]
    public string? Year { get; set; }

    [JsonPropertyName("imdbID")]
    public string? ImdbID { get; set; }

    [JsonPropertyName("Type")]
    public string? Type { get; set; }

    [JsonPropertyName("Poster")]
    public string? Poster { get; set; }
}

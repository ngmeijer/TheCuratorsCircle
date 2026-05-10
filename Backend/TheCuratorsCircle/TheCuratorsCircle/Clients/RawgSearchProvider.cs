using System.Text.Json;
using System.Text.Json.Serialization;

namespace TheCuratorsCircle.Clients;

public class RawgSearchResponse
{
    [JsonPropertyName("count")]
    public int Count { get; set; }

    [JsonPropertyName("next")]
    public string? Next { get; set; }

    [JsonPropertyName("previous")]
    public string? Previous { get; set; }

    [JsonPropertyName("results")]
    public List<RawgGame> Results { get; set; } = new();
}

public class RawgGame
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("slug")]
    public string Slug { get; set; } = "";

    [JsonPropertyName("name")]
    public string Name { get; set; } = "";

    [JsonPropertyName("released")]
    public string? Released { get; set; }

    [JsonPropertyName("background_image")]
    public string? BackgroundImage { get; set; }

    [JsonPropertyName("rating")]
    public double Rating { get; set; }

    [JsonPropertyName("rating_top")]
    public int RatingTop { get; set; }

    [JsonPropertyName("ratings_count")]
    public int RatingsCount { get; set; }

    [JsonPropertyName("metacritic")]
    public int? Metacritic { get; set; }

    [JsonPropertyName("playtime")]
    public int Playtime { get; set; }

    [JsonPropertyName("genres")]
    public List<RawgGenre> Genres { get; set; } = new();

    [JsonPropertyName("platforms")]
    public List<RawgPlatformWrapper> Platforms { get; set; } = new();

    [JsonPropertyName("short_screenshots")]
    public List<RawgScreenshot> ShortScreenshots { get; set; } = new();
}

public class RawgGenre
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = "";

    [JsonPropertyName("slug")]
    public string Slug { get; set; } = "";
}

public class RawgPlatformWrapper
{
    [JsonPropertyName("platform")]
    public RawgPlatform Platform { get; set; } = new();
}

public class RawgPlatform
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = "";

    [JsonPropertyName("slug")]
    public string Slug { get; set; } = "";
}

public class RawgScreenshot
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("image")]
    public string Image { get; set; } = "";
}

public class RawgSearchProvider : IMediaSearchProvider
{
    private readonly HttpClient _client;
    private readonly IConfiguration _config;

    public string MediaType => "game";

    public RawgSearchProvider(HttpClient client, IConfiguration config)
    {
        _client = client;
        _config = config;
    }

    public async Task<List<MediaSearchResult>> SearchAsync(string query, string? mediaType = null)
    {
        var apiKey = _config["RAWG_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
            return new List<MediaSearchResult>();

        var response = await _client.GetAsync(
            $"https://api.rawg.io/api/games?key={apiKey}&search={Uri.EscapeDataString(query)}&page_size=20"
        );

        if (!response.IsSuccessStatusCode)
            return new List<MediaSearchResult>();

        var json = await response.Content.ReadAsStringAsync();
        var searchResult = JsonSerializer.Deserialize<RawgSearchResponse>(json);

        if (searchResult?.Results == null)
            return new List<MediaSearchResult>();

        return searchResult.Results.Select(g => new MediaSearchResult
        {
            Id = g.Id.ToString(),
            Title = g.Name,
            Year = g.Released?.Split('-').FirstOrDefault() ?? "",
            Type = "game",
            PosterUrl = g.BackgroundImage ?? "",
            Genre = g.Genres.FirstOrDefault()?.Name,
            Rating = g.Rating
        }).ToList();
    }

    public async Task<MediaSearchResult?> GetByIdAsync(string id)
    {
        var apiKey = _config["RAWG_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
            return null;

        var response = await _client.GetAsync(
            $"https://api.rawg.io/api/games/{id}?key={apiKey}"
        );

        if (!response.IsSuccessStatusCode)
            return null;

        var json = await response.Content.ReadAsStringAsync();
        var game = JsonSerializer.Deserialize<RawgGame>(json);

        if (game == null)
            return null;

        return new MediaSearchResult
        {
            Id = game.Id.ToString(),
            Title = game.Name,
            Year = game.Released?.Split('-').FirstOrDefault() ?? "",
            Type = "game",
            PosterUrl = game.BackgroundImage ?? "",
            Genre = string.Join(", ", game.Genres.Select(g => g.Name)),
            Rating = game.Rating
        };
    }
}

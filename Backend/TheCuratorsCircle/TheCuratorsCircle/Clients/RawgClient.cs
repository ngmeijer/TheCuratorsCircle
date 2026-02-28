using System.Text.Json;
using System.Text.Json.Serialization;

namespace TheCuratorsCircle.Clients;

public class RawgClient
{
    private readonly HttpClient _client;
    private readonly IConfiguration _config;

    public RawgClient(HttpClient client, IConfiguration config)
    {
        _client = client;
        _config = config;
    }

    public async Task<List<RawgGame>> SearchGamesAsync(string query)
    {
        var apiKey = _config["RAWG_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
            return new List<RawgGame>();

        var response = await _client.GetAsync(
            $"https://api.rawg.io/api/games?key={apiKey}&search={Uri.EscapeDataString(query)}&page_size=20"
        );

        if (!response.IsSuccessStatusCode)
            return new List<RawgGame>();

        var json = await response.Content.ReadAsStringAsync();
        var searchResult = JsonSerializer.Deserialize<RawgSearchResponse>(json);

        if (searchResult?.Results == null)
            return new List<RawgGame>();

        return searchResult.Results;
    }

    public async Task<RawgGame?> GetGameByIdAsync(string id)
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
        return JsonSerializer.Deserialize<RawgGame>(json);
    }
}

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

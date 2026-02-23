using System.Text.Json;
using System.Text.Json.Serialization;

namespace TheCuratorsCircle.Clients;

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

    public async Task<List<MediaSearchResult>> SearchAsync(string query)
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

using System.Text.Json;
using System.Text.Json.Serialization;
using TheCuratorsCircle.Models.Media;

namespace TheCuratorsCircle.Clients;

public class OmdbClient
{
    private HttpClient _client;
    private readonly IConfiguration _config;
    
    public OmdbClient(HttpClient client, IConfiguration config)
    {
        _client = client;
        _config = config;
    }
    
    public async Task<MediaResponse?> FetchMediaAsync(string title)
    {
        var apiKey = _config["OMDB_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
            return null;

        var response = await _client.GetAsync(
            $"http://www.omdbapi.com/?apikey={apiKey}&t={Uri.EscapeDataString(title)}"
        );

        if (!response.IsSuccessStatusCode)
            return null;

        var json = await response.Content.ReadAsStringAsync();

        var media = JsonSerializer.Deserialize<MediaResponse>(json);

        if (media == null || media.Response == "False")
            return null;

        return media;
    }

    public async Task<List<MediaResponse>> SearchMediaAsync(string query)
    {
        var apiKey = _config["OMDB_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
            return new List<MediaResponse>();

        var response = await _client.GetAsync(
            $"http://www.omdbapi.com/?apikey={apiKey}&s={Uri.EscapeDataString(query)}"
        );

        if (!response.IsSuccessStatusCode)
            return new List<MediaResponse>();

        var json = await response.Content.ReadAsStringAsync();

        var searchResult = JsonSerializer.Deserialize<MediaSearchResponse>(json);

        if (searchResult == null || searchResult.Response == "False" || searchResult.Search == null)
            return new List<MediaResponse>();

        return searchResult.Search;
    }
}

public class MediaSearchResponse
{
    [JsonPropertyName("Search")]
    public List<MediaResponse>? Search { get; set; }

    [JsonPropertyName("totalResults")]
    public string? TotalResults { get; set; }

    [JsonPropertyName("Response")]
    public string Response { get; set; }
}

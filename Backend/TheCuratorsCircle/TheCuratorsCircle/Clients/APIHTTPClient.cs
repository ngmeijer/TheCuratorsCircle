using System.Text.Json;
using TheCuratorsCircle.Models.Media;

namespace TheCuratorsCircle.Clients;

public class APIHTTPClient
{
    private HttpClient _client;
    private readonly IConfiguration _config;
    
    public APIHTTPClient(HttpClient client, IConfiguration config)
    {
        _client = client;
        _config = config;
    }
    
    public async Task<MovieResponse?> FetchMoviePostAsync(string movieName)
    {
        var apiKey = _config["OMDB_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
            return null;

        var response = await _client.GetAsync(
            $"http://www.omdbapi.com/?apikey={apiKey}&t={Uri.EscapeDataString(movieName)}"
        );

        if (!response.IsSuccessStatusCode)
            return null;

        var json = await response.Content.ReadAsStringAsync();

        var omdbMovie = JsonSerializer.Deserialize<MovieResponse>(json);

        if (omdbMovie == null || omdbMovie.Response == "False")
            return null;

        return omdbMovie;
    }
}
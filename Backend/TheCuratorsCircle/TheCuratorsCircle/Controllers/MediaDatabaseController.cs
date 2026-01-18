using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using TheCuratorsCircle.Mappers;
using TheCuratorsCircle.Models.Media;

namespace TheCuratorsCircle.Controllers;

[ApiController]
[Route("media")]
public class MediaDatabaseController : ControllerBase
{
    private readonly IHttpClientFactory _clientFactory;
    private readonly IConfiguration _config;
    private HttpClient _client;
    
    public MediaDatabaseController(IHttpClientFactory clientFactory, IConfiguration config) 
    {
        _clientFactory =  clientFactory;
        _config = config;
        _client = _clientFactory.CreateClient();
    }

    [HttpGet("movie")]
    public async Task<IActionResult> GetMovie([FromQuery] MovieRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Invalid data, and movie name field cannot be empty." });

        try
        {
            var apiKey = _config["OMDB_API_KEY"];
            if (string.IsNullOrEmpty(apiKey))
                return StatusCode(500, new { message = "OMDB API key is missing." });

            // Use await, not .Result
            var response = await _client.GetAsync($"http://www.omdbapi.com/?apikey={apiKey}&t={Uri.EscapeDataString(request.MovieName)}");
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();

            // Deserialize as a single movie
            var omdbMovie = JsonSerializer.Deserialize<MovieResponse>(json);

            if (omdbMovie == null || omdbMovie.Response == "False")
                return NotFound(new { message = "Movie not found" });

            // Map to your PostDto
            var post = MovieToPostMapper.MapToPost(omdbMovie);

            return Ok(new[] { post }); // return an array for FlatList
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    
    public class OmdbSearchResult
    {
        [JsonPropertyName("Search")]
        public List<MovieResponse> Search { get; set; }

        public string TotalResults { get; set; }
        public string Response { get; set; }
    }
}
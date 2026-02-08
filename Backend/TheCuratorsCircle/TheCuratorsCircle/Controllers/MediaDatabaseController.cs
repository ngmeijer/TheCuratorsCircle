using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using TheCuratorsCircle.Mappers;
using TheCuratorsCircle.Models.Content;
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
    public async Task<IActionResult> GetMovieData([FromQuery] MovieRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Invalid data." });

        var post = await FetchMoviePostAsync(request.MovieName);

        if (post == null)
            return NotFound(new { message = "Movie not found" });

        return Ok(new[] { post });
    }

    
    [HttpGet("collections")]
    public async Task<IActionResult> GetCollections()
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Invalid data, and movie name field cannot be empty." });

        var storedCollections = new[]
        {
            new CollectionEntity()
            {
                Name = "Star Wars",
                Category = "Movies",
                ItemIDs = 
                [
                    "Star Wars: Episode IV - A New Hope",
                    "Star Wars: Episode V - The Empire Strikes Back",
                    "Star Wars: Episode VI - Return of the Jedi",
                    "Star Wars: Episode III - Revenge of the Sith",
                ]
            },
            new CollectionEntity()
            {
                Name = "Lord of the Rings",
                Category = "Movies",
                ItemIDs = 
                [
                    "The Lord of the Rings: The Fellowship of the Ring",
                    "The Lord of the Rings: The Two Towers",
                    "The Lord of the Rings: The Return of the King",
                ]
            }
        };
        
        try
        {
            List<CollectionDto> collections = new List<CollectionDto>();
            foreach (var collection in storedCollections)
            {
                CollectionDto collectionDto = new();
                List<MovieDto> movieDtos = new List<MovieDto>();
                
                //Collect data about all movies in the collection
                foreach (string itemTitle in collection.ItemIDs)
                {
                    //Get specific movie data
                    MovieResponse data = await FetchMoviePostAsync(itemTitle);
                    if(data == null)
                        continue;

                    //If data retrieved, map to DTO
                    MovieDto dto = Mapper.MapToDto(data);
                    movieDtos.Add(dto);
                }
                
                collectionDto.Category = collection.Category;
                collectionDto.Name = collection.Name;
                collectionDto.MoviesData = movieDtos;
                collections.Add(collectionDto);
            }
            Console.WriteLine(collections);
            return Ok(collections);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("posts")]
    public async Task<IActionResult> GetPosts()
    {
        try
        {
            //This will be replaced by a database query, containing all the movie names the user has posted about.
            var movieNames = new[]
            {
                "Iron Man",
                "Nuremberg",
                "300",
                "Afterburn",
                "Prometheus",
                "Avatar"
            };

            var tasks = movieNames
                .Select(name => FetchMoviePostAsync(name));

            var results = await Task.WhenAll(tasks);

            var movieData = results
                .Where(p => p != null)
                .ToList();

            List<PostDto> posts = new List<PostDto>();
            foreach (MovieResponse response in movieData)
            {
                PostDto dto = new PostDto()
                {
                    MediaData = Mapper.MapToDto(response),
                    AspectRatio = 1,
                    Category = "Movies",
                    CommentCount = 324,
                    LikeCount = 6565,
                    ShareCount = 54,
                    Id = $"{Guid.CreateVersion7(DateTime.Now)}",
                    Name = "Test post functions"
                };
                posts.Add(dto);
            }

            return Ok(posts);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
    
    private async Task<MovieResponse?> FetchMoviePostAsync(string movieName)
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
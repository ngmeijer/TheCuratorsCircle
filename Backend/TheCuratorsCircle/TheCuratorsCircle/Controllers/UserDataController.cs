using Microsoft.AspNetCore.Mvc;
using TheCuratorsCircle.Clients;
using TheCuratorsCircle.Mappers;
using TheCuratorsCircle.Models.Content;
using TheCuratorsCircle.Models.Media;

namespace TheCuratorsCircle.Controllers;

[ApiController]
[Route("user")]
public class UserDataController : ControllerBase
{
    private APIHTTPClient _apiClient;
    private readonly PostDataSeeder _seeder;
    
    public UserDataController(APIHTTPClient apiHttpApiClient, PostDataSeeder seeder)
    {
        _apiClient = apiHttpApiClient;
        _seeder = seeder;
    }
    
    [HttpGet("posts")]
    public async Task<IActionResult> GetPosts()
    {
        try
        {
            await _seeder.SeedAsync();
            return Ok(_seeder.SeededPosts.Values.ToList());
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
    
    [HttpGet("posts/{postId}")]
    public async Task<IActionResult> GetPost(string postId)
    {
        try
        {
            var postData = _seeder.SeededPosts.TryGetValue(postId, out var post) ? post : null;
            if (postData == null)
                return NotFound();
            
            return Ok(postData);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
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
                    MovieResponse data = await _apiClient.FetchMoviePostAsync(itemTitle);
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
}
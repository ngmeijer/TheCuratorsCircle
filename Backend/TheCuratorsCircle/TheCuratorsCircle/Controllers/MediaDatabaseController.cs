using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using TheCuratorsCircle.Clients;
using TheCuratorsCircle.Mappers;
using TheCuratorsCircle.Models.Content;
using TheCuratorsCircle.Models.Media;

namespace TheCuratorsCircle.Controllers;

[ApiController]
[Route("media")]
public class MediaDatabaseController : ControllerBase
{
    private APIHTTPClient _apiClient;
    private IHttpClientFactory _clientFactory;
    
    public MediaDatabaseController(IHttpClientFactory httpClientFactory, APIHTTPClient apiHttpApiClient) 
    {
        _clientFactory = httpClientFactory;
        _apiClient = apiHttpApiClient;
    }

    [HttpGet("movie")]
    public async Task<IActionResult> GetMovieData([FromQuery] MovieRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Invalid data." });

        var post = await _apiClient.FetchMoviePostAsync(request.MovieName);

        if (post == null)
            return NotFound(new { message = "Movie not found" });

        return Ok(new[] { post });
    }
}
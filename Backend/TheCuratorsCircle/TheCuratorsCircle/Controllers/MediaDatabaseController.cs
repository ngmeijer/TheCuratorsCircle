using Microsoft.AspNetCore.Mvc;
using TheCuratorsCircle.Clients;
using TheCuratorsCircle.Models;
using TheCuratorsCircle.Models.Media;

namespace TheCuratorsCircle.Controllers;

[ApiController]
[Route("media")]
public class MediaDatabaseController : ControllerBase
{
    private readonly MediaSearchProviderFactory _providerFactory;
    private readonly ILogger<MediaDatabaseController> _logger;

    public MediaDatabaseController(MediaSearchProviderFactory providerFactory, ILogger<MediaDatabaseController> logger)
    {
        _providerFactory = providerFactory;
        _logger = logger;
    }

    private IActionResult ApiError(int statusCode, string error, string? code = null)
        => StatusCode(statusCode, new ApiErrorResponse { Error = error, Code = code });

    [HttpGet("search")]
    public async Task<IActionResult> SearchMedia([FromQuery] string query, [FromQuery] string mediaType = "movie")
    {
        if (string.IsNullOrWhiteSpace(query))
            return BadRequest(new ApiErrorResponse { Error = "Query is required." });

        _logger.LogInformation("SearchMedia request - Query: {Query}, Type: {Type}", query, mediaType);

        var provider = _providerFactory.GetProvider(mediaType);

        if (provider == null)
            return BadRequest(new ApiErrorResponse { Error = $"Unsupported media type: {mediaType}" });

        var results = await provider.SearchAsync(query, mediaType);

        return Ok(results);
    }

    [HttpGet("media")]
    public async Task<IActionResult> GetMediaData([FromQuery] string id, [FromQuery] string mediaType = "movie")
    {
        if (string.IsNullOrWhiteSpace(id))
            return BadRequest(new ApiErrorResponse { Error = "ID is required." });

        _logger.LogInformation("GetMediaData request - ID: {Id}, Type: {Type}", id, mediaType);

        var provider = _providerFactory.GetProvider(mediaType);

        if (provider == null)
            return BadRequest(new ApiErrorResponse { Error = $"Unsupported media type: {mediaType}" });

        var media = await provider.GetByIdAsync(id);

        if (media == null)
            return NotFound(new ApiErrorResponse { Error = "Media not found" });

        return Ok(media);
    }
}

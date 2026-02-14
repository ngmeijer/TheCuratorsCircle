using TheCuratorsCircle.Clients;
using TheCuratorsCircle.Mappers;
using TheCuratorsCircle.Models.Content;

namespace TheCuratorsCircle.Controllers;

public class PostDataSeeder
{
    private readonly APIHTTPClient _apiClient;
    public Dictionary<string, PostDto> SeededPosts { get; private set; } = new();

    public PostDataSeeder(APIHTTPClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task SeedAsync()
    {
        // Only seed if we haven't already
        if (SeededPosts.Any()) return;

        var movieNames = new[] { "Iron Man", "300", "Avatar" };
        var tasks = movieNames.Select(name => _apiClient.FetchMoviePostAsync(name));
        var results = await Task.WhenAll(tasks);

        foreach (var response in results.Where(r => r != null))
        {
            var dto = new PostDto {
                Id = Guid.CreateVersion7().ToString(),
                Name = "Test title",
                MediaData = Mapper.MapToDto(response),
                CreatedAt = new DateTime(2026, 02, 14, 16,12,0).ToString("MM/dd/yyyy HH:mm"),
                LikeCount = 4343,
                CommentCount = 576,
                ShareCount = 65,
                Category = "Movies"
            };
            SeededPosts.TryAdd(dto.Id, dto);
        }
    }
}
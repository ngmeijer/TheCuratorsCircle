using TheCuratorsCircle.Clients;
using TheCuratorsCircle.Models.Content;

namespace TheCuratorsCircle.Controllers;

public class PostDataSeeder
{
    private readonly OmdbSearchProvider _omdbProvider;
    public Dictionary<string, PostDto> SeededPosts { get; private set; } = new();

    public PostDataSeeder(OmdbSearchProvider omdbProvider)
    {
        _omdbProvider = omdbProvider;
    }

    public async Task SeedAsync()
    {
        if (SeededPosts.Any()) return;

        var mediaNames = new[] { "Iron Man", "300", "Avatar", "Breaking Bad" };
        var tasks = mediaNames.Select(name => _omdbProvider.SearchAsync(name));
        var results = await Task.WhenAll(tasks);

        foreach (var resultList in results)
        {
            var first = resultList.FirstOrDefault();
            if (first == null) continue;

            var dto = new PostDto {
                Id = Guid.CreateVersion7().ToString(),
                Name = "Test title",
                MediaData = new MediaDto
                {
                    Title = first.Title,
                    PosterUrl = first.PosterUrl,
                    ReleaseYear = first.Year,
                    MediaType = first.Type,
                },
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

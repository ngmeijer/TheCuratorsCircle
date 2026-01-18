using TheCuratorsCircle.Models.Content;
using TheCuratorsCircle.Models.Media;

namespace TheCuratorsCircle.Mappers;

public class MovieToPostMapper
{
    public static PostDto MapToPost(MovieResponse movie)
    {
        double aspectRatio = 0.67;

        return new PostDto
        {
            Id = $"omdb-{movie.ImdbID}",
            Name = movie.Title,
            MovieTitle = movie.Title,
            Category = "Movies",
            AspectRatio = aspectRatio,
            PosterUrl = !string.IsNullOrEmpty(movie.Poster) ? movie.Poster : "https://picsum.photos/800/1200",
            LikeCount = new Random().Next(0, 5000),
            CommentCount = new Random().Next(0, 200),
            ShareCount = new Random().Next(0, 50)
        };
    }
}
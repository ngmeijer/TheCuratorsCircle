using TheCuratorsCircle.Models.Content;
using TheCuratorsCircle.Models.Media;

namespace TheCuratorsCircle.Mappers;

public class Mapper
{
    public static MovieDto MapToDto(MovieResponse response)
    {
        return new MovieDto()
        {
            Title = response.Title,
            Genre  = response.Genre,
            Plot = response.Plot,
            PosterUrl = response.Poster,
            ReleaseDate = response.Released,
            RuntimeInMinutes = response.Runtime,
            Language = response.Language
        };
    }
}
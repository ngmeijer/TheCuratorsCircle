using System.Globalization;
using TheCuratorsCircle.Models.Content;
using TheCuratorsCircle.Models.Media;

namespace TheCuratorsCircle.Mappers;

public class Mapper
{
    public static MovieDto MapToDto(MovieResponse response)
    {
        DateTime parsedDate = DateTime.ParseExact(
            response.Released,
            "dd MMM yyyy",
            CultureInfo.InvariantCulture
        );
        
        return new MovieDto()
        {
            Title = response.Title,
            Genre  = response.Genre,
            Plot = response.Plot,
            PosterUrl = response.Poster,
            ReleaseYear =  parsedDate.Year.ToString(),
            ReleaseDate = parsedDate.ToShortDateString(),
            RuntimeInMinutes = response.Runtime,
            Language = response.Language,
            Rating =  response.ImdbRating,
        };
    }
}
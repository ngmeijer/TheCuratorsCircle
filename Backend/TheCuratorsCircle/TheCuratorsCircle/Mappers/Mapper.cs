using System.Globalization;
using TheCuratorsCircle.Models.Content;
using TheCuratorsCircle.Models.Media;

namespace TheCuratorsCircle.Mappers;

public class Mapper
{
    public static MediaDto MapToDto(MediaResponse response)
    {
        DateTime parsedDate = DateTime.ParseExact(
            response.Released,
            "dd MMM yyyy",
            CultureInfo.InvariantCulture
        );
        
        return new MediaDto()
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
            Director = response.Director,
            Actors = response.Actors,
            Writer = response.Writer,
            Rated = response.Rated,
            Country = response.Country,
            Awards = response.Awards,
            BoxOffice = response.BoxOffice,
            Metascore = response.Metascore,
            ImdbVotes = response.ImdbVotes,
            MediaType = response.Type ?? "movie",
            TotalSeasons = response.TotalSeasons,
        };
    }
}
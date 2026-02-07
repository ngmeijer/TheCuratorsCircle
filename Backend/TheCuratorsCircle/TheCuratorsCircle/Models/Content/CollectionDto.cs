using TheCuratorsCircle.Models.Media;

namespace TheCuratorsCircle.Models.Content;

public class CollectionDto
{
    public string Name { get; set; }
    public string Category { get; set; }
    public List<MovieDto> MoviesData { get; set; }
}
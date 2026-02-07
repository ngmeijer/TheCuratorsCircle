using TheCuratorsCircle.Models.Media;

namespace TheCuratorsCircle.Models.Content;

public class PostDto
{
    public string Id { get; set; }
    public string Name { get; set; }
    public MovieDto MediaData { get; set; }
    public string Category { get; set; }
    public double AspectRatio { get; set; }
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public int ShareCount { get; set; }   
}

public class MovieDto
{
    public string Title { get; set; }     
    public string Genre { get; set; }
    public string Plot { get; set; }
    public string PosterUrl { get; set; }
    public DateTime ReleaseDate { get; set; }
    public string RuntimeInMinutes { get; set; }
    public string Language { get; set; }
}
using Google.Cloud.Firestore;

namespace TheCuratorsCircle.Models.Content;

[FirestoreData]
public class MediaDto
{
    public string? Title { get; set; }     
    public string? Genre { get; set; }
    public string? Plot { get; set; }
    public string? PosterUrl { get; set; }
    public string? ReleaseYear { get; set; }
    public string? ReleaseDate { get; set; }
    public string? RuntimeInMinutes { get; set; }
    public string? Language { get; set; }
    public string? Rating { get; set; }
    public string? Director { get; set; }
    public string? Actors { get; set; }
    public string? Writer { get; set; }
    public string? Rated { get; set; }
    public string? Country { get; set; }
    public string? Awards { get; set; }
    public string? BoxOffice { get; set; }
    public string? Metascore { get; set; }
    public string? ImdbVotes { get; set; }
    public string? MediaType { get; set; } = "movie";
    public string? TotalSeasons { get; set; }
}

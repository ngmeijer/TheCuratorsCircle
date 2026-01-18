namespace TheCuratorsCircle.Models.Content;

public class PostDto
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string MovieTitle { get; set; }     
    public string Category { get; set; }
    public double AspectRatio { get; set; }
    public string PosterUrl { get; set; }
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public int ShareCount { get; set; }   
}
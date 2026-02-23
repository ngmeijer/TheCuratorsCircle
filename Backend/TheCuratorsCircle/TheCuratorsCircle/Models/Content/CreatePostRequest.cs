using System.ComponentModel.DataAnnotations;

namespace TheCuratorsCircle.Models.Content;

public class CreatePostRequest
{
    [Required]
    public string ImageUrl { get; set; }

    [Required]
    public string Caption { get; set; }

    [Required]
    public string MediaType { get; set; }

    [Required]
    public string MediaId { get; set; }

    public MediaDto? MediaMetadata { get; set; }
}

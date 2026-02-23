using System.ComponentModel.DataAnnotations;

namespace TheCuratorsCircle.Models.Content;

public class CreatePostRequest
{
    [Required]
    public string Caption { get; set; }

    [Required]
    public string MediaType { get; set; }

    [Required]
    public string MediaId { get; set; }
}

using System.ComponentModel.DataAnnotations;

namespace TheCuratorsCircle.Models.Content;

public class CreatePostRequest
{
    [Required]
    public string Title { get; set; }

    public string Caption { get; set; }

    [Required]
    public string MediaType { get; set; }

    [Required]
    public string MediaId { get; set; }

    [Required]
    public string CollectionId { get; set; }
}

using System.ComponentModel.DataAnnotations;

namespace TheCuratorsCircle.Models.Content;

public class CreatePostRequest
{
    [Required]
    [StringLength(AppConstants.MaxPostTitleLength)]
    public string Title { get; set; }

    [StringLength(AppConstants.MaxPostCaptionLength)]
    public string Caption { get; set; }

    [Required]
    public string MediaType { get; set; }

    [Required]
    public string MediaId { get; set; }

    [Required]
    public string CollectionId { get; set; }
}

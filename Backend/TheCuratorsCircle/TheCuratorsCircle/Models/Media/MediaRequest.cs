using System.ComponentModel.DataAnnotations;

namespace TheCuratorsCircle.Models.Media;

public class MediaRequest
{
    [Required]
    public string Title { get; set; }
}

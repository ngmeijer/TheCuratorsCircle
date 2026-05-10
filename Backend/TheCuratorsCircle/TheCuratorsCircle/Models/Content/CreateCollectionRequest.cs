using System.ComponentModel.DataAnnotations;

namespace TheCuratorsCircle.Models.Content;

public class CreateCollectionRequest
{
    [Required]
    [StringLength(AppConstants.MaxCollectionNameLength, MinimumLength = 1)]
    public string Name { get; set; }
}

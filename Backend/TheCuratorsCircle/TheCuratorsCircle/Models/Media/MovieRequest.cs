using System.ComponentModel.DataAnnotations;

namespace TheCuratorsCircle.Models.Media;

public class MovieRequest
{
    [Required]
    public string MovieName { get; set; }
}
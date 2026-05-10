using System.ComponentModel.DataAnnotations;
using TheCuratorsCircle;

namespace Backend.Models.Profiles;

public class CreateUserProfileRequest
{
    [Required]
    [StringLength(AppConstants.MaxUsernameLength)]
    [RegularExpression(@"^@\w+$", ErrorMessage = "Username must start with @ and contain only letters, numbers, or underscores.")]
    public string Username { get; set; }

    [StringLength(AppConstants.MaxDisplayNameLength)]
    public string? DisplayName { get; set; }

    [StringLength(AppConstants.MaxBioLength)]
    public string? Bio { get; set; }
}

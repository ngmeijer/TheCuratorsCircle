using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheCuratorsCircle.Authentication;

namespace TheCuratorsCircle.Controllers;

[Authorize(AuthenticationSchemes = FirebaseAuthenticationDefaults.AuthenticationScheme)]
[ApiController]
[Route("api/[controller]")]
public class AuthenticationController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        // The authenticated user's ID (UID) is now available in the User principal.
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
        {
            // This should ideally never happen if the [Authorize] attribute worked.
            return Unauthorized();
        }

        // Returns the UID and a success message, confirming the end-to-end security works.
        return Ok(new 
        { 
            message = "Authentication successful. You are authorized.",
            uid = userId, 
            email = User.Claims.FirstOrDefault(c => c.Type == "email")?.Value
        });
    }
}
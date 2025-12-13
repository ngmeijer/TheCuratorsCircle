using System.Security.Claims;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheCuratorsCircle.Authentication;
using TheCuratorsCircle.Models;
using TheCuratorsCircle.Utilities;

namespace TheCuratorsCircle.Controllers;

[ApiController]
[Route("auth")]
public class AuthenticationController : ControllerBase
{
    private readonly FirebaseAuth _auth;

    public AuthenticationController()
    {
        _auth = FirebaseAuth.DefaultInstance;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody]LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var firebaseToken = await VerifyCredentialsWithFirebase(request.Email, request.Password);

            var jwt = JwtTokenGenerator.GenerateToken(request.Email);

            return Ok(new
            {
                token = jwt
            });
        }
        catch (Exception ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    private async Task<string> VerifyCredentialsWithFirebase(string email, string password)
    {
        using var client = new HttpClient();

        var payload = new
        {
            email,
            password,
            returnSecureToken = true
        };

        var response = await client.PostAsJsonAsync(
            "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBwcToSEZCqHamHdGZx_gcXlQmXtzXDRDk",
            payload);

        if (!response.IsSuccessStatusCode)
            throw new Exception("Invalid email or password");

        var result = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();

        return result["idToken"].ToString();
    }
}
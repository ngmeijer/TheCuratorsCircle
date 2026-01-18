using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Threading.Tasks;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
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
            return BadRequest(new { message = "Invalid data, and input fields cannot be empty."});
        }

        try
        {
            var firebaseToken = await VerifyCredentialsWithFirebase(request.Email, request.Password);

            if (firebaseToken == null)
            {
                return BadRequest(new { message = "Invalid credentials."});
            }

            var jwt = JwtTokenGenerator.GenerateToken(request.Email);

            return Ok(new
            {
                token = jwt
            });
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message});
        }
    }
    
    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody]RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Invalid data, and input fields cannot be empty."});
        }

        try
        {
            var userRecord = await _auth.CreateUserAsync(new UserRecordArgs(){Email = request.Email, Password = request.Password});
            
            var firebaseToken  = await VerifyCredentialsWithFirebase(request.Email, request.Password);

            if (firebaseToken == null)
            {
                return StatusCode(500, new {message = "Account created but failed to log in."});
            }
            
            var jwt = JwtTokenGenerator.GenerateToken(request.Email);

            return Ok(new
            {
                token = jwt
            });
        }
        catch (FirebaseAuthException ex) when (ex.AuthErrorCode == AuthErrorCode.EmailAlreadyExists)
        {
            return Conflict(new { message = "Email already in use." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
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
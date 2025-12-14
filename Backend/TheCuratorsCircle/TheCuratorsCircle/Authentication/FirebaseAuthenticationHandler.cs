using System.Security.Claims;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace TheCuratorsCircle.Authentication;

public class FirebaseAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly FirebaseAuth _firebaseAuth;

    public FirebaseAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        System.Text.Encodings.Web.UrlEncoder encoder,
        ISystemClock clock,
        FirebaseAuth firebaseAuth)
        : base(options, logger, encoder, clock)
    {
        _firebaseAuth = firebaseAuth;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // 1. Check for Authorization Header
        if (!Request.Headers.ContainsKey("Authorization"))
        {
            return AuthenticateResult.Fail("Missing Authorization Header");
        }

        // 2. Extract Token
        string authorizationHeader = Request.Headers["Authorization"]!;
        if (!authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return AuthenticateResult.Fail("Invalid Authorization Scheme");
        }

        string idToken = authorizationHeader.Substring("Bearer ".Length).Trim();
        if (string.IsNullOrEmpty(idToken))
        {
            return AuthenticateResult.Fail("Missing Token");
        }

        try
        {
            // 3. Verify Token with Firebase Admin SDK (the core validation step)
            FirebaseToken decodedToken = await _firebaseAuth.VerifyIdTokenAsync(idToken);
            
            // 4. Create Claims Identity
            // The UID (User ID) is the most important piece of information.
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, decodedToken.Uid),
                new Claim(ClaimTypes.Name, decodedToken.Uid) // Or decodedToken.Email
            };

            // Add all claims from the decoded token (useful for roles/custom claims)
            foreach (var (key, value) in decodedToken.Claims)
            {
                claims.Add(new Claim(key, value.ToString()!));
            }

            var identity = new ClaimsIdentity(claims, FirebaseAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, FirebaseAuthenticationDefaults.AuthenticationScheme);

            return AuthenticateResult.Success(ticket);
        }
        catch (Exception ex)
        {
            // Log the error (e.g., token expired, invalid signature, network failure)
            Logger.LogError(ex, "Firebase token validation failed.");
            return AuthenticateResult.Fail("Invalid Firebase Token");
        }
    }
}
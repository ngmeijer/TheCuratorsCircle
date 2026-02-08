using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;

namespace TheCuratorsCircle.Utilities;

public static class JwtTokenGenerator
{
    public static string GenerateToken(string email)
    {
        var jsonText = File.ReadAllText("./credentials.json");
        var jsonDoc = JsonDocument.Parse(jsonText);
        
        var secret = jsonDoc.RootElement.GetProperty("environmentVariables")
            .GetProperty("JWT_SECRET")
            .GetString();
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Email, email)
        };

        var token = new JwtSecurityToken(
            issuer: "TCC",
            audience: "",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
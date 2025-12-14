using Microsoft.VisualStudio.TestPlatform.TestHost;

namespace Tests.IntegrationTests;

using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

public class LoginFlowTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public LoginFlowTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient(); // in-memory server
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsJwt()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "test@gmail.com",
            Password = "testPassword"
        };
        var json = new StringContent(
            JsonSerializer.Serialize(loginRequest),
            Encoding.UTF8,
            "application/json"
        );

        // Act
        var response = await _client.PostAsync("/auth/login", json);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();

        var responseBody = await response.Content.ReadAsStringAsync();
        responseBody.Should().Contain("token"); // simple check for JWT
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        var loginRequest = new
        {
            Email = "testuser@example.com",
            Password = "wrongPassword"
        };
        var json = new StringContent(
            JsonSerializer.Serialize(loginRequest),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _client.PostAsync("/auth/login", json);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
    }
}

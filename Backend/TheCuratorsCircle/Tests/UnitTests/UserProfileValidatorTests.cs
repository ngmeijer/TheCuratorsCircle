namespace Tests.UnitTests;

using Backend.Models.Profiles;
using Backend.Validators;
using FluentAssertions;
using Xunit;

public class UserProfileValidatorTests
{
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void ValidateUsername_NullOrEmpty_ReturnsRequiredError(string? username)
    {
        var result = UserProfileValidator.ValidateUsername(username);
        result.Should().Be("Username is required");
    }

    [Fact]
    public void ValidateUsername_NoAtSymbol_ReturnsMustStartWithAtError()
    {
        var result = UserProfileValidator.ValidateUsername("testuser");
        result.Should().Be("Username must start with @");
    }

    [Fact]
    public void ValidateUsername_JustAtSymbol_ReturnsTooShortError()
    {
        var result = UserProfileValidator.ValidateUsername("@");
        result.Should().Be("Username must be at least 3 characters");
    }

    [Fact]
    public void ValidateUsername_TooLong_ReturnsTooLongError()
    {
        var longUsername = "@" + new string('a', 31);
        var result = UserProfileValidator.ValidateUsername(longUsername);
        result.Should().Be("Username must be at most 30 characters");
    }

    [Theory]
    [InlineData("@ab")]
    [InlineData("@test")]
    [InlineData("@validuser123")]
    public void ValidateUsername_ValidUsername_ReturnsNull(string username)
    {
        var result = UserProfileValidator.ValidateUsername(username);
        result.Should().BeNull();
    }

    [Fact]
    public void ValidateCreateRequest_NullRequest_ReturnsRequiredError()
    {
        var result = UserProfileValidator.ValidateCreateRequest(null);
        result.Should().Be("Username is required");
    }

    [Fact]
    public void ValidateCreateRequest_ValidRequest_ReturnsNull()
    {
        var request = new CreateUserProfileRequest
        {
            Username = "@testuser",
            DisplayName = "Test User",
            Bio = "Test bio"
        };
        
        var result = UserProfileValidator.ValidateCreateRequest(request);
        result.Should().BeNull();
    }

    [Fact]
    public void ValidateUpdateRequest_NullRequest_ReturnsError()
    {
        var result = UserProfileValidator.ValidateUpdateRequest(null, "@oldusername");
        result.Should().Be("Request is required");
    }

    [Fact]
    public void ValidateUpdateRequest_SameUsername_ReturnsSameError()
    {
        var request = new UpdateUserProfileRequest { Username = "@sameuser" };
        var result = UserProfileValidator.ValidateUpdateRequest(request, "@sameuser");
        result.Should().Be("Username is the same as current");
    }

    [Fact]
    public void ValidateUpdateRequest_DifferentValidUsername_ReturnsNull()
    {
        var request = new UpdateUserProfileRequest { Username = "@newusername" };
        var result = UserProfileValidator.ValidateUpdateRequest(request, "@oldusername");
        result.Should().BeNull();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("a")]
    public void IsValidSearchQuery_InvalidQuery_ReturnsFalse(string? query)
    {
        UserProfileValidator.IsValidSearchQuery(query).Should().BeFalse();
    }

    [Theory]
    [InlineData("ab")]
    [InlineData("test")]
    [InlineData("valid query")]
    public void IsValidSearchQuery_ValidQuery_ReturnsTrue(string query)
    {
        UserProfileValidator.IsValidSearchQuery(query).Should().BeTrue();
    }
}

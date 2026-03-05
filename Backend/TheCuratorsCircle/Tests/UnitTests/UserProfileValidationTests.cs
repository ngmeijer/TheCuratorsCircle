namespace Tests.UnitTests;

using Backend.Models.Profiles;
using FluentAssertions;
using Xunit;

public class UserProfileValidationTests
{
    [Theory]
    [InlineData(null, "Username is required")]
    [InlineData("", "Username is required")]
    public void CreateRequest_ValidatesUsername(string username, string expectedError)
    {
        var request = new CreateUserProfileRequest
        {
            Username = username,
            DisplayName = "Test"
        };

        string error = null;
        if (string.IsNullOrEmpty(request.Username))
            error = "Username is required";
        else if (!request.Username.StartsWith("@"))
            error = "Username must start with @";

        error.Should().Be(expectedError);
    }

    [Theory]
    [InlineData("noatsymbol")]
    [InlineData("testuser")]
    [InlineData("123")]
    public void CreateRequest_UsernameWithoutAtSymbol_Fails(string username)
    {
        var request = new CreateUserProfileRequest
        {
            Username = username,
            DisplayName = "Test"
        };

        string error = null;
        if (string.IsNullOrEmpty(request.Username))
            error = "Username is required";
        else if (!request.Username.StartsWith("@"))
            error = "Username must start with @";

        error.Should().Be("Username must start with @");
    }

    [Fact]
    public void CreateRequest_ValidUsername_PassesValidation()
    {
        var request = new CreateUserProfileRequest
        {
            Username = "@validuser",
            DisplayName = "Test"
        };

        string error = null;
        if (string.IsNullOrEmpty(request.Username))
            error = "Username is required";
        else if (!request.Username.StartsWith("@"))
            error = "Username must start with @";

        error.Should().BeNull();
    }

    [Fact]
    public void UserProfile_DefaultIsPublic_IsTrue()
    {
        var profile = new UserProfile();
        profile.IsPublic.Should().BeTrue();
    }

    [Fact]
    public void UserProfile_UsernamesHistory_DefaultsToEmpty()
    {
        var profile = new UserProfile();
        profile.UsernamesHistory.Should().NotBeNull();
        profile.UsernamesHistory.Should().BeEmpty();
    }
}

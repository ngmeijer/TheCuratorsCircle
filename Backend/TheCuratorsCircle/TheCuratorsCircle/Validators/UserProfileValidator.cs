namespace Backend.Validators;

using Backend.Models.Profiles;

public static class UserProfileValidator
{
    public static string? ValidateUsername(string? username)
    {
        if (string.IsNullOrEmpty(username))
            return "Username is required";
        
        if (!username.StartsWith("@"))
            return "Username must start with @";
        
        if (username.Length < 3)
            return "Username must be at least 3 characters";
        
        if (username.Length > 30)
            return "Username must be at most 30 characters";
        
        return null;
    }

    public static string? ValidateCreateRequest(CreateUserProfileRequest request)
    {
        return ValidateUsername(request?.Username);
    }

    public static string? ValidateUpdateRequest(UpdateUserProfileRequest request, string currentUsername)
    {
        if (request == null)
            return "Request is required";
        
        if (!string.IsNullOrEmpty(request.Username))
        {
            var usernameError = ValidateUsername(request.Username);
            if (usernameError != null)
                return usernameError;
            
            if (request.Username == currentUsername)
                return "Username is the same as current";
        }
        
        return null;
    }

    public static bool IsValidSearchQuery(string? query)
    {
        return !string.IsNullOrWhiteSpace(query) && query.Length >= 2;
    }
}

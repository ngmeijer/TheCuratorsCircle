using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authentication;

namespace TheCuratorsCircle.Authentication;

public static class FirebaseAuthenticationExtensions
{
    public static WebApplicationBuilder AddFirebaseAuthentication(this WebApplicationBuilder builder)
    {
        // IMPORTANT: Replace this with your actual project ID from the Firebase console.
        const string firebaseProjectId = "your-firebase-project-id-here"; 

        // 1. Initialize Firebase Admin SDK
        // This relies on the environment variable GOOGLE_APPLICATION_CREDENTIALS 
        // pointing to your downloaded service account JSON file.
        var app = FirebaseApp.Create(new AppOptions()
        {
            ProjectId = firebaseProjectId
            // If you can't use the environment variable, you must load the credentials file here.
        });

        // 2. Register FirebaseAuth as a Singleton
        builder.Services.AddSingleton(FirebaseAuth.GetAuth(app));

        // 3. Configure Authentication Pipeline
        builder.Services
            .AddAuthentication(options =>
            {
                // Set the default scheme to our custom Firebase handler
                options.DefaultAuthenticateScheme = FirebaseAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = FirebaseAuthenticationDefaults.AuthenticationScheme;
            })
            // 4. Add the custom handler to the pipeline
            .AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>(
                FirebaseAuthenticationDefaults.AuthenticationScheme, options => { });

        return builder;
    }
}
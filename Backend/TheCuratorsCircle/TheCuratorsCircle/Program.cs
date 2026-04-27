using System;
using System.Security.Claims;
using System.Threading.RateLimiting;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.DependencyInjection;
using TheCuratorsCircle.Clients;
using TheCuratorsCircle.Controllers;
using TheCuratorsCircle.Authentication;
using Backend.Services;
using TheCuratorsCircle.Repositories;

var builder = WebApplication.CreateBuilder(args);

// GOOGLE_APPLICATION_CREDENTIALS must be set externally (shell, Docker env, cloud ADC).
// For local dev: export GOOGLE_APPLICATION_CREDENTIALS=/path/to/firebase_creds.json
if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS")))
{
    throw new InvalidOperationException(
        "GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. " +
        "See .env.example in the Backend root for setup instructions.");
}

if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("FIREBASE_WEB_API_KEY")))
{
    throw new InvalidOperationException("FIREBASE_WEB_API_KEY environment variable is not set");
}

builder.Configuration["Firebase:WebApiKey"] = Environment.GetEnvironmentVariable("FIREBASE_WEB_API_KEY");
builder.Services.AddSingleton(FirebaseApp.Create());
builder.Services.AddSingleton(FirebaseAuth.DefaultInstance);
builder.Services.AddSingleton(FirestoreDb.Create("the-curator-s-circle"));

builder.Services.AddSingleton<IUserProfileService, UserProfileService>();
builder.Services.AddSingleton<IFollowService, FollowService>();
builder.Services.AddSingleton<ICollectionRepository, FirestoreCollectionRepository>();

builder.Services.AddHttpClient<APIHTTPClient>();
builder.Services.AddHttpClient<RawgClient>();
builder.Services.AddHttpClient<OmdbSearchProvider>();
builder.Services.AddHttpClient<RawgSearchProvider>();
builder.Services.AddSingleton<OmdbSearchProvider>();
builder.Services.AddSingleton<RawgSearchProvider>();
builder.Services.AddSingleton<MediaSearchProviderFactory>();
builder.Services.AddSingleton<FirestoreClient>();
builder.Services.AddSingleton<PostDataSeeder>();

builder.Services.AddAuthentication(FirebaseAuthenticationDefaults.AuthenticationScheme)
    .AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>(
        FirebaseAuthenticationDefaults.AuthenticationScheme,
        null);

// CORS — allowed origins are configured per environment in appsettings.json
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Rate limiting — global: 100 req/min per IP; write: 10 req/min per IP
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<Microsoft.AspNetCore.Http.HttpContext, string>(ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = builder.Configuration.GetValue("RateLimiting:GlobalPermitLimit", 100),
                Window = TimeSpan.FromSeconds(builder.Configuration.GetValue("RateLimiting:GlobalWindowSeconds", 60))
            }));

    options.AddFixedWindowLimiter("write", o =>
    {
        o.AutoReplenishment = true;
        o.PermitLimit = builder.Configuration.GetValue("RateLimiting:WritePermitLimit", 10);
        o.Window = TimeSpan.FromSeconds(builder.Configuration.GetValue("RateLimiting:WriteWindowSeconds", 60));
        o.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        o.QueueLimit = 0;
    });

    options.RejectionStatusCode = 429;
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();

public partial class Program { }

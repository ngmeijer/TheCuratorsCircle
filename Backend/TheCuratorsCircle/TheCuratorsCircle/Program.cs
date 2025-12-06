using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using TheCuratorsCircle.Authentication;

var builder = WebApplication.CreateBuilder(args);

Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", @"./firebase_creds.json");
builder.Services.AddSingleton(FirebaseApp.Create());

builder.Services.AddControllers(); 

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
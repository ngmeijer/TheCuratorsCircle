using System;
using FirebaseAdmin;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using TheCuratorsCircle.Clients;
using TheCuratorsCircle.Controllers;

var builder = WebApplication.CreateBuilder(args);

Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", @"./firebase_creds.json");
builder.Services.AddSingleton(FirebaseApp.Create());

builder.Services.AddHttpClient<APIHTTPClient>();
builder.Services.AddHttpClient<RawgClient>();
builder.Services.AddHttpClient<OmdbSearchProvider>();
builder.Services.AddHttpClient<RawgSearchProvider>();
builder.Services.AddSingleton<OmdbSearchProvider>();
builder.Services.AddSingleton<RawgSearchProvider>();
builder.Services.AddSingleton<MediaSearchProviderFactory>();
builder.Services.AddSingleton<FirestoreClient>();
builder.Services.AddSingleton<PostDataSeeder>();
builder.Services.AddControllers();

var app = builder.Build();


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();

public partial class Program { }
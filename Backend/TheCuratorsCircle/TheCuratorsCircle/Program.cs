using TheCuratorsCircle.Authentication;

var builder = WebApplication.CreateBuilder(args);

builder.AddFirebaseAuthentication(); 
builder.Services.AddControllers(); 

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
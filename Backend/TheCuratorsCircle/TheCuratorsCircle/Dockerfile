FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["TheCuratorsCircle/TheCuratorsCircle.csproj", "TheCuratorsCircle/"]
RUN dotnet restore "TheCuratorsCircle/TheCuratorsCircle.csproj"
COPY . .
WORKDIR "/src/TheCuratorsCircle"
RUN dotnet build "TheCuratorsCircle.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TheCuratorsCircle.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TheCuratorsCircle.dll"]

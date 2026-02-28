namespace TheCuratorsCircle.Clients;

public class MediaSearchProviderFactory
{
    private readonly OmdbSearchProvider _omdbProvider;
    private readonly RawgSearchProvider _rawgProvider;

    public MediaSearchProviderFactory(OmdbSearchProvider omdbProvider, RawgSearchProvider rawgProvider)
    {
        _omdbProvider = omdbProvider;
        _rawgProvider = rawgProvider;
    }

    public IMediaSearchProvider? GetProvider(string mediaType)
    {
        return mediaType.ToLower() switch
        {
            "movie" or "series" => _omdbProvider,
            "game" => _rawgProvider,
            _ => null
        };
    }
}

using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using TheCuratorsCircle.Clients;
using Xunit;
using System.Net.Http;

namespace Tests.IntegrationTests
{
    public class MediaProviderFactoryTests
    {
        [Fact]
        public void MovieReturnsOmdbProvider()
        {
            var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string>{{"OMDB_API_KEY","x"}}).Build();
            var omdb = new OmdbSearchProvider(new HttpClient(), config);
            var rawg = new RawgSearchProvider(new HttpClient(), new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string>{{"RAWG_API_KEY","x"}}).Build());
            var factory = new MediaSearchProviderFactory(omdb, rawg);
            var prov = factory.GetProvider("movie");
            Assert.NotNull(prov);
            Assert.IsType<OmdbSearchProvider>(prov);
        }

        [Fact]
        public void GameReturnsRawgProvider()
        {
            var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string>{{"OMDB_API_KEY","x"}}).Build();
            var omdb = new OmdbSearchProvider(new HttpClient(), config);
            var rawg = new RawgSearchProvider(new HttpClient(), new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string>{{"RAWG_API_KEY","x"}}).Build());
            var factory = new MediaSearchProviderFactory(omdb, rawg);
            var prov = factory.GetProvider("game");
            Assert.NotNull(prov);
            Assert.IsType<RawgSearchProvider>(prov);
        }

        [Fact]
        public void UnknownTypeReturnsNull()
        {
            var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string>{{"OMDB_API_KEY","x"}}).Build();
            var omdb = new OmdbSearchProvider(new HttpClient(), config);
            var rawg = new RawgSearchProvider(new HttpClient(), new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string>{{"RAWG_API_KEY","x"}}).Build());
            var factory = new MediaSearchProviderFactory(omdb, rawg);
            var prov = factory.GetProvider("book");
            Assert.Null(prov);
        }
    }
}

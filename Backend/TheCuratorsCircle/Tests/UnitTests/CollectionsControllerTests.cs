namespace Tests.UnitTests;

using System.Security.Claims;
using FluentAssertions;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using TheCuratorsCircle.Controllers;
using TheCuratorsCircle.Clients;
using TheCuratorsCircle.Models.Content;
using TheCuratorsCircle.Repositories;
using Backend.Services;
using Backend.Models.Profiles;
using Xunit;

public class CollectionsControllerTests
{
    private readonly Mock<ICollectionRepository> _mockRepository;
    private readonly Mock<IUserProfileService> _mockProfileService;
    private readonly Mock<ILogger<CollectionsController>> _mockLogger;
    private readonly Mock<MediaSearchProviderFactory> _mockProviderFactory;
    private readonly CollectionsController _controller;

    public CollectionsControllerTests()
    {
        _mockRepository = new Mock<ICollectionRepository>();
        _mockProfileService = new Mock<IUserProfileService>();
        _mockLogger = new Mock<ILogger<CollectionsController>>();
        var mockOmdbProvider = new Mock<OmdbSearchProvider>(new HttpClient(), Mock.Of<IConfiguration>());
        var mockRawgProvider = new Mock<RawgSearchProvider>(new HttpClient(), Mock.Of<IConfiguration>());
        _mockProviderFactory = new Mock<MediaSearchProviderFactory>(mockOmdbProvider.Object, mockRawgProvider.Object);

        _controller = new CollectionsController(
            _mockRepository.Object,
            _mockLogger.Object,
            _mockProviderFactory.Object,
            _mockProfileService.Object
        );

        // Setup ClaimsPrincipal with test user
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, "test-owner-uid")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };
    }

    [Fact]
    public async Task GetCollections_WhenNoUserIdProvided_ReturnsCurrentUserCollections()
    {
        // Arrange
        var persistentId = "test-persistent-id";
        var ownerUid = "test-owner-uid";

        var profile = new UserProfile
        {
            PersistentId = persistentId,
            OwnerUid = ownerUid,
            UsernamesHistory = new List<string> { "@testuser" },
            DisplayName = "Test User"
        };

        _mockProfileService
            .Setup(s => s.GetByOwnerUidAsync(ownerUid))
            .ReturnsAsync(profile);

        var collections = new List<CollectionEntity>
        {
            new CollectionEntity { Id = "1", UserId = persistentId, Name = "Collection 1", ItemIds = Array.Empty<string>(), CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow) }
        };

        _mockRepository
            .Setup(r => r.GetCollectionsByUserIdAsync(persistentId))
            .ReturnsAsync(collections);

        // Act
        var result = await _controller.GetCollections();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<List<CollectionResponse>>().Subject;
        response.Should().HaveCount(1);
        response[0].UserId.Should().Be(persistentId);

        _mockRepository.Verify(r => r.GetCollectionsByUserIdAsync(persistentId), Times.Once);
    }

    [Fact]
    public async Task GetCollections_WhenUserIdProvided_ReturnsFilteredCollections()
    {
        // Arrange
        var targetUserId = "other-user-id";

        var collections = new List<CollectionEntity>
        {
            new CollectionEntity { Id = "1", UserId = targetUserId, Name = "Other's Collection", ItemIds = Array.Empty<string>(), CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow) }
        };

        _mockRepository
            .Setup(r => r.GetCollectionsByUserIdAsync(targetUserId))
            .ReturnsAsync(collections);

        // Act
        var result = await _controller.GetCollections(targetUserId);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<List<CollectionResponse>>().Subject;
        response.Should().HaveCount(1);
        response[0].UserId.Should().Be(targetUserId);

        _mockRepository.Verify(r => r.GetCollectionsByUserIdAsync(targetUserId), Times.Once);
    }

    [Fact]
    public async Task GetCollections_ReturnsCollectionsOrderedByCreatedAtDescending()
    {
        // Arrange
        var persistentId = "test-persistent-id";
        var ownerUid = "test-owner-uid";

        var profile = new UserProfile
        {
            PersistentId = persistentId,
            OwnerUid = ownerUid,
            UsernamesHistory = new List<string> { "@testuser" },
            DisplayName = "Test User"
        };

        _mockProfileService
            .Setup(s => s.GetByOwnerUidAsync(ownerUid))
            .ReturnsAsync(profile);

        var collections = new List<CollectionEntity>
        {
            new CollectionEntity { Id = "1", UserId = persistentId, Name = "Old", ItemIds = Array.Empty<string>(), CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow.AddDays(-2)) },
            new CollectionEntity { Id = "2", UserId = persistentId, Name = "New", ItemIds = Array.Empty<string>(), CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow) }
        };

        _mockRepository
            .Setup(r => r.GetCollectionsByUserIdAsync(persistentId))
            .ReturnsAsync(collections);

        // Act
        var result = await _controller.GetCollections();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<List<CollectionResponse>>().Subject;
        response.Should().HaveCount(2);
        response[0].Name.Should().Be("New"); // Most recent first
        response[1].Name.Should().Be("Old");
    }

    [Fact]
    public async Task CreateCollection_UsesPersistentIdNotOwnerUid()
    {
        // Arrange
        var persistentId = "test-persistent-id";
        var ownerUid = "test-owner-uid";

        var profile = new UserProfile
        {
            PersistentId = persistentId,
            OwnerUid = ownerUid,
            UsernamesHistory = new List<string> { "@testuser" },
            DisplayName = "Test User"
        };

        _mockProfileService
            .Setup(s => s.GetByOwnerUidAsync(ownerUid))
            .ReturnsAsync(profile);

        _mockRepository
            .Setup(r => r.CreateCollectionAsync(It.IsAny<CollectionEntity>()))
            .ReturnsAsync((CollectionEntity c) => c);

        var request = new CreateCollectionRequest { Name = "Test Collection" };

        // Act
        var result = await _controller.CreateCollection(request);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<CollectionEntity>().Subject;
        response.UserId.Should().Be(persistentId); // Should use persistentId, not ownerUid
        response.Name.Should().Be("Test Collection");

        _mockRepository.Verify(r => r.CreateCollectionAsync(
            It.Is<CollectionEntity>(c => c.UserId == persistentId && c.Name == "Test Collection")
        ), Times.Once);
    }

    [Fact]
    public async Task GetCollection_WhenCollectionNotFound_ReturnsNotFound()
    {
        // Arrange
        var persistentId = "test-persistent-id";
        var ownerUid = "test-owner-uid";

        var profile = new UserProfile
        {
            PersistentId = persistentId,
            OwnerUid = ownerUid,
            UsernamesHistory = new List<string> { "@testuser" },
            DisplayName = "Test User"
        };

        _mockProfileService
            .Setup(s => s.GetByOwnerUidAsync(ownerUid))
            .ReturnsAsync(profile);

        _mockRepository
            .Setup(r => r.GetCollectionByIdAsync("non-existent-id"))
            .ReturnsAsync((CollectionEntity?)null);

        // Act
        var result = await _controller.GetCollection("non-existent-id");

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task GetCollection_WhenCollectionOwnedByDifferentUser_ReturnsForbid()
    {
        // Arrange
        var persistentId = "test-persistent-id";
        var ownerUid = "test-owner-uid";

        var profile = new UserProfile
        {
            PersistentId = persistentId,
            OwnerUid = ownerUid,
            UsernamesHistory = new List<string> { "@testuser" },
            DisplayName = "Test User"
        };

        _mockProfileService
            .Setup(s => s.GetByOwnerUidAsync(ownerUid))
            .ReturnsAsync(profile);

        var collection = new CollectionEntity
        {
            Id = "collection-id",
            UserId = "other-user-id", // Different from persistentId
            Name = "Other User's Collection",
            ItemIds = Array.Empty<string>(),
            CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow)
        };

        _mockRepository
            .Setup(r => r.GetCollectionByIdAsync("collection-id"))
            .ReturnsAsync(collection);

        // Act
        var result = await _controller.GetCollection("collection-id");

        // Assert
        result.Should().BeOfType<ForbidResult>();
    }

    [Fact]
    public async Task GetCollection_WhenCollectionOwnedByCurrentUser_ReturnsOk()
    {
        // Arrange
        var persistentId = "test-persistent-id";
        var ownerUid = "test-owner-uid";

        var profile = new UserProfile
        {
            PersistentId = persistentId,
            OwnerUid = ownerUid,
            UsernamesHistory = new List<string> { "@testuser" },
            DisplayName = "Test User"
        };

        _mockProfileService
            .Setup(s => s.GetByOwnerUidAsync(ownerUid))
            .ReturnsAsync(profile);

        var collection = new CollectionEntity
        {
            Id = "collection-id",
            UserId = persistentId, // Same as persistentId
            Name = "My Collection",
            ItemIds = Array.Empty<string>(),
            CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow)
        };

        _mockRepository
            .Setup(r => r.GetCollectionByIdAsync("collection-id"))
            .ReturnsAsync(collection);

        // Act
        var result = await _controller.GetCollection("collection-id");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<CollectionEntity>().Subject;
        response.UserId.Should().Be(persistentId);
        response.Name.Should().Be("My Collection");
    }
}

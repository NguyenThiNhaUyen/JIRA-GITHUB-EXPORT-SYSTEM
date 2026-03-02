using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using JiraGithubExport.GithubService.Services.Implementations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using Xunit;

namespace IntegrationService.Tests.ExternalServices
{
    public class GithubClientTests
    {
        private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;
        private readonly HttpClient _httpClient;
        private readonly Mock<ILogger<GitHubClient>> _mockLogger;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly Mock<IServiceScopeFactory> _mockScopeFactory;

        public GithubClientTests()
        {
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            _httpClient = new HttpClient(_mockHttpMessageHandler.Object)
            {
                BaseAddress = new Uri("https://api.github.com/")
            };

            // Default Github Client headers
            _httpClient.DefaultRequestHeaders.UserAgent.TryParseAdd("JiraGithubExportSystem");
            _httpClient.DefaultRequestHeaders.Accept.TryParseAdd("application/vnd.github.v3+json");

            _mockLogger = new Mock<ILogger<GitHubClient>>();
            _mockConfiguration = new Mock<IConfiguration>();
            _mockScopeFactory = new Mock<IServiceScopeFactory>();

            _mockConfiguration.Setup(x => x["GitHub:ApiBaseUrl"]).Returns("https://api.github.com");
            _mockConfiguration.Setup(x => x["GitHub:Token"]).Returns("ghp_faketoken");
        }

        [Fact]
        public async Task ValidateRepositoryAsync_SuccessfulResponse_ReturnsTrue()
        {
            // Arrange
            _mockHttpMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(req => 
                        req.Method == HttpMethod.Get && 
                        req.RequestUri.ToString() == "https://api.github.com/repos/test-owner/test-repo"),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                });

            var client = new GitHubClient(_httpClient, _mockConfiguration.Object, _mockLogger.Object, _mockScopeFactory.Object);

            // Act
            var result = await client.ValidateRepositoryAsync("test-owner", "test-repo");

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task ValidateRepositoryAsync_FailedResponse_ReturnsFalse()
        {
            // Arrange
            _mockHttpMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.NotFound,
                });

            var client = new GitHubClient(_httpClient, _mockConfiguration.Object, _mockLogger.Object, _mockScopeFactory.Object);

            // Act
            var result = await client.ValidateRepositoryAsync("test-owner", "test-repo");

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task ValidateRepositoryAsync_ExceptionThrown_ReturnsFalseAndLogsError()
        {
            // Arrange
            _mockHttpMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ThrowsAsync(new HttpRequestException("Network error"));

            var client = new GitHubClient(_httpClient, _mockConfiguration.Object, _mockLogger.Object, _mockScopeFactory.Object);

            // Act
            var result = await client.ValidateRepositoryAsync("test-owner", "test-repo");

            // Assert
            Assert.False(result);
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Error,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Failed to validate GitHub repository")),
                    It.IsAny<Exception>(),
                    It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)),
                Times.Once);
        }
    }
}

using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using JiraGithubExport.JiraService.Services.Implementations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using Xunit;

namespace IntegrationService.Tests.ExternalServices
{
    public class JiraClientTests
    {
        private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;
        private readonly HttpClient _httpClient;
        private readonly Mock<ILogger<JiraClient>> _mockLogger;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly Mock<IServiceScopeFactory> _mockScopeFactory;

        public JiraClientTests()
        {
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            _httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            _mockLogger = new Mock<ILogger<JiraClient>>();
            _mockConfiguration = new Mock<IConfiguration>();
            _mockScopeFactory = new Mock<IServiceScopeFactory>();

            _mockConfiguration.Setup(x => x["Jira:Email"]).Returns("test@example.com");
            _mockConfiguration.Setup(x => x["Jira:ApiToken"]).Returns("fake-token");
        }

        [Fact]
        public async Task ValidateProjectAsync_SuccessfulResponse_ReturnsTrue()
        {
            // Arrange
            _mockHttpMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(req => 
                        req.Method == HttpMethod.Get && 
                        req.RequestUri.ToString() == "https://test.atlassian.net/rest/api/3/project/TEST"),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                });

            var client = new JiraClient(_httpClient, _mockConfiguration.Object, _mockLogger.Object, _mockScopeFactory.Object);

            // Act
            var result = await client.ValidateProjectAsync("TEST", "https://test.atlassian.net");

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task ValidateProjectAsync_FailedResponse_ReturnsFalse()
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

            var client = new JiraClient(_httpClient, _mockConfiguration.Object, _mockLogger.Object, _mockScopeFactory.Object);

            // Act
            var result = await client.ValidateProjectAsync("TEST", "https://test.atlassian.net");

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task ValidateProjectAsync_ExceptionThrown_ReturnsFalseAndLogsError()
        {
            // Arrange
            _mockHttpMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ThrowsAsync(new HttpRequestException("Network error"));

            var client = new JiraClient(_httpClient, _mockConfiguration.Object, _mockLogger.Object, _mockScopeFactory.Object);

            // Act
            var result = await client.ValidateProjectAsync("TEST", "https://test.atlassian.net");

            // Assert
            Assert.False(result);
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Error,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Failed to validate Jira project")),
                    It.IsAny<Exception>(),
                    It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)),
                Times.Once);
        }
    }
}

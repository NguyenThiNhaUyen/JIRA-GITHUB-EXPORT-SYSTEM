using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using JiraGithubExport.IntegrationService.Background;
using JiraGithubExport.Shared.Infrastructure.ExternalServices.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using StackExchange.Redis;
using Xunit;

namespace IntegrationService.Tests.Background
{
    public class SyncWorkerTests
    {
        private readonly Mock<IServiceProvider> _mockServiceProvider;
        private readonly Mock<IServiceScopeFactory> _mockServiceScopeFactory;
        private readonly Mock<IServiceScope> _mockServiceScope;
        private readonly Mock<ILogger<SyncWorker>> _mockLogger;
        private readonly Mock<IConnectionMultiplexer> _mockMultiplexer;
        private readonly Mock<IDatabase> _mockRedisDatabase;
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IGitHubClient> _mockGithubClient;
        private readonly Mock<IJiraClient> _mockJiraClient;

        public SyncWorkerTests()
        {
            _mockServiceProvider = new Mock<IServiceProvider>();
            _mockServiceScopeFactory = new Mock<IServiceScopeFactory>();
            _mockServiceScope = new Mock<IServiceScope>();
            _mockLogger = new Mock<ILogger<SyncWorker>>();
            
            _mockMultiplexer = new Mock<IConnectionMultiplexer>();
            _mockRedisDatabase = new Mock<IDatabase>();
            
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockGithubClient = new Mock<IGitHubClient>();
            _mockJiraClient = new Mock<IJiraClient>();

            // Setup Scope
            _mockServiceProvider
                .Setup(x => x.GetService(typeof(IServiceScopeFactory)))
                .Returns(_mockServiceScopeFactory.Object);
                
            _mockServiceScopeFactory
                .Setup(x => x.CreateScope())
                .Returns(_mockServiceScope.Object);

            _mockServiceScope
                .Setup(x => x.ServiceProvider)
                .Returns(_mockServiceProvider.Object);

            // Setup Redis
            _mockServiceProvider
                .Setup(x => x.GetService(typeof(IConnectionMultiplexer)))
                .Returns(_mockMultiplexer.Object);
            
            _mockMultiplexer
                .Setup(x => x.GetDatabase(It.IsAny<int>(), It.IsAny<object>()))
                .Returns(_mockRedisDatabase.Object);

            // Setup Clients
            _mockServiceProvider.Setup(x => x.GetService(typeof(IUnitOfWork))).Returns(_mockUnitOfWork.Object);
            _mockServiceProvider.Setup(x => x.GetService(typeof(IGitHubClient))).Returns(_mockGithubClient.Object);
            _mockServiceProvider.Setup(x => x.GetService(typeof(IJiraClient))).Returns(_mockJiraClient.Object);
        }

        [Fact]
        public async Task ExecuteAsync_LockNotAcquired_DoesNotExecuteSync()
        {
            // Arrange
            var syncWorker = new SyncWorkerTestWrapper(_mockServiceProvider.Object, _mockLogger.Object);
            
            // Mock Redis to return false when trying to acquire the lock (String Set Async)
            _mockRedisDatabase
                .Setup(db => db.StringSetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<TimeSpan?>(), When.NotExists, CommandFlags.None))
                .ReturnsAsync(false);

            // Act
            using var cts = new CancellationTokenSource();
            // We only want to run it once to avoid an infinite loop for the test
            cts.CancelAfter(50); 
            
            try 
            {
                await syncWorker.StartAsync(cts.Token);
                await Task.Delay(100); // Allow some time for background task to trigger
            }
            finally
            {
                await syncWorker.StopAsync(CancellationToken.None);
            }

            // Assert
            // UnitOfWork and Clients should NOT be requested or called
            _mockUnitOfWork.Verify(x => x.ProjectIntegrations, Times.Never);
            _mockGithubClient.Verify(x => x.SyncCommitsAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }
    }

    // Wrapper to expose protected ExecuteAsync method if needed, but we can also use StartAsync for BackgroundService
    public class SyncWorkerTestWrapper : SyncWorker
    {
        public SyncWorkerTestWrapper(IServiceProvider serviceProvider, ILogger<SyncWorker> logger) 
            : base(serviceProvider, logger)
        {
        }
    }
}

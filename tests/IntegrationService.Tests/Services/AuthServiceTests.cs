using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JiraGithubExport.IntegrationService.Application.Implementations;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Requests.Auth;
using JiraGithubExport.Shared.Infrastructure.Identity.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace IntegrationService.Tests.Services
{
    public class AuthServiceTests
    {
        private readonly Mock<IJwtService> _mockJwtService;
        private readonly Mock<IPasswordHasher> _mockPasswordHasher;
        private readonly Mock<ILogger<AuthService>> _mockLogger;
        private readonly Mock<IConfiguration> _mockConfiguration;

        public AuthServiceTests()
        {
            _mockJwtService = new Mock<IJwtService>();
            _mockPasswordHasher = new Mock<IPasswordHasher>();
            _mockLogger = new Mock<ILogger<AuthService>>();
            _mockConfiguration = new Mock<IConfiguration>();
        }

        private JiraGithubToolDbContext CreateInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<JiraGithubToolDbContext>()
                .UseSqlite("DataSource=:memory:")
                .Options;

            var context = new JiraGithubToolDbContext(options);
            context.Database.OpenConnection();
            context.Database.EnsureCreated();
            return context;
        }

        [Fact]
        public async Task LoginAsync_ValidCredentials_ReturnsLoginResponse()
        {
            // Arrange
            using var context = CreateInMemoryDbContext();
            
            var testUser = new user
            {
                id = 1,
                email = "test@example.com",
                password = "hashed_password",
                full_name = "Test User",
                enabled = true
            };
            
            var testRole = new role { id = 1, role_name = "STUDENT" };
            testUser.roles.Add(testRole);
            
            context.users.Add(testUser);
            await context.SaveChangesAsync();

            _mockPasswordHasher.Setup(x => x.VerifyPassword("password123", "hashed_password"))
                               .Returns(true);
                               
            _mockJwtService.Setup(x => x.GenerateToken(It.IsAny<user>(), It.IsAny<List<string>>()))
                           .Returns("mocked_jwt_token");

            var authService = new AuthService(
                context, 
                _mockJwtService.Object, 
                _mockPasswordHasher.Object, 
                _mockLogger.Object, 
                _mockConfiguration.Object);

            var request = new LoginRequest
            {
                Email = "test@example.com",
                Password = "password123"
            };

            // Act
            var response = await authService.LoginAsync(request);

            // Assert
            Assert.NotNull(response);
            Assert.Equal("mocked_jwt_token", response.AccessToken);
            Assert.Equal("Bearer", response.TokenType);
            Assert.Equal(3600, response.ExpiresIn);
            Assert.Equal("test@example.com", response.User.Email);
            Assert.Contains("STUDENT", response.User.Roles);
        }

        [Fact]
        public async Task LoginAsync_UserNotFound_ThrowsUnauthorizedException()
        {
            // Arrange
            using var context = CreateInMemoryDbContext(); // Empty DB
            
            var authService = new AuthService(
                context, 
                _mockJwtService.Object, 
                _mockPasswordHasher.Object, 
                _mockLogger.Object, 
                _mockConfiguration.Object);

            var request = new LoginRequest
            {
                Email = "nonexistent@example.com",
                Password = "password123"
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<UnauthorizedException>(() => authService.LoginAsync(request));
            Assert.Equal("Invalid email or password", ex.Message);
        }

        [Fact]
        public async Task LoginAsync_InvalidPassword_ThrowsUnauthorizedException()
        {
            // Arrange
            using var context = CreateInMemoryDbContext();
            
            var testUser = new user
            {
                id = 1,
                email = "test@example.com",
                password = "hashed_password",
                enabled = true
            };
            
            context.users.Add(testUser);
            await context.SaveChangesAsync();

            // Mock verify password to return false
            _mockPasswordHasher.Setup(x => x.VerifyPassword("wrong_password", "hashed_password"))
                               .Returns(false);

            var authService = new AuthService(
                context, 
                _mockJwtService.Object, 
                _mockPasswordHasher.Object, 
                _mockLogger.Object, 
                _mockConfiguration.Object);

            var request = new LoginRequest
            {
                Email = "test@example.com",
                Password = "wrong_password"
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<UnauthorizedException>(() => authService.LoginAsync(request));
            Assert.Equal("Invalid email or password", ex.Message);
        }

        [Fact]
        public async Task LoginAsync_AccountDisabled_ThrowsUnauthorizedException()
        {
            // Arrange
            using var context = CreateInMemoryDbContext();
            
            var testUser = new user
            {
                id = 1,
                email = "test@example.com",
                password = "hashed_password",
                enabled = false // Disabled account
            };
            
            context.users.Add(testUser);
            await context.SaveChangesAsync();

            _mockPasswordHasher.Setup(x => x.VerifyPassword("password123", "hashed_password"))
                               .Returns(true);

            var authService = new AuthService(
                context, 
                _mockJwtService.Object, 
                _mockPasswordHasher.Object, 
                _mockLogger.Object, 
                _mockConfiguration.Object);

            var request = new LoginRequest
            {
                Email = "test@example.com",
                Password = "password123"
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<UnauthorizedException>(() => authService.LoginAsync(request));
            Assert.Equal("Account is disabled", ex.Message);
        }

        [Fact]
        public async Task GoogleLoginAsync_MissingConfiguration_ThrowsBusinessException()
        {
            // Arrange
            using var context = CreateInMemoryDbContext();
            
            // Configuration returns null for Google ClientId
            _mockConfiguration.Setup(x => x["Authentication:Google:ClientId"]).Returns((string)null);

            var authService = new AuthService(
                context, 
                _mockJwtService.Object, 
                _mockPasswordHasher.Object, 
                _mockLogger.Object, 
                _mockConfiguration.Object);

            var request = new GoogleLoginRequest
            {
                IdToken = "fake-token"
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<BusinessException>(() => authService.GoogleLoginAsync(request));
            Assert.Equal("Google Client ID is not configured", ex.Message);
        }
    }
}

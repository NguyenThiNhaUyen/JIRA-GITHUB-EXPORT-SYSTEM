using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using JiraGithubExport.Shared.Common;
using JiraGithubExport.Shared.Infrastructure.Identity.Implementations;
using JiraGithubExport.Shared.Models;
using Microsoft.Extensions.Options;
using Xunit;

namespace Shared.Tests.Identity
{
    public class JwtServiceTests
    {
        private readonly JwtService _jwtService;
        private readonly JwtSettings _jwtSettings;

        public JwtServiceTests()
        {
            _jwtSettings = new JwtSettings
            {
                SecretKey = "SuperSecretKeyForTestingPurposesThatIsAtLeast32BytesLong!",
                Issuer = "TestIssuer",
                Audience = "TestAudience",
                ExpirationMinutes = 60
            };

            var optionsMock = Options.Create(_jwtSettings);
            _jwtService = new JwtService(optionsMock);
        }

        [Fact]
        public void GenerateToken_ValidUser_ReturnsValidJwtString()
        {
            // Arrange
            var testUser = new user
            {
                id = 1,
                email = "test@example.com",
                full_name = "Test User"
            };
            var roles = new List<string> { "Admin", "User" };

            // Act
            var tokenString = _jwtService.GenerateToken(testUser, roles);

            // Assert
            Assert.False(string.IsNullOrEmpty(tokenString));
            
            var handler = new JwtSecurityTokenHandler();
            Assert.True(handler.CanReadToken(tokenString));
            
            var token = handler.ReadJwtToken(tokenString);
            Assert.Equal(_jwtSettings.Issuer, token.Issuer);
            Assert.Equal(_jwtSettings.Audience, token.Audiences.First());
            Assert.Contains(token.Claims, c => c.Type == "email" && c.Value == testUser.email);
            Assert.Contains(token.Claims, c => c.Type == ClaimTypes.Role && c.Value == "Admin");
            Assert.Contains(token.Claims, c => c.Type == ClaimTypes.Role && c.Value == "User");
        }

        [Fact]
        public void ValidateToken_WithValidToken_ReturnsClaimsPrincipal()
        {
            // Arrange
            var testUser = new user
            {
                id = 1,
                email = "test@example.com"
            };
            var roles = new List<string> { "User" };
            var tokenString = _jwtService.GenerateToken(testUser, roles);

            // Act
            var principal = _jwtService.ValidateToken(tokenString);

            // Assert
            Assert.NotNull(principal);
            Assert.True(principal.Identity?.IsAuthenticated);
            Assert.Equal(testUser.email, principal.FindFirst(ClaimTypes.Email)?.Value);
        }

        [Fact]
        public void ValidateToken_WithInvalidToken_ReturnsNull()
        {
            // Arrange
            var invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature";

            // Act
            var principal = _jwtService.ValidateToken(invalidToken);

            // Assert
            Assert.Null(principal);
        }

        [Fact]
        public void ValidateToken_WithExpiredToken_ReturnsNull()
        {
            // Arrange
            var expiredSettings = new JwtSettings
            {
                SecretKey = "SuperSecretKeyForTestingPurposesThatIsAtLeast32BytesLong!",
                Issuer = "TestIssuer",
                Audience = "TestAudience",
                ExpirationMinutes = -60 // Expired an hour ago
            };
            var expiredJwtService = new JwtService(Options.Create(expiredSettings));
            
            var testUser = new user { id = 1, email = "test@example.com" };
            var tokenString = expiredJwtService.GenerateToken(testUser, new List<string>());

            // Act
            var principal = _jwtService.ValidateToken(tokenString); // Validating with the normal service that expects unexpired

            // Assert
            Assert.Null(principal);
        }
    }
}

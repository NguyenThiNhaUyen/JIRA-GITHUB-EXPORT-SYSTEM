using System;
using JiraGithubExport.Shared.Infrastructure.Identity.Implementations;
using Xunit;

namespace Shared.Tests.Identity
{
    public class PasswordHasherTests
    {
        private readonly PasswordHasher _passwordHasher;

        public PasswordHasherTests()
        {
            _passwordHasher = new PasswordHasher();
        }

        [Fact]
        public void HashPassword_GivenValidPassword_ReturnsBase64String()
        {
            // Arrange
            string password = "StrongPassword123!";

            // Act
            string hash = _passwordHasher.HashPassword(password);

            // Assert
            Assert.False(string.IsNullOrEmpty(hash));
            // Ensure its valid Base64
            byte[] bytes = Convert.FromBase64String(hash);
            Assert.True(bytes.Length > 0);
        }

        [Fact]
        public void VerifyPassword_GivenCorrectPassword_ReturnsTrue()
        {
            // Arrange
            string password = "MySecretPassword";
            string hash = _passwordHasher.HashPassword(password);

            // Act
            bool result = _passwordHasher.VerifyPassword(password, hash);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void VerifyPassword_GivenIncorrectPassword_ReturnsFalse()
        {
            // Arrange
            string correctPassword = "MySecretPassword";
            string incorrectPassword = "WrongPassword";
            string hash = _passwordHasher.HashPassword(correctPassword);

            // Act
            bool result = _passwordHasher.VerifyPassword(incorrectPassword, hash);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void VerifyPassword_GivenInvalidHashFormat_ReturnsFalse()
        {
            // Arrange
            string password = "MySecretPassword";
            string invalidHash = "NotABase64String!";

            // Act
            bool result = _passwordHasher.VerifyPassword(password, invalidHash);

            // Assert
            Assert.False(result);
        }
    }
}

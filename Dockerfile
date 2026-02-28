FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the solution file and project files first to cache restore
COPY ["JiraGithubExportSystem.sln", "./"]
COPY ["services/integration/IntegrationService.csproj", "services/integration/"]
COPY ["services/jira-service/JiraService.csproj", "services/jira-service/"]
COPY ["services/github-service/GithubService.csproj", "services/github-service/"]
COPY ["packages/shared/Shared.csproj", "packages/shared/"]

# Restore dependencies
RUN dotnet restore "JiraGithubExportSystem.sln"

# Copy the rest of the source code
COPY . .

# Build and Publish IntegrationService
WORKDIR "/src/services/integration"
RUN dotnet publish "IntegrationService.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Generate runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Environment variables (Example defaults)
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose container port
EXPOSE 8080

# Run the app
ENTRYPOINT ["dotnet", "IntegrationService.dll"]

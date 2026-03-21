# Root Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy các project files để restore dependencies trước
COPY ["services/integration/IntegrationService.csproj", "services/integration/"]
COPY ["packages/shared/Shared.csproj", "packages/shared/"]
COPY ["services/jira-service/JiraService.csproj", "services/jira-service/"]
COPY ["services/github-service/GithubService.csproj", "services/github-service/"]

RUN dotnet restore "services/integration/IntegrationService.csproj"

# Copy toàn bộ code
COPY . .
WORKDIR "/src/services/integration"
RUN dotnet build "IntegrationService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "IntegrationService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "IntegrationService.dll"]


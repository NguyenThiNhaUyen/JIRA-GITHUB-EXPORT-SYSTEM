# JIRA GitHub Export System

## 📁 Cấu trúc Monorepo

```
JIRA-GITHUB-EXPORT-SYSTEM/
├── apps/                           (Frontend - tùy chọn)
│   ├── web/                       (FE hiện tại của bạn)
│   └── mobile/                    (sau này)
│
├── services/                       (Backend Microservices)
│   ├── jira-service/              (BE Jira)
│   │   ├── DTOs/
│   │   ├── Services/
│   │   │   └── Implementations/
│   │   │       └── JiraClient.cs
│   │   ├── Program.cs
│   │   └── JiraService.csproj
│   │
│   ├── github-service/            (BE GitHub)
│   │   ├── DTOs/
│   │   ├── Services/
│   │   │   └── Implementations/
│   │   │       └── GitHubClient.cs
│   │   ├── Program.cs
│   │   └── GithubService.csproj
│   │
│   └── integration/               (Main API Service)
│       ├── Application/
│       │   ├── Implementations/
│       │   │   ├── AuthService.cs
│       │   │   ├── CourseService.cs
│       │   │   ├── ProjectService.cs
│       │   │   └── ReportService.cs
│       │   ├── Interfaces/
│       │   │   ├── IAuthService.cs
│       │   │   ├── ICourseService.cs
│       │   │   ├── IProjectService.cs
│       │   │   └── IReportService.cs
│       │   └── Mappings/
│       ├── Controllers/
│       ├── Background/
│       │   └── SyncWorker.cs
│       ├── Middleware/
│       ├── Program.cs
│       └── IntegrationService.csproj
│
└── packages/                       (Shared Libraries)
    └── shared/                    (DTO/types/utils chung)
        ├── Models/                (EF Core Entities - 31 files)
        ├── Migrations/            (EF Core Migrations)
        ├── Infrastructure/
        │   ├── Persistence/
        │   │   └── JiraGithubToolDbContext.cs
        │   ├── Repositories/
        │   │   ├── Interfaces/
        │   │   │   ├── IGenericRepository.cs
        │   │   │   └── IUnitOfWork.cs
        │   │   └── Implementations/
        │   │       ├── GenericRepository.cs
        │   │       └── UnitOfWork.cs
        │   ├── Identity/
        │   │   ├── Interfaces/
        │   │   │   ├── IJwtService.cs
        │   │   │   └── IPasswordHasher.cs
        │   │   └── Implementations/
        │   │       ├── JwtService.cs
        │   │       └── PasswordHasher.cs
        │   └── ExternalServices/
        │       └── Interfaces/
        │           ├── IJiraClient.cs
        │           └── IGitHubClient.cs
        ├── Contracts/             (Request/Response DTOs)
        ├── Common/
        │   ├── Exceptions/
        │   └── JwtSettings.cs
        └── Shared.csproj
```

## 🚀 Build & Run

### Build toàn bộ solution
```bash
cd JIRA-GITHUB-EXPORT-SYSTEM
dotnet build JiraGithubExportSystem.sln
```

### Run từng service
```bash
# Main API
dotnet run --project services/integration/IntegrationService.csproj

# Jira Service (nếu tách riêng)
dotnet run --project services/jira-service/JiraService.csproj

# GitHub Service (nếu tách riêng)
dotnet run --project services/github-service/GithubService.csproj
```

## 📦 Project References

- **IntegrationService** → references:
  - `Shared.csproj`
  - `JiraService.csproj`
  - `GithubService.csproj`

- **JiraService** & **GithubService** → references:
  - `Shared.csproj`

## 🔧 Namespaces

- **Shared**: `JiraGithubExport.Shared.*`
- **JiraService**: `JiraGithubExport.JiraService.*`
- **GithubService**: `JiraGithubExport.GithubService.*`
- **IntegrationService**: `JiraGithubExport.IntegrationService.*`

## 📌 Notes

- Tất cả EF Core models nằm trong `packages/shared/Models`
- DbContext nằm trong `packages/shared/Infrastructure/Persistence`
- Repository Pattern và UnitOfWork nằm trong `packages/shared/Infrastructure/Repositories`
- Application Services (Business Logic) nằm trong `services/integration/Application`
- External API clients (Jira, GitHub) nằm trong các services riêng

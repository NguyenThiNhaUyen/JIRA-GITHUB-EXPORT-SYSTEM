using JiraGithubExport.Shared.Infrastructure.Identity.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace JiraGithubExport.IntegrationService.Application.Startup;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var dbContext = sp.GetRequiredService<JiraGithubToolDbContext>();
        var hasher = sp.GetRequiredService<IPasswordHasher>();
        var seedLogger = sp.GetRequiredService<ILogger<Program>>();

        try
        {
            seedLogger.LogInformation("Applying database migrations...");
            await dbContext.Database.MigrateAsync();

            // 1. Roles
            var Roles = new[] { "ADMIN", "Lecturer", "Student" };
            foreach (var roleName in Roles)
            {
                if (!await dbContext.Roles.AnyAsync(r => r.RoleName == roleName))
                {
                    dbContext.Roles.Add(new Role { RoleName = roleName });
                }
            }
            await dbContext.SaveChangesAsync();

            // 2. Admin
            string adminEmail = "admin@truonghoc.com";
            var adminUser = await dbContext.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Email == adminEmail);
            var adminRole = await dbContext.Roles.FirstAsync(r => r.RoleName == "ADMIN");

            if (adminUser == null)
            {
                adminUser = new User { Email = adminEmail, Password = hasher.HashPassword("Admin@123"), FullName = "Super Admin", Enabled = true };
                adminUser.Roles.Add(adminRole);
                dbContext.Users.Add(adminUser);
                await dbContext.SaveChangesAsync();
                seedLogger.LogWarning("🚀 [SEED] Admin created and seeded: {Email}", adminEmail);
            }
            else if (!adminUser.Roles.Any(r => r.RoleName == "ADMIN"))
            {
                adminUser.Roles.Add(adminRole);
                await dbContext.SaveChangesAsync();
                seedLogger.LogWarning("🚀 [SEED] Admin Role forced for existing User: {Email}", adminEmail);
            }

            // 3. Lecturer
            string lectEmail = "gv@fpt.edu.vn";
            if (!await dbContext.Users.AnyAsync(u => u.Email == lectEmail))
            {
                var Role = await dbContext.Roles.FirstAsync(r => r.RoleName == "Lecturer");
                var u = new User { Email = lectEmail, Password = hasher.HashPassword("Lecturer@123"), FullName = "Nguyễn Văn A", Enabled = true };
                u.Roles.Add(Role);
                dbContext.Users.Add(u);
                await dbContext.SaveChangesAsync();
                dbContext.Lecturers.Add(new Lecturer { UserId = u.Id, LecturerCode = "GV001", OfficeEmail = lectEmail, Department = "SE" });
                await dbContext.SaveChangesAsync();
                seedLogger.LogWarning("🚀 [SEED] Lecturer seeded: {Email}", lectEmail);
            }

            // 4. Student
            string studEmail = "sv@fpt.edu.vn";
            if (!await dbContext.Users.AnyAsync(u => u.Email == studEmail))
            {
                var Role = await dbContext.Roles.FirstAsync(r => r.RoleName == "Student");
                var u = new User { Email = studEmail, Password = hasher.HashPassword("Student@123"), FullName = "Trần Thị B", Enabled = true };
                u.Roles.Add(Role);
                dbContext.Users.Add(u);
                await dbContext.SaveChangesAsync();
                dbContext.Students.Add(new Student { UserId = u.Id, StudentCode = "SE123456", Major = "SE", Department = "IT" });
                await dbContext.SaveChangesAsync();
                seedLogger.LogWarning("🚀 [SEED] Student seeded: {Email}", studEmail);
            }

            // 5. Backfill missing names for old data
            var namelessUsers = await dbContext.Users.Where(x => string.IsNullOrEmpty(x.FullName)).ToListAsync();
            if (namelessUsers.Any())
            {
                foreach (var x in namelessUsers)
                {
                    if (x.Email == "dunghv@fpt.edu.vn") x.FullName = "Hồ Văn Dũng";
                    else if (x.Email == "thanhnb@fpt.edu.vn") x.FullName = "Nguyễn Bá Thành";
                    else if (x.Email == "gv@fpt.edu.vn") x.FullName = "Nguyễn Văn A";
                    else if (x.Email == "Lecturer@truonghoc.com") x.FullName = "Giảng viên Demo";
                    else x.FullName = "Người dùng " + x.Id;
                }
                await dbContext.SaveChangesAsync();
                seedLogger.LogWarning("🚀 [SEED] Fixed missing FullName for {Count} older Users", namelessUsers.Count);
            }

            // 6. Backfill missing Lecturer records
            var lecturerUsers = await dbContext.Users
                .Include(u => u.Roles)
                .Include(u => u.Lecturer)
                .Where(u => u.Roles.Any(r => r.RoleName.ToUpper() == "Lecturer"))
                .ToListAsync();

            seedLogger.LogInformation("🔍 Found {Count} Users with Lecturer Role for checking", lecturerUsers.Count);

            var newLecturersCount = 0;
            foreach (var lu in lecturerUsers)
            {
                if (lu.Lecturer == null)
                {
                    seedLogger.LogWarning("⚠️ User {Email} (Id: {Id}) is missing Lecturer record. Creating one...", lu.Email, lu.Id);
                    string uniqueCode = (lu.FullName?.Substring(0, Math.Min(3, lu.FullName.Length)) ?? "GV").ToUpper() + lu.Id.ToString();
                    dbContext.Lecturers.Add(new Lecturer 
                    { 
                        UserId = lu.Id, 
                        LecturerCode = uniqueCode, 
                        OfficeEmail = lu.Email, 
                        Department = "SE" 
                    });
                    newLecturersCount++;
                }
                else 
                {
                    seedLogger.LogInformation("✅ User {Email} already has Lecturer record (Code: {Code})", lu.Email, lu.Lecturer.LecturerCode);
                }
            }

            // 7. Backfill missing Student records
            var studentUsers = await dbContext.Users
                .Include(u => u.Roles)
                .Include(u => u.Student)
                .Where(u => u.Roles.Any(r => r.RoleName.ToUpper() == "Student"))
                .ToListAsync();

            var newStudentsCount = 0;
            foreach (var su in studentUsers)
            {
                if (su.Student == null)
                {
                    seedLogger.LogWarning("⚠️ User {Email} (Id: {Id}) is missing Student record. Creating one...", su.Email, su.Id);
                    string uniqueCode = "SE" + su.Id.ToString().PadLeft(6, '0');
                    dbContext.Students.Add(new Student 
                    { 
                        UserId = su.Id, 
                        StudentCode = uniqueCode, 
                        Major = "SE", 
                        Department = "IT" 
                    });
                    newStudentsCount++;
                }
            }

            if (newLecturersCount > 0 || newStudentsCount > 0)
            {
                await dbContext.SaveChangesAsync();
                seedLogger.LogWarning("🚀 [SEED] Successfully fixed missing records (Lecturers: {LCount}, Students: {SCount})", newLecturersCount, newStudentsCount);
            }
            else 
            {
                seedLogger.LogInformation("✨ All User Role records (Lecturer/Student) are already up to date.");
            }

            // ==========================================
            // NEW SEED DATA: Semesters AND Subjects
            // ==========================================
            
            // 8. Seed Semesters
            var defaultSemesters = new List<Semester>
            {
                new Semester { Name = "Spring 2024", StartDate = new DateOnly(2024, 1, 1), EndDate = new DateOnly(2024, 4, 30), CreatedAt = DateTime.UtcNow },
                new Semester { Name = "Summer 2024", StartDate = new DateOnly(2024, 5, 1), EndDate = new DateOnly(2024, 8, 31), CreatedAt = DateTime.UtcNow },
                new Semester { Name = "Fall 2024", StartDate = new DateOnly(2024, 9, 1), EndDate = new DateOnly(2024, 12, 31), CreatedAt = DateTime.UtcNow }
            };

            foreach (var s in defaultSemesters)
            {
                if (!await dbContext.Semesters.AnyAsync(x => x.Name == s.Name))
                {
                    dbContext.Semesters.Add(s);
                    seedLogger.LogInformation("🚀 [SEED] Seeded Semester: {Name}", s.Name);
                }
            }
            await dbContext.SaveChangesAsync();

            // 9. Seed Subjects
            var defaultSubjects = new List<Subject>
            {
                new Subject { SubjectCode = "SWD392", SubjectName = "Software Architecture and Design", Department = "SE", Credits = 3, MaxStudents = 40, Status = "ACTIVE", CreatedAt = DateTime.UtcNow },
                new Subject { SubjectCode = "PRN211", SubjectName = "Basic Cross-Platform Application Programming With .NET", Department = "SE", Credits = 3, MaxStudents = 40, Status = "ACTIVE", CreatedAt = DateTime.UtcNow },
                new Subject { SubjectCode = "PRJ301", SubjectName = "Java Web Application Development", Department = "SE", Credits = 3, MaxStudents = 40, Status = "ACTIVE", CreatedAt = DateTime.UtcNow }
            };

            foreach (var sub in defaultSubjects)
            {
                if (!await dbContext.Subjects.AnyAsync(x => x.SubjectCode == sub.SubjectCode))
                {
                    dbContext.Subjects.Add(sub);
                    seedLogger.LogInformation("🚀 [SEED] Seeded Subject: {Code} - {Name}", sub.SubjectCode, sub.SubjectName);
                }
            }
            await dbContext.SaveChangesAsync();

            // 10. Seed Course (Class)
            var subjectSwd = await dbContext.Subjects.FirstOrDefaultAsync(s => s.SubjectCode == "SWD392");
            var semesterFall = await dbContext.Semesters.FirstOrDefaultAsync(s => s.Name == "Fall 2024");
            var mainLecturer = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == "gv@fpt.edu.vn");

            if (subjectSwd != null && semesterFall != null && mainLecturer != null)
            {
                var courseCode = "SE1831";
                if (!await dbContext.Courses.AnyAsync(c => c.CourseCode == courseCode && c.SemesterId == semesterFall.Id))
                {
                    var newCourse = new Course
                    {
                        CourseCode = courseCode,
                        CourseName = "SWD392 - SE1831",
                        SemesterId = semesterFall.Id,
                        SubjectId = subjectSwd.Id,
                        CreatedByUserId = mainLecturer.Id,
                        Status = "ACTIVE",
                        MaxStudents = 30,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    dbContext.Courses.Add(newCourse);
                    await dbContext.SaveChangesAsync();
                    
                    // Assign Lecturer to Course
                    newCourse.LecturerUsers.Add(mainLecturer.Lecturer);
                    await dbContext.SaveChangesAsync();

                    seedLogger.LogInformation("🚀 [SEED] Seeded Course: {Code}", courseCode);

                    // 11. Seed Student Enrollment
                    var stuUser = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == "sv@fpt.edu.vn");
                    if (stuUser != null)
                    {
                        var stuId = stuUser.Id;
                        if (!await dbContext.CourseEnrollments.AnyAsync(ce => ce.CourseId == newCourse.Id && ce.StudentUserId == stuId))
                        {
                            dbContext.CourseEnrollments.Add(new CourseEnrollment
                            {
                                CourseId = newCourse.Id,
                                StudentUserId = stuId,
                                Status = "ACTIVE",
                                EnrolledAt = DateTime.UtcNow
                            });
                            await dbContext.SaveChangesAsync();
                            seedLogger.LogInformation("🚀 [SEED] Enrolled Student {Email} into {Course}", stuUser.Email, courseCode);
                        }

                        // 12. Seed Project Group
                        var projectName = "Jira-Github Sync System";
                        var proj = await dbContext.Projects.FirstOrDefaultAsync(p => p.Name == projectName && p.CourseId == newCourse.Id);
                        if (proj == null)
                        {
                            proj = new Project
                            {
                                CourseId = newCourse.Id,
                                Name = projectName,
                                Status = "ACTIVE",
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };
                            dbContext.Projects.Add(proj);
                            await dbContext.SaveChangesAsync();
                            seedLogger.LogInformation("🚀 [SEED] Seeded Project: {ProjectName}", projectName);

                            // Add Student to Team
                            dbContext.TeamMembers.Add(new TeamMember
                            {
                                ProjectId = proj.Id,
                                StudentUserId = stuId,
                                TeamRole = "LEADER",
                                ParticipationStatus = "ACTIVE"
                            });
                            await dbContext.SaveChangesAsync();
                            seedLogger.LogInformation("🚀 [SEED] Added {Email} as LEADER to Project.", stuUser.Email);
                        }

                        // 13. Seed Jira and GitHub Integrations
                        var githubOwnerName = "FPT-University";
                        var githubRepoName = "SWD392-JiraGithubSync";
                        var githubFullName = $"{githubOwnerName}/{githubRepoName}";
                        var jiraProjectKey = "JGS";
                        var jiraProjectName = "Jira Github Sync Backend";

                        // Create Github Repo
                        var gitRepo = await dbContext.GithubRepositories.FirstOrDefaultAsync(g => g.FullName == githubFullName);
                        if (gitRepo == null)
                        {
                            gitRepo = new GithubRepository
                            {
                                OwnerLogin = githubOwnerName,
                                Name = githubRepoName,
                                FullName = githubFullName,
                                Visibility = "public",
                                DefaultBranch = "main",
                                RepoUrl = $"https://github.com/{githubFullName}",
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };
                            dbContext.GithubRepositories.Add(gitRepo);
                            await dbContext.SaveChangesAsync();
                            seedLogger.LogInformation("🚀 [SEED] Seeded Github Repo: {FullName}", githubFullName);
                        }

                        // Create Jira Project
                        var jiraProj = await dbContext.JiraProjects.FirstOrDefaultAsync(j => j.JiraProjectKey == jiraProjectKey);
                        if (jiraProj == null)
                        {
                            jiraProj = new JiraProject
                            {
                                JiraProjectKey = jiraProjectKey,
                                ProjectName = jiraProjectName,
                                JiraUrl = "https://fpt-swd392.atlassian.net",
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };
                            dbContext.JiraProjects.Add(jiraProj);
                            await dbContext.SaveChangesAsync();
                            seedLogger.LogInformation("🚀 [SEED] Seeded Jira Project: {ProjectKey}", jiraProjectKey);
                        }

                        // Create Project Integration Profile
                        if (!await dbContext.ProjectIntegrations.AnyAsync(pi => pi.ProjectId == proj.Id))
                        {
                            dbContext.ProjectIntegrations.Add(new ProjectIntegration
                            {
                                ProjectId = proj.Id,
                                GithubRepoId = gitRepo.Id,
                                JiraProjectId = jiraProj.Id,
                                ApprovalStatus = "APPROVED",
                                SubmittedByUserId = stuId,
                                SubmittedAt = DateTime.UtcNow,
                                ApprovedByUserId = mainLecturer.Id,
                                ApprovedAt = DateTime.UtcNow,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            });
                            await dbContext.SaveChangesAsync();
                            seedLogger.LogInformation("🚀 [SEED] Linked Jira and Github to Project Id: {ProjectId}", proj.Id);
                        }
                    }
                }
            }
            // ============================================
            // GIAI ĐOẠN 2: GITHUB & JIRA DATA
            // ============================================
            await SeedPhase2Async(dbContext, seedLogger);

            // ============================================
            // GIAI ĐOẠN 3: Student ACTIVITY DAILY (Chart)
            // ============================================
            await SeedPhase3Async(dbContext, seedLogger);

            // ============================================
            // GIAI ĐOẠN 4: GH ISSUES, COMMENTS, WORK LINKS
            // ============================================
            await SeedPhase4Async(dbContext, seedLogger);

            // ============================================
            // GIAI ĐOẠN 5: REPORT EXPORTS (History)
            // ============================================
            await SeedPhase5Async(dbContext, seedLogger);
        }
        catch (Exception ex)
        {
            seedLogger.LogError(ex, "❌ Database seeding failed.");
        }
    }

    private static async Task SeedPhase5Async(JiraGithubToolDbContext dbContext, ILogger seedLogger)
    {
        try
        {
            var lectUser = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == "gv@fpt.edu.vn");
            var proj = await dbContext.Projects.FirstOrDefaultAsync(p => p.Name == "Jira-Github Sync System");
            var Course = await dbContext.Courses.FirstOrDefaultAsync(c => c.CourseCode == "SE1831");

            if (lectUser == null || proj == null || Course == null)
            {
                seedLogger.LogWarning("⚠️ [PHASE 5] Skipped: Missing Lecturer, Project, or Course.");
                return;
            }

            var reportExports = new List<ReportExport>
            {
                new ReportExport
                {
                    ReportType = "COMMIT_STATISTICS",
                    Scope = "Course",
                    ScopeEntityId = Course.Id,
                    Format = "PDF",
                    Status = "COMPLETED",
                    FileUrl = "/reports/course_se1831_commits_sample.pdf",
                    RequestedByUserId = lectUser.Id,
                    RequestedAt = DateTime.UtcNow.AddDays(-2),
                    CompletedAt = DateTime.UtcNow.AddDays(-2).AddMinutes(1)
                },
                new ReportExport
                {
                    ReportType = "TEAM_ROSTER",
                    Scope = "Project",
                    ScopeEntityId = proj.Id,
                    Format = "XLSX",
                    Status = "COMPLETED",
                    FileUrl = "/reports/project_sync_roster_sample.xlsx",
                    RequestedByUserId = lectUser.Id,
                    RequestedAt = DateTime.UtcNow.AddDays(-1),
                    CompletedAt = DateTime.UtcNow.AddDays(-1).AddMinutes(2)
                },
                new ReportExport
                {
                    ReportType = "SRS_ISO29148",
                    Scope = "Project",
                    ScopeEntityId = proj.Id,
                    Format = "PDF",
                    Status = "COMPLETED",
                    FileUrl = "/reports/project_sync_srs_sample.pdf",
                    RequestedByUserId = lectUser.Id,
                    RequestedAt = DateTime.UtcNow.AddHours(-5),
                    CompletedAt = DateTime.UtcNow.AddHours(-5).AddMinutes(3)
                },
                new ReportExport
                {
                    ReportType = "ACTIVITY_SUMMARY",
                    Scope = "Project",
                    ScopeEntityId = proj.Id,
                    Format = "PDF",
                    Status = "PROCESSING",
                    RequestedByUserId = lectUser.Id,
                    RequestedAt = DateTime.UtcNow.AddMinutes(-10)
                }
            };

            int addedCount = 0;
            foreach (var re in reportExports)
            {
                if (!await dbContext.ReportExports.AnyAsync(x => 
                    x.ReportType == re.ReportType && 
                    x.ScopeEntityId == re.ScopeEntityId && 
                    x.RequestedByUserId == re.RequestedByUserId))
                {
                    dbContext.ReportExports.Add(re);
                    addedCount++;
                }
            }

            if (addedCount > 0)
            {
                await dbContext.SaveChangesAsync();
                seedLogger.LogInformation("🚀 [SEED Phase 5] {Count} ReportExport records seeded.", addedCount);
            }
        }
        catch (Exception ex)
        {
            seedLogger.LogError(ex, "❌ [PHASE 5] Seeding failed: {Msg}", ex.Message);
        }
    }

    private static async Task SeedPhase2Async(
        JiraGithubToolDbContext dbContext,
        ILogger seedLogger)
    {
        try
        {
            // Lấy repo và jira Project đã seed ở Giai đoạn 1
            var gitRepo = await dbContext.GithubRepositories
                .FirstOrDefaultAsync(g => g.FullName == "FPT-University/SWD392-JiraGithubSync");
            var jiraProj = await dbContext.JiraProjects
                .FirstOrDefaultAsync(j => j.JiraProjectKey == "JGS");
            var stuUser = await dbContext.Users
                .Include(u => u.Student)
                .FirstOrDefaultAsync(u => u.Email == "sv@fpt.edu.vn");

            if (gitRepo == null || jiraProj == null || stuUser == null)
            {
                seedLogger.LogWarning("⚠️ [PHASE 2] Skipped: Missing repo/jira/Student from Phase 1.");
                return;
            }

            // -------------------------------------------------------
            // A. External Account: Mapping sinh viên FPT ↔ GitHub/Jira
            // -------------------------------------------------------
            var githubLogin = "tranthi-b";
            var jiraAccountId = "712020:abc123xyz-jira-demo";

            if (!await dbContext.ExternalAccounts.AnyAsync(ea => ea.UserId == stuUser.Id && ea.Provider == "GITHUB"))
            {
                dbContext.ExternalAccounts.Add(new ExternalAccount
                {
                    UserId = stuUser.Id,
                    Provider = "GITHUB",
                    ExternalUserKey = githubLogin,
                    Username = githubLogin,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
                seedLogger.LogInformation("🚀 [SEED] External Account (GitHub) mapped for {Email}", stuUser.Email);
            }

            if (!await dbContext.ExternalAccounts.AnyAsync(ea => ea.UserId == stuUser.Id && ea.Provider == "JIRA"))
            {
                dbContext.ExternalAccounts.Add(new ExternalAccount
                {
                    UserId = stuUser.Id,
                    Provider = "JIRA",
                    ExternalUserKey = jiraAccountId,
                    Username = "tranthi.b@fpt.edu.vn",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
                seedLogger.LogInformation("🚀 [SEED] External Account (Jira) mapped for {Email}", stuUser.Email);
            }
            await dbContext.SaveChangesAsync();

            // -------------------------------------------------------
            // B. GitHub User: Profile người dùng trên GitHub
            // -------------------------------------------------------
            var ghUser = await dbContext.GithubUsers.FirstOrDefaultAsync(g => g.Login == githubLogin);
            if (ghUser == null)
            {
                ghUser = new GithubUser
                {
                    Login = githubLogin,
                    DisplayName = "Trần Thị B",
                    Email = "sv@fpt.edu.vn",
                    AvatarUrl = "https://avatars.githubusercontent.com/u/99999999",
                    UserType = "User",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                dbContext.GithubUsers.Add(ghUser);
                await dbContext.SaveChangesAsync();
                seedLogger.LogInformation("🚀 [SEED] GitHub User: {Login}", githubLogin);
            }

            // -------------------------------------------------------
            // C. GitHub Branch: Tạo các nhánh code mẫu
            // -------------------------------------------------------
            // SHA cố định cho branch (Guid.ToString("N") chỉ 32 ký tự, không dùng [..40])
            var branchData = new[]
            {
                new { Name = "main",              Sha = "1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b", IsDefault = true  },
                new { Name = "dev",               Sha = "2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c", IsDefault = false },
                new { Name = "feature/login",     Sha = "3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d", IsDefault = false },
                new { Name = "feature/jira-sync", Sha = "4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e", IsDefault = false },
            };
            var seedBranches = new List<GithubBranch>();
            foreach (var bd in branchData)
            {
                if (!await dbContext.GithubBranches.AnyAsync(b => b.RepoId == gitRepo.Id && b.BranchName == bd.Name))
                {
                    var br = new GithubBranch
                    {
                        RepoId = gitRepo.Id,
                        BranchName = bd.Name,
                        IsDefault = bd.IsDefault,
                        HeadCommitSha = bd.Sha,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    dbContext.GithubBranches.Add(br);
                    seedBranches.Add(br);
                    seedLogger.LogInformation("🚀 [SEED] Branch: {Branch}", bd.Name);
                }
            }
            await dbContext.SaveChangesAsync();

            // -------------------------------------------------------
            // D. GitHub Commits: Tạo lịch sử commit mẫu (7 ngày gần nhất)
            // -------------------------------------------------------
            // SHA cố định để seed không tạo duplicate mỗi lần restart
            var commitData = new[]
            {
                new { Sha = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2", msg = "feat: init Project structure",        add = 50,  del = 0,  files = 5, DaysAgo = 14 },
                new { Sha = "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3", msg = "feat: add JWT authentication",       add = 80,  del = 10, files = 6, DaysAgo = 12 },
                new { Sha = "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4", msg = "feat: integrate Jira API",           add = 120, del = 20, files = 8, DaysAgo = 10 },
                new { Sha = "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5", msg = "fix: null ref on commit sync",       add = 15,  del = 5,  files = 2, DaysAgo = 8  },
                new { Sha = "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6", msg = "feat: add GitHub webhook handler",  add = 90,  del = 15, files = 7, DaysAgo = 6  },
                new { Sha = "f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1", msg = "refactor: clean up service layer",  add = 30,  del = 45, files = 9, DaysAgo = 4  },
                new { Sha = "a7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8", msg = "feat: export SRS report to PDF",   add = 60,  del = 5,  files = 4, DaysAgo = 2  },
            };

            var seededCommits = new List<GithubCommit>();
            foreach (var cd in commitData)
            {
                if (!await dbContext.GithubCommits.AnyAsync(c => c.RepoId == gitRepo.Id && c.CommitSha == cd.Sha))
                {
                    var commit = new GithubCommit
                    {
                        RepoId = gitRepo.Id,
                        CommitSha = cd.Sha,
                        Message = cd.msg,
                        AuthorGithubUserId = ghUser.Id,
                        CommitterGithubUserId = ghUser.Id,
                        CommittedAt = DateTime.UtcNow.AddDays(-cd.DaysAgo),
                        Additions = cd.add,
                        Deletions = cd.del,
                        ChangedFiles = cd.files,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    dbContext.GithubCommits.Add(commit);
                    seededCommits.Add(commit);
                }
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED] {Count} GitHub Commits seeded.", seededCommits.Count);

            // -------------------------------------------------------
            // E. GitHub Pull Requests: Tạo PR mẫu
            // -------------------------------------------------------
            if (!await dbContext.GithubPullRequests.AnyAsync(pr => pr.RepoId == gitRepo.Id && pr.PrNumber == 1))
            {
                dbContext.GithubPullRequests.Add(new GithubPullRequest
                {
                    RepoId = gitRepo.Id,
                    PrNumber = 1,
                    Title = "feat: Jira sync module",
                    Body = "Integrate Jira API to sync issues into local DB.",
                    State = "merged",
                    AuthorGithubUserId = ghUser.Id,
                    SourceBranch = "feature/jira-sync",
                    TargetBranch = "main",
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    UpdatedAt = DateTime.UtcNow.AddDays(-3),
                    MergedAt = DateTime.UtcNow.AddDays(-3)
                });
            }
            if (!await dbContext.GithubPullRequests.AnyAsync(pr => pr.RepoId == gitRepo.Id && pr.PrNumber == 2))
            {
                dbContext.GithubPullRequests.Add(new GithubPullRequest
                {
                    RepoId = gitRepo.Id,
                    PrNumber = 2,
                    Title = "feat: Login feature",
                    Body = "Add JWT authentication for Students and Lecturers.",
                    State = "open",
                    AuthorGithubUserId = ghUser.Id,
                    SourceBranch = "feature/login",
                    TargetBranch = "dev",
                    CreatedAt = DateTime.UtcNow.AddDays(-2),
                    UpdatedAt = DateTime.UtcNow
                });
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED] GitHub Pull Requests seeded.");

            // -------------------------------------------------------
            // F. Jira Issues: Tạo Epic, Story, Task, Bug mẫu
            // -------------------------------------------------------
            var jiraIssueData = new[]
            {
                new { Key = "JGS-1", Title = "Setup Project Infrastructure",    Type = "Epic",  Status = "Done",        Priority = "High"   },
                new { Key = "JGS-2", Title = "Integrate Jira API",              Type = "Story", Status = "Done",        Priority = "High"   },
                new { Key = "JGS-3", Title = "Implement JWT Authentication",    Type = "Task",  Status = "Done",        Priority = "High"   },
                new { Key = "JGS-4", Title = "Sync GitHub Commits to DB",       Type = "Task",  Status = "In Progress", Priority = "Medium" },
                new { Key = "JGS-5", Title = "Export SRS Report as PDF",        Type = "Task",  Status = "In Progress", Priority = "Medium" },
                new { Key = "JGS-6", Title = "Fix null ref on commit sync",     Type = "Bug",   Status = "Done",        Priority = "High"   },
                new { Key = "JGS-7", Title = "Build Contribution Score API",    Type = "Task",  Status = "To Do",       Priority = "Low"    },
            };

            foreach (var issue in jiraIssueData)
            {
                if (!await dbContext.JiraIssues.AnyAsync(ji => ji.JiraIssueKey == issue.Key))
                {
                    dbContext.JiraIssues.Add(new JiraIssue
                    {
                        JiraIssueKey = issue.Key,
                        JiraProjectId = jiraProj.Id,
                        Title = issue.Title,
                        IssueType = issue.Type,
                        Status = issue.Status,
                        Priority = issue.Priority,
                        AssigneeJiraAccountId = jiraAccountId,
                        ReporterJiraAccountId = jiraAccountId,
                        CreatedAt = DateTime.UtcNow.AddDays(-14),
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED] {Count} Jira Issues seeded.", jiraIssueData.Length);

            // -------------------------------------------------------
            // G. Jira Worklogs: Log giờ làm việc cho từng Task đã xong
            // -------------------------------------------------------
            var doneIssues = await dbContext.JiraIssues
                .Where(ji => ji.JiraProjectId == jiraProj.Id && ji.Status == "Done")
                .ToListAsync();

            foreach (var doneIssue in doneIssues)
            {
                if (!await dbContext.JiraWorklogs.AnyAsync(wl => wl.IssueId == doneIssue.Id))
                {
                    dbContext.JiraWorklogs.Add(new JiraWorklog
                    {
                        IssueId = doneIssue.Id,
                        AuthorJiraAccountId = jiraAccountId,
                        TimeSpent = 4.0m,
                        CreatedAt = DateTime.UtcNow.AddDays(-3)
                    });
                }
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED] Jira Worklogs seeded for Done issues.");
        }
        catch (Exception ex)
        {
            seedLogger.LogError(ex, "❌ [PHASE 2] Seeding failed: {Msg}", ex.Message);
        }
    }

    // ============================================================
    // GIAI ĐOẠN 3: Student ACTIVITY DAILY (Dữ liệu Chart/Dashboard)
    // ============================================================
    private static async Task SeedPhase3Async(
        JiraGithubToolDbContext dbContext,
        ILogger seedLogger)
    {
        try
        {
            var stuUser = await dbContext.Users
                .Include(u => u.Student)
                .FirstOrDefaultAsync(u => u.Email == "sv@fpt.edu.vn");

            var proj = await dbContext.Projects
                .FirstOrDefaultAsync(p => p.Name == "Jira-Github Sync System");

            if (stuUser == null || stuUser.Student == null || proj == null)
            {
                seedLogger.LogWarning("⚠️ [PHASE 3] Skipped: Missing Student/Project.");
                return;
            }

            var stuId = stuUser.Id;
            var projId = proj.Id;

            // Tạo dữ liệu activity cho 14 ngày gần nhất để chart hiển thị
            var activityData = new[]
            {
                new { DaysAgo = 14, Commits = 3,  Added = 150, Deleted = 10,  Prs = 0, Reviews = 0, IssuesCreated = 2, IssuesDone = 0, Points = 0, Hours = 3.0m, Comments = 1 },
                new { DaysAgo = 13, Commits = 2,  Added = 80,  Deleted = 5,   Prs = 0, Reviews = 0, IssuesCreated = 1, IssuesDone = 1, Points = 3, Hours = 2.0m, Comments = 2 },
                new { DaysAgo = 12, Commits = 4,  Added = 200, Deleted = 20,  Prs = 1, Reviews = 0, IssuesCreated = 0, IssuesDone = 2, Points = 5, Hours = 4.5m, Comments = 3 },
                new { DaysAgo = 11, Commits = 0,  Added = 0,   Deleted = 0,   Prs = 0, Reviews = 1, IssuesCreated = 1, IssuesDone = 0, Points = 0, Hours = 1.0m, Comments = 2 },
                new { DaysAgo = 10, Commits = 5,  Added = 250, Deleted = 30,  Prs = 0, Reviews = 1, IssuesCreated = 2, IssuesDone = 1, Points = 3, Hours = 5.0m, Comments = 4 },
                new { DaysAgo = 9,  Commits = 1,  Added = 40,  Deleted = 5,   Prs = 0, Reviews = 0, IssuesCreated = 0, IssuesDone = 1, Points = 2, Hours = 1.5m, Comments = 1 },
                new { DaysAgo = 8,  Commits = 2,  Added = 60,  Deleted = 15,  Prs = 0, Reviews = 0, IssuesCreated = 1, IssuesDone = 0, Points = 0, Hours = 2.0m, Comments = 2 },
                new { DaysAgo = 7,  Commits = 3,  Added = 90,  Deleted = 10,  Prs = 1, Reviews = 1, IssuesCreated = 0, IssuesDone = 2, Points = 5, Hours = 3.5m, Comments = 5 },
                new { DaysAgo = 6,  Commits = 4,  Added = 180, Deleted = 25,  Prs = 0, Reviews = 0, IssuesCreated = 2, IssuesDone = 1, Points = 3, Hours = 4.0m, Comments = 3 },
                new { DaysAgo = 5,  Commits = 2,  Added = 70,  Deleted = 8,   Prs = 0, Reviews = 1, IssuesCreated = 1, IssuesDone = 1, Points = 2, Hours = 2.5m, Comments = 2 },
                new { DaysAgo = 4,  Commits = 6,  Added = 300, Deleted = 45,  Prs = 1, Reviews = 0, IssuesCreated = 0, IssuesDone = 3, Points = 8, Hours = 6.0m, Comments = 6 },
                new { DaysAgo = 3,  Commits = 1,  Added = 30,  Deleted = 5,   Prs = 0, Reviews = 1, IssuesCreated = 1, IssuesDone = 0, Points = 0, Hours = 1.0m, Comments = 1 },
                new { DaysAgo = 2,  Commits = 3,  Added = 110, Deleted = 15,  Prs = 0, Reviews = 0, IssuesCreated = 0, IssuesDone = 2, Points = 5, Hours = 3.0m, Comments = 4 },
                new { DaysAgo = 1,  Commits = 2,  Added = 75,  Deleted = 10,  Prs = 1, Reviews = 1, IssuesCreated = 1, IssuesDone = 1, Points = 3, Hours = 2.5m, Comments = 3 },
            };

            int addedCount = 0;
            foreach (var a in activityData)
            {
                var date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-a.DaysAgo));
                if (!await dbContext.StudentActivityDailies.AnyAsync(
                    x => x.StudentUserId == stuId && x.ProjectId == projId && x.ActivityDate == date))
                {
                    dbContext.StudentActivityDailies.Add(new StudentActivityDaily
                    {
                        StudentUserId = stuId,
                        ProjectId = projId,
                        ActivityDate = date,
                        CommitsCount = a.Commits,
                        LinesAdded = a.Added,
                        LinesDeleted = a.Deleted,
                        PullRequestsCount = a.Prs,
                        CodeReviewsCount = a.Reviews,
                        IssuesCreated = a.IssuesCreated,
                        IssuesCompleted = a.IssuesDone,
                        StoryPoints = a.Points,
                        TimeLoggedHours = a.Hours,
                        CommentsCount = a.Comments,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                    addedCount++;
                }
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED Phase 3] {Count} StudentActivityDaily records seeded.", addedCount);
        }
        catch (Exception ex)
        {
            seedLogger.LogError(ex, "❌ [PHASE 3] Seeding failed: {Msg}", ex.Message);
        }
    }

    // ============================================================
    // GIAI ĐOẠN 4: GITHUB ISSUES, COMMENTS, JIRA LINKS, WORK LINKS
    // ============================================================
    private static async Task SeedPhase4Async(
        JiraGithubToolDbContext dbContext,
        ILogger seedLogger)
    {
        try
        {
            var gitRepo = await dbContext.GithubRepositories
                .FirstOrDefaultAsync(g => g.FullName == "FPT-University/SWD392-JiraGithubSync");
            var ghUser = await dbContext.GithubUsers
                .FirstOrDefaultAsync(g => g.Login == "tranthi-b");
            var jiraProj = await dbContext.JiraProjects
                .FirstOrDefaultAsync(j => j.JiraProjectKey == "JGS");

            if (gitRepo == null || ghUser == null || jiraProj == null)
            {
                seedLogger.LogWarning("⚠️ [PHASE 4] Skipped: Missing repo/User/jira from Phase 1-2.");
                return;
            }

            var jiraAccountId = "712020:abc123xyz-jira-demo";

            // -------------------------------------------------------
            // A. GitHub Issues (Bug tracker trên GitHub)
            // -------------------------------------------------------
            var ghIssueData = new[]
            {
                new { num = 1, Title = "Bug: Jira sync fails for subtasks",    State = "closed", DaysAgo = 10 },
                new { num = 2, Title = "Feature: Add pagination to commit list", State = "open",   DaysAgo = 6  },
                new { num = 3, Title = "Bug: PR webhook not triggering sync",  State = "closed", DaysAgo = 4  },
            };

            foreach (var gi in ghIssueData)
            {
                if (!await dbContext.GithubIssues.AnyAsync(i => i.RepoId == gitRepo.Id && i.IssueNumber == gi.num))
                {
                    var newGhIssue = new GithubIssue
                    {
                        RepoId = gitRepo.Id,
                        IssueNumber = gi.num,
                        Title = gi.Title,
                        State = gi.State,
                        AuthorGithubUserId = ghUser.Id,
                        AssigneeGithubUserId = ghUser.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-gi.DaysAgo),
                        UpdatedAt = DateTime.UtcNow,
                        ClosedAt = gi.State == "closed" ? DateTime.UtcNow.AddDays(-1) : null
                    };
                    dbContext.GithubIssues.Add(newGhIssue);
                }
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED P4] GitHub Issues seeded.");

            // -------------------------------------------------------
            // B. GitHub Issue Comments
            // -------------------------------------------------------
            var allGhIssues = await dbContext.GithubIssues
                .Where(i => i.RepoId == gitRepo.Id)
                .ToListAsync();

            foreach (var ghIssue in allGhIssues)
            {
                if (!await dbContext.GithubIssueComments.AnyAsync(c => c.IssueId == ghIssue.Id))
                {
                    dbContext.GithubIssueComments.Add(new GithubIssueComment
                    {
                        IssueId = ghIssue.Id,
                        AuthorGithubUserId = ghUser.Id,
                        Body = $"Looking into this issue. Will fix in next sprint.",
                        CreatedAt = DateTime.UtcNow.AddDays(-1),
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED P4] GitHub Issue Comments seeded.");

            // -------------------------------------------------------
            // C. Jira Issue Comments
            // -------------------------------------------------------
            var allJiraIssues = await dbContext.JiraIssues
                .Where(ji => ji.JiraProjectId == jiraProj.Id)
                .ToListAsync();

            var jiraCommentBodies = new[]
            {
                "Đã bắt đầu implement, dự kiến xong trong 2 ngày.",
                "Review lại logic xử lý null reference.",
                "Merge vào nhánh dev, chờ QA kiểm tra.",
            };

            int commentIdx = 0;
            foreach (var ji in allJiraIssues)
            {
                if (!await dbContext.JiraIssueComments.AnyAsync(c => c.IssueId == ji.Id))
                {
                    dbContext.JiraIssueComments.Add(new JiraIssueComment
                    {
                        IssueId = ji.Id,
                        AuthorJiraAccountId = jiraAccountId,
                        Body = jiraCommentBodies[commentIdx % jiraCommentBodies.Length],
                        CreatedAt = DateTime.UtcNow.AddDays(-2)
                    });
                    commentIdx++;
                }
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED P4] Jira Issue Comments seeded.");

            // -------------------------------------------------------
            // D. Jira Issue Links (Task blocks/relates-to)
            // -------------------------------------------------------
            var issueJgs1 = await dbContext.JiraIssues.FirstOrDefaultAsync(i => i.JiraIssueKey == "JGS-1");
            var issueJgs2 = await dbContext.JiraIssues.FirstOrDefaultAsync(i => i.JiraIssueKey == "JGS-2");
            var issueJgs3 = await dbContext.JiraIssues.FirstOrDefaultAsync(i => i.JiraIssueKey == "JGS-3");
            var issueJgs4 = await dbContext.JiraIssues.FirstOrDefaultAsync(i => i.JiraIssueKey == "JGS-4");

            if (issueJgs1 != null && issueJgs2 != null)
            {
                if (!await dbContext.JiraIssueLinks.AnyAsync(
                    l => l.ParentIssueId == issueJgs1.Id && l.ChildIssueId == issueJgs2.Id))
                {
                    dbContext.JiraIssueLinks.Add(new JiraIssueLink
                    {
                        ParentIssueId = issueJgs1.Id,
                        ChildIssueId = issueJgs2.Id,
                        LinkType = "is_parent_of"
                    });
                }
            }
            if (issueJgs3 != null && issueJgs4 != null)
            {
                if (!await dbContext.JiraIssueLinks.AnyAsync(
                    l => l.ParentIssueId == issueJgs3.Id && l.ChildIssueId == issueJgs4.Id))
                {
                    dbContext.JiraIssueLinks.Add(new JiraIssueLink
                    {
                        ParentIssueId = issueJgs3.Id,
                        ChildIssueId = issueJgs4.Id,
                        LinkType = "blocks"
                    });
                }
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED P4] Jira Issue Links seeded.");

            // -------------------------------------------------------
            // E. Work Links: Liên kết Commit/PR ↔ Jira Issue
            // (Đây là bảng quan trọng nhất để truy xuất nguồn gốc công việc)
            // -------------------------------------------------------
            var allCommits = await dbContext.GithubCommits
                .Where(c => c.RepoId == gitRepo.Id)
                .ToListAsync();
            var allPRs = await dbContext.GithubPullRequests
                .Where(pr => pr.RepoId == gitRepo.Id)
                .ToListAsync();

            // Map commit → Jira Issue theo thứ tự
            var commitJiraMap = new[]
            {
                new { Sha = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2", jiraKey = "JGS-1" },
                new { Sha = "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3", jiraKey = "JGS-3" },
                new { Sha = "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4", jiraKey = "JGS-2" },
                new { Sha = "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5", jiraKey = "JGS-6" },
                new { Sha = "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6", jiraKey = "JGS-4" },
                new { Sha = "f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1", jiraKey = "JGS-2" },
                new { Sha = "a7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8", jiraKey = "JGS-5" },
            };

            int workLinkCount = 0;
            foreach (var map in commitJiraMap)
            {
                var commit = allCommits.FirstOrDefault(c => c.CommitSha == map.Sha);
                var jiraIssue = await dbContext.JiraIssues.FirstOrDefaultAsync(i => i.JiraIssueKey == map.jiraKey);
                if (commit == null || jiraIssue == null) continue;

                if (!await dbContext.WorkLinks.AnyAsync(
                    wl => wl.JiraIssueId == jiraIssue.Id && wl.CommitId == commit.Id && wl.LinkType == "COMMIT"))
                {
                    dbContext.WorkLinks.Add(new WorkLink
                    {
                        JiraIssueId = jiraIssue.Id,
                        RepoId = gitRepo.Id,
                        LinkType = "COMMIT",
                        CommitId = commit.Id,
                        CreatedAt = DateTime.UtcNow
                    });
                    workLinkCount++;
                }
            }

            // Gắn PR #1 → JGS-2 (Jira sync story)
            var pr1 = allPRs.FirstOrDefault(pr => pr.PrNumber == 1);
            var jgs2 = await dbContext.JiraIssues.FirstOrDefaultAsync(i => i.JiraIssueKey == "JGS-2");
            if (pr1 != null && jgs2 != null &&
                !await dbContext.WorkLinks.AnyAsync(wl => wl.PrId == pr1.Id && wl.JiraIssueId == jgs2.Id))
            {
                dbContext.WorkLinks.Add(new WorkLink
                {
                    JiraIssueId = jgs2.Id,
                    RepoId = gitRepo.Id,
                    LinkType = "PR",
                    PrId = pr1.Id,
                    CreatedAt = DateTime.UtcNow
                });
                workLinkCount++;
            }

            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED P4] {Count} Work Links (Commit/PR ↔ Jira) seeded.", workLinkCount);
        }
        catch (Exception ex)
        {
            seedLogger.LogError(ex, "❌ [PHASE 4] Seeding failed: {Msg}", ex.Message);
        }
    }
}


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
            var roles = new[] { "ADMIN", "LECTURER", "STUDENT" };
            foreach (var roleName in roles)
            {
                if (!await dbContext.roles.AnyAsync(r => r.role_name == roleName))
                {
                    dbContext.roles.Add(new role { role_name = roleName });
                }
            }
            await dbContext.SaveChangesAsync();

            // 2. Admin
            string adminEmail = "admin@truonghoc.com";
            var adminUser = await dbContext.users.Include(u => u.roles).FirstOrDefaultAsync(u => u.email == adminEmail);
            var adminRole = await dbContext.roles.FirstAsync(r => r.role_name == "ADMIN");

            if (adminUser == null)
            {
                adminUser = new user { email = adminEmail, password = hasher.HashPassword("Admin@123"), full_name = "Super Admin", enabled = true };
                adminUser.roles.Add(adminRole);
                dbContext.users.Add(adminUser);
                await dbContext.SaveChangesAsync();
                seedLogger.LogWarning("🚀 [SEED] Admin created and seeded: {Email}", adminEmail);
            }
            else if (!adminUser.roles.Any(r => r.role_name == "ADMIN"))
            {
                adminUser.roles.Add(adminRole);
                await dbContext.SaveChangesAsync();
                seedLogger.LogWarning("🚀 [SEED] Admin role forced for existing user: {Email}", adminEmail);
            }

            // 3. Lecturer
            string lectEmail = "gv@fpt.edu.vn";
            if (!await dbContext.users.AnyAsync(u => u.email == lectEmail))
            {
                var role = await dbContext.roles.FirstAsync(r => r.role_name == "LECTURER");
                var u = new user { email = lectEmail, password = hasher.HashPassword("Lecturer@123"), full_name = "Nguyễn Văn A", enabled = true };
                u.roles.Add(role);
                dbContext.users.Add(u);
                await dbContext.SaveChangesAsync();
                dbContext.lecturers.Add(new lecturer { user_id = u.id, lecturer_code = "GV001", office_email = lectEmail, department = "SE" });
                await dbContext.SaveChangesAsync();
                seedLogger.LogWarning("🚀 [SEED] Lecturer seeded: {Email}", lectEmail);
            }

            // 4. Student
            string studEmail = "sv@fpt.edu.vn";
            if (!await dbContext.users.AnyAsync(u => u.email == studEmail))
            {
                var role = await dbContext.roles.FirstAsync(r => r.role_name == "STUDENT");
                var u = new user { email = studEmail, password = hasher.HashPassword("Student@123"), full_name = "Trần Thị B", enabled = true };
                u.roles.Add(role);
                dbContext.users.Add(u);
                await dbContext.SaveChangesAsync();
                dbContext.students.Add(new student { user_id = u.id, student_code = "SE123456", major = "SE", department = "IT" });
                await dbContext.SaveChangesAsync();
                seedLogger.LogWarning("🚀 [SEED] Student seeded: {Email}", studEmail);
            }

            // 5. Backfill missing names for old data
            var namelessUsers = await dbContext.users.Where(x => string.IsNullOrEmpty(x.full_name)).ToListAsync();
            if (namelessUsers.Any())
            {
                foreach (var x in namelessUsers)
                {
                    if (x.email == "dunghv@fpt.edu.vn") x.full_name = "Hồ Văn Dũng";
                    else if (x.email == "thanhnb@fpt.edu.vn") x.full_name = "Nguyễn Bá Thành";
                    else if (x.email == "gv@fpt.edu.vn") x.full_name = "Nguyễn Văn A";
                    else if (x.email == "lecturer@truonghoc.com") x.full_name = "Giảng viên Demo";
                    else x.full_name = "Người dùng " + x.id;
                }
                await dbContext.SaveChangesAsync();
                seedLogger.LogWarning("🚀 [SEED] Fixed missing full_name for {Count} older users", namelessUsers.Count);
            }

            // 6. Backfill missing lecturer records
            var lecturerUsers = await dbContext.users
                .Include(u => u.roles)
                .Include(u => u.lecturer)
                .Where(u => u.roles.Any(r => r.role_name.ToUpper() == "LECTURER"))
                .ToListAsync();

            seedLogger.LogInformation("🔍 Found {Count} users with LECTURER role for checking", lecturerUsers.Count);

            var newLecturersCount = 0;
            foreach (var lu in lecturerUsers)
            {
                if (lu.lecturer == null)
                {
                    seedLogger.LogWarning("⚠️ User {Email} (ID: {Id}) is missing lecturer record. Creating one...", lu.email, lu.id);
                    string uniqueCode = (lu.full_name?.Substring(0, Math.Min(3, lu.full_name.Length)) ?? "GV").ToUpper() + lu.id.ToString();
                    dbContext.lecturers.Add(new lecturer 
                    { 
                        user_id = lu.id, 
                        lecturer_code = uniqueCode, 
                        office_email = lu.email, 
                        department = "SE" 
                    });
                    newLecturersCount++;
                }
                else 
                {
                    seedLogger.LogInformation("✅ User {Email} already has lecturer record (Code: {Code})", lu.email, lu.lecturer.lecturer_code);
                }
            }

            // 7. Backfill missing student records
            var studentUsers = await dbContext.users
                .Include(u => u.roles)
                .Include(u => u.student)
                .Where(u => u.roles.Any(r => r.role_name.ToUpper() == "STUDENT"))
                .ToListAsync();

            var newStudentsCount = 0;
            foreach (var su in studentUsers)
            {
                if (su.student == null)
                {
                    seedLogger.LogWarning("⚠️ User {Email} (ID: {Id}) is missing student record. Creating one...", su.email, su.id);
                    string uniqueCode = "SE" + su.id.ToString().PadLeft(6, '0');
                    dbContext.students.Add(new student 
                    { 
                        user_id = su.id, 
                        student_code = uniqueCode, 
                        major = "SE", 
                        department = "IT" 
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
                seedLogger.LogInformation("✨ All user role records (Lecturer/Student) are already up to date.");
            }

            // ==========================================
            // NEW SEED DATA: SEMESTERS AND SUBJECTS
            // ==========================================
            
            // 8. Seed Semesters
            var defaultSemesters = new List<semester>
            {
                new semester { name = "Spring 2024", start_date = new DateOnly(2024, 1, 1), end_date = new DateOnly(2024, 4, 30), created_at = DateTime.UtcNow },
                new semester { name = "Summer 2024", start_date = new DateOnly(2024, 5, 1), end_date = new DateOnly(2024, 8, 31), created_at = DateTime.UtcNow },
                new semester { name = "Fall 2024", start_date = new DateOnly(2024, 9, 1), end_date = new DateOnly(2024, 12, 31), created_at = DateTime.UtcNow }
            };

            foreach (var s in defaultSemesters)
            {
                if (!await dbContext.semesters.AnyAsync(x => x.name == s.name))
                {
                    dbContext.semesters.Add(s);
                    seedLogger.LogInformation("🚀 [SEED] Seeded Semester: {Name}", s.name);
                }
            }
            await dbContext.SaveChangesAsync();

            // 9. Seed Subjects
            var defaultSubjects = new List<subject>
            {
                new subject { subject_code = "SWD392", subject_name = "Software Architecture and Design", department = "SE", credits = 3, max_students = 40, status = "ACTIVE", created_at = DateTime.UtcNow },
                new subject { subject_code = "PRN211", subject_name = "Basic Cross-Platform Application Programming With .NET", department = "SE", credits = 3, max_students = 40, status = "ACTIVE", created_at = DateTime.UtcNow },
                new subject { subject_code = "PRJ301", subject_name = "Java Web Application Development", department = "SE", credits = 3, max_students = 40, status = "ACTIVE", created_at = DateTime.UtcNow }
            };

            foreach (var sub in defaultSubjects)
            {
                if (!await dbContext.subjects.AnyAsync(x => x.subject_code == sub.subject_code))
                {
                    dbContext.subjects.Add(sub);
                    seedLogger.LogInformation("🚀 [SEED] Seeded Subject: {Code} - {Name}", sub.subject_code, sub.subject_name);
                }
            }
            await dbContext.SaveChangesAsync();

            // 10. Seed Course (Class)
            var subjectSwd = await dbContext.subjects.FirstOrDefaultAsync(s => s.subject_code == "SWD392");
            var semesterFall = await dbContext.semesters.FirstOrDefaultAsync(s => s.name == "Fall 2024");
            var mainLecturer = await dbContext.users.FirstOrDefaultAsync(u => u.email == "gv@fpt.edu.vn");

            if (subjectSwd != null && semesterFall != null && mainLecturer != null)
            {
                var courseCode = "SE1831";
                if (!await dbContext.courses.AnyAsync(c => c.course_code == courseCode && c.semester_id == semesterFall.id))
                {
                    var newCourse = new course
                    {
                        course_code = courseCode,
                        course_name = "SWD392 - SE1831",
                        semester_id = semesterFall.id,
                        subject_id = subjectSwd.id,
                        created_by_user_id = mainLecturer.id,
                        status = "ACTIVE",
                        max_students = 30,
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow
                    };
                    dbContext.courses.Add(newCourse);
                    await dbContext.SaveChangesAsync();
                    
                    // Assign Lecturer to Course
                    newCourse.lecturer_users.Add(mainLecturer.lecturer);
                    await dbContext.SaveChangesAsync();

                    seedLogger.LogInformation("🚀 [SEED] Seeded Course: {Code}", courseCode);

                    // 11. Seed Student Enrollment
                    var stuUser = await dbContext.users.FirstOrDefaultAsync(u => u.email == "sv@fpt.edu.vn");
                    if (stuUser != null)
                    {
                        var stuId = stuUser.id;
                        if (!await dbContext.course_enrollments.AnyAsync(ce => ce.course_id == newCourse.id && ce.student_user_id == stuId))
                        {
                            dbContext.course_enrollments.Add(new course_enrollment
                            {
                                course_id = newCourse.id,
                                student_user_id = stuId,
                                status = "ACTIVE",
                                enrolled_at = DateTime.UtcNow
                            });
                            await dbContext.SaveChangesAsync();
                            seedLogger.LogInformation("🚀 [SEED] Enrolled student {Email} into {Course}", stuUser.email, courseCode);
                        }

                        // 12. Seed Project Group
                        var projectName = "Jira-Github Sync System";
                        var proj = await dbContext.projects.FirstOrDefaultAsync(p => p.name == projectName && p.course_id == newCourse.id);
                        if (proj == null)
                        {
                            proj = new project
                            {
                                course_id = newCourse.id,
                                name = projectName,
                                status = "ACTIVE",
                                created_at = DateTime.UtcNow,
                                updated_at = DateTime.UtcNow
                            };
                            dbContext.projects.Add(proj);
                            await dbContext.SaveChangesAsync();
                            seedLogger.LogInformation("🚀 [SEED] Seeded Project: {ProjectName}", projectName);

                            // Add Student to Team
                            dbContext.team_members.Add(new team_member
                            {
                                project_id = proj.id,
                                student_user_id = stuId,
                                team_role = "LEADER",
                                participation_status = "ACTIVE"
                            });
                            await dbContext.SaveChangesAsync();
                            seedLogger.LogInformation("🚀 [SEED] Added {Email} as LEADER to Project.", stuUser.email);
                        }

                        // 13. Seed Jira and GitHub Integrations
                        var githubOwnerName = "FPT-University";
                        var githubRepoName = "SWD392-JiraGithubSync";
                        var githubFullName = $"{githubOwnerName}/{githubRepoName}";
                        var jiraProjectKey = "JGS";
                        var jiraProjectName = "Jira Github Sync Backend";

                        // Create Github Repo
                        var gitRepo = await dbContext.github_repositories.FirstOrDefaultAsync(g => g.full_name == githubFullName);
                        if (gitRepo == null)
                        {
                            gitRepo = new github_repository
                            {
                                owner_login = githubOwnerName,
                                name = githubRepoName,
                                full_name = githubFullName,
                                visibility = "public",
                                default_branch = "main",
                                repo_url = $"https://github.com/{githubFullName}",
                                created_at = DateTime.UtcNow,
                                updated_at = DateTime.UtcNow
                            };
                            dbContext.github_repositories.Add(gitRepo);
                            await dbContext.SaveChangesAsync();
                            seedLogger.LogInformation("🚀 [SEED] Seeded Github Repo: {FullName}", githubFullName);
                        }

                        // Create Jira Project
                        var jiraProj = await dbContext.jira_projects.FirstOrDefaultAsync(j => j.jira_project_key == jiraProjectKey);
                        if (jiraProj == null)
                        {
                            jiraProj = new jira_project
                            {
                                jira_project_key = jiraProjectKey,
                                project_name = jiraProjectName,
                                jira_url = "https://fpt-swd392.atlassian.net",
                                created_at = DateTime.UtcNow,
                                updated_at = DateTime.UtcNow
                            };
                            dbContext.jira_projects.Add(jiraProj);
                            await dbContext.SaveChangesAsync();
                            seedLogger.LogInformation("🚀 [SEED] Seeded Jira Project: {ProjectKey}", jiraProjectKey);
                        }

                        // Create Project Integration Profile
                        if (!await dbContext.project_integrations.AnyAsync(pi => pi.project_id == proj.id))
                        {
                            dbContext.project_integrations.Add(new project_integration
                            {
                                project_id = proj.id,
                                github_repo_id = gitRepo.id,
                                jira_project_id = jiraProj.id,
                                approval_status = "APPROVED",
                                submitted_by_user_id = stuId,
                                submitted_at = DateTime.UtcNow,
                                approved_by_user_id = mainLecturer.id,
                                approved_at = DateTime.UtcNow,
                                created_at = DateTime.UtcNow,
                                updated_at = DateTime.UtcNow
                            });
                            await dbContext.SaveChangesAsync();
                            seedLogger.LogInformation("🚀 [SEED] Linked Jira and Github to Project ID: {ProjectId}", proj.id);
                        }
                    }
                }
            }
            // ============================================
            // GIAI ĐOẠN 2: GITHUB & JIRA DATA
            // ============================================
            await SeedPhase2Async(dbContext, seedLogger);

            // ============================================
            // GIAI ĐOẠN 3: STUDENT ACTIVITY DAILY (Chart)
            // ============================================
            await SeedPhase3Async(dbContext, seedLogger);

            // ============================================
            // GIAI ĐOẠN 4: GH ISSUES, COMMENTS, WORK LINKS
            // ============================================
            await SeedPhase4Async(dbContext, seedLogger);
        }
        catch (Exception ex)
        {
            seedLogger.LogError(ex, "❌ Database seeding failed.");
        }
    }

    private static async Task SeedPhase2Async(
        JiraGithubToolDbContext dbContext,
        ILogger seedLogger)
    {
        try
        {
            // Lấy repo và jira project đã seed ở Giai đoạn 1
            var gitRepo = await dbContext.github_repositories
                .FirstOrDefaultAsync(g => g.full_name == "FPT-University/SWD392-JiraGithubSync");
            var jiraProj = await dbContext.jira_projects
                .FirstOrDefaultAsync(j => j.jira_project_key == "JGS");
            var stuUser = await dbContext.users
                .Include(u => u.student)
                .FirstOrDefaultAsync(u => u.email == "sv@fpt.edu.vn");

            if (gitRepo == null || jiraProj == null || stuUser == null)
            {
                seedLogger.LogWarning("⚠️ [PHASE 2] Skipped: Missing repo/jira/student from Phase 1.");
                return;
            }

            // -------------------------------------------------------
            // A. External Account: Mapping sinh viên FPT ↔ GitHub/Jira
            // -------------------------------------------------------
            var githubLogin = "tranthi-b";
            var jiraAccountId = "712020:abc123xyz-jira-demo";

            if (!await dbContext.external_accounts.AnyAsync(ea => ea.user_id == stuUser.id && ea.provider == "GITHUB"))
            {
                dbContext.external_accounts.Add(new external_account
                {
                    user_id = stuUser.id,
                    provider = "GITHUB",
                    external_user_key = githubLogin,
                    username = githubLogin,
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                });
                seedLogger.LogInformation("🚀 [SEED] External Account (GitHub) mapped for {Email}", stuUser.email);
            }

            if (!await dbContext.external_accounts.AnyAsync(ea => ea.user_id == stuUser.id && ea.provider == "JIRA"))
            {
                dbContext.external_accounts.Add(new external_account
                {
                    user_id = stuUser.id,
                    provider = "JIRA",
                    external_user_key = jiraAccountId,
                    username = "tranthi.b@fpt.edu.vn",
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                });
                seedLogger.LogInformation("🚀 [SEED] External Account (Jira) mapped for {Email}", stuUser.email);
            }
            await dbContext.SaveChangesAsync();

            // -------------------------------------------------------
            // B. GitHub User: Profile người dùng trên GitHub
            // -------------------------------------------------------
            var ghUser = await dbContext.github_users.FirstOrDefaultAsync(g => g.login == githubLogin);
            if (ghUser == null)
            {
                ghUser = new github_user
                {
                    login = githubLogin,
                    display_name = "Trần Thị B",
                    email = "sv@fpt.edu.vn",
                    avatar_url = "https://avatars.githubusercontent.com/u/99999999",
                    user_type = "User",
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };
                dbContext.github_users.Add(ghUser);
                await dbContext.SaveChangesAsync();
                seedLogger.LogInformation("🚀 [SEED] GitHub User: {Login}", githubLogin);
            }

            // -------------------------------------------------------
            // C. GitHub Branch: Tạo các nhánh code mẫu
            // -------------------------------------------------------
            // SHA cố định cho branch (Guid.ToString("N") chỉ 32 ký tự, không dùng [..40])
            var branchData = new[]
            {
                new { name = "main",              sha = "1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b", isDefault = true  },
                new { name = "dev",               sha = "2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c", isDefault = false },
                new { name = "feature/login",     sha = "3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d", isDefault = false },
                new { name = "feature/jira-sync", sha = "4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e", isDefault = false },
            };
            var seedBranches = new List<github_branch>();
            foreach (var bd in branchData)
            {
                if (!await dbContext.github_branches.AnyAsync(b => b.repo_id == gitRepo.id && b.branch_name == bd.name))
                {
                    var br = new github_branch
                    {
                        repo_id = gitRepo.id,
                        branch_name = bd.name,
                        is_default = bd.isDefault,
                        head_commit_sha = bd.sha,
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow
                    };
                    dbContext.github_branches.Add(br);
                    seedBranches.Add(br);
                    seedLogger.LogInformation("🚀 [SEED] Branch: {Branch}", bd.name);
                }
            }
            await dbContext.SaveChangesAsync();

            // -------------------------------------------------------
            // D. GitHub Commits: Tạo lịch sử commit mẫu (7 ngày gần nhất)
            // -------------------------------------------------------
            // SHA cố định để seed không tạo duplicate mỗi lần restart
            var commitData = new[]
            {
                new { sha = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2", msg = "feat: init project structure",        add = 50,  del = 0,  files = 5, daysAgo = 14 },
                new { sha = "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3", msg = "feat: add JWT authentication",       add = 80,  del = 10, files = 6, daysAgo = 12 },
                new { sha = "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4", msg = "feat: integrate Jira API",           add = 120, del = 20, files = 8, daysAgo = 10 },
                new { sha = "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5", msg = "fix: null ref on commit sync",       add = 15,  del = 5,  files = 2, daysAgo = 8  },
                new { sha = "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6", msg = "feat: add GitHub webhook handler",  add = 90,  del = 15, files = 7, daysAgo = 6  },
                new { sha = "f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1", msg = "refactor: clean up service layer",  add = 30,  del = 45, files = 9, daysAgo = 4  },
                new { sha = "a7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8", msg = "feat: export SRS report to PDF",   add = 60,  del = 5,  files = 4, daysAgo = 2  },
            };

            var seededCommits = new List<github_commit>();
            foreach (var cd in commitData)
            {
                if (!await dbContext.github_commits.AnyAsync(c => c.repo_id == gitRepo.id && c.commit_sha == cd.sha))
                {
                    var commit = new github_commit
                    {
                        repo_id = gitRepo.id,
                        commit_sha = cd.sha,
                        message = cd.msg,
                        author_github_user_id = ghUser.id,
                        committer_github_user_id = ghUser.id,
                        committed_at = DateTime.UtcNow.AddDays(-cd.daysAgo),
                        additions = cd.add,
                        deletions = cd.del,
                        changed_files = cd.files,
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow
                    };
                    dbContext.github_commits.Add(commit);
                    seededCommits.Add(commit);
                }
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED] {Count} GitHub Commits seeded.", seededCommits.Count);

            // -------------------------------------------------------
            // E. GitHub Pull Requests: Tạo PR mẫu
            // -------------------------------------------------------
            if (!await dbContext.github_pull_requests.AnyAsync(pr => pr.repo_id == gitRepo.id && pr.pr_number == 1))
            {
                dbContext.github_pull_requests.Add(new github_pull_request
                {
                    repo_id = gitRepo.id,
                    pr_number = 1,
                    title = "feat: Jira sync module",
                    body = "Integrate Jira API to sync issues into local DB.",
                    state = "merged",
                    author_github_user_id = ghUser.id,
                    source_branch = "feature/jira-sync",
                    target_branch = "main",
                    created_at = DateTime.UtcNow.AddDays(-5),
                    updated_at = DateTime.UtcNow.AddDays(-3),
                    merged_at = DateTime.UtcNow.AddDays(-3)
                });
            }
            if (!await dbContext.github_pull_requests.AnyAsync(pr => pr.repo_id == gitRepo.id && pr.pr_number == 2))
            {
                dbContext.github_pull_requests.Add(new github_pull_request
                {
                    repo_id = gitRepo.id,
                    pr_number = 2,
                    title = "feat: Login feature",
                    body = "Add JWT authentication for students and lecturers.",
                    state = "open",
                    author_github_user_id = ghUser.id,
                    source_branch = "feature/login",
                    target_branch = "dev",
                    created_at = DateTime.UtcNow.AddDays(-2),
                    updated_at = DateTime.UtcNow
                });
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED] GitHub Pull Requests seeded.");

            // -------------------------------------------------------
            // F. Jira Issues: Tạo Epic, Story, Task, Bug mẫu
            // -------------------------------------------------------
            var jiraIssueData = new[]
            {
                new { key = "JGS-1", title = "Setup Project Infrastructure",    type = "Epic",  status = "Done",        priority = "High"   },
                new { key = "JGS-2", title = "Integrate Jira API",              type = "Story", status = "Done",        priority = "High"   },
                new { key = "JGS-3", title = "Implement JWT Authentication",    type = "Task",  status = "Done",        priority = "High"   },
                new { key = "JGS-4", title = "Sync GitHub Commits to DB",       type = "Task",  status = "In Progress", priority = "Medium" },
                new { key = "JGS-5", title = "Export SRS Report as PDF",        type = "Task",  status = "In Progress", priority = "Medium" },
                new { key = "JGS-6", title = "Fix null ref on commit sync",     type = "Bug",   status = "Done",        priority = "High"   },
                new { key = "JGS-7", title = "Build Contribution Score API",    type = "Task",  status = "To Do",       priority = "Low"    },
            };

            foreach (var issue in jiraIssueData)
            {
                if (!await dbContext.jira_issues.AnyAsync(ji => ji.jira_issue_key == issue.key))
                {
                    dbContext.jira_issues.Add(new jira_issue
                    {
                        jira_issue_key = issue.key,
                        jira_project_id = jiraProj.id,
                        title = issue.title,
                        issue_type = issue.type,
                        status = issue.status,
                        priority = issue.priority,
                        assignee_jira_account_id = jiraAccountId,
                        reporter_jira_account_id = jiraAccountId,
                        created_at = DateTime.UtcNow.AddDays(-14),
                        updated_at = DateTime.UtcNow
                    });
                }
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED] {Count} Jira Issues seeded.", jiraIssueData.Length);

            // -------------------------------------------------------
            // G. Jira Worklogs: Log giờ làm việc cho từng Task đã xong
            // -------------------------------------------------------
            var doneIssues = await dbContext.jira_issues
                .Where(ji => ji.jira_project_id == jiraProj.id && ji.status == "Done")
                .ToListAsync();

            foreach (var doneIssue in doneIssues)
            {
                if (!await dbContext.jira_worklogs.AnyAsync(wl => wl.issue_id == doneIssue.id))
                {
                    dbContext.jira_worklogs.Add(new jira_worklog
                    {
                        issue_id = doneIssue.id,
                        author_jira_account_id = jiraAccountId,
                        time_spent = 4.0m,
                        created_at = DateTime.UtcNow.AddDays(-3)
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
    // GIAI ĐOẠN 3: STUDENT ACTIVITY DAILY (Dữ liệu Chart/Dashboard)
    // ============================================================
    private static async Task SeedPhase3Async(
        JiraGithubToolDbContext dbContext,
        ILogger seedLogger)
    {
        try
        {
            var stuUser = await dbContext.users
                .Include(u => u.student)
                .FirstOrDefaultAsync(u => u.email == "sv@fpt.edu.vn");

            var proj = await dbContext.projects
                .FirstOrDefaultAsync(p => p.name == "Jira-Github Sync System");

            if (stuUser == null || stuUser.student == null || proj == null)
            {
                seedLogger.LogWarning("⚠️ [PHASE 3] Skipped: Missing student/project.");
                return;
            }

            var stuId = stuUser.id;
            var projId = proj.id;

            // Tạo dữ liệu activity cho 14 ngày gần nhất để chart hiển thị
            var activityData = new[]
            {
                new { daysAgo = 14, commits = 3,  added = 150, deleted = 10,  prs = 0, reviews = 0, issuesCreated = 2, issuesDone = 0, points = 0, hours = 3.0m, comments = 1 },
                new { daysAgo = 13, commits = 2,  added = 80,  deleted = 5,   prs = 0, reviews = 0, issuesCreated = 1, issuesDone = 1, points = 3, hours = 2.0m, comments = 2 },
                new { daysAgo = 12, commits = 4,  added = 200, deleted = 20,  prs = 1, reviews = 0, issuesCreated = 0, issuesDone = 2, points = 5, hours = 4.5m, comments = 3 },
                new { daysAgo = 11, commits = 0,  added = 0,   deleted = 0,   prs = 0, reviews = 1, issuesCreated = 1, issuesDone = 0, points = 0, hours = 1.0m, comments = 2 },
                new { daysAgo = 10, commits = 5,  added = 250, deleted = 30,  prs = 0, reviews = 1, issuesCreated = 2, issuesDone = 1, points = 3, hours = 5.0m, comments = 4 },
                new { daysAgo = 9,  commits = 1,  added = 40,  deleted = 5,   prs = 0, reviews = 0, issuesCreated = 0, issuesDone = 1, points = 2, hours = 1.5m, comments = 1 },
                new { daysAgo = 8,  commits = 2,  added = 60,  deleted = 15,  prs = 0, reviews = 0, issuesCreated = 1, issuesDone = 0, points = 0, hours = 2.0m, comments = 2 },
                new { daysAgo = 7,  commits = 3,  added = 90,  deleted = 10,  prs = 1, reviews = 1, issuesCreated = 0, issuesDone = 2, points = 5, hours = 3.5m, comments = 5 },
                new { daysAgo = 6,  commits = 4,  added = 180, deleted = 25,  prs = 0, reviews = 0, issuesCreated = 2, issuesDone = 1, points = 3, hours = 4.0m, comments = 3 },
                new { daysAgo = 5,  commits = 2,  added = 70,  deleted = 8,   prs = 0, reviews = 1, issuesCreated = 1, issuesDone = 1, points = 2, hours = 2.5m, comments = 2 },
                new { daysAgo = 4,  commits = 6,  added = 300, deleted = 45,  prs = 1, reviews = 0, issuesCreated = 0, issuesDone = 3, points = 8, hours = 6.0m, comments = 6 },
                new { daysAgo = 3,  commits = 1,  added = 30,  deleted = 5,   prs = 0, reviews = 1, issuesCreated = 1, issuesDone = 0, points = 0, hours = 1.0m, comments = 1 },
                new { daysAgo = 2,  commits = 3,  added = 110, deleted = 15,  prs = 0, reviews = 0, issuesCreated = 0, issuesDone = 2, points = 5, hours = 3.0m, comments = 4 },
                new { daysAgo = 1,  commits = 2,  added = 75,  deleted = 10,  prs = 1, reviews = 1, issuesCreated = 1, issuesDone = 1, points = 3, hours = 2.5m, comments = 3 },
            };

            int addedCount = 0;
            foreach (var a in activityData)
            {
                var date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-a.daysAgo));
                if (!await dbContext.student_activity_dailies.AnyAsync(
                    x => x.student_user_id == stuId && x.project_id == projId && x.activity_date == date))
                {
                    dbContext.student_activity_dailies.Add(new student_activity_daily
                    {
                        student_user_id = stuId,
                        project_id = projId,
                        activity_date = date,
                        commits_count = a.commits,
                        lines_added = a.added,
                        lines_deleted = a.deleted,
                        pull_requests_count = a.prs,
                        code_reviews_count = a.reviews,
                        issues_created = a.issuesCreated,
                        issues_completed = a.issuesDone,
                        story_points = a.points,
                        time_logged_hours = a.hours,
                        comments_count = a.comments,
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow
                    });
                    addedCount++;
                }
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED Phase 3] {Count} student_activity_daily records seeded.", addedCount);
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
            var gitRepo = await dbContext.github_repositories
                .FirstOrDefaultAsync(g => g.full_name == "FPT-University/SWD392-JiraGithubSync");
            var ghUser = await dbContext.github_users
                .FirstOrDefaultAsync(g => g.login == "tranthi-b");
            var jiraProj = await dbContext.jira_projects
                .FirstOrDefaultAsync(j => j.jira_project_key == "JGS");

            if (gitRepo == null || ghUser == null || jiraProj == null)
            {
                seedLogger.LogWarning("⚠️ [PHASE 4] Skipped: Missing repo/user/jira from Phase 1-2.");
                return;
            }

            var jiraAccountId = "712020:abc123xyz-jira-demo";

            // -------------------------------------------------------
            // A. GitHub Issues (Bug tracker trên GitHub)
            // -------------------------------------------------------
            var ghIssueData = new[]
            {
                new { num = 1, title = "Bug: Jira sync fails for subtasks",    state = "closed", daysAgo = 10 },
                new { num = 2, title = "Feature: Add pagination to commit list", state = "open",   daysAgo = 6  },
                new { num = 3, title = "Bug: PR webhook not triggering sync",  state = "closed", daysAgo = 4  },
            };

            foreach (var gi in ghIssueData)
            {
                if (!await dbContext.github_issues.AnyAsync(i => i.repo_id == gitRepo.id && i.issue_number == gi.num))
                {
                    var newGhIssue = new github_issue
                    {
                        repo_id = gitRepo.id,
                        issue_number = gi.num,
                        title = gi.title,
                        state = gi.state,
                        author_github_user_id = ghUser.id,
                        assignee_github_user_id = ghUser.id,
                        created_at = DateTime.UtcNow.AddDays(-gi.daysAgo),
                        updated_at = DateTime.UtcNow,
                        closed_at = gi.state == "closed" ? DateTime.UtcNow.AddDays(-1) : null
                    };
                    dbContext.github_issues.Add(newGhIssue);
                }
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED P4] GitHub Issues seeded.");

            // -------------------------------------------------------
            // B. GitHub Issue Comments
            // -------------------------------------------------------
            var allGhIssues = await dbContext.github_issues
                .Where(i => i.repo_id == gitRepo.id)
                .ToListAsync();

            foreach (var ghIssue in allGhIssues)
            {
                if (!await dbContext.github_issue_comments.AnyAsync(c => c.issue_id == ghIssue.id))
                {
                    dbContext.github_issue_comments.Add(new github_issue_comment
                    {
                        issue_id = ghIssue.id,
                        author_github_user_id = ghUser.id,
                        body = $"Looking into this issue. Will fix in next sprint.",
                        created_at = DateTime.UtcNow.AddDays(-1),
                        updated_at = DateTime.UtcNow
                    });
                }
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED P4] GitHub Issue Comments seeded.");

            // -------------------------------------------------------
            // C. Jira Issue Comments
            // -------------------------------------------------------
            var allJiraIssues = await dbContext.jira_issues
                .Where(ji => ji.jira_project_id == jiraProj.id)
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
                if (!await dbContext.jira_issue_comments.AnyAsync(c => c.issue_id == ji.id))
                {
                    dbContext.jira_issue_comments.Add(new jira_issue_comment
                    {
                        issue_id = ji.id,
                        author_jira_account_id = jiraAccountId,
                        body = jiraCommentBodies[commentIdx % jiraCommentBodies.Length],
                        created_at = DateTime.UtcNow.AddDays(-2)
                    });
                    commentIdx++;
                }
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED P4] Jira Issue Comments seeded.");

            // -------------------------------------------------------
            // D. Jira Issue Links (Task blocks/relates-to)
            // -------------------------------------------------------
            var issueJgs1 = await dbContext.jira_issues.FirstOrDefaultAsync(i => i.jira_issue_key == "JGS-1");
            var issueJgs2 = await dbContext.jira_issues.FirstOrDefaultAsync(i => i.jira_issue_key == "JGS-2");
            var issueJgs3 = await dbContext.jira_issues.FirstOrDefaultAsync(i => i.jira_issue_key == "JGS-3");
            var issueJgs4 = await dbContext.jira_issues.FirstOrDefaultAsync(i => i.jira_issue_key == "JGS-4");

            if (issueJgs1 != null && issueJgs2 != null)
            {
                if (!await dbContext.jira_issue_links.AnyAsync(
                    l => l.parent_issue_id == issueJgs1.id && l.child_issue_id == issueJgs2.id))
                {
                    dbContext.jira_issue_links.Add(new jira_issue_link
                    {
                        parent_issue_id = issueJgs1.id,
                        child_issue_id = issueJgs2.id,
                        link_type = "is_parent_of"
                    });
                }
            }
            if (issueJgs3 != null && issueJgs4 != null)
            {
                if (!await dbContext.jira_issue_links.AnyAsync(
                    l => l.parent_issue_id == issueJgs3.id && l.child_issue_id == issueJgs4.id))
                {
                    dbContext.jira_issue_links.Add(new jira_issue_link
                    {
                        parent_issue_id = issueJgs3.id,
                        child_issue_id = issueJgs4.id,
                        link_type = "blocks"
                    });
                }
            }
            await dbContext.SaveChangesAsync();
            seedLogger.LogInformation("🚀 [SEED P4] Jira Issue Links seeded.");

            // -------------------------------------------------------
            // E. Work Links: Liên kết Commit/PR ↔ Jira Issue
            // (Đây là bảng quan trọng nhất để truy xuất nguồn gốc công việc)
            // -------------------------------------------------------
            var allCommits = await dbContext.github_commits
                .Where(c => c.repo_id == gitRepo.id)
                .ToListAsync();
            var allPRs = await dbContext.github_pull_requests
                .Where(pr => pr.repo_id == gitRepo.id)
                .ToListAsync();

            // Map commit → Jira Issue theo thứ tự
            var commitJiraMap = new[]
            {
                new { sha = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2", jiraKey = "JGS-1" },
                new { sha = "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3", jiraKey = "JGS-3" },
                new { sha = "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4", jiraKey = "JGS-2" },
                new { sha = "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5", jiraKey = "JGS-6" },
                new { sha = "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6", jiraKey = "JGS-4" },
                new { sha = "f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1", jiraKey = "JGS-2" },
                new { sha = "a7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8", jiraKey = "JGS-5" },
            };

            int workLinkCount = 0;
            foreach (var map in commitJiraMap)
            {
                var commit = allCommits.FirstOrDefault(c => c.commit_sha == map.sha);
                var jiraIssue = await dbContext.jira_issues.FirstOrDefaultAsync(i => i.jira_issue_key == map.jiraKey);
                if (commit == null || jiraIssue == null) continue;

                if (!await dbContext.work_links.AnyAsync(
                    wl => wl.jira_issue_id == jiraIssue.id && wl.commit_id == commit.id && wl.link_type == "COMMIT"))
                {
                    dbContext.work_links.Add(new work_link
                    {
                        jira_issue_id = jiraIssue.id,
                        repo_id = gitRepo.id,
                        link_type = "COMMIT",
                        commit_id = commit.id,
                        created_at = DateTime.UtcNow
                    });
                    workLinkCount++;
                }
            }

            // Gắn PR #1 → JGS-2 (Jira sync story)
            var pr1 = allPRs.FirstOrDefault(pr => pr.pr_number == 1);
            var jgs2 = await dbContext.jira_issues.FirstOrDefaultAsync(i => i.jira_issue_key == "JGS-2");
            if (pr1 != null && jgs2 != null &&
                !await dbContext.work_links.AnyAsync(wl => wl.pr_id == pr1.id && wl.jira_issue_id == jgs2.id))
            {
                dbContext.work_links.Add(new work_link
                {
                    jira_issue_id = jgs2.id,
                    repo_id = gitRepo.id,
                    link_type = "PR",
                    pr_id = pr1.id,
                    created_at = DateTime.UtcNow
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


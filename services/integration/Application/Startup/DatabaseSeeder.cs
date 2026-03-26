using JiraGithubExport.Shared.Infrastructure.Identity.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

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
            
            // Auto-fix missing columns if EF migration is not yet ready
            await dbContext.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE jira_issues 
                ADD COLUMN IF NOT EXISTS due_date TIMESTAMP,
                ADD COLUMN IF NOT EXISTS story_points INTEGER DEFAULT 0,
                ADD COLUMN IF NOT EXISTS resolution_date TIMESTAMP;

                ALTER TABLE project_integrations 
                ADD COLUMN IF NOT EXISTS github_token TEXT,
                ADD COLUMN IF NOT EXISTS jira_token TEXT;
            ");

            await SeedRolesAsync(dbContext);
            await SeedBasicUsersAsync(dbContext, hasher);
            await FixMissingUserRecordsAsync(dbContext);
            await SeedSemestersAndSubjectsAsync(dbContext);
            await SeedCourseAndEnrollmentAsync(dbContext);
            
            await SeedPhase2Async(dbContext);
            await SeedPhase3Async(dbContext);
            await SeedPhase5Async(dbContext);
            await SeedPhase6Async(dbContext);
            await SeedPhase7Async(dbContext);

            seedLogger.LogInformation("✅ Database seeding completed successfully!");
        }
        catch (Exception ex)
        {
            seedLogger.LogError(ex, "❌ An error occurred while seeding the database.");
        }
    }

    private static async Task SeedRolesAsync(JiraGithubToolDbContext dbContext)
    {
        var roles = new[] { "ADMIN", "LECTURER", "STUDENT" };
        foreach (var roleName in roles)
        {
            if (!await dbContext.roles.AnyAsync(r => r.role_name == roleName))
            {
                dbContext.roles.Add(new role { role_name = roleName });
            }
        }
        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedBasicUsersAsync(JiraGithubToolDbContext dbContext, IPasswordHasher hasher)
    {
        // Admin
        string adminEmail = "admin@truonghoc.com";
        var adminRole = await dbContext.roles.FirstAsync(r => r.role_name == "ADMIN");
        var adminUser = await dbContext.users.Include(u => u.roles).FirstOrDefaultAsync(u => u.email == adminEmail);

        if (adminUser == null)
        {
            adminUser = new user { email = adminEmail, password = hasher.HashPassword("Admin@123"), full_name = "Super Admin", enabled = true };
            adminUser.roles.Add(adminRole);
            dbContext.users.Add(adminUser);
            await dbContext.SaveChangesAsync();
        }
        else if (!adminUser.roles.Any(r => r.role_name == "ADMIN"))
        {
            adminUser.roles.Add(adminRole);
            await dbContext.SaveChangesAsync();
        }

        // Lecturers
        var lectEmails = new[] { "gv@fpt.edu.vn", "dunghv@fpt.edu.vn", "thanhnb@fpt.edu.vn" };
        var lectRole = await dbContext.roles.FirstAsync(r => r.role_name == "LECTURER");

        foreach (var email in lectEmails)
        {
            if (!await dbContext.users.AnyAsync(u => u.email == email))
            {
                var u = new user { email = email, password = hasher.HashPassword("Lecturer@123"), full_name = email == "gv@fpt.edu.vn" ? "Nguyễn Văn A" : email.Split('@')[0], enabled = true };
                u.roles.Add(lectRole);
                dbContext.users.Add(u);
                await dbContext.SaveChangesAsync();
                
                string code = "GV" + u.id.ToString().PadLeft(3, '0');
                dbContext.lecturers.Add(new lecturer { user_id = u.id, lecturer_code = code, office_email = email, department = "SE" });
            }
        }
        await dbContext.SaveChangesAsync();

        // Students
        var studentEmails = new[] { 
            "sv@fpt.edu.vn", "kietdt@fpt.edu.vn", "tuannv@fpt.edu.vn", 
            "anhbd@fpt.edu.vn", "sinhvnv@fpt.edu.vn", "phuonglt@fpt.edu.vn" 
        };
        var studentRole = await dbContext.roles.FirstAsync(r => r.role_name == "STUDENT");

        foreach (var email in studentEmails)
        {
            if (!await dbContext.users.AnyAsync(u => u.email == email))
            {
                string name = email switch {
                    "sv@fpt.edu.vn" => "Trần Thị B",
                    "kietdt@fpt.edu.vn" => "Dương Tuấn Kiệt",
                    "tuannv@fpt.edu.vn" => "Nguyễn Văn Tuấn",
                    "anhbd@fpt.edu.vn" => "Bùi Đức Anh",
                    "sinhvnv@fpt.edu.vn" => "Nguyễn Văn Sinh Viên",
                    "phuonglt@fpt.edu.vn" => "Lý Thanh Phương",
                    _ => "Sinh viên " + email.Split('@')[0]
                };
                var u = new user { email = email, password = hasher.HashPassword("Student@123"), full_name = name, enabled = true };
                u.roles.Add(studentRole);
                dbContext.users.Add(u);
                await dbContext.SaveChangesAsync();
                
                dbContext.students.Add(new student { user_id = u.id, student_code = "SE" + u.id.ToString().PadLeft(6, '0'), major = "SE", department = "IT" });
            }
        }
        await dbContext.SaveChangesAsync();
    }

    private static async Task FixMissingUserRecordsAsync(JiraGithubToolDbContext dbContext)
    {
        var namelessUsers = await dbContext.users.Where(x => string.IsNullOrEmpty(x.full_name)).ToListAsync();
        foreach (var x in namelessUsers)
        {
            x.full_name = x.email switch {
                "dunghv@fpt.edu.vn" => "Hồ Văn Dũng",
                "thanhnb@fpt.edu.vn" => "Nguyễn Bá Thành",
                "gv@fpt.edu.vn" => "Nguyễn Văn A",
                _ => "Người dùng " + x.id
            };
        }
        await dbContext.SaveChangesAsync();

        var lecturerUsers = await dbContext.users.Include(u => u.roles).Include(u => u.lecturer)
            .Where(u => u.roles.Any(r => r.role_name == "LECTURER") && u.lecturer == null).ToListAsync();
        foreach (var lu in lecturerUsers)
        {
            string fullName = lu.full_name ?? "GV";
            string codePrefix = fullName.Length >= 3 ? fullName.Substring(0, 3) : fullName;
            string code = codePrefix.ToUpper() + lu.id;
            dbContext.lecturers.Add(new lecturer { user_id = lu.id, lecturer_code = code, office_email = lu.email, department = "SE" });
        }

        var studentUsers = await dbContext.users.Include(u => u.roles).Include(u => u.student)
            .Where(u => u.roles.Any(r => r.role_name == "STUDENT") && u.student == null).ToListAsync();
        foreach (var su in studentUsers)
        {
            dbContext.students.Add(new student { user_id = su.id, student_code = "SE" + su.id.ToString().PadLeft(6, '0'), major = "SE", department = "IT" });
        }
        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedSemestersAndSubjectsAsync(JiraGithubToolDbContext dbContext)
    {
        var semesters = new[] { "Spring 2024", "Summer 2024", "Fall 2024" };
        foreach (var name in semesters)
        {
            if (!await dbContext.semesters.AnyAsync(x => x.name == name))
            {
                dbContext.semesters.Add(new semester { name = name, start_date = new DateOnly(2024, 1, 1), end_date = new DateOnly(2024, 12, 31) });
            }
        }
        await dbContext.SaveChangesAsync();

        var subjects = new[] { 
            new { Code = "SWD392", Name = "Software Architecture and Design" },
            new { Code = "PRN211", Name = "Basic Cross-Platform Programming" }
        };
        foreach (var s in subjects)
        {
            if (!await dbContext.subjects.AnyAsync(x => x.subject_code == s.Code))
            {
                dbContext.subjects.Add(new subject { subject_code = s.Code, subject_name = s.Name, department = "SE", credits = 3, status = "ACTIVE" });
            }
        }
        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedCourseAndEnrollmentAsync(JiraGithubToolDbContext dbContext)
    {
        var sub = await dbContext.subjects.FirstOrDefaultAsync(s => s.subject_code == "SWD392");
        var sem = await dbContext.semesters.FirstOrDefaultAsync(s => s.name == "Fall 2024");
        var lect = await dbContext.users.Include(u => u.lecturer).FirstOrDefaultAsync(u => u.email == "gv@fpt.edu.vn");
        if (sub == null || sem == null || lect == null || lect.lecturer == null) return;

        var courseCode = "SE1831";
        var existingCourse = await dbContext.courses.Include(c => c.lecturer_users).FirstOrDefaultAsync(c => c.course_code == courseCode);
        if (existingCourse == null)
        {
            var newCourse = new course {
                course_code = courseCode, course_name = "SWD392 - SE1831", semester_id = sem.id, subject_id = sub.id,
                created_by_user_id = lect.id, status = "ACTIVE", max_students = 30
            };

            // Assign only a single lecturer for test isolation (avoid every lecturer sharing identical course/group data).
            var lecturerEntity = await dbContext.lecturers.FirstOrDefaultAsync(l => l.user_id == lect.id);
            if (lecturerEntity != null)
            {
                newCourse.lecturer_users.Add(lecturerEntity);
            }
            
            dbContext.courses.Add(newCourse);
            await dbContext.SaveChangesAsync();
            existingCourse = newCourse;
        }
        else
        {
            // Replace lecturer assignment with the same deterministic lecturer entity.
            existingCourse.lecturer_users.Clear();
            var lecturerEntity = await dbContext.lecturers.FirstOrDefaultAsync(l => l.user_id == lect.id);
            if (lecturerEntity != null)
            {
                existingCourse.lecturer_users.Add(lecturerEntity);
            }
            await dbContext.SaveChangesAsync();
        }

        var allStudents = await dbContext.users.Where(u => u.roles.Any(r => r.role_name == "STUDENT")).ToListAsync();
        foreach (var s in allStudents)
        {
            if (!await dbContext.course_enrollments.AnyAsync(ce => ce.course_id == existingCourse.id && ce.student_user_id == s.id))
            {
                dbContext.course_enrollments.Add(new course_enrollment { course_id = existingCourse.id, student_user_id = s.id, status = "ACTIVE" });
            }
        }
        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedPhase2Async(JiraGithubToolDbContext dbContext)
    {
        var course = await dbContext.courses.FirstOrDefaultAsync(c => c.course_code == "SE1831");
        if (course == null) return;

        if (!await dbContext.projects.AnyAsync(p => p.course_id == course.id))
        {
            var project = new project {
                course_id = course.id, name = "Group 1 - Jira Github Export",
                description = "Hệ thống quản lý và xuất dữ liệu từ Jira và Github",
                status = "ACTIVE"
            };
            dbContext.projects.Add(project);
            await dbContext.SaveChangesAsync();

            var projectStudents = await dbContext.users
                .Where(u => u.email == "sv@fpt.edu.vn" || u.email == "kietdt@fpt.edu.vn" || u.email == "tuannv@fpt.edu.vn")
                .ToListAsync();

            foreach (var stu in projectStudents)
            {
                dbContext.team_members.Add(new team_member {
                    project_id = project.id, student_user_id = stu.id,
                    team_role = stu.email == "sv@fpt.edu.vn" ? "LEADER" : "MEMBER", 
                    participation_status = "ACTIVE"
                });
            }
            await dbContext.SaveChangesAsync();
        }
    }

    private static async Task SeedPhase3Async(JiraGithubToolDbContext dbContext)
    {
        var stuUser = await dbContext.users.Include(u => u.student).FirstOrDefaultAsync(u => u.email == "sv@fpt.edu.vn");
        var proj = await dbContext.projects.Include(p => p.team_members).FirstOrDefaultAsync(p => p.team_members.Any(t => t.student_user_id == stuUser.id));
        if (stuUser == null || proj == null) return;

        var teamMembers = proj.team_members.ToList();
        var activityTemplate = new[] {
            new { daysAgo = 80, commits = 2, added = 50, prs = 0, issuesDone = 0 },
            new { daysAgo = 73, commits = 3, added = 100, prs = 1, issuesDone = 1 },
            new { daysAgo = 38, commits = 6, added = 300, prs = 1, issuesDone = 3 },
            new { daysAgo = 14, commits = 3, added = 150, prs = 1, issuesDone = 1 },
            new { daysAgo = 7,  commits = 3, added = 90,  prs = 1, issuesDone = 2 },
            new { daysAgo = 1,  commits = 2, added = 75,  prs = 1, issuesDone = 1 },
        };

        foreach (var member in teamMembers)
        {
            foreach (var a in activityTemplate)
            {
                var date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-a.daysAgo));
                if (!await dbContext.student_activity_dailies.AnyAsync(x => x.project_id == proj.id && x.student_user_id == member.student_user_id && x.activity_date == date))
                {
                    dbContext.student_activity_dailies.Add(new student_activity_daily {
                        project_id = proj.id, student_user_id = member.student_user_id,
                        activity_date = date, commits_count = a.commits, lines_added = a.added,
                        pull_requests_count = a.prs, issues_completed = a.issuesDone
                    });
                }
            }
        }
        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedPhase5Async(JiraGithubToolDbContext dbContext)
    {
        var proj = await dbContext.projects.FirstOrDefaultAsync();
        if (proj == null) return;

        if (!await dbContext.project_integrations.AnyAsync(pi => pi.project_id == proj.id))
        {
            var github = new github_repository {
                name = "JiraGithubExport", owner_login = "demo-user",
                full_name = "demo-user/JiraGithubExport", repo_url = "https://github.com/demo-user/JiraGithubExport"
            };
            dbContext.github_repositories.Add(github);
            await dbContext.SaveChangesAsync();

            var jira = new jira_project { jira_project_key = "SWD", project_name = "Software Design", jira_url = "https://atlassian.net" };
            dbContext.jira_projects.Add(jira);
            await dbContext.SaveChangesAsync();

            dbContext.project_integrations.Add(new project_integration {
                project_id = proj.id, github_repo_id = github.id, jira_project_id = jira.id,
                approval_status = "APPROVED", submitted_at = DateTime.UtcNow.AddDays(-20),
                approved_at = DateTime.UtcNow.AddDays(-19)
            });
            await dbContext.SaveChangesAsync();
        }
    }

    private static async Task SeedPhase6Async(JiraGithubToolDbContext dbContext)
    {
        var proj = await dbContext.projects.FirstOrDefaultAsync();
        var lecturer = await dbContext.users.FirstOrDefaultAsync(u => u.roles.Any(r => r.role_name == "LECTURER"));
        var student = await dbContext.users.FirstOrDefaultAsync(u => u.roles.Any(r => r.role_name == "STUDENT"));
        if (proj == null || lecturer == null || student == null) return;

        if (!await dbContext.project_documents.AnyAsync(d => d.project_id == proj.id))
        {
            dbContext.project_documents.Add(new project_document
            {
                project_id = proj.id,
                doc_type = "SRS",
                version_no = 1,
                status = "APPROVED",
                file_url = "https://example.com/srs_v1.pdf",
                submitted_by_user_id = student.id,
                submitted_at = DateTime.UtcNow.AddDays(-10),
                reviewer_user_id = lecturer.id,
                reviewed_at = DateTime.UtcNow.AddDays(-9),
                score = 9.5m
            });

            dbContext.project_documents.Add(new project_document
            {
                project_id = proj.id,
                doc_type = "SRS",
                version_no = 2,
                status = "DRAFT",
                file_url = "https://example.com/srs_v1_1.pdf",
                submitted_by_user_id = student.id,
                submitted_at = DateTime.UtcNow.AddDays(-2)
            });
            await dbContext.SaveChangesAsync();
            }
        }
    private static async Task SeedPhase7Async(JiraGithubToolDbContext dbContext)
    {
        var issues = await dbContext.jira_issues.ToListAsync();
        bool changed = false;
        var rand = new Random();

        foreach (var i in issues)
        {
            if (i.story_points == 0)
            {
                i.story_points = rand.Next(1, 13);
                changed = true;
            }
            if (!i.due_date.HasValue)
            {
                // Assign a due date in the current week or next
                i.due_date = DateTime.UtcNow.AddDays(rand.Next(-3, 15));
                changed = true;
            }
            if (i.status == "Done" && !i.resolution_date.HasValue)
            {
                i.resolution_date = i.updated_at;
                changed = true;
            }
        }

        if (changed) await dbContext.SaveChangesAsync();
    }
}

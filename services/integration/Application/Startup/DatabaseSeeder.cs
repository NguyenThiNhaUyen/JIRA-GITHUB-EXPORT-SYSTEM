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
            if (!await dbContext.users.AnyAsync(u => u.email == adminEmail))
            {
                var adminRole = await dbContext.roles.FirstAsync(r => r.role_name == "ADMIN");
                var adminUser = new user { email = adminEmail, password = hasher.HashPassword("Admin@123"), full_name = "Super Admin", enabled = true };
                adminUser.roles.Add(adminRole);
                dbContext.users.Add(adminUser);
                await dbContext.SaveChangesAsync();
                seedLogger.LogWarning("🚀 [SEED] Admin seeded: {Email}", adminEmail);
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
                    else if (x.email == "lecturer@truonghoc.com") x.full_name = "Giảng viên Demo";
                    else x.full_name = "Người dùng " + x.id;
                }
                await dbContext.SaveChangesAsync();
                seedLogger.LogWarning("🚀 [SEED] Fixed missing full_name for {Count} older users", namelessUsers.Count);
            }
        }
        catch (Exception ex)
        {
            seedLogger.LogError(ex, "❌ Database seeding failed.");
        }
    }
}

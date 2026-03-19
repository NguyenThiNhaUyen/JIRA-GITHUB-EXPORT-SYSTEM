using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JiraGithubExportSystem.Shared.Infrastructure.Identity.Interfaces;
using JiraGithubExportSystem.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace JiraGithubExportSystem.Shared.Infrastructure.Persistence
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(JiraGithubToolDbContext context, IPasswordHasher? passwordHasher = null)
        {
            context.Database.EnsureCreated();

            // 1. Seed Roles
            if (!context.roles.Any())
            {
                var roles = new List<role>
                {
                    new role { role_name = "ADMIN" },
                    new role { role_name = "LECTURER" },
                    new role { role_name = "STUDENT" }
                };
                context.roles.AddRange(roles);
                await context.SaveChangesAsync();
            }

            var adminRole = await context.roles.FirstAsync(r => r.role_name == "ADMIN");
            var lecturerRole = await context.roles.FirstAsync(r => r.role_name == "LECTURER");
            var studentRole = await context.roles.FirstAsync(r => r.role_name == "STUDENT");

            // 2. Seed Admin User
            var adminUser = await context.users.Include(u => u.roles).FirstOrDefaultAsync(u => u.email == "admin@pbl.com");
            if (adminUser == null)
            {
                adminUser = new user
                {
                    email = "admin@pbl.com",
                    password = passwordHasher != null ? passwordHasher.HashPassword("AdminPassword123!") : "AdminPassword123!",
                    full_name = "System Administrator",
                    enabled = true,
                    roles = new List<role> { adminRole }
                };
                context.users.Add(adminUser);
                await context.SaveChangesAsync();
            }
            else if (passwordHasher != null)
            {
                if (!adminUser.password.Contains("==") || adminUser.password.Length < 30) 
                {
                     adminUser.password = passwordHasher.HashPassword("AdminPassword123!");
                     await context.SaveChangesAsync();
                }
            }

            // 3. Seed Lecturers
            var lecturerUser = await context.users.Include(u => u.roles).FirstOrDefaultAsync(u => u.email == "lecturer1@pbl.com");
            if (lecturerUser == null)
            {
                string lecPwd = passwordHasher != null ? passwordHasher.HashPassword("LecPassword123!") : "LecPassword123!";
                lecturerUser = new user
                {
                    email = "lecturer1@pbl.com",
                    password = lecPwd,
                    full_name = "Dr. Nguyen Van A",
                    enabled = true,
                    roles = new List<role> { lecturerRole }
                };
                context.users.Add(lecturerUser);
                await context.SaveChangesAsync();

                var lec = new lecturer
                {
                    user_id = lecturerUser.id,
                    lecturer_code = "LEC001",
                    department = "Software Engineering",
                    office_email = "nva@pbl.com"
                };
                context.lecturers.Add(lec);
                await context.SaveChangesAsync();
            }
            else if (passwordHasher != null)
            {
                if (!lecturerUser.password.Contains("==") || lecturerUser.password.Length < 30) 
                {
                     lecturerUser.password = passwordHasher.HashPassword("LecPassword123!");
                     await context.SaveChangesAsync();
                }
            }

            // 4. Seed Subjects & Semesters
            if (!context.subjects.Any())
            {
                context.subjects.Add(new subject { subject_code = "PBL7", subject_name = "Project Based Learning 7" });
                context.subjects.Add(new subject { subject_code = "PBL6", subject_name = "Project Based Learning 6" });
                await context.SaveChangesAsync();
            }

            // 5. Seed Students
            var studentUser = await context.users.Include(u => u.roles).FirstOrDefaultAsync(u => u.email == "student1@pbl.com");
            if (studentUser == null)
            {
                string stuPwd = passwordHasher != null ? passwordHasher.HashPassword("StuPassword123!") : "StuPassword123!";
                studentUser = new user
                {
                    email = "student1@pbl.com",
                    password = stuPwd,
                    full_name = "Nguyen Van Sinh Vien",
                    enabled = true,
                    roles = new List<role> { studentRole }
                };
                context.users.Add(studentUser);
                await context.SaveChangesAsync();

                var stu = new student
                {
                    user_id = studentUser.id,
                    student_code = "STU001",
                    major = "Information Technology",
                    department = "Software Engineering"
                };
                context.students.Add(stu);
                await context.SaveChangesAsync();
            }
            else if (passwordHasher != null)
            {
                if (!studentUser.password.Contains("==") || studentUser.password.Length < 30) 
                {
                     studentUser.password = passwordHasher.HashPassword("StuPassword123!");
                     await context.SaveChangesAsync();
                }
            }
        }
    }
}

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
            if (!await context.roles.AnyAsync())
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

            // 2. Helper function
            async Task<user> EnsureUserAsync(string email, string password, string fullName, role role)
            {
                var user = await context.users.Include(u => u.roles).FirstOrDefaultAsync(u => u.email == email);
                if (user == null)
                {
                    user = new user
                    {
                        email = email,
                        password = passwordHasher != null ? passwordHasher.HashPassword(password) : password,
                        full_name = fullName,
                        enabled = true,
                        roles = new List<role> { role }
                    };
                    context.users.Add(user);
                    await context.SaveChangesAsync();
                }
                else
                {
                    if (passwordHasher != null && (!user.password.Contains("==") || user.password.Length < 30))
                    {
                        user.password = passwordHasher.HashPassword(password);
                    }
                    if (!user.roles.Any(r => r.role_name == role.role_name))
                    {
                        user.roles.Add(role);
                    }
                    user.enabled = true;
                    await context.SaveChangesAsync();
                }
                return user;
            }

            var adminUser = await EnsureUserAsync("admin@pbl.com", "AdminPassword123!", "System Administrator", adminRole);
            var lecturerUser = await EnsureUserAsync("lecturer1@pbl.com", "LecPassword123!", "Dr. Nguyen Van A", lecturerRole);
            var studentUser = await EnsureUserAsync("student1@pbl.com", "StuPassword123!", "Nguyễn Văn Sinh Viên", studentRole);

            // 3. Lecturer record
            var lecturerRecord = await context.lecturers.FirstOrDefaultAsync(l => l.user_id == lecturerUser.id);
            if (lecturerRecord == null)
            {
                lecturerRecord = new lecturer
                {
                    user_id = lecturerUser.id,
                    lecturer_code = "LEC001",
                    department = "Software Engineering",
                    office_email = "nva@pbl.com",
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };
                context.lecturers.Add(lecturerRecord);
                await context.SaveChangesAsync();
            }

            // 4. Semester & Subject
            var semester = await context.semesters.FirstOrDefaultAsync();
            if (semester == null)
            {
                semester = new semester 
                { 
                    name = "Học kỳ 2 - 2024-2025",
                    start_date = new DateOnly(2025, 1, 1),
                    end_date = new DateOnly(2025, 6, 30)
                };
                context.semesters.Add(semester);
                await context.SaveChangesAsync();
            }

            var subject = await context.subjects.FirstOrDefaultAsync(s => s.subject_code == "PBL7");
            if (subject == null)
            {
                subject = new subject { subject_code = "PBL7", subject_name = "Đồ án chuyên ngành" };
                context.subjects.Add(subject);
                await context.SaveChangesAsync();
            }

            // 5. Courses (Seed 2 courses for Lecturer)
            var course1 = await context.courses.Include(c => c.lecturer_users).FirstOrDefaultAsync(c => c.course_code == "SE101");
            if (course1 == null)
            {
                course1 = new course
                {
                    course_code = "SE101",
                    course_name = "Lớp học mẫu K21 - Nhóm 1",
                    semester_id = semester.id,
                    subject_id = subject.id,
                    created_by_user_id = adminUser.id,
                    max_students = 50,
                    status = "ACTIVE",
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };
                course1.lecturer_users.Add(lecturerRecord);
                context.courses.Add(course1);
                await context.SaveChangesAsync();
            }

            var course2 = await context.courses.Include(c => c.lecturer_users).FirstOrDefaultAsync(c => c.course_code == "SE102");
            if (course2 == null)
            {
                course2 = new course
                {
                    course_code = "SE102",
                    course_name = "Lớp học mẫu K21 - Nhóm 2",
                    semester_id = semester.id,
                    subject_id = subject.id,
                    created_by_user_id = adminUser.id,
                    max_students = 40,
                    status = "ACTIVE",
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };
                course2.lecturer_users.Add(lecturerRecord);
                context.courses.Add(course2);
                await context.SaveChangesAsync();
            }

            // 6. Student record
            var studentRecord = await context.students.FirstOrDefaultAsync(s => s.user_id == studentUser.id);
            if (studentRecord == null)
            {
                studentRecord = new student
                {
                    user_id = studentUser.id,
                    student_code = "STU001",
                    major = "Công nghệ phần mềm",
                    department = "Khoa CNTT",
                    intake_year = 2021,
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };
                context.students.Add(studentRecord);
                await context.SaveChangesAsync();
            }

            // Enroll student to Course 1
            if (!await context.course_enrollments.AnyAsync(e => e.student_user_id == studentRecord.user_id && e.course_id == course1.id))
            {
                context.course_enrollments.Add(new course_enrollment
                {
                    student_user_id = studentRecord.user_id,
                    course_id = course1.id,
                    status = "ACTIVE",
                    enrolled_at = DateTime.UtcNow
                });
                await context.SaveChangesAsync();
            }

            // 7. Projects
            var project1 = await context.projects.Include(p => p.project_integration).FirstOrDefaultAsync(p => p.course_id == course1.id);
            if (project1 == null)
            {
                project1 = new project
                {
                    name = "Nhóm 01 - Hệ thống quản lý PBL",
                    course_id = course1.id,
                    description = "Dự án mẫu để kiểm tra tính năng xuất báo cáo SRS.",
                    status = "ACTIVE",
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };
                context.projects.Add(project1);
                await context.SaveChangesAsync();

                // Project Integration
                var integration1 = new project_integration
                {
                    project_id = project1.id,
                    approval_status = "APPROVED",
                    submitted_by_user_id = studentUser.id,
                    submitted_at = DateTime.UtcNow,
                    approved_by_user_id = lecturerUser.id,
                    approved_at = DateTime.UtcNow,
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };
                context.project_integrations.Add(integration1);
                await context.SaveChangesAsync();
            }

            // Team Member for Project 1
            if (!await context.team_members.AnyAsync(tm => tm.project_id == project1.id && tm.student_user_id == studentRecord.user_id))
            {
                context.team_members.Add(new team_member
                {
                    project_id = project1.id,
                    student_user_id = studentRecord.user_id,
                    team_role = "LEADER",
                    responsibility = "Quản lý dự án & Thiết kế hệ thống",
                    participation_status = "ACTIVE",
                    contribution_score = 95,
                    joined_at = DateTime.UtcNow
                });
                await context.SaveChangesAsync();
            }

            // Add some Student Activity for Dashboard
            if (!await context.student_activity_dailies.AnyAsync(a => a.student_user_id == studentRecord.user_id && a.project_id == project1.id))
            {
                context.student_activity_dailies.Add(new student_activity_daily
                {
                    student_user_id = studentRecord.user_id,
                    project_id = project1.id,
                    activity_date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)),
                    commits_count = 5,
                    lines_added = 150,
                    lines_deleted = 20,
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                });
                await context.SaveChangesAsync();
            }
        }
    }
}

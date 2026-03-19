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
                var rolesList = new List<role>
                {
                    new role { role_name = "ADMIN" },
                    new role { role_name = "LECTURER" },
                    new role { role_name = "STUDENT" }
                };
                context.roles.AddRange(rolesList);
                await context.SaveChangesAsync();
            }

            var adminRole = await context.roles.FirstAsync(r => r.role_name == "ADMIN");
            var lecturerRole = await context.roles.FirstAsync(r => r.role_name == "LECTURER");
            var studentRole = await context.roles.FirstAsync(r => r.role_name == "STUDENT");

            // 2. Helper for User
            async Task<user> EnsureUserAsync(string email, string password, string fullName, role role)
            {
                var u = await context.users.Include(x => x.roles).FirstOrDefaultAsync(x => x.email == email);
                if (u == null)
                {
                    u = new user
                    {
                        email = email,
                        password = passwordHasher != null ? passwordHasher.HashPassword(password) : password,
                        full_name = fullName,
                        enabled = true,
                        roles = new List<role> { role }
                    };
                    context.users.Add(u);
                    await context.SaveChangesAsync();
                }
                else
                {
                    if (passwordHasher != null && (!u.password.Contains("==") || u.password.Length < 30))
                    {
                        u.password = passwordHasher.HashPassword(password);
                    }
                    if (!u.roles.Any(r => r.role_name == role.role_name))
                    {
                        u.roles.Add(role);
                    }
                    u.enabled = true;
                    await context.SaveChangesAsync();
                }
                return u;
            }

            var adminUser = await EnsureUserAsync("admin@pbl.com", "AdminPassword123!", "System Administrator", adminRole);
            var lecturerUser = await EnsureUserAsync("lecturer1@pbl.com", "LecPassword123!", "Dr. Nguyen Van A", lecturerRole);
            var studentUser = await EnsureUserAsync("student1@pbl.com", "StuPassword123!", "Nguyễn Văn Sinh Viên", studentRole);

            // 3. Lecturer record (Handle Unique Constraint on lecturer_code)
            var lecCode = "LEC001";
            var existingLecByCode = await context.lecturers.FirstOrDefaultAsync(l => l.lecturer_code == lecCode);
            var lecturerRecord = await context.lecturers.FirstOrDefaultAsync(l => l.user_id == lecturerUser.id);

            if (lecturerRecord == null)
            {
                // If code is already used by another user, we must use a different code or reassign
                if (existingLecByCode != null)
                {
                    // Update existing to current user to resolve conflict
                    existingLecByCode.user_id = lecturerUser.id;
                    existingLecByCode.office_email = "nva@pbl.com";
                    existingLecByCode.department = "Software Engineering";
                    lecturerRecord = existingLecByCode;
                }
                else
                {
                    lecturerRecord = new lecturer
                    {
                        user_id = lecturerUser.id,
                        lecturer_code = lecCode,
                        department = "Software Engineering",
                        office_email = "nva@pbl.com",
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow
                    };
                    context.lecturers.Add(lecturerRecord);
                }
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

            // 5. Courses
            async Task<course> EnsureCourseAsync(string code, string name)
            {
                var c = await context.courses.Include(x => x.lecturer_users).FirstOrDefaultAsync(x => x.course_code == code);
                if (c == null)
                {
                    c = new course
                    {
                        course_code = code,
                        course_name = name,
                        semester_id = semester.id,
                        subject_id = subject.id,
                        created_by_user_id = adminUser.id,
                        max_students = 50,
                        status = "ACTIVE",
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow
                    };
                    c.lecturer_users.Add(lecturerRecord);
                    context.courses.Add(c);
                }
                else
                {
                    if (!c.lecturer_users.Any(l => l.user_id == lecturerRecord.user_id))
                    {
                        c.lecturer_users.Add(lecturerRecord);
                    }
                }
                await context.SaveChangesAsync();
                return c;
            }

            var course1 = await EnsureCourseAsync("SE101", "Lớp học mẫu K21 - Nhóm 1");
            var course2 = await EnsureCourseAsync("SE102", "Lớp học mẫu K21 - Nhóm 2");

            // 6. Student record (Handle Unique Constraint on student_code)
            var stuCode = "STU001";
            var existingStuByCode = await context.students.FirstOrDefaultAsync(s => s.student_code == stuCode);
            var studentRecord = await context.students.FirstOrDefaultAsync(s => s.user_id == studentUser.id);

            if (studentRecord == null)
            {
                if (existingStuByCode != null)
                {
                    existingStuByCode.user_id = studentUser.id;
                    existingStuByCode.major = "Công nghệ phần mềm";
                    studentRecord = existingStuByCode;
                }
                else
                {
                    studentRecord = new student
                    {
                        user_id = studentUser.id,
                        student_code = stuCode,
                        major = "Công nghệ phần mềm",
                        department = "Khoa CNTT",
                        intake_year = 2021,
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow
                    };
                    context.students.Add(studentRecord);
                }
                await context.SaveChangesAsync();
            }

            // Enroll student to Course 1
            var enrollment = await context.course_enrollments.FirstOrDefaultAsync(e => e.student_user_id == studentRecord.user_id && e.course_id == course1.id);
            if (enrollment == null)
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
            else if (enrollment.status != "ACTIVE")
            {
                enrollment.status = "ACTIVE";
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
            var teamMember = await context.team_members.FirstOrDefaultAsync(tm => tm.project_id == project1.id && tm.student_user_id == studentRecord.user_id);
            if (teamMember == null)
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

            // 8. Student Activity for Dashboard
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

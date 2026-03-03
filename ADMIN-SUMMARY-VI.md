# ADMIN - QUẢN LÝ HỆ THỐNG

## 📋 Yêu cầu nghiệp vụ

Admin chỉ quản lý:
- ✅ **Học kỳ** (Semester): Spring 2026, Fall 2025,...
- ✅ **Môn học** (Subject): SWD, EXE, PRN,...
- ✅ **Lớp học** (Course): SE1821, SE1822, EXE1821,...
- ✅ **Phân công Giảng viên** cho lớp học

## 🎯 Các thay đổi đã thực hiện

### 1. **Cơ sở dữ liệu** (`db.js`) ✅
- **Học kỳ** (semesters): Có nhiều lớp học
- **Môn học** (subjects): SWD, EXE, PRN, SWT
- **Lớp học** (courses): Kết hợp giữa Môn học + Học kỳ
- **Giảng viên** (courseLecturers): Mỗi lớp chỉ có 1 giảng viên PRIMARY
  - ❌ Đã xóa role ASSISTANT (trợ giảng)
  - ✅ Chỉ giữ role PRIMARY

### 2. **Các trang quản lý** ✅

#### a) **Quản lý Học kỳ** (`/admin/semesters`)
- Tạo, sửa, xóa học kỳ
- Hiển thị số lớp học trong học kỳ
- Trạng thái: ACTIVE, UPCOMING, COMPLETED

#### b) **Quản lý Môn học** (`/admin/subjects`)
- Tạo, sửa, xóa môn học (SWD, EXE, PRN,...)
- Hiển thị số lớp học của môn
- Quản lý tín chỉ và mô tả

#### c) **Quản lý Lớp học** (`/admin/courses`)
- Tạo lớp học bằng cách chọn:
  - Môn học
  - Học kỳ
  - Mã lớp (VD: SE1821)
- **Phân công Giảng viên** cho lớp
  - Mỗi lớp chỉ có 1 giảng viên
  - Không có trợ giảng

#### d) **Bảng điều khiển Admin** (`/admin`)
- Thống kê: Học kỳ, Môn học, Lớp học, Giảng viên, Sinh viên
- Điều hướng nhanh đến các trang quản lý
- ❌ Đã xóa phần "Luồng nghiệp vụ" khỏi UI
- ❌ Đã xóa emoji icons
- ❌ Đã xóa nút "Quản lý Users"

### 3. **Đã xóa** ❌
- ❌ Route `/admin/users` - Không còn quản lý users
- ❌ Role ASSISTANT (trợ giảng) - Chỉ giữ PRIMARY
- ❌ Phần "Luồng nghiệp vụ" trên dashboard
- ❌ Emoji icons (📅, 📚, 🎓,...)
- ❌ Nút "Quản lý Users" trên dashboard

## 📊 Mô hình dữ liệu

```
HỌC KỲ (Semester)
├── Có nhiều → LỚP HỌC
│   VD: Spring 2026 có SE1821, SE1822, EXE1821,...

MÔN HỌC (Subject)
├── Có nhiều → LỚP HỌC
│   VD: SWD có SE1821, SE1822, SE1823
│   VD: EXE có EXE1821, EXE1822

LỚP HỌC (Course)
├── Thuộc về 1 MÔN HỌC
├── Thuộc về 1 HỌC KỲ
└── Có 1 GIẢNG VIÊN (PRIMARY)

GIẢNG VIÊN (Lecturer)
└── Có thể dạy nhiều LỚP HỌC trong 1 học kỳ
```

## 🚀 Cách sử dụng

### 1. Đăng nhập Admin
- Email: `admin@gmail.com`
- Password: `admin123`

### 2. Quản lý Học kỳ
- Vào: Bảng điều khiển → "Quản lý Học kỳ"
- Tạo học kỳ mới (VD: Spring 2026)

### 3. Quản lý Môn học
- Vào: Bảng điều khiển → "Quản lý Môn học"
- Tạo môn học (VD: SWD, EXE, PRN)

### 4. Quản lý Lớp học
- Vào: Bảng điều khiển → "Quản lý Lớp học"
- Tạo lớp học:
  - Nhập mã lớp (VD: SE1821)
  - Chọn môn học (VD: SWD)
  - Chọn học kỳ (VD: Spring 2026)
- Phân công giảng viên:
  - Click nút "Thêm GV"
  - Chọn giảng viên
  - Mỗi lớp chỉ có 1 giảng viên

## 📝 Dữ liệu mẫu

### Học kỳ:
- Spring 2026 (ACTIVE)
- Fall 2025 (COMPLETED)
- Summer 2026 (UPCOMING)

### Môn học:
- SWD - Software Development
- EXE - Exe Project
- PRN - Programming .NET
- SWT - Software Testing

### Lớp học:
- SE1821, SE1822, SE1823 (SWD + Spring 2026)
- EXE1821, EXE1822 (EXE + Spring 2026)
- PRN1821 (PRN + Spring 2026)
- SE1721 (SWD + Fall 2025)

### Phân công giảng viên:
- Nguyễn Văn A: Dạy SE1821, SE1822, SE1823
- Trần Thị B: Dạy EXE1821, PRN1821

## 📁 Cấu trúc file

```
apps/web/src/
├── mock/
│   └── db.js                              ✅ Đã cập nhật
├── pages/
│   └── admin/
│       ├── admin-dashboard.jsx             ✅ Đã cập nhật (xóa emoji, business logic, users)
│       ├── course-management.jsx           ✅ Đã cập nhật (xóa role ASSISTANT)
│       ├── semester-management.jsx         ✅ Tiếng Việt
│       ├── subject-management.jsx          ✅ Tiếng Việt
│       ├── user-management.jsx             ❌ KHÔNG SỬ DỤNG
│       ├── create-course-modal.jsx         ❌ KHÔNG SỬ DỤNG
│       └── assign-lecturer-modal.jsx       ❌ KHÔNG SỬ DỤNG
└── App.jsx                                ✅ Đã cập nhật (xóa route /admin/users)
```

## ✨ Tính năng chính

### ✅ Admin có thể:
1. **Quản lý Học kỳ** - Tạo, sửa, xóa
2. **Quản lý Môn học** - Tạo, sửa, xóa
3. **Quản lý Lớp học** - Tạo, sửa, xóa
4. **Phân công Giảng viên** cho lớp học
   - Mỗi lớp chỉ có 1 giảng viên
   - Không có trợ giảng

### ❌ Admin KHÔNG thể:
1. ❌ Quản lý users (lecturers, students)
2. ❌ Thêm trợ giảng cho lớp

---

**Ngày cập nhật**: 2026-01-31  
**Trạng thái**: ✅ HOÀN THÀNH

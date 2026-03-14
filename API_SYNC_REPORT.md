# BÁO CÁO ĐỒNG BỘ API (CẬP NHẬT)
**Ngày:** 2026-03-13
**Trạng thái:** HOÀN THÀNH (Sẵn sàng cho FE)

## 1. Thay đổi Cấu trúc Phản hồi (Pagination)
- Đã sửa thuộc tính `totalItems` thành `totalCount` trong tất cả các phản hồi có phân trang (`PagedResponse`).
- Điều này đảm bảo khớp với logic `totalCount` mà Frontend đang sử dụng.

## 2. Danh sách Người dùng Phẳng (Flat User Lists)
Đã thêm các endpoint mới trả về mảng phẳng người dùng:
- `GET /api/users/students`: Trả về danh sách sinh viên.
- `GET /api/users/lecturers`: Trả về danh sách giảng viên.
- Dữ liệu trả về ở dạng `ApiResponse<List<UserDetailResponse>>`.

## 3. Chi tiết Khoá học & Trạng thái Tích hợp
- `GET /api/courses/{id}`:
  - Thuộc tính `groups[]` đã được định nghĩa kiểu dữ liệu rõ ràng (`CourseGroupInfo`).
  - Mỗi group bao gồm: `id`, `name`, `githubStatus`, `jiraStatus`.
  - `githubStatus` và `jiraStatus` hiện là các chuỗi độc lập (`NONE`, `PENDING`, `APPROVED`, `REJECTED`).

## 4. Định danh Sinh viên (Student Identifiers)
Để hỗ trợ linh hoạt các tên gọi trong FE:
- Đã thêm thuộc tính `studentId` là bản sao của `studentCode` trong:
  - `UserDetailResponse`
  - `EnrollmentInfo` (trong danh sách sinh viên của lớp)
  - `InvitationResponse`

## 5. Ngữ cảnh Giảng viên (Lecturer Context)
- `GET /api/courses`: Tự động lọc lớp học dựa trên vai trò người đăng nhập.
  - Amin: Thấy tất cả.
  - Giảng viên: Chỉ thấy lớp được phân công.
  - Sinh viên: Chỉ thấy lớp đã ghi danh.

## 6. Sẵn sàng cho FE (FE Integration Notes)
- Tất cả JSON hiện đã ở định dạng **camelCase**.
- Các endpoint `/api/student/me/*` đã sẵn sàng để thay thế mock data.
- Các API gửi lời mời (`POST /api/invitations`) và tích hợp (`PUT /api/projects/{id}/integration`) đã được chuẩn hoá.

---
**Build Status:** ✅ Succeeded with 0 errors.

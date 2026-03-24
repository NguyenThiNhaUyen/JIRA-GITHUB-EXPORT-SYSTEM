// User Detail Page — Admin
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import {
    ChevronRight, User, Mail, Hash, Shield, CheckCircle, XCircle,
    BookOpen, FolderKanban, Key, UserX, ArrowLeft, Calendar
} from "lucide-react";
import {
    useGetUsers,
    useUpdateUserRole,
    useUpdateUserStatus,
    useResetUserPassword
} from "../../features/users/hooks/useUsers.js";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects } from "../../features/projects/hooks/useProjects.js";

const ROLE_CFG = {
    ADMIN:    { cls: "bg-purple-50 text-purple-700 border-purple-100", label: "Admin" },
    LECTURER: { cls: "bg-teal-50 text-teal-700 border-teal-100",       label: "Giảng viên" },
    STUDENT:  { cls: "bg-blue-50 text-blue-700 border-blue-100",       label: "Sinh viên" },
};

export default function UserDetail() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    const safeArray = (value) => (Array.isArray(value) ? value : []);

    // Lấy user từ danh sách (không có API GET /users/:id riêng thì lọc từ list)
    const { data: adminList, isLoading: loadingAdmins }    = useGetUsers("ADMIN");
    const { data: lecturerList, isLoading: loadingLecturers } = useGetUsers("LECTURER");
    const { data: studentList, isLoading: loadingStudents }  = useGetUsers("STUDENT");

    const allUsers = [
        ...safeArray(adminList).map(u => ({ ...u, role: "ADMIN" })),
        ...safeArray(lecturerList).map(u => ({ ...u, role: "LECTURER" })),
        ...safeArray(studentList).map(u => ({ ...u, role: "STUDENT" })),
    ];

    const user = allUsers.find(u => String(u.id) === String(userId));

    // Related data
    const { data: coursesData } = useGetCourses({ pageSize: 100 });
    const { data: projectsData } = useGetProjects({ pageSize: 100 });

    const userCourses = safeArray(coursesData?.items).filter(c =>
        c.lecturers?.some(l => String(l.id) === String(userId)) ||
        String(c.studentId) === String(userId)
    );
    const userProjects = safeArray(projectsData?.items).filter(p =>
        p.members?.some(m => String(m.userId ?? m.id) === String(userId)) ||
        String(p.leaderId) === String(userId)
    );

    // Mutations
    const roleMutation    = useUpdateUserRole();
    const statusMutation  = useUpdateUserStatus();
    const passMutation    = useResetUserPassword();

    const [confirmReset, setConfirmReset] = useState(false);
    const isLoadingUserLists = loadingAdmins || loadingLecturers || loadingStudents;

    if (isLoadingUserLists) {
        return (
            <div className="space-y-4">
                <div className="h-10 w-48 rounded-xl bg-gray-100 animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
                    <div className="lg:col-span-2 h-80 rounded-2xl bg-gray-100 animate-pulse" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <User size={48} className="text-gray-300" />
                <p className="text-gray-500 font-medium">Không tìm thấy người dùng</p>
                <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl">
                    ← Quay lại
                </Button>
            </div>
        );
    }

    const isActive = user.status !== "DISABLED";
    const roleCfg  = ROLE_CFG[user.role] || ROLE_CFG.STUDENT;

    const handleChangeRole = async (newRole) => {
        if (newRole === user.role) return;
        try {
            await roleMutation.mutateAsync({ id: String(userId), role: newRole });
            success(`Đã đổi quyền thành ${ROLE_CFG[newRole]?.label}`);
        } catch (err) {
            showError(err.message || "Đổi quyền thất bại");
        }
    };

    const handleToggleStatus = async () => {
        try {
            await statusMutation.mutateAsync({ id: String(userId), enabled: !isActive });
            success(isActive ? "Đã vô hiệu hóa tài khoản" : "Đã kích hoạt tài khoản");
        } catch (err) {
            showError(err.message || "Cập nhật trạng thái thất bại");
        }
    };

    const handleResetPassword = async () => {
        if (!confirmReset) { setConfirmReset(true); return; }
        try {
            await passMutation.mutateAsync({ id: String(userId) });
            success("Đã gửi email đặt lại mật khẩu");
            setConfirmReset(false);
        } catch (err) {
            showError(err.message || "Đặt lại mật khẩu thất bại");
        }
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span
                    className="text-teal-700 font-semibold cursor-pointer hover:underline"
                    onClick={() => navigate(-2)}
                >Admin</span>
                <ChevronRight size={12} />
                <span
                    className="text-teal-600 cursor-pointer hover:underline"
                    onClick={() => navigate(-1)}
                >Quản lý Tài khoản</span>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-semibold">{user.name}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-wrap items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="rounded-xl border-gray-200 h-9 px-3 text-sm flex items-center gap-2"
                >
                    <ArrowLeft size={14} /> Quay lại
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-800">Chi tiết Tài khoản</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Xem và quản lý thông tin người dùng</p>
                </div>
            </div>

            {/* 2-col layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile card */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardContent className="p-6">
                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-3 pb-5 border-b border-gray-100">
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold shadow-inner ${
                                    user.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                                    user.role === "LECTURER" ? "bg-teal-100 text-teal-700" :
                                    "bg-blue-100 text-blue-700"
                                }`}>
                                    {user.name?.charAt(0)}
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${roleCfg.cls}`}>
                                        {roleCfg.label}
                                    </span>
                                </div>
                            </div>

                            {/* Info list */}
                            <div className="mt-4 space-y-3">
                                <InfoRow icon={<Mail size={14} />} label="Email" value={user.email || "—"} />
                                {user.studentId && <InfoRow icon={<Hash size={14} />} label="MSSV" value={user.studentId} />}
                                <InfoRow icon={<Shield size={14} />} label="Vai trò" value={roleCfg.label} />
                                <InfoRow
                                    icon={isActive ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-400" />}
                                    label="Trạng thái"
                                    value={isActive ? "Hoạt động" : "Vô hiệu hóa"}
                                    valueClass={isActive ? "text-green-600" : "text-gray-400"}
                                />
                                {user.createdAt && <InfoRow icon={<Calendar size={14} />} label="Ngày tạo" value={new Date(user.createdAt).toLocaleDateString("vi-VN")} />}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-700">Thao tác</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            {/* Change role */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Đổi vai trò</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {["ADMIN", "LECTURER", "STUDENT"].map(r => (
                                        <button
                                            key={r}
                                            disabled={r === user.role || roleMutation.isPending}
                                            onClick={() => handleChangeRole(r)}
                                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${
                                                r === user.role
                                                    ? `${ROLE_CFG[r].cls} cursor-default`
                                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400"
                                            }`}
                                        >
                                            {ROLE_CFG[r].label} {r === user.role ? "✓" : ""}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Status toggle */}
                            <button
                                onClick={handleToggleStatus}
                                disabled={statusMutation.isPending}
                                className={`w-full flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-all ${
                                    isActive
                                        ? "text-orange-700 bg-orange-50 hover:bg-orange-100 border-orange-200"
                                        : "text-green-700 bg-green-50 hover:bg-green-100 border-green-200"
                                } disabled:opacity-50`}
                            >
                                <UserX size={14} />
                                {isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt tài khoản"}
                            </button>

                            {/* Reset password */}
                            <button
                                onClick={handleResetPassword}
                                disabled={passMutation.isPending}
                                className={`w-full flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-all ${
                                    confirmReset
                                        ? "text-white bg-red-600 border-red-600 hover:bg-red-700"
                                        : "text-red-600 bg-red-50 hover:bg-red-100 border-red-200"
                                } disabled:opacity-50`}
                            >
                                <Key size={14} />
                                {confirmReset ? "Xác nhận đặt lại mật khẩu?" : "Đặt lại mật khẩu"}
                            </button>
                            {confirmReset && (
                                <button
                                    onClick={() => setConfirmReset(false)}
                                    className="w-full text-xs text-gray-400 hover:text-gray-600 py-1"
                                >Hủy</button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right column: courses + projects */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Courses */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <BookOpen size={15} className="text-blue-500" />
                                </div>
                                <CardTitle className="text-base font-semibold text-gray-800">
                                    Lớp học liên quan
                                    <span className="ml-2 text-xs font-normal text-gray-400">({userCourses.length})</span>
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {userCourses.length === 0 ? (
                                <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                                    Không có lớp học nào
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {userCourses.map(c => (
                                        <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800">{c.code || "Không có dữ liệu"}</p>
                                                <p className="text-xs text-gray-400 truncate">{c.name || "Không có dữ liệu"}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                                                c.status === "ACTIVE" ? "bg-green-50 text-green-700" :
                                                c.status === "UPCOMING" ? "bg-blue-50 text-blue-700" :
                                                "bg-gray-100 text-gray-500"
                                            }`}>{c.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Projects */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                                    <FolderKanban size={15} className="text-teal-500" />
                                </div>
                                <CardTitle className="text-base font-semibold text-gray-800">
                                    Nhóm Dự án
                                    <span className="ml-2 text-xs font-normal text-gray-400">({userProjects.length})</span>
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {userProjects.length === 0 ? (
                                <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                                    Không có nhóm dự án nào
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {userProjects.map(p => (
                                        <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800">{p.name || "Không có dữ liệu"}</p>
                                                <p className="text-xs text-gray-400">
                                                    {p.isGithubLinked && "GitHub ✓"}{p.isJiraLinked && " · Jira ✓"}
                                                    {!p.isGithubLinked && !p.isJiraLinked && "Chưa kết nối"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 text-right shrink-0">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                                                    p.integration?.githubStatus === "APPROVED" ? "bg-green-50 text-green-700" :
                                                    p.integration?.githubStatus === "PENDING" ? "bg-yellow-50 text-yellow-700" :
                                                    "bg-gray-100 text-gray-500"
                                                }`}>
                                                    {p.integration?.githubStatus || "NONE"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value, valueClass = "text-gray-700" }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-gray-400 shrink-0">{icon}</span>
            <span className="text-xs text-gray-400 w-20 shrink-0">{label}</span>
            <span className={`text-sm font-medium truncate flex-1 ${valueClass}`}>{value}</span>
        </div>
    );
}

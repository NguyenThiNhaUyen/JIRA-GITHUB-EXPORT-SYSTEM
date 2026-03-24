import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { useGetUsers, useUpdateUserRole, useUpdateUserStatus, useResetUserPassword } from "../../features/users/hooks/useUsers.js";
import {
    ChevronRight, Users, Search, Filter, MoreHorizontal,
    Shield, UserX, Key, CheckCircle, XCircle, Activity
} from "lucide-react";

const ROLE_CFG = {
    ADMIN: { cls: "bg-purple-50 text-purple-700 border-purple-100", label: "Admin" },
    LECTURER: { cls: "bg-teal-50 text-teal-700 border-teal-100", label: "Giảng viên" },
    STUDENT: { cls: "bg-blue-50 text-blue-700 border-blue-100", label: "Sinh viên" },
};

export default function UserManagement() {
    const navigate = useNavigate();
    const { success, error } = useToast();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [actionMenu, setActionMenu] = useState(null);

    const { data: adminsRaw = [], isLoading: load1 } = useGetUsers("ADMIN");
    const { data: lectsRaw = [], isLoading: load2 } = useGetUsers("LECTURER");
    const { data: studentsRaw = [], isLoading: load3 } = useGetUsers("STUDENT");

    const roleMutation = useUpdateUserRole();
    const statusMutation = useUpdateUserStatus();
    const passMutation = useResetUserPassword();

    // BUG-47: Aggregate users reactively as they load (Parallel Loading)
    const allUsers = useMemo(() => {
        const admins = (Array.isArray(adminsRaw) ? adminsRaw : []).map((u) => ({ ...u, role: "ADMIN" }));
        const lects = (Array.isArray(lectsRaw) ? lectsRaw : []).map((u) => ({ ...u, role: "LECTURER" }));
        const students = (Array.isArray(studentsRaw) ? studentsRaw : []).map((u) => ({ ...u, role: "STUDENT" }));
        return [...admins, ...lects, ...students];
    }, [adminsRaw, lectsRaw, studentsRaw]);

    // BUG-48: Debounce search for 3000+ users (Stress Test Enhancement)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);


    const handleChangeRole = async (userId, newRole) => {
        try {
            await roleMutation.mutateAsync({ id: userId, role: newRole });
            success(`Đã cập nhật quyền thành ${ROLE_CFG[newRole]?.label}`);
            setActionMenu(null);
        } catch (err) {
            error(err.message || "Cập nhật quyền thất bại");
        }
    };

    const handleDisable = async (userId, currentStatus) => {
        try {
            const newEnabled = currentStatus === "DISABLED";
            await statusMutation.mutateAsync({ id: userId, enabled: newEnabled });
            success("Đã cập nhật trạng thái tài khoản");
            setActionMenu(null);
        } catch (err) {
            error(err.message || "Cập nhật trạng thái thất bại");
        }
    };

    const handleResetPassword = async (userId, name) => {
        try {
            await passMutation.mutateAsync({ id: userId });
            success(`Đã gửi email đặt lại mật khẩu đến ${name}`);
            setActionMenu(null);
        } catch (err) {
            error(err.message || "Đặt lại mật khẩu thất bại");
        }
    };

    const filtered = allUsers.filter(u => {
        const displayName = u?.name ?? u?.fullName ?? (u?.role === "LECTURER" ? `GV (ID: ${u?.id ?? "N/A"})` : `SV (ID: ${u?.id ?? "N/A"})`);
        const matchSearch = !debouncedSearch ||
            displayName?.toLowerCase?.().includes(debouncedSearch.toLowerCase()) ||
            u?.email?.toLowerCase?.().includes(debouncedSearch.toLowerCase());
        const matchRole = filterRole === "all" || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const countByRole = (role) => allUsers.filter(u => u.role === role).length;

    return (
        <div className="space-y-6" onClick={() => setActionMenu(null)}>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span
                    className="text-teal-700 font-semibold cursor-pointer hover:underline"
                    onClick={() => navigate("/admin")}
                >
                    Admin
                </span>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-semibold">Quản lý Tài khoản</span>
            </nav>

            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">Quản lý Tài khoản</h2>
                <p className="text-sm text-gray-500 mt-0.5">Tài khoản người dùng, phân quyền, và trạng thái</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Tổng", value: allUsers.length, color: "text-gray-700 bg-gray-50 border-gray-200" },
                    { label: "Admin", value: countByRole("ADMIN"), color: "text-purple-700 bg-purple-50 border-purple-100" },
                    { label: "Giảng viên", value: countByRole("LECTURER"), color: "text-teal-700 bg-teal-50 border-teal-100" },
                    { label: "Sinh viên", value: countByRole("STUDENT"), color: "text-blue-700 bg-blue-50 border-blue-100" },
                ].map(({ label, value, color }) => (
                    <div key={label} className={`rounded-2xl px-4 py-3 border flex items-center justify-between ${color}`}>
                        <span className="text-xs font-semibold">{label}</span>
                        <span className="text-xl font-bold">{value}</span>
                    </div>
                ))}
            </div>

            {/* Filters bar */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardContent className="p-5 flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[220px]">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm theo tên hoặc email..."
                            className="pl-9 pr-4 py-2.5 w-full bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-gray-400 shrink-0" />
                        {["all", "ADMIN", "LECTURER", "STUDENT"].map(r => (
                            <button
                                key={r}
                                onClick={() => setFilterRole(r)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filterRole === r
                                    ? "bg-teal-600 text-white border-teal-600"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
                                    }`}
                            >
                                {r === "all" ? "Tất cả" : ROLE_CFG[r]?.label}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Users table (BUG-49: Removed overflow-hidden to prevent menu clipping) */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] bg-white">
                <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">Người dùng</div>
                    <div className="col-span-3 hidden md:block">Email</div>
                    <div className="col-span-2 text-center">Quyền</div>
                    <div className="col-span-2 text-center">Trạng thái</div>
                    <div className="col-span-1 text-right">...</div>
                </div>
                <CardContent className="p-0">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-2">
                            <Users size={28} className="text-gray-300" />
                            <p className="text-sm text-gray-400">Không tìm thấy người dùng</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filtered.map(u => {
                                const roleCfg = ROLE_CFG[u.role] || ROLE_CFG.STUDENT;
                                const isActive = u.status !== "DISABLED";
                                const displayName = u?.name ?? u?.fullName ?? (u?.role === "LECTURER" ? `GV (ID: ${u?.id ?? "N/A"})` : `SV (ID: ${u?.id ?? "N/A"})`);
                                return (
                                    <div
                                        key={u.id}
                                        className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center hover:bg-gray-50/50 transition-colors relative"
                                    >
                                        {/* Name */}
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                                                u.role === "LECTURER" ? "bg-teal-100 text-teal-700" :
                                                    "bg-blue-100 text-blue-700"
                                                }`}>
                                                {displayName?.charAt?.(0) ?? "U"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                                                {(u?.studentId ?? u?.lecturerId) && <p className="text-[11px] text-gray-400">{u?.studentId ?? u?.lecturerId}</p>}
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="col-span-3 hidden md:block">
                                            <p className="text-xs text-gray-500 truncate">{u?.email ?? "—"}</p>
                                        </div>

                                        {/* Role badge */}
                                        <div className="col-span-2 text-center">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${roleCfg.cls}`}>
                                                {roleCfg.label}
                                            </span>
                                        </div>

                                        {/* Status (BUG-50: Enhanced mapping) */}
                                        <div className="col-span-2 text-center">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                u.status === 'ACTIVE' ? "bg-green-50 text-green-700" :
                                                u.status === 'DISABLED' ? "bg-gray-100 text-gray-500" :
                                                "bg-amber-50 text-amber-700"
                                                }`}>
                                                {u.status === 'ACTIVE' ? <CheckCircle size={9} /> : 
                                                 u.status === 'DISABLED' ? <XCircle size={9} /> : 
                                                 <Activity size={9} />}
                                                {u.status === 'ACTIVE' ? "Hoạt động" : 
                                                 u.status === 'DISABLED' ? "Vô hiệu hóa" : 
                                                 "Chờ xác minh"}
                                            </span>
                                        </div>

                                        {/* Action menu */}
                                        <div className="col-span-1 flex justify-end relative">
                                            <button
                                                onClick={e => { e.stopPropagation(); setActionMenu(actionMenu === u.id ? null : u.id); }}
                                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>

                                            {actionMenu === u.id && (
                                                <div
                                                    onClick={e => e.stopPropagation()}
                                                    className="absolute right-0 top-8 z-30 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 w-52 text-sm"
                                                >
                                                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                        Đổi quyền
                                                    </div>
                                                    {["ADMIN", "LECTURER", "STUDENT"]
                                                        .filter(r => r !== u.role)
                                                        .map(r => (
                                                            <button
                                                                key={r}
                                                                onClick={() => handleChangeRole(u.id, r)}
                                                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors"
                                                            >
                                                                <Shield size={13} className="text-gray-400" />
                                                                Đổi thành {ROLE_CFG[r]?.label}
                                                            </button>
                                                        ))}
                                                    <div className="border-t border-gray-50 my-1" />
                                                    <button
                                                        onClick={() => handleDisable(u.id, u.status)}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors"
                                                    >
                                                        <UserX size={13} className="text-gray-400" />
                                                        {isActive ? "Vô hiệu hóa TK" : "Kích hoạt TK"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(u.id, displayName)}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors"
                                                    >
                                                        <Key size={13} className="text-gray-400" />
                                                        Đặt lại mật khẩu
                                                    </button>
                                                    <div className="border-t border-gray-50 my-1" />
                                                    <button
                                                        onClick={() => { setActionMenu(null); navigate(`/admin/users/${u.id}`); }}
                                                        className="w-full text-left px-4 py-2 hover:bg-teal-50 text-teal-700 flex items-center gap-2 transition-colors font-semibold"
                                                    >
                                                        👤 Xem chi tiết
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

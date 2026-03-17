import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Search, 
  Shield, 
  UserX, 
  Key, 
  CheckCircle, 
  UserCheck, 
  GraduationCap,
  UserCog,
  MoreHorizontal,
  Mail,
  ShieldAlert,
  ArrowUpDown,
  Filter,
  XCircle,
  ChevronRight,
  RefreshCw,
  ChevronUp,
  ChevronDown
} from "lucide-react";

// Components UI
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { Badge } from "../../components/ui/badge.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { SelectField, InputField } from "../../components/shared/FormFields.jsx";

// Hooks
import { 
  useGetUsers, 
  useUpdateUserRole, 
  useUpdateUserStatus, 
  useResetUserPassword 
} from "../../features/users/hooks/useUsers.js";

const ROLE_MAP = {
    ADMIN: { label: "Admin", variant: "danger", icon: Shield },
    LECTURER: { label: "Giảng viên", variant: "indigo", icon: UserCog },
    STUDENT: { label: "Sinh viên", variant: "info", icon: GraduationCap },
};

export default function UserManagement() {
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [actionMenu, setActionMenu] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
    const PAGE_SIZE = 10;

    const { data: adminsRaw = [], isLoading: load1 } = useGetUsers("ADMIN");
    const { data: lectsRaw = [], isLoading: load2 } = useGetUsers("LECTURER");
    const { data: studentsRaw = [], isLoading: load3 } = useGetUsers("STUDENT");

    const roleMutation = useUpdateUserRole();
    const statusMutation = useUpdateUserStatus();
    const passMutation = useResetUserPassword();

    const users = useMemo(() => {
        if (load1 || load2 || load3) return [];
        const admins = adminsRaw.map(u => ({ ...u, role: "ADMIN", status: u.status || "ACTIVE" }));
        const lects = lectsRaw.map(u => ({ ...u, role: "LECTURER", status: u.status || "ACTIVE" }));
        const students = studentsRaw.map(u => ({ ...u, role: "STUDENT", status: u.status || "ACTIVE" }));
        return [...admins, ...lects, ...students];
    }, [adminsRaw, lectsRaw, studentsRaw, load1, load2, load3]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    const filteredAndSorted = useMemo(() => {
        let result = users.filter(u => {
            const q = search.toLowerCase();
            const matchSearch = !search ||
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                (u.userName || u.studentCode || u.studentId || "").toLowerCase().includes(q);
            const matchRole = filterRole === "all" || u.role === filterRole;
            return matchSearch && matchRole;
        });

        if (sortConfig.key) {
            result.sort((a, b) => {
                const valA = a[sortConfig.key]?.toLowerCase() || "";
                const valB = b[sortConfig.key]?.toLowerCase() || "";
                if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
                if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [users, search, filterRole, sortConfig]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredAndSorted.slice(start, start + PAGE_SIZE);
    }, [filteredAndSorted, currentPage]);

    const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE);

    const handleAction = async (userId, action, data) => {
        try {
            if (action === 'role') {
                await roleMutation.mutateAsync({ id: userId, role: data });
                success(`Đã cập nhật vai trò người dùng thành ${data}`);
            } else if (action === 'status') {
                await statusMutation.mutateAsync({ id: userId, enabled: data });
                success("Đã cập nhật trạng thái tài khoản");
            } else if (action === 'reset') {
                await passMutation.mutateAsync({ id: userId });
                success("Đã gửi yêu cầu đặt lại mật khẩu đến email người dùng");
            }
            setActionMenu(null);
        } catch (err) {
            showError(err.message || "Thao tác thất bại");
        }
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <ArrowUpDown size={12} className="ml-1 opacity-20" />;
        return sortConfig.direction === "asc" ? <ChevronUp size={12} className="ml-1 text-teal-600" /> : <ChevronDown size={12} className="ml-1 text-teal-600" />;
    };

    if (load1 || load2 || load3) return (
      <div className="flex h-screen items-center justify-center p-8 bg-gray-50/50">
         <div className="text-center">
            <Users className="animate-pulse text-teal-600 mx-auto mb-4" size={48} /> 
            <span className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Đang đồng bộ danh sách tài khoản...</span>
         </div>
      </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500" onClick={() => setActionMenu(null)}>
            <PageHeader 
                title="Quản lý Tài khoản"
                subtitle="Điều chỉnh quyền hạn, trạng thái bảo mật và quyền truy cập cho toàn bộ người dùng hệ thống."
                breadcrumb={["Admin", "Người dùng", "Danh sách"]}
                actions={[
                  <Button key="invite" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-100 border-0 transition-all">
                    <Mail size={16} className="mr-2" /> Gửi lời mời hệ thống
                  </Button>
                ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard label="Tổng tài khoản" value={users.length} icon={Users} variant="indigo" />
                <StatsCard label="Quản trị viên" value={users.filter(u => u.role === 'ADMIN').length} icon={Shield} variant="danger" />
                <StatsCard label="Giảng viên" value={users.filter(u => u.role === 'LECTURER').length} icon={UserCog} variant="success" />
                <StatsCard label="Sinh viên" value={users.filter(u => u.role === 'STUDENT').length} icon={GraduationCap} variant="info" />
            </div>

            <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50 py-6 px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest leading-none">Cơ sở dữ liệu người dùng</CardTitle>
                    <div className="flex gap-3 w-full md:w-auto items-center">
                        <div className="flex-1 md:w-80">
                            <InputField placeholder="Tìm tên, email hoặc mã số..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} icon={Search} />
                        </div>
                        <div className="flex items-center gap-2">
                           <Filter size={14} className="text-gray-300" />
                           {["all", "ADMIN", "LECTURER", "STUDENT"].map(r => (
                               <button
                                   key={r}
                                   onClick={(e) => { e.stopPropagation(); setFilterRole(r); setCurrentPage(1); }}
                                   className={`text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border transition-all ${filterRole === r
                                       ? "bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-100"
                                       : "bg-white text-gray-400 border-gray-100 hover:border-teal-400 hover:text-teal-600"
                                       }`}
                               >
                                   {r === "all" ? "Tất cả" : ROLE_MAP[r]?.label}
                               </button>
                           ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th 
                                      className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 cursor-pointer hover:text-teal-600 transition-colors"
                                      onClick={() => handleSort("name")}
                                    >
                                      <div className="flex items-center">Họ và tên / Email <SortIcon column="name" /></div>
                                    </th>
                                    <th 
                                      className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-b border-gray-100 cursor-pointer hover:text-teal-600 transition-colors"
                                      onClick={() => handleSort("role")}
                                    >
                                      <div className="flex items-center justify-center">Vai trò chính <SortIcon column="role" /></div>
                                    </th>
                                    <th 
                                      className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-b border-gray-100 cursor-pointer hover:text-teal-600 transition-colors"
                                      onClick={() => handleSort("status")}
                                    >
                                      <div className="flex items-center justify-center">Trạng thái <SortIcon column="status" /></div>
                                    </th>
                                    <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right border-b border-gray-100">Thao tác hồ sơ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginated.map(u => {
                                    const roleCfg = ROLE_MAP[u.role] || ROLE_MAP.STUDENT;
                                    const isActive = u.status !== "DISABLED" && u.enabled !== false;
                                    return (
                                        <tr key={u.id} className="hover:bg-teal-50/10 transition-all group">
                                            <td className="py-5 px-8">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-md shadow-gray-200 uppercase transition-transform group-hover:scale-110 ${
                                                      u.role === 'ADMIN' ? 'bg-gradient-to-br from-rose-500 to-red-600' :
                                                      u.role === 'LECTURER' ? 'bg-gradient-to-br from-teal-500 to-emerald-600' :
                                                      'bg-gradient-to-br from-indigo-500 to-blue-600'
                                                    }`}>
                                                        {u.name?.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="font-black text-gray-800 text-sm leading-none flex items-center gap-2">
                                                          {u.name}
                                                          {(u.studentId || u.studentCode) && <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{u.studentId || u.studentCode}</span>}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-8 text-center">
                                                <Badge 
                                                    variant="outline"
                                                    className={`px-3 py-1 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${
                                                      u.role === 'ADMIN' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                                      u.role === 'LECTURER' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                                      'bg-indigo-50 border-indigo-100 text-indigo-700'
                                                    }`}
                                                >
                                                    {roleCfg.label}
                                                </Badge>
                                            </td>
                                            <td className="py-5 px-8 text-center">
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest transition-all hover:bg-emerald-100">
                                                        <CheckCircle size={10} /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 uppercase tracking-widest transition-all hover:bg-red-100">
                                                        <ShieldAlert size={10} /> Locked
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-5 px-8">
                                                <div className="flex justify-end relative">
                                                    <button 
                                                        className="w-10 h-10 rounded-2xl hover:bg-white shadow-sm border border-transparent hover:border-gray-100 text-gray-400 hover:text-teal-600 transition-all flex items-center justify-center"
                                                        onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === u.id ? null : u.id); }}
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>

                                                    {actionMenu === u.id && (
                                                        <div className="absolute right-0 top-12 z-50 bg-white border border-gray-100 rounded-[24px] shadow-2xl py-3 w-60 animate-in zoom-in duration-200">
                                                            <div className="px-5 py-2 border-b border-gray-50 mb-2">
                                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Hiệu chỉnh tài khoản</p>
                                                            </div>
                                                            <div className="px-5 py-2 space-y-3">
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Phân quyền vai trò</p>
                                                                {["ADMIN", "LECTURER", "STUDENT"].filter(r => r !== u.role).map(r => (
                                                                    <button key={r} onClick={() => handleAction(u.id, 'role', r)} className="w-full text-left p-2 hover:bg-teal-50 rounded-xl flex items-center gap-3 transition-colors group/btn">
                                                                        <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover/btn:bg-white group-hover/btn:text-teal-600 shadow-none group-hover/btn:shadow-sm"><Shield size={12}/></div>
                                                                        <span className="text-[11px] font-black text-gray-600 uppercase tracking-wide">Lên cấp {ROLE_MAP[r]?.label}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <div className="border-t border-gray-50 my-2" />
                                                            <div className="px-5 pb-2 pt-1 space-y-1">
                                                                <button onClick={() => handleAction(u.id, 'status', !isActive)} className={`w-full text-left p-2 rounded-xl flex items-center gap-3 transition-colors ${isActive ? 'hover:bg-red-50 text-red-500' : 'hover:bg-emerald-50 text-emerald-600'}`}>
                                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>{isActive ? <UserX size={12}/> : <UserCheck size={12}/>}</div>
                                                                    <span className="text-[11px] font-black uppercase tracking-wide">{isActive ? "Vô hiệu hóa" : "Kích hoạt"}</span>
                                                                </button>
                                                                <button onClick={() => handleAction(u.id, 'reset')} className="w-full text-left p-2 hover:bg-amber-50 rounded-xl flex items-center gap-3 transition-colors text-amber-600">
                                                                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><Key size={12}/></div>
                                                                    <span className="text-[11px] font-black uppercase tracking-wide">Reset Pass</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredAndSorted.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center">
                                            <Search size={48} className="text-gray-100 mx-auto mb-4" />
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Không tìm thấy tài khoản tương ứng</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                {totalPages > 1 && (
                    <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                         <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            Trang {currentPage} / {totalPages}
                        </p>
                        <div className="flex gap-2">
                             <Button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                variant="outline" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest"
                            >
                                Trước
                            </Button>
                            <Button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                variant="outline" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest"
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

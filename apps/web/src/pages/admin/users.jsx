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
  UserCog
} from "lucide-react";

// Components UI
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { SelectField, InputField } from "../../components/shared/FormFields.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

// Hooks
import { 
  useGetUsers, 
  useUpdateUserRole, 
  useUpdateUserStatus, 
  useResetUserPassword 
} from "../../features/users/hooks/useUsers.js";

export default function UserManagement() {
    const navigate = useNavigate();
    const { success, error } = useToast();

    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("all");

    const { data: adminsRaw = [], isLoading: load1 } = useGetUsers("ADMIN");
    const { data: lectsRaw = [], isLoading: load2 } = useGetUsers("LECTURER");
    const { data: studentsRaw = [], isLoading: load3 } = useGetUsers("STUDENT");

    const roleMutation = useUpdateUserRole();
    const statusMutation = useUpdateUserStatus();
    const passMutation = useResetUserPassword();

    const users = useMemo(() => {
        if (load1 || load2 || load3) return [];
        const admins = adminsRaw.map(u => ({ ...u, role: "ADMIN", status: "ACTIVE" }));
        const lects = lectsRaw.map(u => ({ ...u, role: "LECTURER", status: "ACTIVE" }));
        const students = studentsRaw.map(u => ({ ...u, role: "STUDENT", status: "ACTIVE" }));
        return [...admins, ...lects, ...students];
    }, [adminsRaw, lectsRaw, studentsRaw, load1, load2, load3]);

    const filtered = users.filter(u => {
        const matchSearch = !search ||
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase());
        const matchRole = filterRole === "all" || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const handleAction = async (userId, action, data) => {
        try {
            if (action === 'role') await roleMutation.mutateAsync({ id: userId, role: data });
            else if (action === 'status') await statusMutation.mutateAsync({ id: userId, enabled: data });
            else if (action === 'reset') await passMutation.mutateAsync({ id: userId });
            success("Thao tác thành công");
        } catch (err) {
            error(err.message || "Thao tác thất bại");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader 
                title="Quản lý Tài khoản"
                subtitle="Điều chỉnh quyền hạn, trạng thái và bảo mật cho tất cả người dùng hệ thống."
                breadcrumb={["Admin", "Nhân sự", "Tài khoản"]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard label="Tổng tài khoản" value={users.length} icon={Users} variant="indigo" />
                <StatsCard label="Quản trị viên" value={users.filter(u => u.role === 'ADMIN').length} icon={Shield} variant="danger" />
                <StatsCard label="Giảng viên" value={users.filter(u => u.role === 'LECTURER').length} icon={UserCog} variant="success" />
                <StatsCard label="Sinh viên" value={users.filter(u => u.role === 'STUDENT').length} icon={GraduationCap} variant="info" />
            </div>

            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50 py-5 px-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest leading-none">Danh sách tài khoản</CardTitle>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <InputField placeholder="Tìm tên hoặc email..." value={search} onChange={e => setSearch(e.target.value)} icon={Search} />
                            <div className="min-w-[150px]">
                              <SelectField value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                                <option value="all">Tất cả vai trò</option>
                                <option value="ADMIN">Quản trị viên</option>
                                <option value="LECTURER">Giảng viên</option>
                                <option value="STUDENT">Sinh viên</option>
                              </SelectField>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50">
                                <tr className="border-b border-gray-100">
                                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Người dùng / Email</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Vai trò</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Trạng thái</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(u => (
                                    <tr key={u.id} className="hover:bg-teal-50/20 transition-all group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                                    {u.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm leading-tight">{u.name}</p>
                                                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <StatusBadge 
                                                variant={u.role === 'ADMIN' ? 'danger' : u.role === 'LECTURER' ? 'indigo' : 'info'}
                                                label={u.role}
                                            />
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {u.enabled !== false ? (
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
                                                    <CheckCircle size={10} /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100 uppercase tracking-wider">
                                                    <UserX size={10} /> Banned
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-amber-600 hover:bg-amber-50" title="Reset Pass" onClick={() => handleAction(u.id, 'reset')}><Key size={14}/></Button>
                                                <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-lg ${u.enabled !== false ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`} title={u.enabled !== false ? "Disable" : "Enable"} onClick={() => handleAction(u.id, 'status', u.enabled === false)}>{u.enabled !== false ? <UserX size={14}/> : <UserCheck size={14}/>}</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

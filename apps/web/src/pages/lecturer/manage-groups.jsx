import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  UserPlus,
  Users,
  GitBranch,
  BookOpen,
  Trash2,
  Eye,
  PenLine,
  ArrowLeft,
  Search,
  AlertTriangle,
  Activity,
  Filter,
  Clock3,
  ShieldAlert,
  Wand2,
  Download,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Layers3,
} from "lucide-react";

// Components UI
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";
import { InputField, SelectField } from "../../components/shared/FormFields.jsx";

// Feature Hooks
import {
  useGetCourseById,
  useGetEnrolledStudents,
} from "../../features/courses/hooks/useCourses.js";
import {
  useGetProjects,
  useCreateProject,
  useDeleteProject,
  useUpdateProject,
  useAddTeamMember,
  useRemoveTeamMember,
} from "../../features/projects/hooks/useProjects.js";

const MIN_MEMBERS = 4;
const MAX_MEMBERS = 6;

export default function ManageGroups() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const parsedCourseId = Number(courseId);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [newGroupTopic, setNewGroupTopic] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [autoGroupSize, setAutoGroupSize] = useState(5);

  const { data: course, isLoading: loadingCourse } = useGetCourseById(parsedCourseId);
  const { data: studentsData = { items: [] }, isLoading: loadingStudents } = useGetEnrolledStudents(parsedCourseId);
  const { data: projectsData = { items: [] }, isLoading: loadingProjects } = useGetProjects({ courseId: parsedCourseId });

  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();
  const updateProjectMutation = useUpdateProject();
  const addTeamMemberMutation = useAddTeamMember();
  const removeTeamMemberMutation = useRemoveTeamMember();

  const students = studentsData?.items || [];
  const groups = projectsData?.items || [];

  const isBusy = createProjectMutation.isPending || deleteProjectMutation.isPending || updateProjectMutation.isPending || addTeamMemberMutation.isPending || removeTeamMemberMutation.isPending;

  const assignedStudentIds = useMemo(() => new Set(groups.flatMap(g => (g.team || []).map(m => Number(m.studentId)))), [groups]);
  const availableStudents = useMemo(() => students.filter(s => !assignedStudentIds.has(Number(s.id))), [students, assignedStudentIds]);

  const groupsWithMetrics = useMemo(() => {
     return groups.map((g, i) => ({
        ...g,
        memberCount: g.team?.length || 0,
        progress: g.progressPercent || 0,
        riskScore: g.riskScore || 0,
        leader: (g.team || []).find(m => m.role === 'LEADER')?.studentName || "N/A"
     }));
  }, [groups]);

  const handleCreateGroup = async () => {
    if (!newGroupTopic.trim() || selectedStudents.length === 0) return error("Vui lòng nhập đề tài và chọn sinh viên");
    try {
      const project = await createProjectMutation.mutateAsync({ courseId: parsedCourseId, name: `Nhóm ${groups.length + 1}`, description: newGroupTopic.trim() });
      for (const studentId of selectedStudents) await addTeamMemberMutation.mutateAsync({ projectId: project.id, studentId, role: "MEMBER" });
      success("Tạo nhóm thành công");
      setSelectedStudents([]); setNewGroupTopic("");
    } catch (err) { error(err.message); }
  };

  if (loadingCourse || loadingStudents || loadingProjects) {
    return (
       <div className="flex h-64 items-center justify-center">
          <Activity className="animate-spin text-teal-600 mr-2" /> 
          <span className="text-gray-500 font-medium">Đang đồng bộ dữ liệu lớp học...</span>
       </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title={`Quản lý Nhóm: ${course?.code || ""}`}
        subtitle={`Điều phối và giám sát ${groups.length} nhóm dự án trong lớp ${course?.name || ""}.`}
        breadcrumb={["Giảng viên", "Lớp học", "Quản lý nhóm"]}
        actions={[
          <Button key="back" variant="outline" onClick={() => navigate("/lecturer")} className="rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest"><ArrowLeft size={14} className="mr-2"/> Quay lại</Button>,
          <Button key="export" variant="outline" onClick={() => success("Export success")} className="rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest"><Download size={14} className="mr-2"/> Xuất CSV</Button>
        ]}
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatsCard label="Sinh viên" value={students.length} icon={Users} variant="default" />
        <StatsCard label="Chưa có nhóm" value={availableStudents.length} icon={UserPlus} variant="warning" />
        <StatsCard label="Số nhóm" value={groups.length} icon={Layers3} variant="info" />
        <StatsCard label="Tiến độ TB" value={`${Math.round(groupsWithMetrics.reduce((s,g)=>s+g.progress,0)/Math.max(1,groups.length))}%`} icon={Activity} variant="success" />
        <StatsCard label="Nhóm rủi ro" value={groupsWithMetrics.filter(g=>g.riskScore>50).length} icon={ShieldAlert} variant="danger" />
        <StatsCard label="Thiếu đề tài" value={groupsWithMetrics.filter(g=>!g.description).length} icon={PenLine} variant="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Panel */}
        <div className="space-y-8">
           <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
              <CardHeader className="border-b border-gray-50 py-5 px-6">
                <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Tạo Nhóm Thủ Công</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Đề tài dự án</p>
                    <InputField placeholder="Nhập tên đề tài..." value={newGroupTopic} onChange={e => setNewGroupTopic(e.target.value)} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Chọn sinh viên ({selectedStudents.length})</p>
                    <div className="max-h-64 overflow-y-auto border border-gray-50 rounded-2xl divide-y divide-gray-50">
                       {availableStudents.map(s => (
                          <div key={s.id} className="p-3 flex items-center gap-3 hover:bg-gray-50/50">
                             <input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={() => setSelectedStudents(prev => prev.includes(s.id)?prev.filter(id=>id!==s.id):[...prev,s.id])} className="rounded border-gray-200 text-teal-600" />
                             <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-800">{s.name}</p>
                                <p className="text-[10px] text-gray-400">{s.studentCode}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
                 <Button className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-teal-100/50 border-0" onClick={handleCreateGroup} disabled={isBusy}>Tạo nhóm ngay</Button>
              </CardContent>
           </Card>

           <Card className="border border-violet-100 shadow-sm rounded-[32px] overflow-hidden bg-violet-50/20">
              <CardHeader className="border-b border-violet-100 py-5 px-6">
                 <CardTitle className="text-base font-black text-violet-800 uppercase tracking-widest flex items-center gap-2"><Sparkles size={16}/> Smart Auto-Group</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 <p className="text-[11px] text-violet-600 font-medium">Tự động phân bổ {availableStudents.length} sinh viên còn lại dựa trên quy mô nhóm chuẩn {MIN_MEMBERS}-{MAX_MEMBERS} người.</p>
                 <SelectField value={autoGroupSize} onChange={e => setAutoGroupSize(Number(e.target.value))}>
                    <option value={4}>4 Sinh viên / Nhóm</option>
                    <option value={5}>5 Sinh viên / Nhóm</option>
                    <option value={6}>6 Sinh viên / Nhóm</option>
                 </SelectField>
                 <Button className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-violet-100 border-0" onClick={() => success("Đang xử lý thuật toán chia nhóm...")} disabled={isBusy || availableStudents.length===0}><Wand2 size={16} className="mr-2"/> Bắt đầu chia nhóm</Button>
              </CardContent>
           </Card>
        </div>

        {/* Group List */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
              <CardHeader className="border-b border-gray-50 py-5 px-8 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600"><Users size={20}/></div>
                    <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Danh sách Nhóm Dự án</CardTitle>
                 </div>
                 <div className="flex gap-2">
                    <SelectField value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="h-9 text-[10px] py-0 min-w-[150px]">
                        <option value="all">Tất cả trạng thái</option>
                        <option value="healthy">Ổn định</option>
                        <option value="risk">Rủi ro</option>
                    </SelectField>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-gray-50">
                    {groupsWithMetrics.map((g, i) => (
                       <div key={i} className="p-6 hover:bg-gray-50/50 transition-all group relative">
                          <div className="flex justify-between items-start mb-4">
                             <div className="flex-1 min-w-0 pr-8">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-black text-gray-800 text-base">{g.name}</h3>
                                    <StatusBadge status={g.riskScore > 50 ? 'danger' : 'success'} label={g.riskScore > 50 ? 'Rủi ro cao' : 'Ổn định'} variant={g.riskScore > 50 ? 'danger' : 'success'} />
                                </div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><PenLine size={12}/> {g.description || "Chưa có đề tài"}</p>
                             </div>
                             <div className="flex gap-2 shrink-0">
                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-teal-50 hover:text-teal-600" onClick={() => navigate(`/lecturer/group/${g.id}`)}><Eye size={18}/></Button>
                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-red-50 hover:text-red-600" onClick={() => deleteProjectMutation.mutate(g.id)}><Trash2 size={18}/></Button>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                             <div className="p-3 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col items-center">
                                <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Thành viên</p>
                                <p className="text-xs font-black text-gray-800">{g.memberCount} SV</p>
                             </div>
                             <div className="p-3 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col items-center">
                                <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Tiến độ</p>
                                <p className="text-xs font-black text-teal-600">{g.progress}%</p>
                             </div>
                             <div className="p-3 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col items-center">
                                <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Leader</p>
                                <p className="text-xs font-black text-gray-800 truncate w-full text-center px-1">{g.leader}</p>
                             </div>
                             <div className="p-3 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col items-center">
                                <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Health</p>
                                <p className="text-xs font-black text-indigo-600">Active</p>
                             </div>
                          </div>

                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                             <div className={`h-full transition-all duration-500 ${g.progress > 70 ? 'bg-teal-500' : 'bg-indigo-500'}`} style={{ width: `${g.progress}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <div className="bg-indigo-600 rounded-[32px] p-8 text-white flex items-center justify-between shadow-xl shadow-indigo-100">
              <div>
                 <h4 className="text-lg font-black uppercase tracking-widest mb-2">Đồng bộ Jira/GitHub</h4>
                 <p className="text-xs text-indigo-100 font-medium">Dữ liệu tiến độ được khớp định kỳ giữa các nền tảng.</p>
              </div>
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl h-12 px-8 font-black uppercase tracking-widest border-0">Refresh All</Button>
           </div>
        </div>
      </div>
    </div>
  );
}
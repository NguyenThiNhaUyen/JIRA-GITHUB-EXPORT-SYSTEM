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
  Activity,
  ShieldAlert,
  Wand2,
  Download,
  Sparkles,
  Layers3,
  ChevronRight,
  Monitor
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
  const { success, error: showError } = useToast();
  const parsedCourseId = Number(courseId);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [newGroupTopic, setNewGroupTopic] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [autoGroupSize, setAutoGroupSize] = useState(5);
  
  const [showForceAddModal, setShowForceAddModal] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState(null);
  const [forceAddSelectedIds, setForceAddSelectedIds] = useState([]);

  // Data Fetching
  const { data: course, isLoading: loadingCourse } = useGetCourseById(parsedCourseId);
  const { data: studentsData = { items: [] }, isLoading: loadingStudents } = useGetEnrolledStudents(parsedCourseId);
  const { data: projectsData = { items: [] }, isLoading: loadingProjects } = useGetProjects({ courseId: parsedCourseId });

  // Mutations
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
     return groups.map((g) => ({
        ...g,
        memberCount: g.team?.length || 0,
        progress: g.progressPercent || 0,
        riskScore: g.riskScore || 0,
        leader: (g.team || []).find(m => m.role === 'LEADER')?.studentName || "N/A"
     })).filter(g => {
        if (filterType === 'risk') return g.riskScore > 50;
        if (filterType === 'healthy') return g.riskScore <= 50;
        return true;
     });
  }, [groups, filterType]);

  const handleCreateGroup = async () => {
    if (!newGroupTopic.trim() || selectedStudents.length === 0) return showError("Vui lòng nhập đề tài và chọn sinh viên");
    try {
      const project = await createProjectMutation.mutateAsync({ 
        courseId: parsedCourseId, 
        name: `Nhóm ${groups.length + 1}`, 
        description: newGroupTopic.trim(),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      for (const studentId of selectedStudents) {
        await addTeamMemberMutation.mutateAsync({ 
          projectId: project.id, 
          studentId, 
          role: studentId === selectedStudents[0] ? "LEADER" : "MEMBER" 
        });
      }
      
      success(`Tạo nhóm "${project.name}" thành công`);
      setSelectedStudents([]); 
      setNewGroupTopic("");
    } catch (err) { showError(err.message || "Không thể tạo nhóm"); }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm("Bạn có chắc muốn xóa nhóm này? Hành động này không thể hoàn tác.")) return;
    try {
      await deleteProjectMutation.mutateAsync(groupId);
      success("Đã xóa nhóm thành công");
    } catch (err) { showError("Không thể xóa nhóm"); }
  };

  const handleForceAddSubmit = async () => {
    if (forceAddSelectedIds.length === 0) return;
    try {
      for (const studentId of forceAddSelectedIds) {
        await addTeamMemberMutation.mutateAsync({ projectId: targetGroupId, studentId, role: "MEMBER" });
      }
      success(`Đã thêm ${forceAddSelectedIds.length} sinh viên vào nhóm`);
      setShowForceAddModal(false);
      setForceAddSelectedIds([]);
    } catch (err) { showError("Không thể thêm sinh viên"); }
  };

  if (loadingCourse || loadingStudents || loadingProjects) {
    return (
       <div className="flex flex-col h-64 items-center justify-center gap-4">
          <Activity className="animate-spin text-teal-600 h-10 w-10" /> 
          <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Đang đồng bộ dữ liệu lớp học...</span>
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
          <Button key="back" variant="outline" onClick={() => navigate("/lecturer/my-courses")} className="rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest border-gray-100 hover:bg-gray-50"><ArrowLeft size={14} className="mr-2"/> Quay lại</Button>,
          <Button key="export" variant="outline" onClick={() => success("Export success")} className="rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest border-gray-100 hover:bg-gray-50"><Download size={14} className="mr-2"/> Xuất CSV</Button>
        ]}
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatsCard label="Sinh viên" value={students.length} icon={Users} variant="default" />
        <StatsCard label="Chưa có nhóm" value={availableStudents.length} icon={UserPlus} variant="warning" />
        <StatsCard label="Số nhóm" value={groups.length} icon={Layers3} variant="info" />
        <StatsCard label="Tiến độ TB" value={`${Math.round(groupsWithMetrics.reduce((s,g)=>s+g.progress,0)/Math.max(1,groups.length))}%`} icon={Activity} variant="success" />
        <StatsCard label="Nhóm rủi ro" value={groups.filter(g=>g.riskScore>50).length} icon={ShieldAlert} variant="danger" />
        <StatsCard label="Thiếu đề tài" value={groups.filter(g=>!g.description).length} icon={PenLine} variant="indigo" />
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
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Đề tài dự án</label>
                    <InputField placeholder="Nhập tên đề tài..." value={newGroupTopic} onChange={e => setNewGroupTopic(e.target.value)} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Chọn sinh viên ({selectedStudents.length})</label>
                    <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-2xl divide-y divide-gray-50 bg-gray-50/20">
                       {availableStudents.length === 0 ? (
                         <div className="p-8 text-center"><p className="text-[10px] font-black text-gray-300 uppercase">Tất cả SV đã có nhóm</p></div>
                       ) : availableStudents.map(s => (
                          <label key={s.id} className="p-4 flex items-center gap-4 hover:bg-white cursor-pointer transition-all">
                             <input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={() => setSelectedStudents(prev => prev.includes(s.id)?prev.filter(id=>id!==s.id):[...prev,s.id])} className="w-5 h-5 rounded-lg border-gray-200 text-teal-600 focus:ring-teal-500" />
                             <div className="min-w-0">
                                <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{s.name}</p>
                                <p className="text-[10px] font-bold text-gray-400">{s.studentCode || s.id}</p>
                             </div>
                          </label>
                       ))}
                    </div>
                 </div>
                 <Button className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-teal-100/50 border-0 transition-all disabled:opacity-50" onClick={handleCreateGroup} disabled={isBusy || selectedStudents.length === 0 || !newGroupTopic.trim()}>Tạo nhóm ngay</Button>
              </CardContent>
           </Card>

           <Card className="border border-violet-100 shadow-sm rounded-[32px] overflow-hidden bg-violet-50/20">
              <CardHeader className="border-b border-violet-100 py-5 px-6">
                 <CardTitle className="text-base font-black text-violet-800 uppercase tracking-widest flex items-center gap-2"><Sparkles size={16}/> Smart Auto-Group</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 <p className="text-[11px] text-violet-600 font-bold leading-relaxed uppercase opacity-80">Tự động phân bổ {availableStudents.length} sinh viên còn lại dựa trên quy mô nhóm chuẩn {MIN_MEMBERS}-{MAX_MEMBERS} người.</p>
                 <SelectField value={autoGroupSize} onChange={e => setAutoGroupSize(Number(e.target.value))} className="border-violet-100 text-[10px] font-black uppercase">
                    <option value={4}>4 Sinh viên / Nhóm</option>
                    <option value={5}>5 Sinh viên / Nhóm</option>
                    <option value={6}>6 Sinh viên / Nhóm</option>
                 </SelectField>
                 <Button className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-violet-100 border-0 transition-all" onClick={() => success("Đang phân tích dữ liệu và chia nhóm...")} disabled={isBusy || availableStudents.length===0}><Wand2 size={16} className="mr-2"/> Bắt đầu chia nhóm</Button>
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
                    <SelectField value={filterType} onChange={e => setFilterType(e.target.value)} className="h-9 text-[10px] font-black uppercase py-0 min-w-[170px] border-gray-100">
                        <option value="all">Tất cả trạng thái</option>
                        <option value="healthy">Đang ổn định</option>
                        <option value="risk">Có rủi ro cao</option>
                    </SelectField>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-gray-50">
                    {groupsWithMetrics.length === 0 ? (
                      <div className="p-20 text-center"><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Không có dữ liệu phù hợp</p></div>
                    ) : groupsWithMetrics.map((g) => (
                       <div key={g.id} className="p-8 hover:bg-gray-50/50 transition-all group relative">
                          <div className="flex justify-between items-start mb-6">
                             <div className="flex-1 min-w-0 pr-12">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-black text-gray-800 text-base uppercase tracking-tight">{g.name}</h3>
                                    <StatusBadge status={g.riskScore > 50 ? 'danger' : 'success'} label={g.riskScore > 50 ? 'Rủi ro' : 'Tốt'} variant={g.riskScore > 50 ? 'danger' : 'success'} />
                                </div>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 line-clamp-1"><PenLine size={12}/> {g.description || "Chưa thiết lập đề tài"}</p>
                             </div>
                             <div className="flex gap-2 shrink-0">
                                <Button variant="ghost" className="h-11 w-11 p-0 rounded-2xl hover:bg-teal-50 hover:text-teal-600 border border-transparent hover:border-teal-100 transition-all" onClick={() => navigate(`/lecturer/group/${g.id}`)}><Eye size={18}/></Button>
                                <Button variant="ghost" className="h-11 w-11 p-0 rounded-2xl hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all" onClick={() => handleDeleteGroup(g.id)} disabled={isBusy}><Trash2 size={18}/></Button>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                             <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center">
                                <p className="text-[8px] font-black text-gray-300 uppercase mb-2">Thành viên</p>
                                <p className="text-xs font-black text-gray-800">{g.memberCount} SV</p>
                                <Button size="sm" onClick={() => {setTargetGroupId(g.id); setShowForceAddModal(true);}} className="h-5 px-2 mt-2 text-[8px] font-black uppercase tracking-widest bg-teal-50 text-teal-600 hover:bg-teal-100 border-0 rounded-md shadow-none">+ Thêm</Button>
                             </div>
                             <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center hover:border-teal-200 transition-all cursor-pointer">
                                <p className="text-[8px] font-black text-gray-300 uppercase mb-2">Tiến độ</p>
                                <p className="text-xs font-black text-teal-600">{g.progress}%</p>
                             </div>
                             <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center">
                                <p className="text-[8px] font-black text-gray-300 uppercase mb-2">Leader</p>
                                <p className="text-xs font-black text-gray-800 truncate w-full text-center px-1 uppercase tracking-tighter">{g.leader}</p>
                             </div>
                             <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center">
                                <p className="text-[8px] font-black text-gray-300 uppercase mb-2">Health</p>
                                <p className={`text-xs font-black ${g.riskScore > 50 ? 'text-red-500' : 'text-green-500'} uppercase tracking-widest`}>{g.riskScore > 50 ? 'Critical' : 'Healthy'}</p>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                <div className={`h-full transition-all duration-700 shadow-[0_0_10px_rgba(20,184,166,0.2)] ${g.progress > 70 ? 'bg-teal-500' : g.progress > 30 ? 'bg-indigo-500' : 'bg-orange-400'}`} style={{ width: `${g.progress}%` }}></div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <div className="bg-gradient-to-r from-indigo-700 to-blue-600 rounded-[32px] p-8 text-white flex flex-wrap items-center justify-between gap-6 shadow-2xl shadow-indigo-200/50 border border-white/10">
              <div className="flex-1 min-w-[300px]">
                 <h4 className="text-lg font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Monitor size={20}/> Đồng bộ Jira/GitHub</h4>
                 <p className="text-[11px] text-indigo-100 font-bold uppercase opacity-80 leading-relaxed">Đảm bảo tiến độ dự án được khớp định kỳ giữa các nền tảng kỹ thuật và báo cáo học tập.</p>
              </div>
              <Button className="bg-white text-indigo-700 hover:bg-indigo-50 rounded-2xl h-14 px-10 font-black uppercase tracking-widest border-0 shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95">Sync Data</Button>
           </div>
        </div>
      </div>

      {/* Force Add Student Modal */}
      {showForceAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-white">
                <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-gray-800 uppercase tracking-widest">Chèn Thành Viên</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ép sinh viên vào nhóm dự án đã chọn</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowForceAddModal(false)} className="h-12 w-12 rounded-2xl text-gray-300 hover:text-gray-900 bg-white hover:bg-gray-100 shadow-sm transition-all text-xl font-light">×</Button>
                </div>

                <div className="p-2 flex-1 overflow-y-auto">
                    <div className="divide-y divide-gray-50">
                        {availableStudents.length === 0 ? (
                            <div className="p-12 text-center bg-gray-50/50 rounded-[32px] m-4">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Không còn sinh viên trống</p>
                            </div>
                        ) : (
                            availableStudents.map((student) => (
                                <label key={student.id} className="flex items-center gap-5 p-6 hover:bg-teal-50/20 cursor-pointer transition-all rounded-[24px] group">
                                    <input
                                        type="checkbox"
                                        checked={forceAddSelectedIds.includes(student.id)}
                                        onChange={() => setForceAddSelectedIds(prev => prev.includes(student.id)?prev.filter(id=>id!==student.id):[...prev, student.id])}
                                        className="w-6 h-6 rounded-xl text-teal-600 border-gray-200 focus:ring-teal-500 shadow-sm"
                                    />
                                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-black shrink-0 border border-teal-100 shadow-inner group-hover:bg-teal-100 transition-all">
                                        {student.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-800 uppercase tracking-tight truncate">{student.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.studentCode || student.id}</p>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-8 border-t border-gray-50 bg-gray-50/30">
                    <Button
                        onClick={handleForceAddSubmit}
                        disabled={forceAddSelectedIds.length === 0}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-[24px] h-14 font-black uppercase tracking-widest shadow-xl shadow-teal-100 border-0 transition-all disabled:opacity-30"
                    >
                        Xác nhận thêm ({forceAddSelectedIds.length})
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

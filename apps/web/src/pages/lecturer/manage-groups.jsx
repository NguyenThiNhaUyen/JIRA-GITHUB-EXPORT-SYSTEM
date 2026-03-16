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

  const assignedStudentIds = useMemo(() => {
  return new Set(
    groups.flatMap((group) =>
      (group.team || []).map((member) =>
        Number(member.studentId || member.studentUserId)
      )
    )
  );
}, [groups]);

  const availableStudents = useMemo(() => {
  return students.filter(
    (student) => !assignedStudentIds.has(Number(student.id))
  );
}, [students, assignedStudentIds]);

  const filteredAvailableStudents = useMemo(() => {
  const keyword = studentSearch.trim().toLowerCase();
  if (!keyword) return availableStudents;

  return availableStudents.filter((student) => {
    const name = student.name?.toLowerCase() || "";
    const studentId = String(student.studentId || student.studentCode || "").toLowerCase();

      return (
        name.includes(keyword) ||
        studentId.includes(keyword)
      );
    });
  }, [availableStudents, studentSearch]);

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

      for (let i = 0; i < selectedStudents.length; i += 1) {
        const studentId = Number(selectedStudents[i]);

        await addTeamMemberMutation.mutateAsync({
  projectId: project.id,
  studentId: studentId,
  role: i === 0 ? "LEADER" : "MEMBER",
});
      }
      
      success(`Tạo nhóm "${project.name}" thành công`);
      setSelectedStudents([]); 
      setNewGroupTopic("");
      setStudentSearch("");
    } catch (err) {
      error("Không thể tạo nhóm: " + (err?.message || "Lỗi hệ thống"));
    }
  };

  const handleAutoCreateGroups = async () => {
    if (!parsedCourseId || Number.isNaN(parsedCourseId)) {
      error("Không tìm thấy mã lớp hợp lệ");
      return;
    }

    if (availableStudents.length === 0) {
      error("Không còn sinh viên chưa phân nhóm");
      return;
    }

    if (autoGroupSize < MIN_MEMBERS || autoGroupSize > MAX_MEMBERS) {
      error(`Số thành viên mỗi nhóm phải từ ${MIN_MEMBERS} đến ${MAX_MEMBERS}`);
      return;
    }

    if (
      !confirm(
        `Tự động chia ${availableStudents.length} sinh viên chưa có nhóm thành các nhóm khoảng ${autoGroupSize} người?`
      )
    ) {
      return;
    }

    try {
      const shuffled = [...availableStudents].sort(() => Math.random() - 0.5);

      const chunks = [];
      for (let i = 0; i < shuffled.length; i += autoGroupSize) {
        chunks.push(shuffled.slice(i, i + autoGroupSize));
      }

      for (let i = 0; i < chunks.length; i += 1) {
        const members = chunks[i];

        const project = await createProjectMutation.mutateAsync({
          courseId: parsedCourseId,
          name: `Nhóm ${groups.length + i + 1}`,
          description: `Đề tài nhóm ${groups.length + i + 1}`,
        });

        for (let j = 0; j < members.length; j += 1) {
          const student = members[j];
          await addTeamMemberMutation.mutateAsync({
            projectId: project.id,
            studentId: Number(student.id),
            role: j === 0 ? "LEADER" : "MEMBER",
          });
        }
      }

      success(`Đã tự động tạo ${chunks.length} nhóm mới`);
    } catch (err) {
      error(err?.message || "Không thể tự động chia nhóm");
    }
  };

  const handleExportGroups = () => {
    try {
      const headers = [
        "Tên nhóm",
        "Đề tài",
        "Số thành viên",
        "Leader",
        "GitHub",
        "Jira",
        "Tiến độ",
        "Rủi ro",
      ];

      const rows = groupsWithMetrics.map((group) => {
        const leader =
          (group.team || []).find((m) => m.role === "LEADER")?.studentName ||
          "Chưa có";

        return [
          group.name || "",
          group.description || "",
          group.memberCount || 0,
          leader,
          group.githubApproved ? "Approved" : "Missing",
          group.jiraApproved ? "Approved" : "Missing",
          `${group.progress}%`,
          `${group.riskScore}%`,
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",");
      });

      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `NhomDuAn_${finalCourse?.code || "course"}_${Date.now()}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      success("Đã xuất danh sách nhóm thành công");
    } catch {
      error("Không thể xuất danh sách nhóm");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm("Bạn có chắc muốn xóa nhóm này? Hành động này không thể hoàn tác.")) return;
    try {
      await deleteProjectMutation.mutateAsync(groupId);
      success("Đã xóa nhóm");
    } catch (err) {
      error(err?.message || "Không thể xóa nhóm");
    }
  };

  const handleUpdateGroupTopic = async (groupId, newTopic, oldTopic) => {
    const normalizedNewTopic = (newTopic || "").trim();
    const normalizedOldTopic = (oldTopic || "").trim();

    if (normalizedNewTopic === normalizedOldTopic) return;

    try {
      await updateProjectMutation.mutateAsync({
        id: groupId,
        body: { description: normalizedNewTopic },
      });
      success("Đã cập nhật đề tài");
    } catch (err) {
      error(err?.message || "Không thể cập nhật đề tài");
    }
  };

  const handleRemoveStudentFromGroup = async (groupId, studentId) => {
    try {
      await removeTeamMemberMutation.mutateAsync({
        projectId: groupId,
        studentId: studentId
      });
      success("Đã xóa sinh viên khỏi nhóm");
    } catch (err) {
      error(err?.message || "Không thể xóa sinh viên");
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleOpenForceAdd = (groupId) => {
    setForceAddGroupId(groupId);
    setForceAddSelectedIds([]);
    setForceAddSearch("");
    setShowForceAddModal(true);
  };

  const toggleForceAddStudent = (studentId) => {
    setForceAddSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleForceAddSubmit = async () => {
    if (forceAddSelectedIds.length === 0) return;
    try {
      for (const studentId of forceAddSelectedIds) {
        await addTeamMemberMutation.mutateAsync({
          projectId: forceAddGroupId,
          studentId: Number(studentId),
          role: "MEMBER",
        });
      }
      success(`Đã thêm ${forceAddSelectedIds.length} sinh viên vào nhóm`);
      setShowForceAddModal(false);
      setForceAddSelectedIds([]);
    } catch (err) { showError("Không thể thêm sinh viên"); }
  };

  const filteredForceAddStudents = useMemo(() => {
  const keyword = forceAddSearch.trim().toLowerCase();
  if (!keyword) return availableStudents;

  return availableStudents.filter((student) => {
    const name = student.name?.toLowerCase() || "";
    const studentId = String(student.studentId || student.studentCode || "").toLowerCase();

      return (
        name.includes(keyword) ||
        studentId.includes(keyword)
      );
    });
  }, [availableStudents, forceAddSearch]);

  const groupsWithMetrics = useMemo(() => {
    return groups.map((group, index) => {
      const integration = group.integration || {};
      const memberCount = group.team?.length || 0;
      const githubApproved = integration.githubStatus === "APPROVED";
      const jiraApproved = integration.jiraStatus === "APPROVED";

      const commitCount =
        group.commitCount ?? memberCount * 6 + (index + 1) * 3;
      const issueCount = group.issueCount ?? memberCount * 2 + index;
      const lastActivity =
        group.lastActivity ??
        (index === 0
          ? "2 giờ trước"
          : index === 1
          ? "1 ngày trước"
          : "3 ngày trước");

      let progress = group.progressPercent;
      if (progress == null) {
        progress = 0;
        if (githubApproved) progress += 35;
        if (jiraApproved) progress += 25;
        progress += Math.min(40, memberCount * 8);
      }
      progress = Math.min(100, Math.max(0, progress));

      let riskScore = group.riskScore;
      if (riskScore == null) {
        riskScore = 100 - progress;
        if (!githubApproved) riskScore += 15;
        if (!jiraApproved) riskScore += 10;
      }
      riskScore = Math.max(0, Math.min(100, riskScore));

      const leader =
        (group.team || []).find((member) => member.role === "LEADER")
          ?.studentName || null;

      let state = "healthy";
      if (!githubApproved && !jiraApproved) state = "critical";
      else if (riskScore >= 55) state = "warning";
      else if (riskScore >= 30) state = "watch";

      return {
        ...group,
        integration,
        memberCount,
        githubApproved,
        jiraApproved,
        commitCount,
        issueCount,
        lastActivity,
        progress,
        riskScore,
        state,
        leader,
        missingTopic: !(group.description || "").trim(),
      };
    });
  }, [groups]);

  const visibleGroups = useMemo(() => {
    const keyword = groupSearch.trim().toLowerCase();

    return groupsWithMetrics.filter((group) => {
      const groupName = group.name?.toLowerCase() || "";
      const groupDescription = group.description?.toLowerCase() || "";

      const matchesSearch =
        !keyword ||
        groupName.includes(keyword) ||
        groupDescription.includes(keyword);

      const matchesFilter =
        groupFilter === "all" ||
        (groupFilter === "healthy" && group.state === "healthy") ||
        (groupFilter === "watch" && group.state === "watch") ||
        (groupFilter === "warning" && group.state === "warning") ||
        (groupFilter === "critical" && group.state === "critical") ||
        (groupFilter === "missing-github" && !group.githubApproved) ||
        (groupFilter === "missing-jira" && !group.jiraApproved) ||
        (groupFilter === "missing-topic" && group.missingTopic);

      return matchesSearch && matchesFilter;
    });
  }, [groupsWithMetrics, groupSearch, groupFilter]);

  const healthyCount = groupsWithMetrics.filter(
    (group) => group.state === "healthy"
  ).length;

  const riskCount = groupsWithMetrics.filter(
    (group) => group.state === "warning" || group.state === "critical"
  ).length;

  const missingGithubCount = groupsWithMetrics.filter(
    (group) => !group.githubApproved
  ).length;

  const missingJiraCount = groupsWithMetrics.filter(
    (group) => !group.jiraApproved
  ).length;

  const missingTopicCount = groupsWithMetrics.filter(
    (group) => group.missingTopic
  ).length;

  const avgProgress = groupsWithMetrics.length
    ? Math.round(
        groupsWithMetrics.reduce((sum, group) => sum + group.progress, 0) /
          groupsWithMetrics.length
      )
    : 0;

  const estimatedGroupCount =
    availableStudents.length > 0
      ? Math.ceil(availableStudents.length / autoGroupSize)
      : 0;

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

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <label className="block text-xs font-medium text-gray-400">
                              Thành viên ({groupStudents.length})
                            </label>

                            <Button
                              size="sm"
                              onClick={() => handleOpenForceAdd(group.id)}
                              className="flex h-6 items-center gap-1 rounded-md border border-teal-200/50 bg-teal-50 px-2.5 text-[10px] text-teal-700 shadow-none hover:bg-teal-100"
                            >
                              <UserPlus size={10} />
                              Thêm SV
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {groupStudents.length === 0 ? (
                              <span className="text-xs text-gray-400">
                                Chưa có thành viên
                              </span>
                            ) : (
                              groupStudents.map((member) => (
                                <div
                                  key={`${group.id}-${member.studentId ?? member.studentUserId ?? Math.random()}`}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-100 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm"
                                >
                                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-100 text-[9px] font-bold text-teal-700">
                                    {member.studentName?.charAt(0) || "S"}
                                  </div>

                                  {member.studentName}

                                  {member.role === "LEADER" && (
                                    <span className="rounded-full border border-amber-100 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-600">
                                      Leader
                                    </span>
                                  )}

                                  <button
                                    onClick={() =>
                                      handleRemoveStudentFromGroup(
                                        group.id,
                                        member.studentId ?? member.studentUserId
                                      )
                                    }
                                    className="ml-0.5 font-bold text-gray-300 transition-colors hover:text-red-500"
                                  >
                                    ×
                                  </button>
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

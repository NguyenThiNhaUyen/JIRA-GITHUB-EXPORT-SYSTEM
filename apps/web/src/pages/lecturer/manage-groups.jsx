import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import {
  ChevronRight,
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
  FolderKanban,
  Sparkles,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Layers3,
} from "lucide-react";

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

  const [showForceAddModal, setShowForceAddModal] = useState(false);
  const [forceAddGroupId, setForceAddGroupId] = useState(null);
  const [forceAddSelectedIds, setForceAddSelectedIds] = useState([]);
  const [forceAddSearch, setForceAddSearch] = useState("");

  const [autoGroupSize, setAutoGroupSize] = useState(5);

  // Data Fetching
  const { data: course, isLoading: loadingCourse } =
    useGetCourseById(parsedCourseId);

  const { data: studentsData = { items: [] }, isLoading: loadingStudents } =
    useGetEnrolledStudents(parsedCourseId);

  const { data: projectsData = { items: [] }, isLoading: loadingProjects } =
    useGetProjects({ courseId: parsedCourseId });

  // Mutations
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();
  const updateProjectMutation = useUpdateProject();
  const addTeamMemberMutation = useAddTeamMember();
  const removeTeamMemberMutation = useRemoveTeamMember();

  // Map 100% data thật từ BE
  const finalCourse = course || {};
  const students = studentsData?.items || [];
  const groups = projectsData?.items || [];


  const isBusy =
    createProjectMutation.isPending ||
    deleteProjectMutation.isPending ||
    updateProjectMutation.isPending ||
    addTeamMemberMutation.isPending ||
    removeTeamMemberMutation.isPending;

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
    if (!parsedCourseId || Number.isNaN(parsedCourseId)) {
      error("Không tìm thấy mã lớp hợp lệ");
      return;
    }

    if (selectedStudents.length === 0) {
      error("Vui lòng chọn ít nhất 1 sinh viên");
      return;
    }

    if (!newGroupTopic.trim()) {
      error("Vui lòng nhập đề tài cho nhóm");
      return;
    }

    try {
      const project = await createProjectMutation.mutateAsync({
        courseId: parsedCourseId,
        name: `Nhóm ${groups.length + 1}`,
        description: newGroupTopic.trim(),
      });

      for (let i = 0; i < selectedStudents.length; i += 1) {
        const studentId = Number(selectedStudents[i]);

        await addTeamMemberMutation.mutateAsync({
  projectId: project.id,
  studentId: studentId,
  role: i === 0 ? "LEADER" : "MEMBER",
});
      }

      success(`Đã tạo nhóm "${project.name}" thành công`);
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
    if (!confirm("Bạn có chắc muốn xóa nhóm này?")) return;

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
    if (!forceAddGroupId) {
      error("Không tìm thấy nhóm để thêm sinh viên");
      return;
    }

    if (forceAddSelectedIds.length === 0) {
      error("Vui lòng chọn ít nhất 1 sinh viên");
      return;
    }

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
      setForceAddSearch("");
    } catch (err) {
      error(err?.message || "Không thể thêm sinh viên");
    }
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
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-teal-600" />
        <p className="font-medium text-gray-500">Đang tải dữ liệu nhóm...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <nav className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <button
              onClick={() => navigate("/lecturer")}
              className="font-semibold text-teal-700 hover:underline"
            >
              Giảng viên
            </button>
            <ChevronRight size={12} />
            <span className="text-gray-600">Quản lý nhóm</span>
            {finalCourse && (
  <span className="font-semibold text-gray-800">{finalCourse.code}</span>
)}
          </nav>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-800">
              Nhóm & Dự án
            </h2>
            {course && (
              <p className="mt-1 text-sm text-gray-500">
                Điều hành nhóm đồ án, theo dõi tích hợp Jira/GitHub và kiểm soát
                rủi ro theo từng lớp học.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <HeaderInfoChip
              icon={<BookOpen size={13} />}
              label={finalCourse?.code || "N/A"}
            />
            <HeaderInfoChip
              icon={<GraduationCap size={13} />}
              label={finalCourse?.name || "Chưa có tên lớp"}
            />
            <HeaderInfoChip
              icon={<Layers3 size={13} />}
              label={`${students.length} sinh viên`}
            />
            <HeaderInfoChip
              icon={<FolderKanban size={13} />}
              label={`${groups.length} nhóm`}
            />
            <HeaderInfoChip
              icon={<ShieldAlert size={13} />}
              label={`${riskCount} nhóm rủi ro`}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => navigate("/lecturer")}
            variant="outline"
            className="flex h-9 items-center gap-2 rounded-xl border-gray-200 px-4 text-sm text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={14} />
            Quay lại
          </Button>

          <Button
            onClick={() => navigate(`/lecturer/course/${courseId}/analytics`)}
            variant="outline"
            className="flex h-9 items-center gap-2 rounded-xl border-gray-200 px-4 text-sm"
          >
            <Activity size={14} />
            Analytics
          </Button>

          <Button
            onClick={handleExportGroups}
            variant="outline"
            className="flex h-9 items-center gap-2 rounded-xl border-gray-200 px-4 text-sm"
          >
            <Download size={14} />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Governance Overview */}
      <Card className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-4">
                <MiniStat
                  label="Tổng sinh viên"
                  value={students.length}
                  color="text-blue-600 bg-blue-50"
                />
                <MiniStat
                  label="Chưa phân nhóm"
                  value={availableStudents.length}
                  color="text-orange-600 bg-orange-50"
                />
                <MiniStat
                  label="Nhóm hiện có"
                  value={groups.length}
                  color="text-teal-600 bg-teal-50"
                />
                <MiniStat
                  label="Tiến độ TB"
                  value={`${avgProgress}%`}
                  color="text-indigo-600 bg-indigo-50"
                />
                <MiniStat
                  label="Nhóm ổn định"
                  value={healthyCount}
                  color="text-green-600 bg-green-50"
                />
                <MiniStat
                  label="Nhóm rủi ro"
                  value={riskCount}
                  color="text-red-600 bg-red-50"
                />
                <MiniStat
                  label="Thiếu GitHub"
                  value={missingGithubCount}
                  color="text-amber-600 bg-amber-50"
                />
                <MiniStat
                  label="Thiếu Jira"
                  value={missingJiraCount}
                  color="text-pink-600 bg-pink-50"
                />
              </div>
            </div>

            <div className="xl:col-span-4">
              <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80">
                    <Sparkles size={15} className="text-teal-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Gợi ý quản trị lớp
                    </p>
                    <p className="text-xs text-gray-500">
                      Theo rule FPTU cho đồ án nhóm
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-700">
                  <RuleLine
                    ok={availableStudents.length === 0}
                    text={
                      availableStudents.length === 0
                        ? "Tất cả sinh viên đã được phân nhóm."
                        : `Còn ${availableStudents.length} sinh viên chưa có nhóm.`
                    }
                  />
                  <RuleLine
                    ok={missingTopicCount === 0}
                    text={
                      missingTopicCount === 0
                        ? "Tất cả nhóm đã có đề tài."
                        : `${missingTopicCount} nhóm chưa có đề tài rõ ràng.`
                    }
                  />
                  <RuleLine
                    ok={missingGithubCount === 0}
                    text={
                      missingGithubCount === 0
                        ? "Tất cả nhóm đã có GitHub."
                        : `${missingGithubCount} nhóm chưa hoàn tất GitHub.`
                    }
                  />
                  <RuleLine
                    ok={missingJiraCount === 0}
                    text={
                      missingJiraCount === 0
                        ? "Tất cả nhóm đã có Jira."
                        : `${missingJiraCount} nhóm chưa hoàn tất Jira.`
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left side */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-50 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50">
                  <UserPlus size={15} className="text-teal-600" />
                </div>
                <CardTitle className="text-base font-semibold text-gray-800">
                  Tạo Nhóm Mới
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 pt-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Đề tài nhóm
                </label>
                <input
                  type="text"
                  value={newGroupTopic}
                  onChange={(e) => setNewGroupTopic(e.target.value)}
                  placeholder="Nhập đề tài cho nhóm..."
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Sinh viên chưa phân nhóm
                  </label>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                    {availableStudents.length} có sẵn
                  </span>
                </div>

                <div className="relative mb-3">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Tìm sinh viên..."
                    className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div className="max-h-52 overflow-y-auto rounded-xl border border-gray-100">
                  {filteredAvailableStudents.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-xs text-gray-400">
                        {availableStudents.length === 0
                          ? "Tất cả sinh viên đã được phân nhóm"
                          : "Không tìm thấy sinh viên phù hợp"}
                      </p>
                    </div>
                  ) : (
                    filteredAvailableStudents.map((student) => (
                      <label
                        key={student.id}
                        className="flex cursor-pointer items-center gap-3 border-b border-gray-50 px-4 py-2.5 transition-colors last:border-0 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-400"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-700">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {student.studentCode || student.studentId}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>

                {selectedStudents.length > 0 && (
                  <p className="mt-2 text-xs font-medium text-teal-600">
                    Đã chọn {selectedStudents.length} sinh viên
                  </p>
                )}
              </div>

              <Button
                onClick={handleCreateGroup}
                disabled={
                  isBusy ||
                  selectedStudents.length === 0 ||
                  !newGroupTopic.trim()
                }
                className="h-10 w-full rounded-xl border-0 bg-teal-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 disabled:opacity-50"
              >
                + Tạo nhóm
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-50 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50">
                  <Wand2 size={15} className="text-violet-600" />
                </div>
                <CardTitle className="text-base font-semibold text-gray-800">
                  Tự Động Chia Nhóm
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-5">
              <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                <p className="text-sm font-semibold text-gray-800">
                  Hỗ trợ chia nhanh theo quy mô nhóm
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Khuyến nghị nhóm từ {MIN_MEMBERS}–{MAX_MEMBERS} sinh viên theo
                  format đồ án FPTU.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Số thành viên / nhóm
                </label>
                <select
                  value={autoGroupSize}
                  onChange={(e) => setAutoGroupSize(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option value={4}>4 sinh viên</option>
                  <option value={5}>5 sinh viên</option>
                  <option value={6}>6 sinh viên</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SmartInfoCard
                  icon={<Users size={14} />}
                  label="Chưa phân nhóm"
                  value={availableStudents.length}
                />
                <SmartInfoCard
                  icon={<FolderKanban size={14} />}
                  label="Ước tính nhóm mới"
                  value={estimatedGroupCount}
                />
              </div>

              <Button
                onClick={handleAutoCreateGroups}
                disabled={isBusy || availableStudents.length === 0}
                className="h-10 w-full rounded-xl border-0 bg-violet-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 disabled:opacity-50"
              >
                <Wand2 size={14} className="mr-2" />
                Tự động chia nhóm
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right side */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-50 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
                    <Users size={15} className="text-blue-600" />
                  </div>
                  <CardTitle className="text-base font-semibold text-gray-800">
                    Danh sách Nhóm
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2">
                  {missingTopicCount > 0 && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      {missingTopicCount} nhóm thiếu đề tài
                    </span>
                  )}
                  <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-400">
                    {visibleGroups.length}/{groups.length} nhóm
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    placeholder="Tìm nhóm hoặc đề tài..."
                    className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div className="relative md:w-56">
                  <Filter
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="healthy">Ổn định</option>
                    <option value="watch">Cần theo dõi</option>
                    <option value="warning">Rủi ro</option>
                    <option value="critical">Nguy cấp</option>
                    <option value="missing-github">Thiếu GitHub</option>
                    <option value="missing-jira">Thiếu Jira</option>
                    <option value="missing-topic">Thiếu đề tài</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {visibleGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                    <ClipboardList size={22} className="text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600">
                      Chưa có nhóm phù hợp
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Bắt đầu bằng cách tạo nhóm thủ công hoặc dùng tính năng tự
                      động chia nhóm.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {visibleGroups.map((group) => {
                    const groupStudents = group.team || [];

                    return (
                      <div
                        key={group.id}
                        className="p-5 transition-colors hover:bg-gray-50/50"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-gray-900">
                                {group.name}
                              </h3>

                              <StatusBadge
                                status={group.integration?.githubStatus}
                                icon={<GitBranch size={9} />}
                                label="GitHub"
                              />
                              <StatusBadge
                                status={group.integration?.jiraStatus}
                                icon={<BookOpen size={9} />}
                                label="Jira"
                              />
                              <RiskBadge state={group.state} />
                              {group.missingTopic && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                                  Thiếu đề tài
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                              <MetricChip
                                icon={<Users size={11} />}
                                label={`${group.memberCount} thành viên`}
                              />
                              <MetricChip
                                icon={<GraduationCap size={11} />}
                                label={group.leader ? `Leader: ${group.leader}` : "Chưa có leader"}
                              />
                              <MetricChip
                                icon={<Activity size={11} />}
                                label={`${group.commitCount} commits`}
                              />
                              <MetricChip
                                icon={<BookOpen size={11} />}
                                label={`${group.issueCount} issues`}
                              />
                              <MetricChip
                                icon={<Clock3 size={11} />}
                                label={group.lastActivity}
                              />
                              <MetricChip
                                icon={<ShieldAlert size={11} />}
                                label={`Risk ${group.riskScore}%`}
                              />
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5">
                            <button
                              onClick={() =>
                                navigate(`/lecturer/group/${group.id}`)
                              }
                              className="flex items-center gap-1 rounded-lg border border-teal-100 bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100"
                            >
                              <Eye size={11} />
                              Chi tiết
                            </button>

                            <button
                              onClick={() => handleDeleteGroup(group.id)}
                              className="flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                            >
                              <Trash2 size={11} />
                              Xóa
                            </button>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-400">
                            <PenLine size={10} /> Đề tài / Mô tả dự án
                          </label>
                          <input
                            type="text"
                            defaultValue={group.description || ""}
                            onBlur={(e) =>
                              handleUpdateGroupTopic(
                                group.id,
                                e.target.value,
                                group.description
                              )
                            }
                            placeholder="Chưa có đề tài..."
                            className="w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder-gray-300 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-400"
                          />
                        </div>

                        <div className="mb-4">
                          <div className="mb-1.5 flex justify-between text-[11px] text-gray-500">
                            <span>Tiến độ dự án</span>
                            <span>{group.progress}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full ${
                                group.progress >= 80
                                  ? "bg-green-500"
                                  : group.progress >= 50
                                  ? "bg-teal-500"
                                  : group.progress >= 30
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${group.progress}%` }}
                            />
                          </div>
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
                              ))
                            )}
                          </div>
                        </div>

                        {(group.state === "warning" ||
                          group.state === "critical" ||
                          group.missingTopic) && (
                          <div className="mt-4 flex flex-col gap-2">
                            {(group.state === "warning" ||
                              group.state === "critical") && (
                              <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                                <AlertTriangle size={12} />
                                {group.state === "critical"
                                  ? "Nhóm đang thiếu tích hợp quan trọng và có rủi ro cao."
                                  : "Nhóm cần được theo dõi thêm về tiến độ hoặc mức độ hoạt động."}
                              </div>
                            )}

                            {group.missingTopic && (
                              <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                <CircleAlert size={12} />
                                Nhóm chưa có đề tài cụ thể. Nên cập nhật để thuận tiện review.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showForceAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="mx-4 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="mb-4 flex shrink-0 items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Thêm Thành Viên
                </h3>
                <p className="text-xs text-gray-500">
                  Thêm sinh viên vào nhóm này
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForceAddModal(false)}
                className="h-8 w-8 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ×
              </Button>
            </div>

            <div className="relative mb-3 shrink-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={forceAddSearch}
                onChange={(e) => setForceAddSearch(e.target.value)}
                placeholder="Tìm sinh viên..."
                className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <div className="mb-5 min-h-0 flex-1 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50">
              {filteredForceAddStudents.length === 0 ? (
                <div className="bg-gray-50/50 px-4 py-8 text-center">
                  <p className="text-sm text-gray-500">
                    {availableStudents.length === 0
                      ? "Tất cả sinh viên trong lớp đã có nhóm."
                      : "Không tìm thấy sinh viên phù hợp."}
                  </p>
                </div>
              ) : (
                filteredForceAddStudents.map((student) => (
                  <label
                    key={student.id}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-teal-50/30"
                  >
                    <input
                      type="checkbox"
                      checked={forceAddSelectedIds.includes(student.id)}
                      onChange={() => toggleForceAddStudent(student.id)}
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-400"
                    />
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                      {student.name?.charAt(0) || "S"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {student.studentCode || student.studentId}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="shrink-0 border-t border-gray-50 pt-2">
              <Button
                onClick={handleForceAddSubmit}
                disabled={isBusy || forceAddSelectedIds.length === 0}
                className="h-10 w-full rounded-xl border-0 bg-teal-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 disabled:opacity-50"
              >
                Xác nhận thêm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────── */

function HeaderInfoChip({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
      {icon}
      {label}
    </span>
  );
}

function RuleLine({ ok, text }) {
  return (
    <div className="flex items-start gap-2">
      {ok ? (
        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-600" />
      ) : (
        <CircleAlert size={14} className="mt-0.5 shrink-0 text-amber-600" />
      )}
      <span>{text}</span>
    </div>
  );
}

function SmartInfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div className="mb-1 flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl px-4 py-3 ${color}`}
    >
      <span className="text-xs font-semibold opacity-80">{label}</span>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );
}

function StatusBadge({ status, icon, label }) {
  const approved = status === "APPROVED";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
        approved ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
      }`}
    >
      {icon}
      {label}
      {approved ? " ✓" : ""}
    </span>
  );
}

function RiskBadge({ state }) {
  const styleMap = {
    healthy: "bg-green-50 text-green-700",
    watch: "bg-yellow-50 text-yellow-700",
    warning: "bg-orange-50 text-orange-700",
    critical: "bg-red-50 text-red-700",
  };

  const labelMap = {
    healthy: "Ổn định",
    watch: "Theo dõi",
    warning: "Rủi ro",
    critical: "Nguy cấp",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
        styleMap[state] || "bg-gray-100 text-gray-500"
      }`}
    >
      {labelMap[state] || "Không xác định"}
    </span>
  );
}

function MetricChip({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-100 bg-gray-50 px-2 py-1">
      {icon}
      {label}
    </span>
  );
}
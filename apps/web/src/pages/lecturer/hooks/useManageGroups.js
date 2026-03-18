import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/Toast.jsx";
import {
  useGetCourseById,
  useGetEnrolledStudents,
} from "@/features/courses/hooks/useCourses.js";
import {
  useGetProjects,
  useCreateProject,
  useDeleteProject,
  useUpdateProject,
  useAddTeamMember,
  useRemoveTeamMember,
} from "@/features/projects/hooks/useProjects.js";

const MIN_MEMBERS = 4;
const MAX_MEMBERS = 6;

export function useManageGroups() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const parsedCourseId = Number(courseId);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [newGroupTopic, setNewGroupTopic] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [autoGroupSize, setAutoGroupSize] = useState(5);

  const [showForceAddModal, setShowForceAddModal] = useState(false);
  const [forceAddGroupId, setForceAddGroupId] = useState(null);
  const [forceAddSearch, setForceAddSearch] = useState("");
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

  const handleCreateGroup = async () => {
    if (!newGroupTopic.trim() || selectedStudents.length === 0) return showError("Vui lĂ²ng nháº­p Ä‘á» tĂ i vĂ  chá»n sinh viĂªn");
    try {
      const project = await createProjectMutation.mutateAsync({
        courseId: parsedCourseId,
        name: `NhĂ³m ${groups.length + 1}`,
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

      success(`Táº¡o nhĂ³m "${project.name}" thĂ nh cĂ´ng`);
      setSelectedStudents([]);
      setNewGroupTopic("");
      setStudentSearch("");
    } catch (err) {
      showError("KhĂ´ng thá»ƒ táº¡o nhĂ³m: " + (err?.message || "Lá»—i há»‡ thá»‘ng"));
    }
  };

  const handleAutoCreateGroups = async () => {
    if (!parsedCourseId || Number.isNaN(parsedCourseId)) {
      showError("KhĂ´ng tĂ¬m tháº¥y mĂ£ lá»›p há»£p lá»‡");
      return;
    }

    if (availableStudents.length === 0) {
      showError("KhĂ´ng cĂ²n sinh viĂªn chÆ°a phĂ¢n nhĂ³m");
      return;
    }

    if (autoGroupSize < MIN_MEMBERS || autoGroupSize > MAX_MEMBERS) {
      showError(`Sá»‘ thĂ nh viĂªn má»—i nhĂ³m pháº£i tá»« ${MIN_MEMBERS} Ä‘áº¿n ${MAX_MEMBERS}`);
      return;
    }

    if (!confirm(`Tá»± Ä‘á»™ng chia ${availableStudents.length} sinh viĂªn chÆ°a cĂ³ nhĂ³m thĂ nh cĂ¡c nhĂ³m khoáº£ng ${autoGroupSize} ngÆ°á»i?`)) return;

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
          name: `NhĂ³m ${groups.length + i + 1}`,
          description: `Äá» tĂ i nhĂ³m ${groups.length + i + 1}`,
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

      success(`ÄĂ£ tá»± Ä‘á»™ng táº¡o ${chunks.length} nhĂ³m má»›i`);
    } catch (err) {
      showError(err?.message || "KhĂ´ng thá»ƒ tá»± Ä‘á»™ng chia nhĂ³m");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm("Báº¡n cĂ³ cháº¯c muá»‘n xĂ³a nhĂ³m nĂ y? HĂ nh Ä‘á»™ng nĂ y khĂ´ng thá»ƒ hoĂ n tĂ¡c.")) return;
    try {
      await deleteProjectMutation.mutateAsync(groupId);
      success("ÄĂ£ xĂ³a nhĂ³m");
    } catch (err) {
      showError(err?.message || "KhĂ´ng thá»ƒ xĂ³a nhĂ³m");
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
      success("ÄĂ£ cáº­p nháº­t Ä‘á» tĂ i");
    } catch (err) {
      showError(err?.message || "KhĂ´ng thá»ƒ cáº­p nháº­t Ä‘á» tĂ i");
    }
  };

  const handleRemoveStudentFromGroup = async (groupId, studentId) => {
    try {
      await removeTeamMemberMutation.mutateAsync({
        projectId: groupId,
        studentId: studentId
      });
      success("ÄĂ£ xĂ³a sinh viĂªn khá»i nhĂ³m");
    } catch (err) {
      showError(err?.message || "KhĂ´ng thá»ƒ xĂ³a sinh viĂªn");
    }
  };

  const handleOpenForceAdd = (groupId) => {
    setForceAddGroupId(groupId);
    setForceAddSelectedIds([]);
    setForceAddSearch("");
    setShowForceAddModal(true);
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
      success(`ÄĂ£ thĂªm ${forceAddSelectedIds.length} sinh viĂªn vĂ o nhĂ³m`);
      setShowForceAddModal(false);
      setForceAddSelectedIds([]);
    } catch (err) { showError("KhĂ´ng thá»ƒ thĂªm sinh viĂªn"); }
  };

  const groupsWithMetrics = useMemo(() => {
    return groups.map((group, index) => {
      const integration = group.integration || {};
      const memberCount = group.team?.length || 0;
      const githubApproved = integration.githubStatus === "APPROVED";
      const jiraApproved = integration.jiraStatus === "APPROVED";

      const commitCount = group.commitCount ?? (memberCount * 6 + (index + 1) * 3);
      const issueCount = group.issueCount ?? (memberCount * 2 + index);
      const lastActivity = group.lastActivity ?? (index === 0 ? "2 giá» trÆ°á»›c" : index === 1 ? "1 ngĂ y trÆ°á»›c" : "3 ngĂ y trÆ°á»›c");

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

      const leader = (group.team || []).find((member) => member.role === "LEADER")?.studentName || null;

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
      const matchesSearch = !keyword || groupName.includes(keyword) || groupDescription.includes(keyword);

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

  return {
    courseId: parsedCourseId,
    course,
    students,
    groups,
    availableStudents,
    loadingCourse,
    loadingStudents,
    loadingProjects,
    isBusy,
    selectedStudents,
    setSelectedStudents,
    newGroupTopic,
    setNewGroupTopic,
    studentSearch,
    setStudentSearch,
    groupSearch,
    setGroupSearch,
    groupFilter,
    setGroupFilter,
    autoGroupSize,
    setAutoGroupSize,
    showForceAddModal,
    setShowForceAddModal,
    forceAddGroupId,
    forceAddSearch,
    setForceAddSearch,
    forceAddSelectedIds,
    setForceAddSelectedIds,
    groupsWithMetrics,
    visibleGroups,
    handleCreateGroup,
    handleAutoCreateGroups,
    handleDeleteGroup,
    handleUpdateGroupTopic,
    handleRemoveStudentFromGroup,
    handleOpenForceAdd,
    handleForceAddSubmit,
    navigate
  };
}

import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { LINK_STATUS as LINK_STATUS_CFG, SRS_STATUS } from "../../shared/permissions.js";
import {
    BookOpen, CheckCircle, AlertTriangle,
    Clock, Link2,
    Users, BarChart2,
    Crown, MapPin, Github, Star, UserPlus, RefreshCw, Trash2, Edit3, Plus
} from "lucide-react";

import { useGetEnrolledStudents, useGetCourseById } from "../../features/courses/hooks/useCourses.js";
import { 
    useAddTeamMember, 
    useGetProjectMetrics, 
    useGetProjects, 
    useLinkIntegration,
    useSyncProjectCommits,
    useRemoveTeamMember
} from "../../features/projects/hooks/useProjects.js";
import { useGetProjectSrs, useSubmitSrs, useDeleteSrs } from "../../features/srs/hooks/useSrs.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Skeleton } from "../../components/ui/skeleton.jsx";
import { Modal } from "../../components/ui/interactive.jsx";
import { InputField } from "../../components/shared/FormFields.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

const SRS_STATUS_CLS = Object.fromEntries(Object.entries(SRS_STATUS).map(([k, v]) => [k, v.cls]));

export default function CourseWorkspace() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?.id;
    const { success, error: showError } = useToast();

    // Data Fetching
    const { data: course, isLoading: loadingCourse } = useGetCourseById(courseId);
    const { data: projectsData, isLoading: loadingProjects } = useGetProjects({ courseId });
    const group = useMemo(() => {
        return projectsData?.items?.find(p => String(p.courseId) === String(courseId) || String(p.course?.id) === String(courseId)) || null;
    }, [projectsData, courseId]);

    const { data: groupSrs = [], isLoading: loadingSrs } = useGetProjectSrs(group?.id);
    const { data: enrolledData = { items: [] }, isFetching: isEnrolledFetching } = useGetEnrolledStudents(courseId, { pageSize: 500 });
    const { data: metrics, isLoading: loadingMetrics } = useGetProjectMetrics(group?.id);

    const groupStudents = group?.team || [];
    const myMember = groupStudents.find(m => String(m.studentId) === String(userId));
    const isLeader = myMember?.role === 'LEADER';

    const [githubInput, setGithubInput] = useState("");
    const [jiraInput, setJiraInput] = useState("");
    
    // Mutations
    const { mutateAsync: addMemberMutateAsync } = useAddTeamMember();
    const { mutateAsync: removeMemberMutateAsync } = useRemoveTeamMember();
    const linkIntegrationMutation = useLinkIntegration();
    const syncCommitsMutation = useSyncProjectCommits();

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteSelectedIds, setInviteSelectedIds] = useState([]);
    const [isInviting, setIsInviting] = useState(false);

    // Initial state setup when data loads
    useMemo(() => {
        if (group?.integration) {
            setGithubInput(group.integration.githubRepo || "");
            setJiraInput(group.integration.jiraKey || "");
        }
    }, [group]);

    if (loadingCourse || loadingProjects) {
        return (
            <div className="p-8 space-y-6">
                <Skeleton className="h-10 w-1/4 rounded-xl" />
                <Skeleton className="h-40 w-full rounded-[32px]" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-64 rounded-[32px]" />
                    <Skeleton className="h-64 rounded-[32px] md:col-span-2" />
                </div>
            </div>
        );
    }

    if (!course) return (
        <div className="p-20 text-center">
            <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
            <h3 className="text-xl font-black uppercase text-gray-800">Không tìm thấy khóa học</h3>
            <Button onClick={() => navigate("/student/courses")} variant="ghost" className="mt-4">Quay lại danh sách</Button>
        </div>
    );

    const handleInviteSubmit = async () => {
        if (inviteSelectedIds.length === 0) return;
        setIsInviting(true);
        let successCount = 0;
        for (const studentId of inviteSelectedIds) {
            try {
                await addMemberMutateAsync({
                    projectId: group.id,
                    studentId: studentId,
                    role: "MEMBER",
                    responsibility: "Thành viên"
                });
                successCount++;
            } catch (err) {}
        }
        setIsInviting(false);
        if (successCount > 0) success(`Đã thêm ${successCount} thành viên!`);
        setShowInviteModal(false);
        setInviteSelectedIds([]);
    };

    const handleLinkSubmit = () => {
        linkIntegrationMutation.mutate({
            projectId: group.id,
            body: { githubRepo: githubInput, jiraKey: jiraInput }
        }, {
            onSuccess: () => success("Đã gửi yêu cầu liên kết tích hợp!")
        });
    };

    const handleSync = () => {
        syncCommitsMutation.mutate(group.id, {
            onSuccess: () => success("Đã đồng bộ dữ liệu mới nhất từ GitHub/Jira")
        });
    };

    const ghStatus = group?.integration?.githubStatus || "NONE";
    const jiraStatus = group?.integration?.jiraStatus || "NONE";

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <button onClick={() => navigate("/student/courses")} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700 transition-all">
                ← Danh sách khóa học
            </button>

            {/* ── Project Header ── */}
            <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
                <div className="h-2 bg-gradient-to-r from-teal-500 to-indigo-500" />
                <CardContent className="p-8">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                        <div className="flex gap-6">
                            <div className="w-16 h-16 rounded-[24px] bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xl shadow-inner">
                                {course.subject?.code?.charAt(0) || course.code?.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100 uppercase tracking-widest">{course.subject?.code || course.code}</span>
                                    {isLeader && (
                                        <span className="flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full border bg-amber-50 text-amber-600 border-amber-100 uppercase tracking-widest">
                                            <Crown size={12} /> Team Leader
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight leading-none mb-2">{group?.name || "Member Workspace"}</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Users size={12} /> Giảng viên: {course.lecturerNames?.join(", ") || "N/A"}
                                </p>
                            </div>
                        </div>

                        {group && (
                            <div className="flex items-center gap-3">
                                <Button 
                                    onClick={handleSync}
                                    disabled={syncCommitsMutation.isPending}
                                    variant="outline" 
                                    className="rounded-2xl h-12 border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] px-8 hover:bg-teal-50 hover:text-teal-600 transition-all shadow-sm"
                                >
                                    {syncCommitsMutation.isPending ? <RefreshCw className="animate-spin mr-2" size={14}/> : <RefreshCw size={14} className="mr-2" />} Sync Now
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {!group ? (
                <Card className="rounded-[48px] border-dashed border-2 border-gray-100 bg-white p-24 text-center">
                    <Users size={64} className="text-gray-100 mx-auto mb-8 opacity-40" />
                    <h4 className="text-xl font-black text-gray-300 uppercase tracking-widest">Bạn chưa được phân vào nhóm nào</h4>
                    <p className="text-sm text-gray-300 mt-4 font-bold uppercase tracking-widest opacity-60">Vui lòng liên hệ giảng viên phụ trách lớp.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-8">
                        {/* ── Integration Links ── */}
                        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[48px] bg-white overflow-hidden">
                            <CardHeader className="p-10 border-b border-gray-50 bg-gray-50/30 flex flex-row items-center justify-between">
                                <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest flex items-center gap-4">
                                    <Link2 size={24} className="text-indigo-600" /> Tích hợp Jira & GitHub
                                </CardTitle>
                                <Badge variant="outline" className="text-[10px] font-black bg-white px-4 py-1.5 rounded-full border-gray-100">{group.integration?.syncStatus || "CHƯA ĐỒNG BỘ"}</Badge>
                            </CardHeader>
                            <CardContent className="p-12 space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">GitHub Repository (org/repo)</label>
                                        <div className="relative group">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors"><Github size={20} /></div>
                                            <input 
                                                disabled={!isLeader}
                                                className="w-full h-16 pl-16 pr-6 bg-gray-50 border border-gray-100 rounded-[24px] text-sm font-black focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none uppercase tracking-widest"
                                                placeholder="facebook/react"
                                                value={githubInput}
                                                onChange={e => setGithubInput(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Jira Project Key</label>
                                        <div className="relative group">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors"><Star size={20} /></div>
                                            <input 
                                                disabled={!isLeader}
                                                className="w-full h-16 pl-16 pr-6 bg-gray-50 border border-gray-100 rounded-[24px] text-sm font-black focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none uppercase tracking-widest"
                                                placeholder="SWD-2024"
                                                value={jiraInput}
                                                onChange={e => setJiraInput(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {isLeader && (
                                    <div className="pt-8 border-t border-gray-50 flex justify-end">
                                        <Button 
                                            onClick={handleLinkSubmit}
                                            disabled={linkIntegrationMutation.isPending}
                                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-[24px] h-16 px-12 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 border-0"
                                        >
                                            {linkIntegrationMutation.isPending ? <RefreshCw className="animate-spin mr-2" size={16}/> : <CheckCircle size={20} className="mr-2" />} Cập nhật liên kết
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* ── Team Management ── */}
                        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[48px] bg-white overflow-hidden">
                            <CardHeader className="p-10 border-b border-gray-50 bg-gray-50/30 flex flex-row items-center justify-between">
                                <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest flex items-center gap-4">
                                    <Users size={24} className="text-emerald-600" /> Thành viên nhóm ({groupStudents.length})
                                </CardTitle>
                                {isLeader && (
                                    <Button onClick={() => setShowInviteModal(true)} variant="ghost" className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50">
                                        <UserPlus size={16} className="mr-2" /> Thêm thành viên
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-50">
                                    {groupStudents.map((m, idx) => (
                                        <div key={m.studentId} className="p-10 flex items-center justify-between hover:bg-gray-50/30 transition-all group animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-[24px] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 font-black text-lg shadow-inner group-hover:scale-110 transition-transform">
                                                    {m.name?.charAt(0) || <Crown size={24} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-800 text-base uppercase tracking-tight leading-none mb-2">{m.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-70">{m.responsibility || "Thành viên dự án"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <Badge variant={m.role === 'LEADER' ? 'warning' : 'outline'} className={`text-[10px] font-black px-4 py-1.5 rounded-full border ${m.role === 'LEADER' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-white text-gray-400 border-gray-100'}`}>
                                                    {m.role === 'LEADER' ? 'TRƯỞNG NHÓM' : 'THÀNH VIÊN'}
                                                </Badge>
                                                {isLeader && m.role !== 'LEADER' && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-12 w-12 text-gray-200 hover:text-red-500 rounded-[20px] opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:border-red-100 border border-transparent"
                                                        onClick={() => removeMemberMutateAsync({ projectId: group.id, studentId: m.studentId })}
                                                    >
                                                        <Trash2 size={20} />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Rights Sidebar (Metrics/SRS) ── */}
                    <div className="space-y-8">
                        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[48px] bg-white p-12 overflow-hidden relative">
                            <div className="absolute right-0 top-0 w-48 h-48 bg-teal-50 rounded-full blur-[80px] -mr-24 -mt-24 opacity-60" />
                            <h4 className="text-[12px] font-black text-gray-300 uppercase tracking-[0.3em] mb-10 relative">Project KPI Summary</h4>
                            <div className="space-y-10 relative">
                                <div className="flex justify-between items-end border-b border-gray-50 pb-6">
                                    <div className="space-y-3">
                                        <span className="text-[11px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full">Commits</span>
                                        <p className="text-5xl font-black text-gray-800 tracking-tighter leading-none">{metrics?.totalCommits || 0}</p>
                                    </div>
                                    <div className="w-24 h-2 bg-teal-100 rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-teal-500 rounded-full" style={{ width: '60%' }} />
                                    </div>
                                </div>
                                <div className="flex justify-between items-end border-b border-gray-50 pb-6">
                                    <div className="space-y-3">
                                        <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Merged PRs</span>
                                        <p className="text-5xl font-black text-gray-800 tracking-tighter leading-none">{metrics?.totalPrs || 0}</p>
                                    </div>
                                    <div className="w-24 h-2 bg-indigo-100 rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '40%' }} />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[48px] bg-slate-900 text-white overflow-hidden p-12 relative">
                            <div className="absolute left-0 bottom-0 w-48 h-48 bg-teal-500 rounded-full blur-[100px] -ml-24 -mb-24 opacity-20" />
                            <h4 className="text-[12px] font-black text-teal-500 uppercase tracking-[0.3em] mb-10 relative mb-8">SRS Documents</h4>
                            <div className="space-y-6 relative mb-10">
                                {groupSrs.slice(0, 3).map((srs, idx) => (
                                    <div key={srs.id} className="p-6 bg-white/5 border border-white/10 rounded-[28px] flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-teal-500 shadow-inner group-hover:scale-110 transition-transform"><BarChart2 size={18}/></div>
                                            <div>
                                               <p className="text-sm font-black uppercase tracking-widest">Version {srs.version || (idx + 1).toFixed(1)}</p>
                                               <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mt-1">Updated recently</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={srs.status === 'FINAL' ? 'success' : 'warning'} label={srs.status === 'FINAL' ? 'Duyệt' : 'Draft'} />
                                    </div>
                                ))}
                                {groupSrs.length === 0 && <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest py-10 text-center italic opacity-50 underline decoration-slate-800 underline-offset-8">Chưa có bản nộp SRS nào được ghi nhận</p>}
                            </div>
                            <Button 
                                onClick={() => navigate("/student/srs")}
                                className="w-full h-16 bg-teal-500 hover:bg-teal-400 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all border-0 shadow-2xl shadow-teal-500/20 active:scale-95 relative z-10"
                            >
                                <Plus size={20} className="mr-2" /> Quản lý SRS
                            </Button>
                        </Card>
                    </div>
                </div>
            )}

            {/* ── Invite Modal ── */}
            <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Tìm kiếm & Mời thành viên" size="md">
                <div className="space-y-8 p-4">
                   <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Danh sách sinh viên lớp chưa tham gia nhóm</p>
                    <div className="max-h-[380px] overflow-y-auto pr-4 space-y-3 custom-scrollbar">
                        {enrolledData.items?.filter(s => !groupStudents.find(m => String(m.studentId) === String(s.id))).map((s, idx) => (
                            <div 
                                key={s.id} 
                                onClick={() => setInviteSelectedIds(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])}
                                className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer flex items-center justify-between group animate-in slide-in-from-right-4 duration-500 ${inviteSelectedIds.includes(s.id) ? 'border-teal-500 bg-teal-50/50 shadow-xl shadow-teal-100' : 'border-gray-50 bg-white hover:border-teal-200 hover:shadow-lg'}`}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-[20px] shadow-sm flex items-center justify-center font-black text-lg transition-all group-hover:scale-110 ${inviteSelectedIds.includes(s.id) ? 'bg-teal-500 text-white' : 'bg-gray-50 text-gray-300'}`}>
                                        {s.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-gray-800 uppercase tracking-tight leading-none mb-1.5">{s.name}</p>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{s.studentCode || s.email}</p>
                                    </div>
                                </div>
                                {inviteSelectedIds.includes(s.id) ? (
                                   <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white"><CheckCircle size={20}/></div>
                                ) : (
                                   <div className="w-8 h-8 rounded-full border-2 border-gray-100 opacity-20 group-hover:opacity-100 group-hover:border-teal-200 transition-all" />
                                )}
                            </div>
                        ))}
                        {enrolledData.items?.filter(s => !groupStudents.find(m => String(m.studentId) === String(s.id))).length === 0 && (
                            <div className="py-20 text-center">
                                <Users size={40} className="text-gray-100 mx-auto mb-4" />
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Tất cả sinh viên đã có nhóm</p>
                            </div>
                        )}
                    </div>
                    <div className="pt-8 border-t border-gray-50 flex gap-4">
                        <Button onClick={() => setShowInviteModal(false)} variant="ghost" className="flex-1 rounded-[24px] h-16 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600">Hủy bỏ</Button>
                        <Button 
                            onClick={handleInviteSubmit} 
                            disabled={isInviting || inviteSelectedIds.length === 0} 
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-[24px] h-16 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all disabled:opacity-30 border-0"
                        >
                            {isInviting ? <RefreshCw className="animate-spin mr-2" size={20}/> : <UserPlus size={20} className="mr-2" />} Thêm {inviteSelectedIds.length} SV
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

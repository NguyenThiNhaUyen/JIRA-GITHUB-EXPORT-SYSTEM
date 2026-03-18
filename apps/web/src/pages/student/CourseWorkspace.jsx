import { useParams, useNavigate } from "react-router-dom";
import { 
    Users, 
    AlertTriangle, 
    Github 
} from "lucide-react";

// Components UI
import { Button } from "../../components/ui/Button.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";

// Local Components
import { WorkspaceHeader } from "./components/CourseWorkspace/WorkspaceHeader.jsx";
import { IntegrationPanel } from "./components/CourseWorkspace/IntegrationPanel.jsx";
import { TeamManagement } from "./components/CourseWorkspace/TeamManagement.jsx";
import { ProjectKpiSidebar } from "./components/CourseWorkspace/ProjectKpiSidebar.jsx";
import { SrsSidebar } from "./components/CourseWorkspace/SrsSidebar.jsx";
import { InviteMemberModal } from "./components/CourseWorkspace/InviteMemberModal.jsx";

// Hooks
import { useCourseWorkspace } from "./hooks/useCourseWorkspace.js";

export default function CourseWorkspace() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const {
        course,
        loadingCourse,
        group,
        loadingProjects,
        groupStudents,
        groupSrs,
        loadingSrs,
        enrolledData,
        metrics,
        loadingMetrics,
        isLeader,
        githubInput,
        setGithubInput,
        jiraInput,
        setJiraInput,
        showInviteModal,
        setShowInviteModal,
        inviteSelectedIds,
        setInviteSelectedIds,
        isInviting,
        isLinking,
        isSyncing,
        handleInviteSubmit,
        handleLinkSubmit,
        handleSync,
        handleRemoveMember
    } = useCourseWorkspace(courseId);

    if (loadingCourse || loadingProjects) {
        return (
            <div className="p-10 space-y-10 animate-pulse">
                <Skeleton className="h-40 w-full rounded-[44px]" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <Skeleton className="h-[600px] md:col-span-2 rounded-[56px]" />
                    <Skeleton className="h-[600px] rounded-[56px]" />
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50/50">
                <div className="text-center p-20 bg-white rounded-[56px] border border-amber-100 shadow-2xl max-w-lg glass-card animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-amber-50 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-inner border border-amber-100/50">
                        <AlertTriangle size={56} className="text-amber-500 animate-bounce" />
                    </div>
                    <h3 className="text-3xl font-black uppercase text-gray-800 tracking-tighter mb-4 font-display">Không tìm thấy khóa học</h3>
                    <p className="text-sm text-gray-400 mb-12 leading-relaxed font-bold uppercase tracking-widest px-8">Mã khóa học <b>{courseId}</b> không tồn tại trong hệ thống đào tạo.</p>
                    <Button onClick={() => navigate("/student/courses")} className="w-full bg-slate-900 hover:bg-black text-white rounded-[28px] h-16 font-black uppercase tracking-[0.3em] shadow-2xl font-display hover:scale-105 active:scale-95 border-0">Quay lại danh sách</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <WorkspaceHeader 
                course={course} 
                group={group} 
                isLeader={isLeader} 
                onSync={handleSync} 
                isSyncing={isSyncing}
                onBack={() => navigate("/student/courses")}
            />

            {!group ? (
                <div className="py-40 bg-white rounded-[64px] border-4 border-dashed border-gray-100 text-center glass-card group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="w-32 h-32 bg-gray-50 rounded-[48px] flex items-center justify-center mx-auto mb-12 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                        <Users size={64} className="text-gray-200 group-hover:text-teal-300 transition-colors" />
                    </div>
                    <h4 className="text-3xl font-black text-gray-300 uppercase tracking-[0.3em] mb-4 font-display group-hover:text-gray-400 transition-colors">Bạn chưa có nhóm dự án</h4>
                    <p className="text-sm text-gray-300 font-black uppercase tracking-[0.4em] opacity-60">Vui lòng liên hệ Giảng viên phụ trách để được phân nhóm.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
                    <div className="xl:col-span-2 space-y-10">
                        <IntegrationPanel 
                            group={group} 
                            isLeader={isLeader} 
                            githubInput={githubInput} 
                            setGithubInput={setGithubInput}
                            jiraInput={jiraInput} 
                            setJiraInput={setJiraInput}
                            onLinkSubmit={handleLinkSubmit}
                            isLinking={isLinking}
                        />

                        <TeamManagement 
                            groupStudents={groupStudents} 
                            isLeader={isLeader} 
                            onInviteOpen={() => setShowInviteModal(true)} 
                            onRemoveMember={handleRemoveMember}
                        />
                    </div>

                    <div className="space-y-10 lg:sticky lg:top-8">
                        <ProjectKpiSidebar 
                            metrics={metrics} 
                            isSyncing={isSyncing} 
                        />

                        <SrsSidebar 
                            groupSrs={groupSrs} 
                            loadingSrs={loadingSrs} 
                            onSrsCenterNavigate={() => navigate("/student/srs")} 
                        />
                    </div>
                </div>
            )}

            <InviteMemberModal 
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                enrolledData={enrolledData}
                groupStudents={groupStudents}
                inviteSelectedIds={inviteSelectedIds}
                setInviteSelectedIds={setInviteSelectedIds}
                isInviting={isInviting}
                onInviteSubmit={handleInviteSubmit}
            />
        </div>
    );
}

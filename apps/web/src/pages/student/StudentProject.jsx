import { useParams, useNavigate } from "react-router-dom";
import { 
    RefreshCw, 
    Upload, 
    ShieldAlert, 
    GitCommit, 
    CheckSquare, 
    BarChart2, 
    Target 
} from "lucide-react";

// Components UI
import { Button } from "@/components/ui/Button.jsx";
import { Skeleton } from "@/components/ui/Skeleton.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Interactive.jsx";

// Shared Components
import { PageHeader } from "@/components/shared/PageHeader.jsx";
import { StatsCard } from "@/components/shared/StatsCard.jsx";

// Local Components
import { CommitHistory } from "@/pages/student/components/StudentProject/CommitHistory.jsx";
import { PerformanceMetrics } from "@/pages/student/components/StudentProject/PerformanceMetrics.jsx";
import { StudentTeamList } from "@/pages/student/components/StudentProject/StudentTeamList.jsx";
import { ProjectProgress } from "@/pages/student/components/StudentProject/ProjectProgress.jsx";
import { SrsSubmissions } from "@/pages/student/components/StudentProject/SrsSubmissions.jsx";
import { ProjectSummarySidebar } from "@/pages/student/components/StudentProject/ProjectSummarySidebar.jsx";
import { SrsUploadModal } from "@/pages/student/components/StudentProject/SrsUploadModal.jsx";

// Hooks
import { useStudentProject } from "./hooks/useStudentProject.js";
import { useAuth } from "@/context/AuthContext.jsx";

export default function StudentProject() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const {
        project,
        loadingProject,
        metrics,
        loadingMetrics,
        commitHistory,
        loadingCommits,
        srsReports,
        loadingSrs,
        roadmapData,
        cfdData,
        cycleTime,
        agingWip,
        isSyncing,
        isSubmitting,
        myTeamMember,
        myCommits,
        activeTab,
        setActiveTab,
        isUploadModalOpen,
        setIsUploadModalOpen,
        uploadFile,
        setUploadFile,
        handleSync,
        handleSrsSubmit
    } = useStudentProject(projectId);

    if (!loadingProject && !project) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50/50">
                <div className="text-center p-16 bg-white rounded-[56px] border border-red-100 shadow-[0_50px_100px_-20px_rgba(239,68,68,0.15)] max-w-lg animate-in zoom-in-95 duration-500 glass-card">
                    <div className="w-24 h-24 bg-red-50 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-inner border border-red-100/50">
                        <ShieldAlert size={56} className="text-red-500 animate-pulse" />
                    </div>
                    <p className="text-3xl font-black text-gray-800 mb-4 font-display">Dự án không tồn tại!</p>
                    <p className="text-sm text-gray-400 mb-12 leading-relaxed font-bold px-8">Mã dự án <b>{projectId}</b> không khớp với bất kỳ dữ liệu nào trong hồ sơ học thuật của bạn.</p>
                    <Button onClick={() => navigate("/student")} className="w-full bg-slate-900 hover:bg-black text-white rounded-[28px] h-16 font-black shadow-2xl shadow-slate-200 transition-all font-display hover:scale-105 active:scale-95 border-0">Quay lại Tổng quan</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <PageHeader 
                title={loadingProject ? <Skeleton className="h-10 w-80 rounded-2xl" /> : project.name}
                subtitle={loadingProject ? <Skeleton className="h-4 w-[500px] mt-4 rounded-xl" /> : (project.description || "Dự án CNTT tích hợp JIRA & GITHUB phục vụ đồ án chuyên môn.")}
                breadcrumb={["Sinh viên", "Project Workspace", loadingProject ? "..." : project.name]}
                actions={loadingProject ? [<Skeleton key="1" className="h-12 w-40 rounded-2xl" />, <Skeleton key="2" className="h-12 w-40 rounded-2xl" />] : [
                    <Button 
                        key="sync" 
                        variant="outline" 
                        className={`rounded-[24px] border-teal-100 text-teal-700 h-12 px-8 text-[11px] font-black hover:bg-teal-50 hover:border-teal-200 shadow-sm transition-all font-display ${isSyncing ? 'opacity-50 pointer-events-none' : ''}`} 
                        onClick={handleSync}
                    >
                        <RefreshCw size={18} className={`mr-3 ${isSyncing ? 'animate-spin' : ''}`} /> Sync Activity
                    </Button>,
                    <Button 
                        key="upload" 
                        onClick={() => setIsUploadModalOpen(true)} 
                        className="bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white rounded-[24px] h-12 px-10 text-[11px] font-black shadow-xl shadow-teal-100 border-0 transition-all hover:scale-110 active:scale-95 font-display"
                    >
                        <Upload size={18} className="mr-3" /> Submit SRS
                    </Button>
                ]}
            />

            {/* KPI Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loadingMetrics || loadingCommits || loadingProject ? (
                    <>
                        <Skeleton className="h-32 rounded-[32px]" />
                        <Skeleton className="h-32 rounded-[32px]" />
                        <Skeleton className="h-32 rounded-[32px]" />
                        <Skeleton className="h-32 rounded-[32px]" />
                    </>
                ) : (
                    <>
                        <StatsCard 
                            label="Commits của tôi" 
                            value={myCommits[0]?.commits ?? myCommits[0]?.totalCommits ?? 0} 
                            icon={GitCommit} 
                            variant="success" 
                            description="TỔNG SỐ COMMIT CÁ NHÂN"
                        />
                        <StatsCard 
                            label="Issues Hoàn thành (Nhóm)" 
                            value={metrics?.issuesDone ?? 0} 
                            icon={CheckSquare} 
                            variant="info" 
                            description="TỔNG TASKS (DONE) TRÊN JIRA"
                        />
                        <StatsCard 
                            label="Tổng Commits Nhóm" 
                            value={metrics?.totalCommits ?? 0} 
                            icon={BarChart2} 
                            variant="indigo" 
                            description="HOẠT ĐỘNG CỦA TOÀN NHÓM"
                        />
                        <StatsCard 
                            label="Đóng góp cá nhân" 
                            value={`${myTeamMember?.contributionScore || 0}%`} 
                            icon={Target} 
                            variant="warning" 
                            description="CHỈ SỐ ĐÓNG GÓP (LECTURER)"
                        />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                <div className="lg:col-span-2 space-y-10">
                    <Tabs defaultValue="commits" className="w-full" onValueChange={setActiveTab}>
                        <div className="flex items-center justify-between mb-8 bg-gray-50/50 p-2 rounded-[30px] w-fit border border-gray-100 shadow-inner group glass-card">
                            <TabsList className="bg-transparent border-0 gap-2 p-1">
                                {['commits', 'performance', 'team', 'progress', 'srs'].map((tab) => (
                                    <TabsTrigger 
                                        key={tab}
                                        value={tab} 
                                        className="px-10 py-3.5 rounded-[22px] text-[10px] font-black data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-2xl transition-all duration-300 font-display"
                                    >
                                        {tab === 'commits' && "Lịch sử Source"}
                                        {tab === 'performance' && "Hiệu suất Code"}
                                        {tab === 'team' && "Thành viên"}
                                        {tab === 'progress' && "Tiến độ"}
                                        {tab === 'srs' && "Tài liệu SRS"}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <TabsContent value="commits" className="mt-0 animate-in slide-in-from-left-4 duration-500">
                            <CommitHistory 
                                loadingCommits={loadingCommits} 
                                myCommits={myCommits} 
                                githubUrl={project?.integration?.githubRepo ? `https://github.com/${project.integration.githubRepo}` : null} 
                            />
                        </TabsContent>

                        <TabsContent value="performance" className="mt-0 animate-in slide-in-from-left-4 duration-500">
                            <PerformanceMetrics 
                                metrics={metrics} 
                                commitHistory={commitHistory} 
                            />
                        </TabsContent>

                        <TabsContent value="team" className="mt-0 animate-in slide-in-from-left-4 duration-500">
                            <StudentTeamList 
                                project={project} 
                                metrics={metrics} 
                                userId={user?.id} 
                            />
                        </TabsContent>

                        <TabsContent value="progress" className="mt-0 animate-in slide-in-from-left-4 duration-500">
                            <ProjectProgress 
                                cycleTime={cycleTime} 
                                metrics={metrics} 
                                roadmapData={roadmapData} 
                                agingWip={agingWip} 
                                cfdData={cfdData} 
                            />
                        </TabsContent>

                        <TabsContent value="srs" className="mt-0 animate-in slide-in-from-left-4 duration-500">
                            <SrsSubmissions 
                                loadingSrs={loadingSrs} 
                                srsReports={srsReports} 
                                onUploadModalOpen={() => setIsUploadModalOpen(true)} 
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="lg:sticky lg:top-8">
                    <ProjectSummarySidebar 
                        loadingProject={loadingProject} 
                        project={project} 
                        onSync={handleSync} 
                        isSyncing={isSyncing} 
                        roadmapData={roadmapData} 
                    />
                </div>
            </div>

            <SrsUploadModal 
                isOpen={isUploadModalOpen} 
                onClose={() => setIsUploadModalOpen(false)} 
                uploadFile={uploadFile} 
                setUploadFile={setUploadFile} 
                onSrsSubmit={handleSrsSubmit} 
                isSubmitting={isSubmitting} 
            />
        </div>
    );
}







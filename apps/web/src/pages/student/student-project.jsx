import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  CheckSquare,
  Clock3,
  Download,
  FileText,
  FolderKanban,
  Github,
  GitPullRequest,
  Link2,
  RefreshCw,
  ShieldAlert,
  Target,
  Upload,
  Users,
  AlertTriangle,
  GitBranch,
  BarChart2,
  GitCommit,
  Clock,
  ExternalLink,
  Activity,
  Check,
  AlertCircle,
  CheckCircle
} from "lucide-react";

// Components UI
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Modal } from "../../components/ui/interactive.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/interactive.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";
import { Skeleton } from "../../components/ui/skeleton.jsx";

// Features & Hooks
import { useAuth } from "../../context/AuthContext.jsx";
import { 
    useGetProjectById,
    useGetProjectMetrics,
    useProjectCommitHistory,
    useSyncProjectCommits,
    useGetProjectRoadmap,
    useGetProjectCfd,
    useGetProjectCycleTime,
    useGetProjectKanban,
    useGetProjectAgingWip
} from "../../features/projects/hooks/useProjects.js";
import { useGetProjectSrs, useSubmitSrs } from "../../features/srs/hooks/useSrs.js";

export default function StudentProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState("commits");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  /* ── Data Hooks ── */
  const { data: project, isLoading: loadingProject } = useGetProjectById(projectId);
  const { data: metrics, isLoading: loadingMetrics } = useGetProjectMetrics(projectId);
  const { data: commitHistory = [], isLoading: loadingCommits } = useProjectCommitHistory(projectId);
  const { data: srsReports = [], isLoading: loadingSrs } = useGetProjectSrs(projectId);
  const { data: roadmapData } = useGetProjectRoadmap(projectId);
  const { data: cfdData } = useGetProjectCfd(projectId);
  const { data: cycleTime } = useGetProjectCycleTime(projectId);
  const { data: kanban } = useGetProjectKanban(projectId);
  const { data: agingWip } = useGetProjectAgingWip(projectId);
  
  const { mutate: syncCommits, isLoading: isSyncing } = useSyncProjectCommits();
  const { mutate: submitSrs, isLoading: isSubmitting } = useSubmitSrs();

  const myTeamMember = useMemo(() => 
    project?.team?.find(m => m.studentId === String(user?.id)), 
  [project, user]);

  const myCommits = useMemo(() => 
    commitHistory.filter(c => String(c.authorId || c.studentId) === String(user?.id)),
  [commitHistory, user]);

  // No longer blocking the whole UI
  const isLoading = loadingProject;

  if (!loadingProject && !project) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center p-12 bg-white rounded-[40px] border border-red-100 shadow-2xl max-w-md animate-in zoom-in duration-300">
           <div className="w-20 h-20 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <ShieldAlert size={48} className="text-red-500" />
           </div>
           <p className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Ops! Dự án không tồn tại</p>
           <p className="text-sm text-gray-500 mb-10 mt-4 leading-relaxed font-medium">Mã dự án <b>{projectId}</b> không khớp với bất kỳ dữ liệu nào trong hồ sơ của bạn.</p>
           <Button onClick={() => navigate("/student")} className="w-full bg-slate-900 hover:bg-black text-white rounded-[24px] h-14 font-black uppercase tracking-widest shadow-xl transition-all">Quay lại Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleSync = () => {
    syncCommits(projectId, {
        onSuccess: () => success("Đồng bộ dữ liệu mã nguồn thành công!"),
        onError: () => showError("Lỗi đồng bộ. Vui lòng kiểm tra lại URL Repo.")
    });
  };

  const handleSrsSubmit = () => {
    if (!uploadFile) return showError("Vui lòng chọn file tài liệu");
    submitSrs({ projectId, file: uploadFile }, {
        onSuccess: () => {
            success("Đã nộp SRS thành công!");
            setIsUploadModalOpen(false);
            setUploadFile(null);
        },
        onError: () => showError("Nộp thất bại. Vui lòng thử lại.")
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title={isLoading ? <Skeleton className="h-8 w-64" /> : project.name}
        subtitle={isLoading ? <Skeleton className="h-4 w-96 mt-2" /> : (project.description || "Dự án CNTT tích hợp JIRA & GITHUB.")}
        breadcrumb={["Sinh viên", "Dự án", isLoading ? "..." : project.name]}
        actions={isLoading ? [<Skeleton key="1" className="h-11 w-32 rounded-2xl" />, <Skeleton key="2" className="h-11 w-32 rounded-2xl" />] : [
          <Button key="sync" variant="outline" className={`rounded-2xl border-teal-200 text-teal-700 h-11 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-teal-50 shadow-sm transition-all ${isSyncing ? 'opacity-50' : ''}`} onClick={handleSync} disabled={isSyncing}>
            <RefreshCw size={14} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> Sync Activity
          </Button>,
          <Button key="upload" onClick={() => setIsUploadModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-100 border-0 transition-all hover:scale-105 active:scale-95">
            <Upload size={16} className="mr-2" /> Submit SRS
          </Button>
        ]}
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28 rounded-3xl" />
            <Skeleton className="h-28 rounded-3xl" />
            <Skeleton className="h-28 rounded-3xl" />
            <Skeleton className="h-28 rounded-3xl" />
          </>
        ) : (
          <>
            <StatsCard label="Commits của tôi" value={myCommits.length} icon={GitCommit} variant="success" />
            <StatsCard label="Issues Hoàn thành" value={metrics?.totalIssues ?? 0} icon={CheckSquare} variant="info" />
            <StatsCard label="Tổng Commits Nhóm" value={metrics?.totalCommits ?? 0} icon={BarChart2} variant="indigo" />
            <StatsCard label="Đóng góp cá nhân" value={`${myTeamMember?.contributionScore || 0}%`} icon={Target} variant="warning" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Tabs defaultValue="commits" className="w-full" onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-6 bg-gray-50/50 p-1.5 rounded-[24px] w-fit border border-gray-100 shadow-inner">
                <TabsList className="bg-transparent border-0 gap-1">
                  <TabsTrigger value="commits" className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-xl transition-all">Lịch sử Source</TabsTrigger>
                  <TabsTrigger value="performance" className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-xl transition-all">Hiệu suất Code</TabsTrigger>
                  <TabsTrigger value="team" className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-xl transition-all">Thành viên</TabsTrigger>
                  <TabsTrigger value="progress" className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-xl transition-all">Tiến độ</TabsTrigger>
                  <TabsTrigger value="srs" className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-xl transition-all">Tài liệu SRS</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="commits" className="mt-0 animate-in slide-in-from-left-2 duration-300">
                <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
                  <CardHeader className="border-b border-gray-50 py-6 px-10">
                    <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">Dòng thời gian đóng góp trên GitHub</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {loadingCommits ? (
                        <div className="py-20 text-center animate-pulse"><RefreshCw className="mx-auto text-gray-100 animate-spin" size={32}/></div>
                    ) : myCommits.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200"><Github size={32} /></div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Chưa có bản ghi commit nào được ghi nhận</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {myCommits.map(commit => (
                          <div key={commit.id || commit.sha} className="p-6 px-10 hover:bg-gray-50/50 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-6 min-w-0">
                              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-inner">
                                <GitBranch size={20} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-gray-800 leading-tight truncate group-hover:text-teal-600 transition-colors uppercase tracking-tight">{commit.message}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-[11px] font-black text-teal-600 font-mono bg-white px-2 py-0.5 rounded border border-teal-100 shadow-sm">{String(commit.sha || "0000000").substring(0, 7)}</span>
                                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1.5"><Clock size={10}/> {new Date(commit.createdAt || commit.date).toLocaleString("vi-VN")}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-gray-300 hover:text-teal-600 hover:bg-white scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all" onClick={() => project.integration?.githubUrl && window.open(`${project.integration.githubUrl}/commit/${commit.sha}`, '_blank')}><ExternalLink size={16}/></Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="mt-0 animate-in slide-in-from-left-2 duration-300 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
                      <CardHeader className="border-b border-gray-50 py-6 px-10">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">Phân bổ đóng góp thành viên</CardTitle>
                      </CardHeader>
                      <CardContent className="p-10">
                         <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={metrics?.contributions || []}>
                                  <XAxis dataKey="studentName" hide />
                                  <YAxis hide />
                                  <Tooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }} 
                                  />
                                  <Bar dataKey="commits" fill="#0d9488" radius={[10, 10, 0, 0]} />
                                  <Bar dataKey="issues" fill="#4f46e5" radius={[10, 10, 0, 0]} />
                               </BarChart>
                            </ResponsiveContainer>
                         </div>
                         <div className="flex justify-center gap-8 mt-6">
                            <div className="flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full bg-teal-600"></div>
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Commits</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Issues</span>
                            </div>
                         </div>
                      </CardContent>
                   </Card>

                   <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
                      <CardHeader className="border-b border-gray-50 py-6 px-10">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">Tần suất commit dự án</CardTitle>
                      </CardHeader>
                      <CardContent className="p-10">
                         <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={commitHistory?.slice(-15) || []}>
                                  <defs>
                                    <linearGradient id="colorProjectCommits" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <XAxis dataKey="date" hide />
                                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', fontSize: '10px', fontWeight: 'bold' }} />
                                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorProjectCommits)" />
                               </AreaChart>
                            </ResponsiveContainer>
                         </div>
                         <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mt-6">Dữ liệu 15 ngày gần nhất</p>
                      </CardContent>
                   </Card>
                </div>
              </TabsContent>

              <TabsContent value="team" className="mt-0 animate-in slide-in-from-left-2 duration-300">
                <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
                  <CardHeader className="border-b border-gray-50 py-6 px-10">
                    <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">Danh sách thành viên & Chỉ số đóng góp</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {(project.team || []).map(m => {
                      const isMe = String(m.studentId) === String(user?.id);
                      const lead = m.role?.toUpperCase() === "LEADER";
                      const studentMetric = metrics?.contributions?.find(met => String(met.studentId) === String(m.studentId));
                      
                      return (
                        <div key={m.studentId} className="flex items-center gap-8 px-10 py-8 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-all group">
                          <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-lg font-black text-white shrink-0 shadow-xl transition-all group-hover:scale-110 ${lead ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-100' : 'bg-gradient-to-br from-teal-500 to-indigo-600 shadow-teal-100'}`}>
                            {m.studentName?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <p className="text-base font-black text-gray-800 tracking-tight uppercase">{m.studentName}</p>
                              {lead && <Badge variant="outline" className="bg-amber-50 border-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full">⭐ Leader</Badge>}
                              {isMe && <Badge variant="outline" className="bg-teal-50 border-teal-100 text-teal-700 text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full">Bạn</Badge>}
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner p-0.5">
                                <div className={`h-full rounded-full shadow-lg transition-all duration-1000 ${lead ? 'bg-amber-400 shadow-amber-100' : 'bg-teal-500 shadow-teal-100'}`} style={{ width: `${m.contributionScore || 0}%` }} />
                              </div>
                              <span className="text-xs font-black text-gray-700 uppercase tracking-widest shrink-0">{m.contributionScore || 0}% Đóng góp</span>
                            </div>
                          </div>
                          <div className="hidden md:flex gap-10">
                             <div className="text-center">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5 opacity-60">Commits</p>
                                <p className="font-black text-2xl text-teal-600 tracking-tighter leading-none">{studentMetric?.commits || 0}</p>
                             </div>
                             <div className="text-center">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5 opacity-60">Issues</p>
                                <p className="font-black text-2xl text-indigo-500 tracking-tighter leading-none">{studentMetric?.issues || 0}</p>
                             </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="mt-0 animate-in slide-in-from-left-2 duration-300 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <Card className="border border-gray-100 shadow-sm rounded-[32px] bg-white p-6">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Cycle Time TB</p>
                      <div className="flex items-end gap-2">
                         <span className="text-3xl font-black text-teal-600 tracking-tighter">{cycleTime?.averageDays || 0}</span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Ngày</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase">Gần 30 ngày qua</p>
                   </Card>
                   <Card className="border border-gray-100 shadow-sm rounded-[32px] bg-white p-6">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Tốc độ hoàn thành</p>
                      <div className="flex items-end gap-2">
                         <span className="text-3xl font-black text-indigo-500 tracking-tighter">{metrics?.velocity || roadmapData?.items?.filter(i => i.status === 'DONE').length || 0}</span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Issues / Tuần</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase">Theo Iteration</p>
                   </Card>
                   <Card className="border border-gray-100 shadow-sm rounded-[32px] bg-white p-6">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Aging Tasks (WIP)</p>
                      <div className="flex items-end gap-2">
                         <span className="text-3xl font-black text-amber-500 tracking-tighter">{agingWip?.length || 0}</span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Đang trễ</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase">Cần tập trung xử lý</p>
                   </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                   <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
                      <CardHeader className="border-b border-gray-50 py-6 px-10">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">Cumulative Flow Diagram (CFD)</CardTitle>
                      </CardHeader>
                      <CardContent className="p-10">
                        <div className="h-64 w-full bg-gray-50 rounded-3xl flex items-center justify-center border border-dashed border-gray-200">
                          {cfdData?.buckets?.length > 0 ? (
                            <div className="space-y-4 w-full px-10">
                               <div className="flex justify-between items-end gap-2 h-32">
                                  {cfdData.buckets.slice(-10).map((b, i) => (
                                    <div key={i} className="flex-1 flex flex-col justify-end gap-1 group relative">
                                      <div className="w-full bg-teal-500 rounded-t-lg transition-all" style={{ height: `${Math.min(b.done * 5, 80)}%` }}></div>
                                      <div className="w-full bg-indigo-400 rounded-t-sm opacity-50" style={{ height: `${Math.min(b.inProgress * 5, 40)}%` }}></div>
                                    </div>
                                  ))}
                               </div>
                               <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                  <span>30 ngày trước</span>
                                  <span>Hôm nay</span>
                                </div>
                            </div>
                          ) : (
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Không đủ dữ liệu CFD</p>
                          )}
                        </div>
                      </CardContent>
                   </Card>

                   <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
                      <CardHeader className="border-b border-gray-50 py-6 px-10">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">Aging WIP - Công việc tồn đọng lâu</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                         {agingWip?.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                               {agingWip.map((task, i) => (
                                  <div key={task.id || i} className="p-6 px-10 flex items-center justify-between group hover:bg-gray-50 transition-all">
                                     <div className="min-w-0">
                                        <p className="text-sm font-black text-gray-800 uppercase tracking-tight truncate group-hover:text-amber-600 transition-colors">{task.title}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Đã tồn tại: <span className="text-amber-500">{task.ageDays} ngày</span></p>
                                     </div>
                                     <Badge className="bg-amber-50 text-amber-600 border-amber-100 h-6">WIP</Badge>
                                  </div>
                               ))}
                            </div>
                         ) : (
                            <div className="py-20 text-center">
                               <CheckCircle size={32} className="mx-auto text-teal-100 mb-4" />
                               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Không có task nào bị tồn đọng quá lâu</p>
                            </div>
                         )}
                      </CardContent>
                   </Card>
                </div>
              </TabsContent>

              <TabsContent value="srs" className="mt-0 animate-in slide-in-from-left-2 duration-300">
                <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
                  <CardHeader className="border-b border-gray-50 py-6 px-10 flex justify-between items-center">
                    <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">Bản nộp tài liệu SRS (Software Requirements Specification)</CardTitle>
                    <Button onClick={() => setIsUploadModalOpen(true)} className="bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-2xl h-10 px-6 text-[10px] font-black uppercase tracking-widest border-0 transition-all">Submit New</Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    {loadingSrs ? (
                        <div className="py-20 text-center animate-pulse"><FileText className="mx-auto text-gray-100 animate-bounce" size={32}/></div>
                    ) : srsReports.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <FileText size={48} className="text-gray-100" />
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Chưa có tài liệu nào được nộp</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {srsReports.map(rpt => (
                          <div key={rpt.id} className="p-8 px-10 flex items-center justify-between hover:bg-gray-50/50 group transition-all">
                             <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                   <FileText size={24} />
                                </div>
                                <div className="min-w-0">
                                   <div className="flex items-center gap-3 mb-1.5">
                                      <p className="text-sm font-black text-gray-800 uppercase tracking-tight">SRS_Version_{rpt.version}.pdf</p>
                                      <StatusBadge status={rpt.status === 'FINAL' ? 'success' : 'warning'} label={rpt.status} variant={rpt.status === 'FINAL' ? 'success' : 'warning'} />
                                   </div>
                                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Đã nộp: {new Date(rpt.submittedAt).toLocaleString("vi-VN")}</p>
                                   {rpt.feedback && (
                                       <div className="mt-3 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl inline-block max-w-sm">
                                            <p className="text-[10px] font-black text-blue-700 leading-relaxed italic">GV: {rpt.feedback}</p>
                                       </div>
                                   )}
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <Button 
                                    variant="outline" 
                                    className="rounded-xl h-12 px-6 text-[10px] font-black uppercase tracking-widest border-gray-100 bg-white hover:shadow-xl transition-all"
                                    onClick={() => rpt.fileUrl && window.open(rpt.fileUrl, '_blank')}
                                >
                                    <Download size={16} className="mr-2"/> Tải xuống
                                </Button>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
           </Tabs>
        </div>

        <div className="space-y-8 animate-in slide-in-from-right-2 duration-500">
           <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white group p-10 relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 pointer-events-none group-hover:opacity-70 transition-all duration-1000"></div>
              <CardTitle className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Target size={18} className="text-teal-600" /> Bản tóm tắt dự án
              </CardTitle>
              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tighter uppercase leading-tight mb-6">{isLoading ? <Skeleton className="h-8 w-full" /> : project.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-32 rounded-[28px]" />
                        <Skeleton className="h-32 rounded-[28px]" />
                      </>
                    ) : (
                      <>
                        <div className="p-6 rounded-[28px] bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-3 transition-all hover:bg-white hover:shadow-xl hover:border-teal-50 group/item">
                          <Github size={24} className="text-gray-300 group-hover/item:text-teal-600 transition-colors" />
                          <div className="text-center">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">GitHub Integration</p>
                                <StatusBadge status={project.integration?.githubStatus === 'ACTIVE' ? 'success' : 'warning'} label={project.integration?.githubStatus || "PENDING"} />
                          </div>
                        </div>
                        <div className="p-6 rounded-[28px] bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-3 transition-all hover:bg-white hover:shadow-xl hover:border-blue-50 group/item">
                          <Link2 size={24} className="text-gray-300 group-hover/item:text-blue-600 transition-colors" />
                          <div className="text-center">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Jira Integration</p>
                                <StatusBadge status={project.integration?.jiraStatus === 'ACTIVE' ? 'success' : 'warning'} label={project.integration?.jiraStatus || "PENDING"} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Thông tin đề tài</p>
                   <div className="p-8 bg-teal-50/20 rounded-[32px] border border-teal-100 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
                      <p className="text-sm font-black text-teal-800 tracking-tight leading-relaxed">{project.description || "Dự án đang trong quá trình thiết lập mục tiêu và phạm vi đề tài."}</p>
                   </div>
                </div>

                <Button onClick={handleSync} disabled={isSyncing} className="w-full bg-slate-900 hover:bg-black text-white rounded-[24px] h-16 font-black uppercase tracking-widest shadow-2xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-95">
                  <RefreshCw size={20} className={`mr-3 ${isSyncing ? 'animate-spin' : ''}`} /> Force Re-Sync Data
                </Button>
              </div>
           </Card>

           <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white p-10">
              <CardTitle className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" /> Academic Timeline
              </CardTitle>
              <div className="space-y-2">
                 {(roadmapData?.items || []).length > 0 ? (
                    roadmapData.items.slice(0, 5).map((item, i) => (
                      <div key={item.id || i} className="flex gap-6 p-6 rounded-[24px] hover:bg-gray-50 transition-all border border-transparent hover:border-gray-50 group">
                        <div className={`w-12 h-12 rounded-[18px] bg-gray-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                           {item.status?.toUpperCase() === 'DONE' ? <CheckCircle size={22} className="text-teal-500" /> : <Clock size={22} className="text-indigo-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center mb-1">
                              <p className="text-sm font-black text-gray-800 tracking-tight uppercase group-hover:text-teal-600 transition-colors truncate pr-2">{item.title}</p>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${item.status?.toUpperCase() === 'DONE' ? 'text-teal-500 border-teal-100' : 'text-indigo-500 border-indigo-100'} bg-white opacity-80`}>{item.status}</span>
                           </div>
                           <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{item.dueDate ? `Hạn: ${new Date(item.dueDate).toLocaleDateString("vi-VN")}` : "Xem Jira"}</p>
                        </div>
                      </div>
                    ))
                 ) : (
                    [
                      { title: "Nộp SRS Final", due: "Chuẩn bị ngay", status: "Critical", color: "text-red-500", icon: ShieldAlert },
                      { title: "Review Iteration 2", due: "Trong 5 ngày tới", status: "Upcoming", color: "text-amber-500", icon: Clock3 },
                      { title: "Đóng Sprint 3", due: "Cuối tuần này", status: "Normal", color: "text-blue-500", icon: GitCommit }
                    ].map((d, i) => (
                      <div key={i} className="flex gap-6 p-6 rounded-[24px] hover:bg-gray-50 transition-all border border-transparent hover:border-gray-50 group">
                         <div className={`w-12 h-12 rounded-[18px] bg-gray-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                            <d.icon size={22} className={d.color} />
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                               <p className="text-sm font-black text-gray-800 tracking-tight uppercase group-hover:text-teal-600 transition-colors">{d.title}</p>
                               <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${d.color} bg-white opacity-80`}>{d.status}</span>
                            </div>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{d.due}</p>
                         </div>
                     </div>
                   ))
                 )}
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Nộp tài liệu SRS mới" size="md">
         <div className="p-2 space-y-8">
            <div 
                className={`p-10 border-2 border-dashed rounded-[40px] text-center group cursor-pointer transition-all hover:scale-[1.01] ${uploadFile ? 'border-teal-500 bg-teal-50/30' : 'border-teal-100 bg-teal-50/10 hover:bg-teal-50/30'}`}
                onClick={() => document.getElementById('srs-upload').click()}
            >
               <input 
                id="srs-upload" 
                type="file" 
                className="hidden" 
                onChange={(e) => setUploadFile(e.target.files[0])} 
               />
               <div className={`w-20 h-20 rounded-[28px] shadow-2xl flex items-center justify-center mx-auto mb-6 transition-all group-hover:shadow-teal-100 ${uploadFile ? 'bg-teal-600 text-white' : 'bg-white text-teal-600'}`}>
                   {uploadFile ? <Check size={32} /> : <Upload size={32} />}
               </div>
               <p className="text-base font-black text-gray-800 uppercase tracking-tight">{uploadFile ? uploadFile.name : "Chọn hoặc Kéo thả file SRS"}</p>
               <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">{uploadFile ? `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB` : "Định dạng hỗ trợ: PDF (Tối đa 20MB)"}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Phiên bản tài liệu</label>
                  <input type="text" placeholder="VD: 1.0.0" className="w-full h-14 rounded-[20px] bg-gray-50 border border-gray-100 px-6 text-sm font-black focus:ring-4 focus:ring-teal-50 focus:border-teal-500 focus:bg-white outline-none transition-all placeholder:font-bold placeholder:text-gray-300" />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Phân loại nộp</label>
                  <select className="w-full h-14 rounded-[20px] bg-gray-50 border border-gray-100 px-6 text-sm font-black focus:ring-4 focus:ring-teal-50 focus:border-teal-500 focus:bg-white outline-none transition-all cursor-pointer">
                     <option>Bản nháp (Draft)</option>
                     <option>Bản chính thức (Final)</option>
                  </select>
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-8 border-t border-gray-50">
               <Button onClick={() => { setIsUploadModalOpen(false); setUploadFile(null); }} variant="ghost" className="rounded-[20px] h-14 px-10 font-black uppercase tracking-widest text-[11px] text-gray-400 hover:text-gray-800 transition-colors">Hủy bỏ</Button>
               <Button 
                onClick={handleSrsSubmit} 
                disabled={isSubmitting || !uploadFile} 
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-[24px] h-14 px-12 font-black uppercase tracking-widest shadow-xl shadow-teal-100 disabled:opacity-50 transition-all hover:scale-105"
               >
                {isSubmitting ? <RefreshCw className="animate-spin mr-2" size={16}/> : null} Gửi nộp tài liệu
               </Button>
            </div>
         </div>
      </Modal>
    </div>
  );
}
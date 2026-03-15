import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckSquare,
  Clock3,
  Download,
  Eye,
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
  ChevronRight,
  GitBranch
} from "lucide-react";

// Components UI
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

// Features & Hooks
import {
  getStudentProjectById,
  getStudentProjectDetailById,
} from "../../mock/student.mock.js";

export default function StudentProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { success } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");

  const project = getStudentProjectById(projectId);
  const detail = getStudentProjectDetailById(projectId);

  if (!project || !detail) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl border border-red-100 shadow-xl max-w-sm">
           <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
           <p className="text-lg font-bold text-gray-800">Không tìm thấy dự án</p>
           <p className="text-sm text-gray-500 mb-6 mt-2">Dữ liệu dự án này không tồn tại hoặc đã bị gỡ.</p>
           <Button onClick={() => navigate("/student")} className="w-full bg-slate-900 rounded-xl">Quay lại Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title={project.title}
        subtitle={project.description}
        breadcrumb={["Student", "Dự án", project.title]}
        actions={[
          <Button key="repo" variant="outline" className="rounded-2xl border-gray-200 h-11 px-6 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all" onClick={() => success?.("Mở Repo")}>
            <Github size={16} className="mr-2" /> Repository
          </Button>,
          <Button key="jira" variant="outline" className="rounded-2xl border-gray-200 h-11 px-6 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all" onClick={() => success?.("Mở Jira")}>
            <FolderKanban size={16} className="mr-2" /> Jira Board
          </Button>
        ]}
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Commits" value={project.commits} icon={Github} variant="success" />
        <StatsCard label="Issues Done" value={project.issuesDone} icon={CheckSquare} variant="info" />
        <StatsCard label="PRs Merged" value={project.prsMerged} icon={GitBranch} variant="indigo" />
        <StatsCard label="Contribution" value={`${project.myContribution}%`} icon={Target} variant="warning" />
      </div>

      {/* Tabs Control */}
      <div className="flex flex-wrap items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl w-fit">
        {["overview", "tasks", "team", "srs"].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedTab === tab ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab === 'overview' ? 'Tổng quan' : tab === 'tasks' ? 'Task cá nhân' : tab === 'team' ? 'Thành viên' : 'Hồ sơ SRS'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {selectedTab === 'overview' && (
            <div className="space-y-8">
               <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                 <CardHeader className="border-b border-gray-50 py-5 px-6">
                   <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Tiến độ Sprint</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                    <div className="space-y-6">
                      {detail.milestones?.map((m, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-center mb-2">
                             <p className="text-xs font-black text-gray-700 uppercase tracking-widest">{m.title}</p>
                             <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-lg">{m.progress}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500" style={{ width: `${m.progress}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                 </CardContent>
               </Card>

               <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                 <CardHeader className="border-b border-gray-50 py-5 px-6">
                   <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest text-center">Hoạt động dự án</CardTitle>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="divide-y divide-gray-50">
                      {(detail.activities || []).slice(0, 5).map((act, i) => (
                        <div key={i} className="p-4 flex gap-4 hover:bg-gray-50/50 transition-colors">
                           <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                             <RefreshCw size={16} className="text-indigo-600" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold text-gray-800 leading-snug">{act.text}</p>
                             <div className="flex items-center gap-3 mt-1.5">
                               <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100">{act.type}</span>
                               <span className="text-[10px] text-gray-400 font-bold">{act.time}</span>
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                 </CardContent>
               </Card>
            </div>
          )}

          {selectedTab === 'tasks' && (
             <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
               <CardHeader className="border-b border-gray-50 py-5 px-6">
                 <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Tasks Jira cá nhân</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                 {detail.personalTasks?.map((task, i) => (
                    <div key={i} className="p-5 border-b border-gray-50 hover:bg-gray-50/50 transition-all flex items-center gap-4 group">
                       <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-[10px] border border-gray-100 group-hover:bg-white transition-colors">{task.key}</div>
                       <div className="flex-1 min-w-0">
                         <p className="font-bold text-gray-800 text-sm">{task.title}</p>
                         <div className="flex items-center gap-3 mt-1.5">
                            <StatusBadge status={task.status} label={task.status} variant={task.status === 'Done' ? 'success' : 'info'} />
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Clock3 size={12}/> {task.due}</span>
                         </div>
                       </div>
                       <Button variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">Mở Jira</Button>
                    </div>
                 ))}
               </CardContent>
             </Card>
          )}

          {selectedTab === 'team' && (
             <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
               <CardHeader className="border-b border-gray-50 py-5 px-6">
                 <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Thành viên đội nhóm</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                 {detail.teamMembers?.map((member, i) => (
                    <div key={i} className="p-5 border-b border-gray-50 hover:bg-gray-50/50 transition-all flex items-center gap-6">
                       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 shrink-0">{member.name?.charAt(0)}</div>
                       <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-800 text-sm tracking-tight">{member.name}</p>
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{member.role}</p>
                       </div>
                       <div className="flex gap-4 items-center">
                          <div className="text-center px-4 border-r border-gray-100 last:border-0">
                            <p className="text-[9px] font-black text-gray-400 uppercase">Commits</p>
                            <p className="font-black text-lg text-teal-600">{member.commits}</p>
                          </div>
                          <div className="text-center px-4 border-r border-gray-100 last:border-0">
                            <p className="text-[9px] font-black text-gray-400 uppercase">Score</p>
                            <p className="font-black text-lg text-indigo-600">{member.score}%</p>
                          </div>
                       </div>
                    </div>
                 ))}
               </CardContent>
             </Card>
          )}

          {selectedTab === 'srs' && (
             <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
               <CardHeader className="border-b border-gray-50 py-5 px-6 flex flex-row items-center justify-between">
                 <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Tài liệu SRS</CardTitle>
                 <Button onClick={() => success?.("Mở Upload")} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 px-6 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-100 border-0"><Upload size={14} className="mr-2"/> Tải lên bản mới</Button>
               </CardHeader>
               <CardContent className="p-0">
                  {detail.srsFiles?.map((file, i) => (
                     <div key={i} className="p-5 border-b border-gray-50 hover:bg-gray-50/50 transition-all flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-white transition-colors border border-blue-50">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="font-bold text-gray-800 text-sm">{file.version}</p>
                           <p className="text-[10px] text-gray-400 font-bold mt-1">Cập nhật: {file.updatedAt}</p>
                        </div>
                        <StatusBadge status={file.status} variant={file.status === 'APPROVED' ? 'success' : 'info'} />
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-teal-600"><Download size={16}/></Button>
                     </div>
                  ))}
               </CardContent>
             </Card>
          )}
        </div>

        <div className="space-y-8">
           {/* Info Summary */}
           <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
             <CardHeader className="border-b border-gray-50 py-5 px-6">
               <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Thông tin dự án</CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div>
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Tech Stack</p>
                   <div className="flex flex-wrap gap-2">
                     {project.techStack?.map(t => <span key={t} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-600">{t}</span>)}
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Jira Key</p>
                      <p className="font-black text-gray-800">{project.jiraKey}</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Team Size</p>
                      <p className="font-black text-gray-800">{project.teamSize} Member</p>
                   </div>
                </div>
             </CardContent>
           </Card>

           {/* Deadlines Sidebar */}
           <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
             <CardHeader className="border-b border-gray-50 py-5 px-6">
               <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Deadlines Cần lưu ý</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                {detail.deadlines?.map((d, i) => (
                   <div key={i} className="p-4 border-b border-gray-50 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                         <AlertTriangle size={16} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{d.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{d.due}</p>
                      </div>
                   </div>
                ))}
             </CardContent>
           </Card>

           <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-14 font-black uppercase tracking-widest shadow-xl shadow-teal-100 border-0" onClick={() => success?.("Đồng bộ thành công")}>
             <RefreshCw size={18} className="mr-3" /> Sync Activity
           </Button>
        </div>
      </div>
    </div>
  );
}
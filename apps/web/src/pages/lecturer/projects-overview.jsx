import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  GitBranch, 
  Activity, 
  Search, 
  AlertTriangle, 
  Users, 
  RefreshCw,
  Layers,
  ChevronRight,
  LayoutGrid
} from "lucide-react";

// Components UI
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { Skeleton } from "../../components/ui/skeleton.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";

// Hooks
import { useGetProjects } from "../../features/projects/hooks/useProjects.js";

export default function ProjectsOverview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: projectsData, isLoading, refetch } = useGetProjects({ 
    courseId: courseId ? Number(courseId) : undefined 
  });
  
  const projects = projectsData?.items || [];

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = !search || 
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'error' && p.integration?.syncStatus === 'ERROR') ||
        (statusFilter === 'active' && p.status === 'ACTIVE');
        
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-8 p-8">
        <Skeleton className="h-20 w-3/4 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-[24px]" />)}
        </div>
        <Skeleton className="h-96 rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Tổng quan Dự án"
        subtitle="Quản lý tiến độ, tích hợp và hoạt động của tất cả các nhóm dự án."
        breadcrumb={["Giảng viên", "Dự án"]}
        actions={[
          <Button 
            key="refresh" 
            variant="outline" 
            className="rounded-2xl border-gray-200 h-11 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 shadow-sm" 
            onClick={() => refetch()}
          >
             <RefreshCw size={14} className="mr-2" /> Làm mới dữ liệu
          </Button>
        ]}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Tổng nhóm" value={projects.length} icon={Users} variant="info" />
        <StatsCard label="Sync thành công" value={projects.filter(p => p.integration?.syncStatus === 'SUCCESS').length} icon={GitBranch} variant="success" />
        <StatsCard label="Lỗi kết nối" value={projects.filter(p => p.integration?.syncStatus === 'ERROR').length} icon={AlertTriangle} variant="danger" />
        <StatsCard label="Đang hoạt động" value={projects.filter(p => p.status === 'ACTIVE').length} icon={Activity} variant="indigo" />
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input 
                placeholder="Tìm kiếm dự án, nhóm..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all shadow-sm" 
              />
           </div>
           <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             {[
               {id: 'all', label: 'Tất cả'},
               {id: 'error', label: 'Lỗi đồng bộ'},
               {id: 'active', label: 'Đang chạy'}
             ].map(f => (
               <button
                 key={f.id}
                 onClick={() => setStatusFilter(f.id)}
                 className={`shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                   statusFilter === f.id ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-100' : 'bg-white text-gray-400 border-gray-100 hover:border-teal-400 hover:text-teal-600'
                 }`}
               >
                 {f.label}
               </button>
             ))}
           </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/30 border-b border-gray-50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Dự án & Nhóm</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">GitHub</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Jira</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Thành viên</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProjects.map(project => (
                  <tr key={project.id} className="hover:bg-teal-50/10 transition-all group cursor-pointer" onClick={() => navigate(`/lecturer/group/${project.id}`)}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm group-hover:scale-110 transition-transform">
                          <Layers size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-gray-800 uppercase tracking-tight text-sm truncate">{project.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1 line-clamp-1 max-w-xs">{project.description || 'Chưa thiết lập đề tài'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <StatusPill status={project.integration?.githubStatus === 'APPROVED' ? 'success' : 'warning'} label={project.integration?.githubStatus || 'NONE'} />
                    </td>
                    <td className="px-8 py-6 text-center">
                       <StatusPill status={project.integration?.jiraStatus === 'APPROVED' ? 'success' : 'warning'} label={project.integration?.jiraStatus || 'NONE'} />
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="flex -space-x-2 items-center justify-center">
                          {(project.team || []).slice(0, 3).map((m, i) => (
                             <div key={i} className="w-8 h-8 rounded-xl bg-teal-500 border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm" title={m.studentName}>{m.studentName?.charAt(0)}</div>
                          ))}
                          {(project.team?.length > 3) && (
                             <div className="w-8 h-8 rounded-xl bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-400">+{project.team.length - 3}</div>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl hover:bg-white border border-transparent hover:border-gray-100 text-gray-400 hover:text-teal-600 shadow-sm transition-all">
                          <ChevronRight size={18} />
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredProjects.length === 0 && (
              <div className="py-24 text-center">
                 <div className="w-20 h-20 rounded-[32px] bg-gray-50 flex items-center justify-center mx-auto mb-6 shadow-inner border border-gray-100 opacity-50">
                    <LayoutGrid size={32} className="text-gray-300" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Không tìm thấy dự án nào hợp lệ</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusPill({ status, label }) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm",
    default: "bg-gray-50 text-gray-400 border-gray-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100 shadow-sm",
    error: "bg-red-50 text-red-700 border-red-100 shadow-sm"
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${styles[status]}`}>
      {label}
    </span>
  );
}

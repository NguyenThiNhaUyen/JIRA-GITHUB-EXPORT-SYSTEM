import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  GitBranch, 
  Activity, 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  Users, 
  ExternalLink,
  RefreshCw
} from "lucide-react";

// Components UI
import { Card, CardContent } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { InputField } from "../../components/shared/FormFields.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

// Hooks
import { projectService } from "../../services/projectService.js";
import { commitService } from "../../services/commitService.js";

export default function ProjectsOverview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (courseId) loadProjects();
  }, [courseId, filter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      let projectData = [];
      if (filter === 'all') projectData = await projectService.getCourseProjects(courseId);
      else if (filter === 'sync-error') projectData = await projectService.getCourseProjects(courseId, { syncStatus: 'ERROR' });
      else if (filter === 'no-commits-7days') projectData = await commitService.getSilentProjects(courseId, 7);
      
      setProjects(projectData);
    } catch (err) {
      error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Tổng quan Dự án"
        subtitle="Quản lý tiến độ, tích hợp và hoạt động của tất cả các nhóm trong lớp."
        breadcrumb={["Giảng viên", "Dự án"]}
        actions={[
          <Button key="refresh" variant="outline" className="rounded-2xl border-gray-200 h-11 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50" onClick={loadProjects}>
             <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </Button>
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard label="Tổng nhóm" value={projects.length} icon={Users} variant="info" />
        <StatsCard label="Sync thành công" value={projects.filter(p => p.integration?.syncStatus === 'SUCCESS').length} icon={GitBranch} variant="success" />
        <StatsCard label="Lỗi kết nối" value={projects.filter(p => p.integration?.syncStatus === 'ERROR').length} icon={AlertTriangle} variant="danger" />
        <StatsCard label="Ít hoạt động" value={projects.filter(p => !p.commits || p.commits.length === 0).length} icon={Clock} variant="warning" />
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-wrap gap-4 items-center justify-between">
           <InputField 
             placeholder="Tìm kiếm dự án..." 
             value={search} 
             onChange={e => setSearch(e.target.value)} 
             icon={Search} 
             className="max-w-md bg-white"
           />
           <div className="flex gap-2">
             {[
               {id: 'all', label: 'Tất cả'},
               {id: 'sync-error', label: 'Lỗi Sync'},
               {id: 'no-commits-7days', label: 'Im lặng > 7 ngày'}
             ].map(f => (
               <button
                 key={f.id}
                 onClick={() => setFilter(f.id)}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                   filter === f.id ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                 }`}
               >
                 {f.label}
               </button>
             ))}
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Dự án & Mô tả</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Thành viên</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Sync Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProjects.map(project => (
                <tr key={project.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="font-black text-gray-800 uppercase tracking-tight">{project.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 line-clamp-1">{project.description || 'Chưa có mô tả'}</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                     <StatusPill status={project.status === 'ACTIVE' ? 'success' : 'default'} label={project.status} />
                  </td>
                  <td className="px-6 py-5 text-center">
                     <span className="text-xs font-black text-gray-500">{project.team?.length || 0}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <StatusBadge 
                      status={project.integration?.syncStatus === 'SUCCESS' ? 'success' : project.integration?.syncStatus === 'ERROR' ? 'error' : 'warning'} 
                      label={project.integration?.syncStatus || 'N/A'}
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-teal-600 hover:bg-teal-50" onClick={() => navigate(`/lecturer/project/${project.id}`)}>
                         Chi tiết
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredProjects.length === 0 && (
            <div className="py-20 text-center">
               <Activity size={40} className="mx-auto text-gray-100 mb-4" />
               <p className="text-gray-400 text-sm font-medium">Không tìm thấy dự án nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status, label }) {
  const styles = {
    success: "bg-teal-50 text-teal-700 border-teal-100",
    default: "bg-gray-50 text-gray-500 border-gray-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-red-50 text-red-700 border-red-100"
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${styles[status]}`}>
      {label}
    </span>
  );
}

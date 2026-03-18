import { Layers, ChevronRight, LayoutGrid } from "lucide-react";
import { Button } from "../../components/ui/Button.jsx";

export function ProjectsTable({ projects, onNavigate }) {
  return (
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
          {projects.map(project => (
            <tr key={project.id} className="hover:bg-teal-50/10 transition-all group cursor-pointer" onClick={() => onNavigate(`/lecturer/group/${project.id}`)}>
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

      {projects.length === 0 && (
        <div className="py-24 text-center">
          <div className="w-20 h-20 rounded-[32px] bg-gray-50 flex items-center justify-center mx-auto mb-6 shadow-inner border border-gray-100 opacity-50">
            <LayoutGrid size={32} className="text-gray-300" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Không tìm thấy dự án nào hợp lệ</p>
        </div>
      )}
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

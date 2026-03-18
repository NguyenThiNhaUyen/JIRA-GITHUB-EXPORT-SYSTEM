import {
  GitBranch,
  Activity,
  Search,
  AlertTriangle,
  Users,
  RefreshCw
} from "lucide-react";

// Components UI
import { Card, CardContent } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";

// Shared Components
import { PageHeader } from "../components/shared/PageHeader.jsx";
import { StatsCard } from "../components/shared/StatsCard.jsx";

// Local Components
import { ProjectsTable } from "./components/ProjectsOverview/ProjectsTable.jsx";

// Hooks
import { useProjectsOverview } from "./hooks/useProjectsOverview.js";

export default function ProjectsOverview() {
  const {
    navigate,
    search, setSearch,
    statusFilter, setStatusFilter,
    projects,
    filteredProjects,
    stats,
    isLoading,
    refetch
  } = useProjectsOverview();

  if (isLoading) {
    return (
      <div className="space-y-8 p-8">
        <Skeleton className="h-20 w-3/4 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-[24px]" />)}
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
        <StatsCard label="Tổng nhóm" value={stats.total} icon={Users} variant="info" />
        <StatsCard label="Sync thành công" value={stats.success} icon={GitBranch} variant="success" />
        <StatsCard label="Lỗi kết nối" value={stats.error} icon={AlertTriangle} variant="danger" />
        <StatsCard label="Đang hoạt động" value={stats.active} icon={Activity} variant="indigo" />
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
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 font-sans">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'error', label: 'Lỗi đồng bộ' },
              { id: 'active', label: 'Đang chạy' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${statusFilter === f.id ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-100' : 'bg-white text-gray-400 border-gray-100 hover:border-teal-400 hover:text-teal-600'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-0">
          <ProjectsTable
            projects={filteredProjects}
            onNavigate={navigate}
          />
        </CardContent>
      </Card>
    </div>
  );
}

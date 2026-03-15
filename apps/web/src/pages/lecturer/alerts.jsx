import { useMemo, useState, useEffect } from "react";
import {
  ChevronRight,
  Bell,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  Search,
  Eye,
  Activity,
  Users,
} from "lucide-react";

// Components UI
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { InputField } from "../../components/shared/FormFields.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

// Feature Hooks
import {
  useGetAlerts,
  useResolveAlert,
} from "../../features/system/hooks/useAlerts.js";

const SEVERITY_STYLE = {
  HIGH: { dot: "bg-red-500", variant: "danger", label: "Nghiêm trọng" },
  MEDIUM: { dot: "bg-amber-500", variant: "warning", label: "Trung bình" },
  LOW: { dot: "bg-blue-500", variant: "info", label: "Nhẹ" }
};

export default function Alerts() {
  const { success, error: showError } = useToast();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [remindedIds, setRemindedIds] = useState(new Set());

  const { data: alertsData, isLoading, refetch } = useGetAlerts({ pageSize: 100 });
  const { mutate: resolveMutate, isPending: resolving } = useResolveAlert();

  const alertsList = alertsData?.items || [];

  const filtered = useMemo(() => {
    return alertsList.filter(a => {
      const q = search.toLowerCase();
      const matchesSearch = !search || 
        (a.groupName || "").toLowerCase().includes(q) || 
        (a.targetName || "").toLowerCase().includes(q) || 
        (a.message || "").toLowerCase().includes(q);
      
      if (!matchesSearch) return false;
      
      if (filter === 'resolved') return a.status === 'RESOLVED';
      if (filter === 'all') return a.status === 'OPEN' || a.status === null;
      
      const severity = (a.severity || "").toUpperCase();
      return (a.status === 'OPEN' || a.status === null) && severity === filter.toUpperCase();
    });
  }, [alertsList, filter, search]);

  const selectedAlert = useMemo(() => {
    if (!selectedId && filtered.length > 0) return filtered[0];
    return filtered.find(a => String(a.id) === String(selectedId)) || (filtered.length > 0 ? filtered[0] : null);
  }, [filtered, selectedId]);

  const handleResolve = (id) => {
    resolveMutate(id, {
      onSuccess: () => { 
        success("Đã xử lý cảnh báo"); 
        refetch(); 
      },
      onError: (err) => showError(err.message || "Không thể giải quyết cảnh báo")
    });
  };

  const handleRemind = (alert) => {
    setRemindedIds(prev => new Set([...prev, alert.id]));
    success(`Đã gửi nhắc nhở đến ${alert.targetName || alert.groupName || 'nhóm'}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Trung tâm Cảnh báo"
        subtitle="Phát hiện và xử lý sớm các rủi ro về tiến độ, đóng góp của sinh viên và nhóm dự án."
        breadcrumb={["Giảng viên", "Cảnh báo"]}
        actions={[
          <Button key="refresh" variant="outline" onClick={() => refetch()} className="rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest border-gray-200">
            <RefreshCw size={14} className={`mr-2 ${isLoading?'animate-spin':''}`} /> Làm mới dữ liệu
          </Button>
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <StatsCard label="Chưa xử lý" value={alertsList.filter(a=> (a.status === 'OPEN' || a.status === null)).length} icon={AlertTriangle} variant="danger" />
        <StatsCard label="Nghiêm trọng" value={alertsList.filter(a=>(a.severity || "").toUpperCase()==='HIGH' && (a.status === 'OPEN' || a.status === null)).length} icon={ShieldAlert} variant="warning" />
        <StatsCard label="Đã xử lý" value={alertsList.filter(a=>a.status==='RESOLVED').length} icon={CheckCircle} variant="success" />
        <StatsCard label="Mới (24h)" value={alertsList.filter(a=>Math.abs(Date.now()-new Date(a.createdAt).getTime())<86400000).length} icon={Clock} variant="info" />
        <StatsCard label="Theo nhóm" value={new Set(alertsList.map(a => a.groupName)).size} icon={Users} variant="indigo" />
        <StatsCard label="Đã nhắc" value={remindedIds.size} icon={Bell} variant="default" />
      </div>

      {/* Filter Bar */}
      <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="flex items-center gap-2 flex-wrap">
              {[
                {id: 'all', label: 'Tất cả'}, 
                {id: 'high', label: 'Nghiêm trọng'}, 
                {id: 'medium', label: 'Trung bình'}, 
                {id: 'low', label: 'Nhẹ'}, 
                {id: 'resolved', label: 'Đã xử lý'}
              ].map(f => (
                <button 
                  key={f.id} 
                  onClick={() => setFilter(f.id)} 
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.id ? 'bg-teal-600 text-white shadow-lg shadow-teal-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {f.label}
                </button>
              ))}
           </div>
           <div className="w-full md:w-96">
              <InputField placeholder="Tìm tên nhóm, SV, nội dung..." value={search} onChange={e => setSearch(e.target.value)} icon={Search} />
           </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <Card className="xl:col-span-2 border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white min-h-[500px]">
            <CardHeader className="border-b border-gray-50 py-5 px-8">
               <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                  <Bell size={18} className="text-red-500" /> Danh sách Cảnh báo
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               {isLoading ? (
                 <div className="p-20 text-center space-y-4">
                   <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
                 </div>
               ) : (
                 <div className="divide-y divide-gray-50">
                    {filtered.map((a, idx) => {
                      const severity = (a.severity || "MEDIUM").toUpperCase();
                      const style = SEVERITY_STYLE[severity] || SEVERITY_STYLE.MEDIUM;
                      return (
                        <div 
                          key={a.id || idx} 
                          onClick={() => setSelectedId(a.id)} 
                          className={`p-6 flex gap-6 cursor-pointer transition-all ${selectedId === a.id ? 'bg-teal-50/30' : 'hover:bg-gray-50/50'}`}
                        >
                           <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${style.dot} shadow-lg shadow-current/20`} />
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                 <h3 className="font-black text-gray-800 text-sm uppercase tracking-tight">{a.targetName || a.groupName}</h3>
                                 <StatusBadge status={style.variant} label={style.label} variant={style.variant} />
                                 <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest border border-gray-100 px-2 py-0.5 rounded-md">{a.courseCode}</span>
                              </div>
                              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4">{a.message}</p>
                              <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                                 <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded-full">Commits: {a.metrics?.commits ?? 0}</span>
                                 <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded-full">Jira: {a.metrics?.jiraDone ?? 0}</span>
                                 <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded-full">Overdue: {a.metrics?.overdueTasks ?? 0}</span>
                                 {remindedIds.has(a.id) && <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Đã nhắc nhở</span>}
                              </div>
                           </div>
                           {a.status !== 'RESOLVED' && (
                             <div className="flex flex-col gap-2 shrink-0">
                                <Button size="sm" variant="outline" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={(e) => { e.stopPropagation(); handleRemind(a); }} disabled={remindedIds.has(a.id)}><Bell size={12} className="mr-2"/> Nhắc nhở</Button>
                                <Button size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-teal-600 hover:bg-teal-700 text-white border-0" onClick={(e) => { e.stopPropagation(); handleResolve(a.id); }} disabled={resolving}><CheckCircle size={12} className="mr-2"/> Xong</Button>
                             </div>
                           )}
                        </div>
                      );
                    })}
                    {filtered.length === 0 && <div className="p-20 text-center text-gray-400">Không có cảnh báo nào.</div>}
                 </div>
               )}
            </CardContent>
         </Card>

         <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 py-5 px-6">
               <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Phân tích rủi ro</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               {!selectedAlert ? <div className="text-center py-20 text-gray-300 font-bold uppercase tracking-widest text-xs">Vui lòng chọn cảnh báo</div> : (
                 <>
                    <div className="text-center">
                       <div className="w-20 h-20 rounded-[32px] bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
                          <AlertTriangle size={32} className="text-red-500" />
                       </div>
                       <h4 className="font-black text-gray-800 text-base uppercase tracking-widest">{selectedAlert.targetName || selectedAlert.groupName}</h4>
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{selectedAlert.groupName}</p>
                    </div>

                    <div className="space-y-4">
                       <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Đề xuất xử lý</p>
                          <p className="text-xs text-gray-700 font-medium leading-relaxed">{selectedAlert.suggestion || "Nên liên hệ trực tiếp để xác minh lý do tham gia kém và cập nhật lại phân chia công việc."}</p>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-2xl border border-gray-100"><p className="text-[9px] font-black text-gray-400 uppercase mb-1">Score</p><p className="text-xl font-black text-gray-800">{selectedAlert.metrics?.score || 0}</p></div>
                          <div className="p-4 rounded-2xl border border-gray-100"><p className="text-[9px] font-black text-gray-400 uppercase mb-1">Thời điểm</p><p className="text-[10px] font-black text-gray-800 uppercase mt-2">{new Date(selectedAlert.createdAt).toLocaleDateString('vi-VN')}</p></div>
                       </div>
                    </div>

                    <div className="pt-4 space-y-3">
                       <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 border-0">Gửi mail thông báo</Button>
                    </div>
                 </>
               )}
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

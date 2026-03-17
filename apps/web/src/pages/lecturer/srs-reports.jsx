import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  FileText,
  Eye,
  CheckCircle,
  MessageSquare,
  ExternalLink,
  Search,
  Filter,
  AlertTriangle,
  GitBranch,
  FolderKanban,
  Users,
  CalendarDays,
  Upload,
  CheckCheck,
  RefreshCcw,
  Download,
  Star
} from "lucide-react";

// Components UI
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { Badge } from "../../components/ui/badge.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";

// Hooks
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetReports } from "../../features/admin/hooks/useReports.js";
import { useSendAlert } from "../../features/system/hooks/useAlerts.js";
import { useGenerateCommitStats } from "../../features/projects/hooks/useReports.js";
import { useReviewSrs } from "../../features/srs/hooks/useSrs.js";

const STATUS_META = {
  NOT_SUBMITTED: { label: "Chưa nộp", variant: "secondary", color: "text-gray-500 bg-gray-50 border-gray-100" },
  DRAFT: { label: "Bản nháp", variant: "outline", color: "text-slate-500 bg-slate-50 border-slate-100" },
  SUBMITTED: { label: "Đã nộp", variant: "info", color: "text-sky-600 bg-sky-50 border-sky-100" },
  REVIEW: { label: "Đang review", variant: "info", color: "text-blue-600 bg-blue-50 border-blue-100" },
  NEED_REVISION: { label: "Cần sửa", variant: "warning", color: "text-amber-600 bg-amber-50 border-amber-100" },
  APPROVED: { label: "Đã duyệt", variant: "success", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  FINAL: { label: "Hoàn tất", variant: "success", color: "text-green-600 bg-green-50 border-green-100" },
  OVERDUE: { label: "Quá hạn", variant: "danger", color: "text-red-600 bg-red-50 border-red-100" },
};

export default function SrsReports() {
  const { success, error: showError } = useToast();

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [feedbackText, setFeedbackText] = useState("");
  const [scoreValue, setScoreValue] = useState(0);

  const reviewMutation = useReviewSrs();
  const { mutate: sendAlert, isPending: isSendingAlert } = useSendAlert();
  const generateStatsMutation = useGenerateCommitStats();
  
  const { data: coursesData = { items: [] } } = useGetCourses({ pageSize: 100 });
  const realCourses = coursesData?.items || [];
  const currentCourse = realCourses.find(c => c.code === courseFilter || c.id === courseFilter);

  const { data: srsResponse, isLoading: loadingReports } = useGetReports({ 
    courseId: currentCourse?.id, 
    type: "SRS" 
  }, { 
    enabled: !!currentCourse?.id || courseFilter === 'all'
  });

  const allProjects = useMemo(() => {
    const projs = [];
    realCourses.forEach(c => {
      (c.projects || []).forEach(p => {
        projs.push({ ...p, courseCode: c.code, courseName: c.name });
      });
    });
    return projs;
  }, [realCourses]);

  const srsList = useMemo(() => {
    if (!srsResponse?.items) return [];
    return srsResponse.items.map(rpt => {
      const p = allProjects.find(px => px.id === rpt.projectId);
      return {
        ...rpt,
        teamName: p?.name || "Unknown Team",
        projectName: p?.description || "Unknown Project",
        leaderName: p?.team?.find(m => m.role === 'LEADER')?.studentName || "N/A",
        courseCode: p?.courseCode || "—",
        score: rpt.score || 0
      };
    });
  }, [srsResponse, allProjects]);

  const filtered = useMemo(() => {
    return srsList.filter(item => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCourse = courseFilter === "all" || item.courseCode === courseFilter;
      const q = search.toLowerCase();
      const matchesSearch = !search || 
        item.teamName.toLowerCase().includes(q) || 
        item.projectName.toLowerCase().includes(q) ||
        item.leaderName.toLowerCase().includes(q);
      return matchesStatus && matchesCourse && matchesSearch;
    });
  }, [srsList, statusFilter, courseFilter, search]);

  const selectedSrs = useMemo(() => filtered.find(s => s.id === selectedId) || (filtered.length > 0 ? filtered[0] : null), [filtered, selectedId]);

  useEffect(() => {
    if (selectedSrs) {
      setFeedbackText(selectedSrs.feedback || "");
      setScoreValue(selectedSrs.score || 0);
    }
  }, [selectedSrs]);

  const handleReview = async (status) => {
    if (!selectedSrs) return;
    try {
      await reviewMutation.mutateAsync({
        reportId: selectedSrs.id,
        status,
        feedback: feedbackText,
        score: parseFloat(scoreValue)
      });
      success(`Đã cập nhật đánh giá cho ${selectedSrs.teamName}`);
    } catch (err) {
      showError(err.message || "Đánh giá thất bại");
    }
  };

  const handleExportCsv = () => {
    if (filtered.length === 0) return showError("Không có dữ liệu để xuất");
    
    try {
      const headers = ["Nhóm", "Dự án", "Lớp", "Phiên bản", "Trạng thái", "Điểm", "Ngày nộp", "Feedback"];
      const rows = filtered.map(item => [
        item.teamName,
        item.projectName,
        item.courseCode,
        item.version,
        STATUS_META[item.status]?.label || item.status,
        item.score || 0,
        new Date(item.submittedAt || item.createdAt).toLocaleDateString("vi-VN"),
        (item.feedback || "").replace(/"/g, '""')
      ].map(val => `"${val}"`).join(","));

      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `SRS_Reports_Export_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      success("Đã xuất bảng điểm thành công!");
    } catch (err) {
      showError("Lỗi khi xuất file");
    }
  };

  const handleSyncAlerts = () => {
    const overdue = filtered.filter(s => s.status === 'OVERDUE' || s.status === 'NEED_REVISION');
    if (overdue.length === 0) return success("Không có nhóm nào cần nhắc nhở");
    
    overdue.forEach(v => {
      sendAlert({ 
        groupId: v.projectId, 
        message: "Nhắc nhở: Vui lòng cập nhật tài liệu SRS theo yêu cầu của Giảng viên.",
        severity: "MEDIUM"
      });
    });
    success(`Đã gửi nhắc nhở cho ${overdue.length} nhóm`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Quản lý Tài liệu SRS"
        subtitle="Review, đánh giá và phản hồi các bản đặc tả yêu cầu phần mềm từ sinh viên."
        breadcrumb={["Giảng viên", "Báo cáo", "SRS"]}
        actions={[
          <Button key="alert" onClick={handleSyncAlerts} disabled={isSendingAlert} variant="outline" className="rounded-2xl border-orange-200 text-orange-600 hover:bg-orange-50 h-11 px-6 text-[10px] font-black uppercase tracking-widest transition-all">
            <MessageSquare size={14} className="mr-2" /> Nhắc nhóm trễ hạn
          </Button>,
          <Button key="export" onClick={handleExportCsv} className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-100 border-0 transition-all">
            <Download size={16} className="mr-2" /> Xuất bảng điểm
          </Button>
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Tổng bản nộp" value={srsList.length} icon={FileText} variant="indigo" />
        <StatsCard label="Đang Review" value={srsList.filter(s => s.status === 'REVIEW' || s.status === 'SUBMITTED').length} icon={Eye} variant="info" />
        <StatsCard label="Cần chỉnh sửa" value={srsList.filter(s => s.status === 'NEED_REVISION').length} icon={RefreshCcw} variant="warning" />
        <StatsCard label="Đã hoàn tất" value={srsList.filter(s => s.status === 'FINAL' || s.status === 'APPROVED').length} icon={CheckCheck} variant="success" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-6">
          <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input 
                    placeholder="Tìm tên nhóm, leader..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all" 
                  />
                </div>
                <select 
                  value={courseFilter} 
                  onChange={e => setCourseFilter(e.target.value)}
                  className="h-11 px-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all cursor-pointer"
                >
                  <option value="all">Tất cả lớp</option>
                  {realCourses.map(c => <option key={c.id} value={c.code}>{c.code}</option>)}
                </select>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                {["all", "SUBMITTED", "REVIEW", "NEED_REVISION", "FINAL"].map(status => (
                  <button 
                    key={status} 
                    onClick={() => setStatusFilter(status)}
                    className={`shrink-0 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${statusFilter === status ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-100' : 'bg-white text-gray-400 border-gray-100 hover:border-teal-400 hover:text-teal-600'}`}
                  >
                    {status === 'all' ? 'Tất cả' : STATUS_META[status]?.label}
                  </button>
                ))}
              </div>
            </div>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/30">
                    <tr>
                      <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Dự án & Nhóm</th>
                      <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Version</th>
                      <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Trạng thái</th>
                      <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Điểm</th>
                      <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loadingReports ? (
                      [1,2,3].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="py-8 px-8"><div className="h-4 bg-gray-50 rounded w-full" /></td>
                        </tr>
                      ))
                    ) : filtered.map(item => (
                      <tr 
                        key={item.id} 
                        onClick={() => setSelectedId(item.id)}
                        className={`group cursor-pointer transition-all ${selectedId === item.id ? 'bg-teal-50/30' : 'hover:bg-gray-50/20'}`}
                      >
                        <td className="py-6 px-8">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 group-hover:scale-110 transition-transform"><FileText size={18}/></div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-gray-800 uppercase tracking-tight truncate">{item.teamName}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 truncate max-w-[200px]">{item.projectName}</p>
                              </div>
                           </div>
                        </td>
                        <td className="py-6 px-8 text-center"><span className="text-[11px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 uppercase">V{item.version || '1.0'}</span></td>
                        <td className="py-6 px-8 text-center">
                           <Badge variant="outline" className={`px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest border transition-all ${STATUS_META[item.status]?.color || ''}`}>{STATUS_META[item.status]?.label}</Badge>
                        </td>
                        <td className="py-6 px-8 text-center">
                           <div className="inline-flex items-center gap-1 font-black text-sm text-gray-800 bg-gray-50 px-3 py-1 rounded-xl shadow-inner border border-gray-100">
                              <Star size={12} className="text-amber-400 fill-amber-400" /> {item.score ? item.score.toFixed(1) : '—'}
                           </div>
                        </td>
                        <td className="py-6 px-8 text-right">
                           <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl hover:bg-white shadow-sm border border-transparent hover:border-gray-100 text-gray-400 hover:text-teal-600 transition-all"><Eye size={16}/></Button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center opacity-40">
                          <FileText size={48} className="mx-auto mb-4" />
                          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Không tìm thấy yêu cầu nào</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-4 space-y-8">
          <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white sticky top-8">
            <CardHeader className="border-b border-gray-50 py-6 px-8 flex justify-between items-center">
              <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">Chi tiết thẩm định</CardTitle>
              {selectedSrs?.fileUrl && (
                  <Button variant="outline" onClick={() => window.open(selectedSrs.fileUrl, '_blank')} className="rounded-xl h-9 px-4 text-[9px] font-black uppercase tracking-widest border-teal-100 text-teal-600 hover:bg-teal-50">
                    <ExternalLink size={12} className="mr-1.5" /> Xem File
                  </Button>
              )}
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {!selectedSrs ? (
                <div className="py-20 text-center opacity-30">
                  <Eye size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Chọn một bản nộp để review</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-gray-800 tracking-tighter uppercase leading-tight mb-2">{selectedSrs.teamName}</h3>
                      <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Users size={12}/> {selectedSrs.leaderName}</span>
                        <span className="flex items-center gap-1.5"><CalendarDays size={12}/> {new Date(selectedSrs.submittedAt || selectedSrs.createdAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>

                    <div className="p-5 rounded-[24px] bg-gray-50 border border-gray-100 space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bản đặc tả:</span>
                          <span className="text-[10px] font-black text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-widest">ISO 29148 Standard</span>
                       </div>
                       <p className="text-xs font-bold text-gray-600 leading-relaxed italic">"{selectedSrs.projectName}"</p>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Điểm Review (0-10)</label>
                       <div className="relative">
                          <input 
                            type="number" 
                            step="0.5" 
                            min="0" 
                            max="10" 
                            value={scoreValue}
                            onChange={e => setScoreValue(e.target.value)}
                            className="w-full h-14 rounded-[20px] bg-gray-50 border border-gray-100 px-6 text-base font-black text-amber-600 focus:ring-4 focus:ring-teal-50 focus:border-teal-500 outline-none transition-all pr-12" 
                          />
                          <Star size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 fill-amber-400" />
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phản hồi của Giảng viên</label>
                       <textarea 
                          rows={6}
                          value={feedbackText}
                          onChange={e => setFeedbackText(e.target.value)}
                          placeholder="Nhập nội dung góp ý hoặc lý do yêu cầu sửa đổi..."
                          className="w-full rounded-[24px] bg-gray-50 border border-gray-100 p-6 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-teal-50 focus:border-teal-500 outline-none transition-all resize-none placeholder:text-gray-300"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                       <Button 
                          onClick={() => handleReview("NEED_REVISION")}
                          disabled={reviewMutation.isPending}
                          className="h-16 rounded-[24px] bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-amber-100 border-0 transition-all hover:scale-[1.02] active:scale-95"
                       >
                          Yêu cầu sửa
                       </Button>
                       <Button 
                          onClick={() => handleReview("FINAL")}
                          disabled={reviewMutation.isPending}
                          className="h-16 rounded-[24px] bg-teal-600 hover:bg-teal-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-teal-100 border-0 transition-all hover:scale-[1.02] active:scale-95"
                       >
                          {reviewMutation.isPending ? <RefreshCcw className="animate-spin mr-2" size={14}/> : <CheckCircle size={16} className="mr-2"/>} Duyệt Final
                       </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

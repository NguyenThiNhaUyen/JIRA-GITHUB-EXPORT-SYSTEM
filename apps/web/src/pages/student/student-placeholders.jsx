import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  GitBranch,
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  BookOpen,
  BarChart2,
  Users,
  Activity,
  FileDown,
  FolderKanban,
  Eye,
  RefreshCw,
  Upload,
  FileText,
  Target,
} from "lucide-react";

// Components UI
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

/* ---------------- MOCK DATA ---------------- */
const MOCK_COURSES = [
  { id: "c1", code: "SE113", name: "Software Engineering", lecturer: "Nguyễn Thanh Bình", progress: 76, status: "ACTIVE" },
  { id: "c2", code: "SWD392", name: "SWP Project", lecturer: "Lê Hoàng", progress: 68, status: "ACTIVE" }
];

const MOCK_PROJECTS = [
  { id: "p1", name: "JGT Tool", role: "Leader", repo: "jira-gh-export", jira: "JGT", commits: 24 },
  { id: "p2", name: "CV AI Platform", role: "Member", repo: "jobie-cv", jira: "JOB", commits: 16 }
];

/* ---------------- STUDENT COURSES PAGE ---------------- */
export default function StudentCoursesPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Khóa học của tôi"
        subtitle="Danh sách các lớp học phần bạn đang tham gia trong học kỳ này."
        breadcrumb={["Sinh viên", "Lớp học"]}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Tổng số lớp" value={MOCK_COURSES.length} icon={BookOpen} variant="info" />
        <StatsCard label="Đang hoạt động" value={MOCK_COURSES.length} icon={Target} variant="success" />
        <StatsCard label="Tiến độ TB" value="72%" icon={Activity} variant="warning" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_COURSES.map(c => (
          <Card key={c.id} className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="h-1 bg-teal-500" />
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-teal-600 bg-teal-50 px-2 py-1 rounded-md">{c.code}</span>
                  <h3 className="text-lg font-black text-gray-800 mt-2">{c.name}</h3>
                   <p className="text-xs text-gray-400 font-bold uppercase mt-1">GV: {c.lecturer}</p>
                </div>
                <StatusBadge status="success" label={c.status} variant="success" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                  <span>Tiến độ</span>
                  <span className="text-teal-600">{c.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                   <div className="h-full bg-teal-500" style={{width: `${c.progress}%`}} />
                </div>
              </div>
              <Button className="w-full bg-gray-50 hover:bg-teal-600 hover:text-white text-gray-400 border-0 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest transition-all" onClick={() => navigate("/student/my-project")}>Xem chi tiết lớp</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- STUDENT MY PROJECT PAGE ---------------- */
export function StudentMyProjectPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Dự án của tôi"
        subtitle="Quản lý các nhóm và dự án bạn đang tham gia."
        breadcrumb={["Sinh viên", "Dự án"]}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Dự án tham gia" value={MOCK_PROJECTS.length} icon={FolderKanban} variant="indigo" />
        <StatsCard label="Vai trò Leader" value="1" icon={Users} variant="warning" />
        <StatsCard label="Tổng Commits" value="40" icon={GitBranch} variant="success" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {MOCK_PROJECTS.map(p => (
           <Card key={p.id} className="rounded-[32px] border border-gray-50 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-8 flex items-center justify-between gap-8">
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                       <h3 className="font-black text-gray-800 text-lg uppercase tracking-tight">{p.name}</h3>
                       <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${p.role==='Leader'?'bg-amber-50 text-amber-600 border border-amber-100':'bg-gray-50 text-gray-400 border border-gray-100'}`}>{p.role}</span>
                    </div>
                    <div className="flex gap-4 mt-4">
                       <div><p className="text-[9px] font-black text-gray-300 uppercase mb-1">Repo</p><p className="text-xs font-bold text-gray-700">{p.repo}</p></div>
                       <div><p className="text-[9px] font-black text-gray-300 uppercase mb-1">Jira</p><p className="text-xs font-bold text-gray-700">{p.jira}</p></div>
                    </div>
                 </div>
                 <Button className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-12 px-6 text-[10px] font-black uppercase tracking-widest border-0" onClick={() => navigate(`/student/project/${p.id}`)}>Bảng điều khiển</Button>
              </CardContent>
           </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- STUDENT CONTRIBUTION PAGE ---------------- */
export function StudentContributionPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader title="Đóng góp cá nhân" subtitle="Thống kê các hoạt động commit và task đã hoàn thành." breadcrumb={["Sinh viên", "Đóng góp"]} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {MOCK_PROJECTS.map(p => (
           <Card key={p.id} className="rounded-[32px] border border-gray-50 bg-white p-8">
              <div className="flex justify-between items-end mb-8">
                 <div>
                    <h4 className="font-black text-gray-800 text-base uppercase tracking-widest">{p.name}</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">Sự đóng góp của bạn</p>
                 </div>
                 <div className="text-right">
                    <p className="text-3xl font-black text-teal-600">{p.commits}</p>
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Commits</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="text-gray-400">Hạng trong nhóm</span>
                    <span className="text-indigo-600">#1 / 5</span>
                 </div>
                 <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500" style={{width: '80%'}} />
                 </div>
              </div>
           </Card>
         ))}
      </div>
    </div>
  );
}

/* ---------------- STUDENT ALERTS PAGE ---------------- */
export function StudentAlertsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader title="Thông báo & Cảnh báo" subtitle="Các nhắc nhở về tiến độ từ hệ thống và Giảng viên." breadcrumb={["Sinh viên", "Cảnh báo"]} />
      <Card className="rounded-[32px] border border-gray-50 bg-white overflow-hidden">
         <CardContent className="p-0 divide-y divide-gray-50">
            <div className="p-8 flex gap-6 hover:bg-gray-50/50 transition-all">
               <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shrink-0"><AlertTriangle size={24}/></div>
               <div>
                  <h4 className="font-black text-gray-800 text-sm uppercase tracking-widest">Tiến độ thấp</h4>
                  <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">Nhóm Alpha chưa có commit nào trong 3 ngày qua. Vui lòng cập nhật tiến độ trước buổi review.</p>
                  <p className="text-[9px] font-black text-gray-300 uppercase mt-2">2 giờ trước</p>
               </div>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- STUDENT SRS PAGE ---------------- */
export function StudentSrsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader title="Tài liệu SRS" subtitle="Nộp và theo dõi trạng thái phê duyệt tài liệu SRS." breadcrumb={["Sinh viên", "SRS"]} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <Card className="xl:col-span-2 rounded-[32px] border border-gray-50 bg-white overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50"><CardTitle className="text-base font-black uppercase tracking-widest">Lịch sử nộp bài</CardTitle></CardHeader>
            <CardContent className="p-0">
               <div className="p-8 flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                     <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600"><FileText size={20}/></div>
                     <div><p className="text-sm font-black text-gray-800 uppercase">SRS_Final_v1.pdf</p><p className="text-[10px] text-gray-400 font-bold uppercase">Nộp lúc: 12/03/2026</p></div>
                  </div>
                  <StatusBadge status="warning" label="Đang chờ duyệt" variant="warning" />
               </div>
            </CardContent>
         </Card>
         <Card className="rounded-[32px] border-0 bg-teal-600 text-white p-8">
            <h4 className="font-black uppercase tracking-widest mb-4">Nộp tài liệu mới</h4>
            <p className="text-xs text-teal-100 leading-relaxed mb-8">Vui lòng kiểm tra kỹ định dạng file (.pdf) trước khi nộp. Mọi thay đổi sau khi nộp sẽ được lưu thành version mới.</p>
            <Button className="w-full h-14 bg-white text-teal-600 hover:bg-teal-50 rounded-2xl font-black uppercase tracking-widest border-0">Chọn File & Nộp</Button>
         </Card>
      </div>
    </div>
  );
}
import {
 FileText,
 Eye,
 MessageSquare,
 RefreshCcw,
 CheckCheck,
 Download,
 Star
} from"lucide-react";

// Components UI
import { CardContent } from"@/components/ui/Card.jsx";
import { Button } from"@/components/ui/Button.jsx";
import { Badge } from"@/components/ui/Badge.jsx";

// Shared Components
import { PageHeader } from"@/components/shared/PageHeader.jsx";
import { StatsCard } from"@/components/shared/StatsCard.jsx";

// Local Components
import { SrsListTable } from"@/pages/lecturer/components/SrsReports/SrsListTable.jsx";
import { SrsReviewPanel } from"@/pages/lecturer/components/SrsReports/SrsReviewPanel.jsx";

// Hooks
import { useSrsReports } from"./hooks/useSrsReports.js";

export default function SrsReports() {
 const {
 setSelectedId,
 search, setSearch,
 statusFilter, setStatusFilter,
 courseFilter, setCourseFilter,
 feedbackText, setFeedbackText,
 scoreValue, setScoreValue,
 realCourses,
 srsList,
 filtered,
 selectedSrs,
 loadingReports,
 isSendingAlert,
 reviewMutation,
 handleReview,
 handleExportCsv,
 handleSyncAlerts,
 STATUS_META
 } = useSrsReports();

 return (
 <div className="space-y-8 animate-in fade-in duration-500">
 <PageHeader
 title="Quản lý Tài liệu SRS"
 subtitle="Review, đánh giá và phản hồi các bản đặc tả yêu cầu phần mềm từ sinh viên."
 breadcrumb={["Giảng viên","Báo cáo","SRS"]}
 actions={[
 <Button key="alert" onClick={handleSyncAlerts} disabled={isSendingAlert} variant="outline" className="rounded-2xl border-orange-200 text-orange-600 hover:bg-orange-50 h-11 px-6 text-[10px] font-black transition-all">
 <MessageSquare size={14} className="mr-2" /> Nhắc nhóm trễ hạn
 </Button>,
 <Button key="export" onClick={handleExportCsv} className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-8 text-[10px] font-black shadow-lg shadow-teal-100 border-0 transition-all">
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
 <SrsListTable
 loadingReports={loadingReports}
 filtered={filtered}
 selectedId={selectedSrs?.id}
 setSelectedId={setSelectedId}
 search={search}
 setSearch={setSearch}
 courseFilter={courseFilter}
 setCourseFilter={setCourseFilter}
 statusFilter={statusFilter}
 setStatusFilter={setStatusFilter}
 realCourses={realCourses}
 STATUS_META={STATUS_META}
 FileText={FileText}
 Badge={Badge}
 Eye={Eye}
 Star={Star}
 Button={Button}
 CardContent={CardContent}
 />

 <SrsReviewPanel
 selectedSrs={selectedSrs}
 feedbackText={feedbackText}
 setFeedbackText={setFeedbackText}
 scoreValue={scoreValue}
 setScoreValue={setScoreValue}
 handleReview={handleReview}
 reviewMutation={reviewMutation}
 />
 </div>
 </div>
 );
}







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
 title="Quáº£n lĂ½ TĂ i liá»‡u SRS"
 subtitle="Review, Ä‘Ă¡nh giĂ¡ vĂ  pháº£n há»“i cĂ¡c báº£n Ä‘áº·c táº£ yĂªu cáº§u pháº§n má»m tá»« sinh viĂªn."
 breadcrumb={["Giáº£ng viĂªn","BĂ¡o cĂ¡o","SRS"]}
 actions={[
 <Button key="alert" onClick={handleSyncAlerts} disabled={isSendingAlert} variant="outline" className="rounded-2xl border-orange-200 text-orange-600 hover:bg-orange-50 h-11 px-6 text-[10px] font-black transition-all">
 <MessageSquare size={14} className="mr-2" /> Nháº¯c nhĂ³m trá»… háº¡n
 </Button>,
 <Button key="export" onClick={handleExportCsv} className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-8 text-[10px] font-black shadow-lg shadow-teal-100 border-0 transition-all">
 <Download size={16} className="mr-2" /> Xuáº¥t báº£ng Ä‘iá»ƒm
 </Button>
 ]}
 />

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <StatsCard label="Tá»•ng báº£n ná»™p" value={srsList.length} icon={FileText} variant="indigo" />
 <StatsCard label="Äang Review" value={srsList.filter(s => s.status === 'REVIEW' || s.status === 'SUBMITTED').length} icon={Eye} variant="info" />
 <StatsCard label="Cáº§n chá»‰nh sá»­a" value={srsList.filter(s => s.status === 'NEED_REVISION').length} icon={RefreshCcw} variant="warning" />
 <StatsCard label="ÄĂ£ hoĂ n táº¥t" value={srsList.filter(s => s.status === 'FINAL' || s.status === 'APPROVED').length} icon={CheckCheck} variant="success" />
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


import {
 Activity,
 Users,
 GitBranch,
 AlertTriangle,
 Download,
 ArrowLeft
} from"lucide-react";

import { Button } from"@/components/ui/Button.jsx";
import { PageHeader } from"@/components/shared/PageHeader.jsx";
import { StatsCard } from"@/components/shared/StatsCard.jsx";
import { Skeleton } from"@/components/ui/Skeleton.jsx";

// Local Components
import { ActivityHeatmap } from"@/pages/lecturer/components/CourseAnalytics/ActivityHeatmap.jsx";
import { ContributionTrends } from"@/pages/lecturer/components/CourseAnalytics/ContributionTrends.jsx";
import { JiraTaskDistribution } from"@/pages/lecturer/components/CourseAnalytics/JiraTaskDistribution.jsx";
import { TeamAnalyticsSummary } from"@/pages/lecturer/components/CourseAnalytics/TeamAnalyticsSummary.jsx";

// Hooks
import { useCourseAnalytics } from"./hooks/useCourseAnalytics.js";

export default function CourseAnalytics() {
 const {
 courseId,
 navigate,
 success,
 course,
 heatmapData,
 courseInactiveTeams,
 courseRankings,
 chartData,
 jiraData,
 integrationStats,
 loading
 } = useCourseAnalytics();

 if (loading) {
 return (
 <div className="space-y-8 p-8">
 <Skeleton className="h-20 w-3/4 rounded-2xl" />
 <div className="grid grid-cols-4 gap-4">
 {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-[24px]" />)}
 </div>
 <div className="grid grid-cols-12 gap-8">
 <Skeleton className="col-span-12 h-64 rounded-[40px]" />
 <Skeleton className="col-span-8 h-96 rounded-[40px]" />
 <Skeleton className="col-span-4 h-96 rounded-[40px]" />
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-8 animate-in fade-in duration-500">
 <PageHeader
 title="BĂ¡o cĂ¡o PhĂ¢n tĂ­ch"
 subtitle={course ? `Lá»›p: ${course.code} â€” ${course.name}. Dá»¯ liá»‡u heatmap & xu hÆ°á»›ng tá»« GitHub.` :"Tá»•ng quan vá» hiá»‡u suáº¥t vĂ  tiáº¿n Ä‘á»™ cá»§a toĂ n lá»›p."}
 breadcrumb={["Giáº£ng viĂªn","Thá»‘ng kĂª", course?.code ||"Lá»›p há»c"]}
 actions={[
 <Button key="back" variant="outline" onClick={() => navigate(-1)} className="rounded-2xl h-11 px-6 text-[10px] font-black border-gray-100 hover:bg-gray-50 shadow-sm">
 <ArrowLeft size={14} className="mr-2" /> Quay láº¡i
 </Button>,
 <Button key="export" onClick={() => success("TĂ­nh nÄƒng nĂ y Ä‘ang Ä‘Æ°á»£c phĂ¡t triá»ƒn...")} className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-8 text-[10px] font-black shadow-xl shadow-teal-100 border-0 transition-all">
 <Download size={16} className="mr-2" /> Xuáº¥t bĂ¡o cĂ¡o PDF
 </Button>
 ]}
 />

 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <StatsCard label="NhĂ³m dá»± Ă¡n" value={course?.projectsCount || 0} icon={Users} variant="info" />
 <StatsCard label="Tá»•ng sinh viĂªn" value={course?.currentStudents || 0} icon={Activity} variant="success" />
 <StatsCard label="Tá»· lá»‡ káº¿t ná»‘i" value={`${Math.round(((courseRankings.length || 0) / (course?.projectsCount || 1)) * 100)}%`} icon={GitBranch} variant="indigo" />
 <StatsCard label="Cáº§n chĂº Ă½" value={courseInactiveTeams.length || 0} icon={AlertTriangle} variant="danger" />
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
 <ActivityHeatmap heatmapData={heatmapData} />
 <ContributionTrends chartData={chartData} />
 <JiraTaskDistribution jiraData={jiraData} integrationStats={integrationStats} />
 </div>

 <TeamAnalyticsSummary
 courseRankings={courseRankings}
 courseInactiveTeams={courseInactiveTeams}
 navigate={navigate}
 />
 </div>
 );
}

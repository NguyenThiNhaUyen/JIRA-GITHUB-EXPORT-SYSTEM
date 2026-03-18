import { Download } from"lucide-react";

// Components Shared
import { PageHeader } from"@/components/shared/PageHeader.jsx";
import { InputField } from"@/components/shared/FormFields.jsx";
import { useToast } from"@/components/ui/Toast.jsx";
import { Button } from"@/components/ui/Button.jsx";
import { Card } from"@/components/ui/Card.jsx";

// Local Sub-components (Feature)
import { ContributionStats } from"@/features/lecturer/components/contributions/ContributionStats.jsx";
import { StudentContributionTable } from"@/features/lecturer/components/contributions/StudentContributionTable.jsx";
import { WeeklyActivityChart } from"@/features/lecturer/components/contributions/WeeklyActivityChart.jsx";

// Local Components (Refactored)
import { TopContributors } from"@/pages/lecturer/components/contributions/TopContributors.jsx";

// Hooks
import { useContributions } from"./hooks/useContributions.js";

export default function Contributions() {
 const { success } = useToast();
 const {
 selectedCourse, setSelectedCourse,
 search, setSearch,
 courses,
 loading,
 filteredStudents,
 weeklyCommits,
 stats
 } = useContributions();

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-20 gap-4">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
 <p className="text-gray-500 font-black text-xs">Äang táº£i dá»¯ liá»‡u Ä‘Ă³ng gĂ³p...</p>
 </div>
 );
 }

 return (
 <div className="space-y-8 animate-in fade-in duration-500">
 <PageHeader
 title="Theo dĂµi ÄĂ³ng gĂ³p"
 subtitle="PhĂ¢n tĂ­ch chi tiáº¿t ná»— lá»±c cĂ¡ nhĂ¢n cá»§a sinh viĂªn qua Commits, Pull Requests vĂ  Code Reviews."
 breadcrumb={["Giáº£ng viĂªn","ÄĂ³ng gĂ³p"]}
 actions={[
 <Button key="export" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-6 text-xs font-black border-0 shadow-lg shadow-teal-100">
 <Download size={16} className="mr-2" /> Xuáº¥t bĂ¡o cĂ¡o
 </Button>
 ]}
 />

 <ContributionStats
 totalCommits={stats.totalCommits}
 activeStudents={stats.activeStudents}
 avgScore={stats.avgScore}
 totalPRs={stats.totalPRs}
 totalReviews={stats.totalReviews}
 riskGroupsCount={stats.riskGroupsCount}
 />

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2">
 <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
 <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <h3 className="text-sm font-black text-gray-800 leading-none">Chi tiáº¿t sinh viĂªn</h3>
 <div className="flex items-center gap-3">
 <select
 className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-black text-gray-500 outline-none focus:ring-2 focus:ring-teal-100"
 value={selectedCourse}
 onChange={(e) => setSelectedCourse(e.target.value)}
 >
 {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
 </select>
 <div className="w-64">
 <InputField
 placeholder="TĂ¬m sinh viĂªn, nhĂ³m..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 size="sm"
 />
 </div>
 </div>
 </div>
 <StudentContributionTable
 students={filteredStudents}
 onWarning={(s) => success(`ÄĂ£ gá»­i cáº£nh bĂ¡o tá»›i ${s.name}`)}
 />
 </Card>
 </div>

 <div className="space-y-8">
 <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white p-8">
 <h3 className="text-sm font-black text-gray-800 mb-6 leading-none">Hoáº¡t Ä‘á»™ng trong tuáº§n</h3>
 <WeeklyActivityChart weeklyCommits={weeklyCommits} />
 </Card>

 <TopContributors students={filteredStudents} />
 </div>
 </div>
 </div>
 );
}


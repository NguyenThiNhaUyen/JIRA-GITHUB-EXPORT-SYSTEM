import { useParams, useNavigate } from"react-router-dom";
import { Button } from"@/components/ui/Button.jsx";
import {
 useGetProjectById,
 useGetProjectCfd,
 useGetProjectCycleTime,
 useGetProjectAgingWip
} from"@/features/projects/hooks/useProjects.js";
import { useGroupActions } from"./hooks/useGroupActions.js";

// Chart & Tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/Interactive.jsx";
import { CfdChart } from"@/components/charts/CfdChart.jsx";
import { CycleTimeChart } from"@/components/charts/CycleTimeChart.jsx";

// Components
import { PageHeader } from"@/components/shared/PageHeader.jsx";
import { StatsCard } from"@/components/shared/StatsCard.jsx";
import { GroupMembers } from"@/pages/lecturer/components/GroupDetail/GroupMembers.jsx";
import { GroupIntegrations } from"@/pages/lecturer/components/GroupDetail/GroupIntegrations.jsx";
import { GroupExport } from"@/pages/lecturer/components/GroupDetail/GroupExport.jsx";
import { AgingWipTable } from"@/pages/lecturer/components/GroupDetail/AgingWipTable.jsx";

import { ArrowLeft, GitBranch, BookOpen, Users, Calendar, Activity } from"lucide-react";

export default function GroupDetail() {
 const { groupId } = useParams();
 const navigate = useNavigate();

 // 1. Data Fetching
 const { data: group, isLoading, isError } = useGetProjectById(groupId);
 const students = group?.team || [];

 // 2. Actions & Logic
 const {
 handleApproveLink,
 handleRejectLink,
 handleUpdateScore,
 handleExportCsv,
 handleExportSrs,
 handleSendAlert,
 isGeneratingSrs,
 isSendingAlert
 } = useGroupActions(groupId);

 // 3. Analytics Hooks
 const { data: cfdData, isLoading: loadingCfd } = useGetProjectCfd(groupId);
 const { data: cycleTimeData, isLoading: loadingCycleTime } = useGetProjectCycleTime(groupId);
 const { data: agingWipData, isLoading: loadingAgingWip } = useGetProjectAgingWip(groupId);

 if (isLoading) {
 return (
 <div className="flex flex-col h-64 items-center justify-center gap-4">
 <Activity className="animate-spin text-teal-600 h-10 w-10" />
 <span className="text-gray-500 font-bold text-[10px]">Đang tải dữ liệu từ API...</span>
 </div>
 );
 }

 if (isError || !group) {
 return (
 <div className="flex flex-col h-64 items-center justify-center gap-4">
 <p className="text-red-500 font-black text-xs">Cảnh báo: Không thể tải dữ liệu nhóm</p>
 <Button onClick={() => navigate("/lecturer/my-courses")} variant="outline" className="rounded-2xl border-gray-100 text-[10px] font-black h-11 px-6">Trở về bảng tin</Button>
 </div>
 );
 }
 const course = group.course;

 const githubApproved = group.integration?.githubStatus ==="APPROVED";
 const jiraApproved = group.integration?.jiraStatus ==="APPROVED";

 return (
 <div className="space-y-8 animate-in fade-in duration-500">
 <PageHeader
 title={group.name}
 subtitle={`${course?.code || ''} — ${course?.name || ''}. Quản lý trạng thái và thành viên của nhóm dự án.`}
 breadcrumb={["Giảng viên","Nhóm", group.name]}
 actions={[
 <Button
 key="back"
 variant="outline"
 onClick={() => navigate(-1)}
 className="rounded-2xl h-11 px-6 text-[10px] font-black border-gray-100 hover:bg-gray-50 shadow-sm"
 >
 <ArrowLeft size={14} className="mr-2" /> Quay lại
 </Button>
 ]}
 />

 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <StatsCard label="Thành viên" value={students.length} icon={Users} variant="info" />
 <StatsCard label="GitHub" value={githubApproved ?"Ổn định" :"Chờ duyệt"} icon={GitBranch} variant={githubApproved ?"success" :"warning"} />
 <StatsCard label="Jira" value={jiraApproved ?"Ổn định" :"Chờ duyệt"} icon={BookOpen} variant={jiraApproved ?"success" :"warning"} />
 <StatsCard label="Ngày tạo" value={group.createdAt ? new Date(group.createdAt).toLocaleDateString("vi-VN") :"N/A"} icon={Calendar} variant="indigo" />
 </div>

 <Tabs defaultValue="overview" className="space-y-8">
 <TabsList className="bg-transparent border-0 p-0 flex gap-4 h-auto">
 <TabsTrigger value="overview" className="h-12 px-8 rounded-2xl text-[10px] font-black border-0 data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-400 transition-all shadow-sm">
 Tổng quan & Thành viên
 </TabsTrigger>
 <TabsTrigger value="analytics" className="h-12 px-8 rounded-2xl text-[10px] font-black border-0 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-400 transition-all shadow-sm">
 Phân tích Jira chuyên sâu
 </TabsTrigger>
 </TabsList>

 <TabsContent value="overview">
 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
 <GroupMembers
 group={group}
 students={students}
 handleUpdateScore={handleUpdateScore}
 />

 {/* Right Column: Links & Controls */}
 <div className="lg:col-span-3 space-y-8">
 <GroupIntegrations
 group={group}
 handleApproveLink={handleApproveLink}
 handleRejectLink={handleRejectLink}
 />

 <GroupExport
 group={group}
 students={students}
 handleExportCsv={handleExportCsv}
 handleExportSrs={handleExportSrs}
 handleSendAlert={handleSendAlert}
 isGeneratingSrs={isGeneratingSrs}
 isSendingAlert={isSendingAlert}
 />
 </div>
 </div>
 </TabsContent>

 <TabsContent value="analytics" className="space-y-8">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 <CfdChart data={cfdData?.data || cfdData || []} isLoading={loadingCfd} />
 <CycleTimeChart data={cycleTimeData} isLoading={loadingCycleTime} />
 </div>

 <AgingWipTable
 agingWipData={agingWipData}
 loadingAgingWip={loadingAgingWip}
 />
 </TabsContent>
 </Tabs>
 </div>
 );
}







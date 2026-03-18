import { ArrowLeft, Download, Activity } from"lucide-react";

// Components UI
import { Button } from"@/components/ui/Button.jsx";
import { useToast } from"@/components/ui/Toast.jsx";

// Shared Components
import { PageHeader } from"@/components/shared/PageHeader.jsx";

// Local Components
import { GroupOverviewStats } from"@/pages/lecturer/components/ManageGroups/GroupOverviewStats.jsx";
import { GroupCreationPanel } from"@/pages/lecturer/components/ManageGroups/GroupCreationPanel.jsx";
import { GroupListPanel } from"@/pages/lecturer/components/ManageGroups/GroupListPanel.jsx";
import { ForceAddModal } from"@/pages/lecturer/components/ManageGroups/ForceAddModal.jsx";

// Hooks
import { useManageGroups } from"./hooks/useManageGroups.js";

export default function ManageGroups() {
 const { success } = useToast();
 const {
 course,
 students,
 groups,
 availableStudents,
 loadingCourse,
 loadingStudents,
 loadingProjects,
 isBusy,
 selectedStudents,
 setSelectedStudents,
 newGroupTopic,
 setNewGroupTopic,
 groupSearch,
 setGroupSearch,
 groupFilter,
 setGroupFilter,
 autoGroupSize,
 setAutoGroupSize,
 showForceAddModal,
 setShowForceAddModal,
 forceAddSelectedIds,
 setForceAddSelectedIds,
 groupsWithMetrics,
 visibleGroups,
 handleCreateGroup,
 handleAutoCreateGroups,
 handleDeleteGroup,
 handleOpenForceAdd,
 handleForceAddSubmit,
 navigate
 } = useManageGroups();

 if (loadingCourse || loadingStudents || loadingProjects) {
 return (
 <div className="flex flex-col h-64 items-center justify-center gap-4">
 <Activity className="animate-spin text-teal-600 h-10 w-10" />
 <span className="text-gray-500 font-bold text-[10px]">Äang Ä‘á»“ng bá»™ dá»¯ liá»‡u lá»›p há»c...</span>
 </div>
 );
 }

 return (
 <div className="space-y-8 animate-in fade-in duration-500">
 <PageHeader
 title={`Quáº£n lĂ½ NhĂ³m: ${course?.code ||""}`}
 subtitle={`Äiá»u phá»‘i vĂ  giĂ¡m sĂ¡t ${groups.length} nhĂ³m dá»± Ă¡n trong lá»›p ${course?.name ||""}.`}
 breadcrumb={["Giáº£ng viĂªn","Lá»›p há»c","Quáº£n lĂ½ nhĂ³m"]}
 actions={[
 <Button key="back" variant="outline" onClick={() => navigate("/lecturer/my-courses")} className="rounded-2xl h-11 px-6 text-[10px] font-black border-gray-100 hover:bg-gray-50"><ArrowLeft size={14} className="mr-2" /> Quay láº¡i</Button>,
 <Button key="export" variant="outline" onClick={() => success("Export success")} className="rounded-2xl h-11 px-6 text-[10px] font-black border-gray-100 hover:bg-gray-50"><Download size={14} className="mr-2" /> Xuáº¥t CSV</Button>
 ]}
 />

 <GroupOverviewStats
 studentsLength={students.length}
 availableStudentsLength={availableStudents.length}
 groupsLength={groups.length}
 groupsWithMetrics={groupsWithMetrics}
 />

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <GroupCreationPanel
 newGroupTopic={newGroupTopic}
 setNewGroupTopic={setNewGroupTopic}
 selectedStudents={selectedStudents}
 setSelectedStudents={setSelectedStudents}
 availableStudents={availableStudents}
 handleCreateGroup={handleCreateGroup}
 isBusy={isBusy}
 autoGroupSize={autoGroupSize}
 setAutoGroupSize={setAutoGroupSize}
 handleAutoCreateGroups={handleAutoCreateGroups}
 />

 <GroupListPanel
 groupSearch={groupSearch}
 setGroupSearch={setGroupSearch}
 groupFilter={groupFilter}
 setGroupFilter={setGroupFilter}
 groupsWithMetrics={groupsWithMetrics}
 visibleGroups={visibleGroups}
 navigate={navigate}
 handleDeleteGroup={handleDeleteGroup}
 handleOpenForceAdd={handleOpenForceAdd}
 isBusy={isBusy}
 />
 </div>

 <ForceAddModal
 isOpen={showForceAddModal}
 onClose={() => setShowForceAddModal(false)}
 availableStudents={availableStudents}
 forceAddSelectedIds={forceAddSelectedIds}
 setForceAddSelectedIds={setForceAddSelectedIds}
 handleForceAddSubmit={handleForceAddSubmit}
 />
 </div>
 );
}

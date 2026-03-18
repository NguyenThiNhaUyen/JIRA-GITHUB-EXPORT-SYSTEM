import { useNavigate } from "react-router-dom";
import {
  Bell,
  ShieldAlert,
  Activity,
  LayoutList
} from "lucide-react";

// Components
import { Button } from "@/components/ui/Button.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { PageHeader } from "@/components/shared/PageHeader.jsx";
import { LecturerStats } from "@/features/dashboard/components/LecturerStats.jsx";
import { LecturerFilters } from "@/features/dashboard/components/LecturerFilters.jsx";
import { SendAlertModal } from "@/features/dashboard/components/SendAlertModal.jsx";

// Local Components
import { ActivityFeed } from "@/pages/lecturer/components/LecturerDashboard/ActivityFeed.jsx";
import { SystemAlerts } from "@/pages/lecturer/components/LecturerDashboard/SystemAlerts.jsx";
import { IntegrationApproval } from "@/pages/lecturer/components/LecturerDashboard/IntegrationApproval.jsx";
import { GroupTrackingTable } from "@/pages/lecturer/components/LecturerDashboard/GroupTrackingTable.jsx";
import { RadarPerformanceMap } from "@/pages/lecturer/components/LecturerDashboard/RadarPerformanceMap.jsx";

// Hooks
import { useLecturerDashboard } from "./hooks/useLecturerDashboard.js";

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const { success } = useToast();
  const {
    user,
    selectedCourse, setSelectedCourse,
    selectedSubject, setSelectedSubject,
    filter, setFilter,
    isAlertModalOpen, setIsAlertModalOpen,
    subjects,
    courses,
    course,
    loadingCourse,
    alertsList,
    radarData,
    activities,
    loadingLogs,
    pendingIntegrations,
    groups,
    stats,
    handleApprovePending,
    handleResolveAlert
  } = useLecturerDashboard();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Dashboard Giảng viên"
        subtitle={`Chào mừng trở lại, ${user?.name || 'Giảng viên'}! Dưới đây là tình hình chuyên môn các lớp học.`}
        breadcrumb={["Giảng viên", "Hệ thống", "Tổng quan"]}
        actions={[
          <Button key="alerts" variant="outline" className="rounded-full w-10 h-10 p-0 border-gray-100 relative" onClick={() => navigate("/lecturer/alerts")}>
            <Bell size={18} />
            {alertsList.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>}
          </Button>,
          <Button key="send-alert" onClick={() => setIsAlertModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100 border-0 transition-all">
            <ShieldAlert size={16} className="mr-2" /> Phát cảnh báo
          </Button>
        ]}
      />

      <LecturerStats stats={stats} />

      <LecturerFilters
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        filter={filter}
        setFilter={setFilter}
        subjects={subjects}
        courses={courses}
        onManageGroups={() => navigate(`/lecturer/course/${selectedCourse}/manage-groups`)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ActivityFeed activities={activities} loadingLogs={loadingLogs} />

        <div className="space-y-8">
          <SystemAlerts
            alertsList={alertsList}
            handleResolveAlert={handleResolveAlert}
            onNavigate={() => navigate("/lecturer/alerts")}
          />

          <IntegrationApproval
            pendingIntegrations={pendingIntegrations}
            handleApprovePending={handleApprovePending}
          />
        </div>
      </div>

      {selectedCourse && groups.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GroupTrackingTable
            groups={groups}
            navigate={navigate}
            success={success}
          />

          <RadarPerformanceMap
            radarData={radarData}
            alertsCount={alertsList.length}
          />
        </div>
      )}

      {(!selectedCourse || groups.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 gap-6 opacity-40">
          <div className="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center shadow-inner border border-gray-100">
            <LayoutList size={40} className="text-gray-300" />
          </div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Khởi tạo không gian làm việc bằng cách chọn Lớp học</p>
        </div>
      )}

      <SendAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        groups={groups}
      />
    </div>
  );
}







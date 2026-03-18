import { RefreshCw, Plus } from "lucide-react";

// Components UI
import { Button } from "../components/ui/Button.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { SendAlertModal } from "../../features/dashboard/components/SendAlertModal.jsx";

// Local Components
import { AlertStats } from "./components/alerts/AlertStats.jsx";
import { AlertFilters } from "./components/alerts/AlertFilters.jsx";
import { AlertList } from "./components/alerts/AlertList.jsx";
import { AlertRiskAnalysis } from "./components/alerts/AlertRiskAnalysis.jsx";

// Hooks
import { useAlertActions } from "./hooks/useAlertActions.js";

export default function Alerts() {
  const {
    filter, setFilter,
    search, setSearch,
    selectedId, setSelectedId,
    remindedIds,
    isAlertModalOpen, setIsAlertModalOpen,
    alertsList, filtered, selectedAlert,
    isLoading, resolving, refetch,
    allGroups,
    handleResolve, handleRemind,
    now
  } = useAlertActions();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Trung tâm Cảnh báo"
        subtitle="Phát hiện và xử lý sớm các rủi ro về tiến độ, đóng góp của sinh viên và nhóm dự án."
        breadcrumb={["Giảng viên", "Cảnh báo"]}
        actions={[
          <Button key="refresh" variant="outline" onClick={() => refetch()} className="rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest border-gray-200">
            <RefreshCw size={14} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Làm mới dữ liệu
          </Button>,
          <Button key="send" onClick={() => setIsAlertModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-11 px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100 border-0 transition-all">
            <Plus size={16} className="mr-2" /> Phát cảnh báo mới
          </Button>
        ]}
      />

      {/* Stats */}
      <AlertStats 
        alertsList={alertsList} 
        remindedCount={remindedIds.size} 
        now={now}
      />

      {/* Filter Bar */}
      <AlertFilters
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <AlertList
          isLoading={isLoading}
          filtered={filtered}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          handleRemind={handleRemind}
          handleResolve={handleResolve}
          resolving={resolving}
          remindedIds={remindedIds}
        />

        <AlertRiskAnalysis 
          selectedAlert={selectedAlert} 
          onRemind={handleRemind}
          remindedIds={remindedIds}
        />
      </div>

      <SendAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        groups={allGroups}
      />
    </div>
  );
}

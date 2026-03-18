import { RefreshCw, Plus } from"lucide-react";

// Components UI
import { Button } from"@/components/ui/Button.jsx";

// Shared Components
import { PageHeader } from"@/components/shared/PageHeader.jsx";
import { SendAlertModal } from"@/features/dashboard/components/SendAlertModal.jsx";

// Local Components
import { AlertStats } from"@/pages/lecturer/components/alerts/AlertStats.jsx";
import { AlertFilters } from"@/pages/lecturer/components/alerts/AlertFilters.jsx";
import { AlertList } from"@/pages/lecturer/components/alerts/AlertList.jsx";
import { AlertRiskAnalysis } from"@/pages/lecturer/components/alerts/AlertRiskAnalysis.jsx";

// Hooks
import { useAlertActions } from"./hooks/useAlertActions.js";

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
 title="Trung tĂ¢m Cáº£nh bĂ¡o"
 subtitle="PhĂ¡t hiá»‡n vĂ  xá»­ lĂ½ sá»›m cĂ¡c rá»§i ro vá» tiáº¿n Ä‘á»™, Ä‘Ă³ng gĂ³p cá»§a sinh viĂªn vĂ  nhĂ³m dá»± Ă¡n."
 breadcrumb={["Giáº£ng viĂªn","Cáº£nh bĂ¡o"]}
 actions={[
 <Button key="refresh" variant="outline" onClick={() => refetch()} className="rounded-2xl h-11 px-6 text-[10px] font-black border-gray-200">
 <RefreshCw size={14} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} /> LĂ m má»›i dá»¯ liá»‡u
 </Button>,
 <Button key="send" onClick={() => setIsAlertModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-11 px-8 text-[10px] font-black shadow-lg shadow-red-100 border-0 transition-all">
 <Plus size={16} className="mr-2" /> PhĂ¡t cáº£nh bĂ¡o má»›i
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


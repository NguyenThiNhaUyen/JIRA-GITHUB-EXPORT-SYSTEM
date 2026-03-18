import { BarChart2, CheckCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card.jsx";

export function ProjectKpiSidebar({ metrics, isSyncing }) {
    return (
        <Card className="border-0 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] rounded-[56px] bg-white p-14 overflow-hidden relative glass-card group hover:shadow-2xl transition-all duration-700">
            <div className="absolute right-0 top-0 w-64 h-64 bg-teal-50/40 rounded-full blur-[100px] -mr-32 -mt-32 opacity-60 pointer-events-none group-hover:opacity-100 transition-opacity" />
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-50/20 rounded-full blur-[100px] -ml-32 -mb-32 opacity-40 pointer-events-none group-hover:opacity-80 transition-opacity" />
            
            <h4 className="text-[12px] font-black text-gray-300 uppercase tracking-[0.4em] mb-12 relative flex items-center justify-between">
                <span>PROJECT KPI SUMMARY</span>
                {isSyncing && <RefreshCw size={14} className="animate-spin text-teal-500" />}
            </h4>
            
            <div className="space-y-12 relative">
                <div className="p-8 rounded-[40px] bg-gray-50/50 border border-gray-100 flex flex-col gap-6 group/item hover:bg-white hover:shadow-2xl transition-all hover:-translate-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black text-teal-600 uppercase tracking-[0.2em] bg-teal-50 px-4 py-1.5 rounded-full border border-teal-100 shadow-sm">Total Commits</span>
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-teal-400 group-hover/item:text-teal-600 group-hover/item:rotate-12 transition-all">
                             <BarChart2 size={24} />
                        </div>
                    </div>
                    <div>
                        <p className="text-6xl font-black text-gray-800 tracking-tighter leading-none mb-4 font-display">{metrics?.totalCommits || 0}</p>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                             <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full shadow-lg shadow-teal-100" style={{ width: '60%' }} />
                        </div>
                    </div>
                </div>

                <div className="p-8 rounded-[40px] bg-gray-50/50 border border-gray-100 flex flex-col gap-6 group/item hover:bg-white hover:shadow-2xl transition-all hover:-translate-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100 shadow-sm">Merged PRs</span>
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-400 group-hover/item:text-indigo-600 group-hover/item:rotate-12 transition-all">
                             <CheckCircle size={24} />
                        </div>
                    </div>
                    <div>
                        <p className="text-6xl font-black text-gray-800 tracking-tighter leading-none mb-4 font-display">{metrics?.totalPrs || 0}</p>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                             <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full shadow-lg shadow-indigo-100" style={{ width: '40%' }} />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

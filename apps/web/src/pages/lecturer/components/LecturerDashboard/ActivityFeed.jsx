import { Activity, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";

export function ActivityFeed({ activities, loadingLogs }) {
  return (
    <Card className="lg:col-span-2 shadow-sm rounded-[32px] overflow-hidden bg-white border border-gray-100">
      <CardHeader className="py-6 px-8 flex items-center justify-between border-b border-gray-50 bg-gray-50/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-100">
            <Activity size={18} className="text-white" />
          </div>
          <CardTitle className="font-display">Dòng hoạt động thời gian thực</CardTitle>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-pulse">
          <Zap size={10} fill="currentColor" />
          <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loadingLogs ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <Activity size={40} strokeWidth={1} className="mx-auto mb-4 text-gray-400" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Chưa có hoạt động ghi nhận</p>
          </div>
        ) : activities.map((act, idx) => (
          <div key={act.id || idx} className="flex items-start gap-5 px-8 py-6 border-b border-gray-50 hover:bg-teal-50/10 transition-all duration-300 last:border-0 group">
            <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${act.color}`}>
              <act.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gray-800 leading-snug tracking-tight group-hover:text-teal-700 transition-colors uppercase-first">{act.msg}</p>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-[10px] text-gray-400 flex items-center gap-1 font-bold uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 group-hover:bg-white group-hover:border-teal-100 transition-colors">
                  <Clock size={10} className="text-gray-300" /> {act.time}
                </p>
                <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">Verified Event</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 text-[9px] border-gray-100 hover:bg-white hover:border-teal-100 hover:text-teal-600 shadow-sm group-hover:shadow-md transition-all">Chi tiết</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

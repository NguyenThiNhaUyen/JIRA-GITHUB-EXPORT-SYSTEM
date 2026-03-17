import { Activity, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";

export function ActivityFeed({ activities, loadingLogs }) {
  return (
    <Card className="lg:col-span-2 border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
      <CardHeader className="border-b border-gray-50 py-6 px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center shadow-sm">
            <Activity size={18} className="text-teal-600" />
          </div>
          <CardTitle className="text-sm font-black text-gray-800 uppercase tracking-widest leading-none">Dòng hoạt động thời gian thực</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loadingLogs ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-10 opacity-40">
            <Activity size={32} className="mx-auto mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">Chưa có hoạt động</p>
          </div>
        ) : activities.map(act => (
          <div key={act.id} className="flex items-start gap-4 px-8 py-5 border-b border-gray-50 hover:bg-gray-50/20 transition-all last:border-0 group">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${act.color}`}>
              <act.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gray-700 leading-tight tracking-tight">{act.msg}</p>
              <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1 font-bold uppercase tracking-widest">
                <Clock size={12} className="text-gray-300" /> {act.time}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl h-8 px-3 text-[10px] font-black uppercase tracking-widest text-teal-600 hover:bg-teal-50">Chi tiết</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

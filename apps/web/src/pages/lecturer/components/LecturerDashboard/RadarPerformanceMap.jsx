import { TrendingUp, LayoutList } from "lucide-react";
import { Card, CardTitle } from "../components/ui/Card.jsx";
import { GroupRadarChart } from "../../../../components/charts/RadarChart.jsx";

export function RadarPerformanceMap({ radarData, alertsCount }) {
  return (
    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white p-8">
      <CardTitle className="text-sm font-black text-gray-800 uppercase tracking-widest mb-8 flex items-center gap-2">
        <TrendingUp size={18} className="text-teal-600" /> Bản đồ Hiệu suất
      </CardTitle>
      <div className="aspect-square w-full">
        <GroupRadarChart data={radarData} />
      </div>
      <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-teal-50 rounded-2xl">
          <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Git Approved</p>
          <p className="text-xl font-black text-gray-800">{radarData.filter(d => d.githubLinked === 100 || d.githubLinked === 1).length}</p>
        </div>
        <div className="text-center p-4 bg-indigo-50 rounded-2xl">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Alerts</p>
          <p className="text-xl font-black text-gray-800">{alertsCount}</p>
        </div>
      </div>
    </Card>
  );
}

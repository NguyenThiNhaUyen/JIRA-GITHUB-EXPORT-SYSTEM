import { PieChart as PieChartIcon } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card.jsx";

export function JiraTaskDistribution({ jiraData, integrationStats }) {
  const donePercent = Math.round((integrationStats?.jiraStats?.done / (Object.values(integrationStats?.jiraStats || {}).reduce((a, b) => a + b, 0) || 1)) * 100);

  return (
    <Card className="xl:col-span-4 border border-gray-100 shadow-xl shadow-slate-100/50 rounded-[40px] overflow-hidden bg-white">
      <CardHeader className="border-b border-gray-50 py-8 px-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shadow-sm">
            <PieChartIcon size={22} className="text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-gray-800 uppercase tracking-widest leading-none">Phân bổ Jira</CardTitle>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 opacity-70">Tỷ lệ hoàn thành công việc</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={jiraData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={8}
                dataKey="value"
              >
                {jiraData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-2xl font-black text-gray-800 leading-none">{donePercent}%</p>
            <p className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-widest">Done</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-8">
          {jiraData.map(item => (
            <div key={item.name} className="text-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.name}</p>
              <p className="text-sm font-black text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}







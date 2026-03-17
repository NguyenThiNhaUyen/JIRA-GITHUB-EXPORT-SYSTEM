import { TrendingUp } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";

export function ContributionTrends({ chartData }) {
  return (
    <Card className="xl:col-span-8 border border-gray-100 shadow-xl shadow-slate-100/50 rounded-[40px] overflow-hidden bg-white">
      <CardHeader className="border-b border-gray-50 py-8 px-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-sm">
            <TrendingUp size={22} className="text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-gray-800 uppercase tracking-widest leading-none">Xu hướng Đóng góp</CardTitle>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 opacity-70">Thống kê commit theo thời gian thức</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-10">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#cbd5e1' }} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#cbd5e1' }} dx={-10} />
              <Tooltip
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '16px' }}
              />
              <Line
                type="monotone"
                dataKey="commits"
                stroke="#14b8a6"
                strokeWidth={5}
                dot={{ r: 4, fill: '#fff', strokeWidth: 3, stroke: '#14b8a6' }}
                activeDot={{ r: 7, strokeWidth: 0, fill: '#14b8a6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

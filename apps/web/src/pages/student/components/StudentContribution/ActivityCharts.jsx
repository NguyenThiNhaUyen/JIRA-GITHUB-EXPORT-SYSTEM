import { Flame, Calendar } from"lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from"recharts";
import CalendarHeatmap from"react-calendar-heatmap";
import { Card, CardHeader, CardTitle, CardContent } from"@/components/ui/Card.jsx";
import { Badge } from"@/components/ui/Badge.jsx";

export function ActivityCharts({ commitActivity, heatmapData }) {
 return (
 <div className="space-y-10">
 {/* Style for Heatmap */}
 <style>
 {`
 .react-calendar-heatmap .color-scale-0 { fill: #f3f4f6; }
 .react-calendar-heatmap .color-scale-1 { fill: #ccfbf1; }
 .react-calendar-heatmap .color-scale-2 { fill: #5eead4; }
 .react-calendar-heatmap .color-scale-3 { fill: #14b8a6; }
 .react-calendar-heatmap .color-scale-4 { fill: #0f766e; }
 `}
 </style>

 {/* Commit Frequency Chart */}
 <Card className="border border-gray-100 shadow-sm rounded-[44px] overflow-hidden bg-white group glass-card">
 <CardHeader className="border-b border-gray-50/50 py-10 px-12 flex flex-row items-center justify-between">
 <div>
 <CardTitle className="text-xs font-black text-gray-400 flex items-center gap-4 font-display">
 <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shadow-inner">
 <Flame size={20} className="text-orange-500 animate-pulse" />
 </div>
 Táº§n suáº¥t hoáº¡t Ä‘á»™ng 14 ngĂ y qua
 </CardTitle>
 </div>
 <Badge className="bg-orange-50 text-orange-600 border-orange-100 px-6 py-2 rounded-full text-[10px] font-black shadow-sm">Streak: 4 NgĂ y</Badge>
 </CardHeader>
 <CardContent className="p-12">
 <div className="h-72 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={commitActivity || []}>
 <defs>
 <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
 <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <XAxis 
 dataKey="label" 
 axisLine={false} 
 tickLine={false} 
 tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
 dy={10}
 />
 <YAxis hide />
 <Tooltip 
 contentStyle={{ 
 borderRadius: '24px', 
 border: 'none', 
 boxShadow: '0 30px 40px -10px rgb(0 0 0 / 0.1)',
 fontSize: '11px',
 fontWeight: 'black',
 textTransform: '',
 letterSpacing: '0.1em',
 padding: '16px 20px'
 }} 
 cursor={{stroke: '#14b8a6', strokeWidth: 1, strokeDasharray: '5 5'}}
 />
 <Area 
 type="monotone" 
 dataKey="commits" 
 stroke="#14b8a6" 
 strokeWidth={4} 
 fillOpacity={1} 
 fill="url(#colorCommits)" 
 animationDuration={2500}
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>

 {/* Heatmap Card */}
 <Card className="border border-gray-100 shadow-sm rounded-[44px] overflow-hidden bg-white glass-card">
 <CardHeader className="border-b border-gray-50/50 py-10 px-12">
 <CardTitle className="text-xs font-black text-gray-400 flex items-center gap-4 font-display">
 <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shadow-inner">
 <Calendar size={20} className="text-teal-600" />
 </div>
 Contribution Heatmap (6 ThĂ¡ng)
 </CardTitle>
 </CardHeader>
 <CardContent className="p-12">
 <div className="px-6">
 <CalendarHeatmap
 startDate={new Date(Date.now() - 1000 * 60 * 60 * 24 * 180)}
 endDate={new Date()}
 values={heatmapData || []}
 classForValue={(value) => {
 if (!value) return 'color-scale-0';
 return `color-scale-${Math.min(value.count || 0, 4)}`;
 }}
 gutterSize={4}
 />
 </div>
 <div className="mt-12 flex items-center justify-end gap-5 text-[10px] font-black text-gray-400 opacity-60">
 <span>Low Activity</span>
 <div className="flex gap-1.5 p-1.5 bg-gray-50 rounded-xl border border-gray-100">
 {[0, 1, 2, 3, 4].map(i => (
 <div key={i} className={`w-4 h-4 rounded-md color-scale-${i}`} style={{ backgroundColor: i === 0 ? '#f3f4f6' : i === 1 ? '#ccfbf1' : i === 2 ? '#5eead4' : i === 3 ? '#14b8a6' : '#0f766e' }}></div>
 ))}
 </div>
 <span>High Activity</span>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}


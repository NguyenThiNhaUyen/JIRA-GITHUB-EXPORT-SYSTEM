import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from"recharts";
import { Card, CardHeader, CardTitle, CardContent } from"@/components/ui/Card.jsx";

export function PerformanceMetrics({ metrics, commitHistory }) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <Card className="border border-gray-100 shadow-sm rounded-[44px] overflow-hidden bg-white glass-card">
 <CardHeader className="border-b border-gray-50/50 py-8 px-10 bg-gray-50/10">
 <CardTitle className="text-xs font-black text-gray-400 font-display">PhĂ¢n bá»• Ä‘Ă³ng gĂ³p thĂ nh viĂªn</CardTitle>
 </CardHeader>
 <CardContent className="p-10">
 <div className="h-72 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={metrics?.contributions || []}>
 <XAxis dataKey="studentName" hide />
 <YAxis hide />
 <Tooltip 
 cursor={{fill: 'rgba(13, 148, 136, 0.05)'}}
 contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 30px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold', padding: '16px' }} 
 />
 <Bar dataKey="commits" fill="#0d9488" radius={[12, 12, 0, 0]} />
 <Bar dataKey="issues" fill="#4f46e5" radius={[12, 12, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 <div className="flex justify-center gap-10 mt-8">
 <div className="flex items-center gap-3">
 <div className="w-4 h-4 rounded-full bg-teal-600 shadow-lg shadow-teal-100 animate-pulse"></div>
 <span className="text-[10px] font-black text-gray-400 leading-none">Commits</span>
 </div>
 <div className="flex items-center gap-3">
 <div className="w-4 h-4 rounded-full bg-indigo-600 shadow-lg shadow-indigo-100 animate-pulse"></div>
 <span className="text-[10px] font-black text-gray-400 leading-none">Issues</span>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="border border-gray-100 shadow-sm rounded-[44px] overflow-hidden bg-white glass-card">
 <CardHeader className="border-b border-gray-50/50 py-8 px-10 bg-gray-50/10">
 <CardTitle className="text-xs font-black text-gray-400 font-display">Táº§n suáº¥t commit dá»± Ă¡n</CardTitle>
 </CardHeader>
 <CardContent className="p-10">
 <div className="h-72 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={commitHistory?.slice(-15) || []}>
 <defs>
 <linearGradient id="colorProjectCommits" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
 <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <XAxis dataKey="date" hide />
 <Tooltip 
 contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 30px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold', padding: '16px' }} 
 />
 <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorProjectCommits)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 <p className="text-center text-[10px] font-black text-gray-300 tracking-[0.3em] mt-8 opacity-60">Dá»¯ liá»‡u 15 ngĂ y gáº§n nháº¥t</p>
 </CardContent>
 </Card>
 </div>
 );
}


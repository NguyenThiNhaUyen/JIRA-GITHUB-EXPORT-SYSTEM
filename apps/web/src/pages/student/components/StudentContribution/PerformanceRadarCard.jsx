import { Target } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { Card, CardTitle } from "../../../components/ui/Card.jsx";

export function PerformanceRadarCard({ performanceRadar, stats }) {
    return (
        <Card className="border border-gray-100 shadow-sm rounded-[48px] overflow-hidden bg-white p-12 glass-card group">
            <CardTitle className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shadow-inner">
                    <Target size={20} className="text-indigo-600" />
                </div>
                Bản đồ năng lực kỹ thuật
            </CardTitle>
            <div className="h-72 w-full flex items-center justify-center mb-10 group-hover:scale-105 transition-transform duration-700">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceRadar}>
                        <PolarGrid stroke="#f1f5f9" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                        <Radar
                            name="Skill Index"
                            dataKey="A"
                            stroke="#6366f1"
                            fill="#6366f1"
                            fillOpacity={0.2}
                            animationDuration={2000}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-8">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                     Phân tích chi tiết chỉ số
                </p>
                <div className="space-y-8">
                    {[
                        { label: 'Coding Efficiency', value: stats?.codingScore || 85, color: 'from-teal-400 to-teal-600', bg: 'bg-teal-50' },
                        { label: 'Document Quality', value: stats?.docScore || 60, color: 'from-indigo-400 to-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Consistency', value: stats?.consistencyScore || 92, color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50' }
                    ].map((skill, i) => (
                        <div key={i} className="space-y-3 group/item">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider px-2">
                                <span className="text-gray-400 group-hover/item:text-gray-800 transition-colors">{skill.label}</span>
                                <span className="text-gray-800 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 shadow-sm">{skill.value}%</span>
                            </div>
                            <div className={`h-2.5 w-full ${skill.bg} rounded-full overflow-hidden p-0.5 shadow-inner`}>
                                <div className={`h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-1000 ease-out shadow-lg`} style={{ width: `${skill.value}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}

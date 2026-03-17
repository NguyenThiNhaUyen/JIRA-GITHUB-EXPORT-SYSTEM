import { useMemo } from "react";
import { 
    Activity, 
    BarChart3, 
    Calendar, 
    CheckCircle, 
    ChevronRight, 
    Clock, 
    Code2, 
    Flame, 
    GitCommit, 
    GitPullRequest, 
    History, 
    ShieldCheck, 
    Star, 
    Target, 
    TrendingUp, 
    Zap
} from "lucide-react";
import { 
    Bar, 
    BarChart, 
    Cell, 
    ResponsiveContainer, 
    Tooltip, 
    XAxis, 
    YAxis, 
    Area, 
    AreaChart, 
    Radar, 
    RadarChart, 
    PolarGrid, 
    PolarAngleAxis, 
    PolarRadiusAxis 
} from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

// Components UI
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";

// Features & Hooks
import { useAuth } from "../../context/AuthContext.jsx";
import { 
    useStudentStats, 
    useStudentHeatmap, 
    useStudentCommitActivity,
    useStudentProjects
} from "../../features/dashboard/hooks/useDashboard.js";

export default function StudentContribution() {
    const { user } = useAuth();
    
    // Data Hooks
    const { data: stats, isLoading: loadingStats } = useStudentStats();
    const { data: heatmapData, isLoading: loadingHeatmap } = useStudentHeatmap(180); // 6 months
    const { data: commitActivity, isLoading: loadingActivity } = useStudentCommitActivity(14); // 2 weeks
    const { data: projectsData, isLoading: loadingProjects } = useStudentProjects();

    const projects = projectsData?.items || [];
    const isLoading = loadingStats || loadingHeatmap || loadingActivity || loadingProjects;

    // Derived Metrics
    const performanceRadar = useMemo(() => [
        { subject: 'Coding', A: stats?.codingScore || 85, fullMark: 100 },
        { subject: 'Jira Task', A: stats?.taskScore || 70, fullMark: 100 },
        { subject: 'Documentation', A: stats?.docScore || 60, fullMark: 100 },
        { subject: 'Consistency', A: stats?.consistencyScore || 90, fullMark: 100 },
        { subject: 'Collaboration', A: stats?.collabScore || 75, fullMark: 100 },
    ], [stats]);

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center gap-6 bg-gray-50/30">
                <div className="relative w-20 h-20">
                    <Activity className="animate-spin text-teal-600 h-20 w-20 opacity-20" />
                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-teal-600 animate-pulse" size={32} />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">Analyzing Code DNA</span>
                    <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <style>
                {`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(250%); }
                }
                .react-calendar-heatmap .color-scale-0 { fill: #f3f4f6; }
                .react-calendar-heatmap .color-scale-1 { fill: #ccfbf1; }
                .react-calendar-heatmap .color-scale-2 { fill: #5eead4; }
                .react-calendar-heatmap .color-scale-3 { fill: #14b8a6; }
                .react-calendar-heatmap .color-scale-4 { fill: #0f766e; }
                `}
            </style>

            <PageHeader 
                title="Phân tích hiệu suất Code"
                subtitle="Dữ liệu chuyên sâu về đóng góp kỹ thuật và tần suất hoạt động của bạn."
                breadcrumb={["Sinh viên", "Hiệu suất"]}
                actions={[
                    <Button key="refresh" variant="outline" className="rounded-2xl border-gray-100 h-11 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 shadow-sm transition-all group">
                        <History size={14} className="mr-2 group-hover:rotate-180 transition-transform duration-500" /> Refresh Insight
                    </Button>
                ]}
            />

            {/* KPI Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard label="Tổng Commits" value={stats?.totalCommits || 0} icon={GitCommit} variant="success" hint="+12 tuần này" />
                <StatsCard label="PRs Đã Merged" value={stats?.totalPrs || 0} icon={GitPullRequest} variant="indigo" />
                <StatsCard label="Điểm Consistency" value={`${stats?.consistencyScore || 0}%`} icon={TrendingUp} variant="warning" />
                <StatsCard label="Thứ hạng lớp" value={`#${stats?.rank || 5}`} icon={Star} variant="info" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Activity Charts */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Commit Frequency Chart */}
                    <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white group">
                        <CardHeader className="border-b border-gray-50 py-8 px-10 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Flame size={16} className="text-orange-500" /> Tần suất hoạt động 14 ngày qua
                                </CardTitle>
                            </div>
                            <Badge className="bg-orange-50 text-orange-600 border-orange-100 px-4 py-1.5 rounded-full text-[9px] font-black uppercase">Streak: 4 Ngày</Badge>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={commitActivity || []}>
                                        <defs>
                                            <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis 
                                            dataKey="label" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                                            dy={10}
                                        />
                                        <YAxis hide />
                                        <Tooltip 
                                            contentStyle={{ 
                                                borderRadius: '20px', 
                                                border: 'none', 
                                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }} 
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="commits" 
                                            stroke="#14b8a6" 
                                            strokeWidth={4} 
                                            fillOpacity={1} 
                                            fill="url(#colorCommits)" 
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Heatmap Card */}
                    <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 py-8 px-10">
                            <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={16} className="text-teal-600" /> Contribution Heatmap (6 Tháng)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="px-4">
                                <CalendarHeatmap
                                    startDate={new Date(Date.now() - 1000 * 60 * 60 * 24 * 180)}
                                    endDate={new Date()}
                                    values={heatmapData || []}
                                    classForValue={(value) => {
                                        if (!value) return 'color-scale-0';
                                        return `color-scale-${Math.min(value.count || 0, 4)}`;
                                    }}
                                    tooltipDataAttrs={(value) => ({
                                        'data-tip': `${value.date}: ${value.count} contributions`,
                                    })}
                                    gutterSize={3}
                                />
                            </div>
                            <div className="mt-8 flex items-center justify-end gap-3 text-[9px] font-black text-gray-400 uppercase">
                                <span>Low</span>
                                <div className="flex gap-1">
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <div key={i} className={`w-3 h-3 rounded-[3px] color-scale-${i}`} style={{ backgroundColor: i === 0 ? '#f3f4f6' : i === 1 ? '#ccfbf1' : i === 2 ? '#5eead4' : i === 3 ? '#14b8a6' : '#0f766e' }}></div>
                                    ))}
                                </div>
                                <span>High</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Performance Radar & Skills */}
                <div className="space-y-8">
                    <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white p-10">
                        <CardTitle className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <Target size={18} className="text-indigo-600" /> Bản đồ năng lực
                        </CardTitle>
                        <div className="h-64 w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceRadar}>
                                    <PolarGrid stroke="#f1f5f9" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} />
                                    <Radar
                                        name="Student"
                                        dataKey="A"
                                        stroke="#6366f1"
                                        fill="#6366f1"
                                        fillOpacity={0.2}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-10 space-y-4">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Phân tích kỹ năng</p>
                            <div className="space-y-6">
                                {[
                                    { label: 'Coding Efficiency', value: 85, color: 'bg-teal-500' },
                                    { label: 'Documentation Quality', value: 60, color: 'bg-indigo-500' },
                                    { label: 'Deadline Compliance', value: 92, color: 'bg-amber-500' }
                                ].map((skill, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase">
                                            <span className="text-gray-500">{skill.label}</span>
                                            <span className="text-gray-800">{skill.value}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                            <div className={`h-full ${skill.color} rounded-full`} style={{ width: `${skill.value}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-[40px] p-10 shadow-2xl shadow-indigo-200 group overflow-hidden relative">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000"></div>
                        <div className="relative z-10">
                            <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-500/30 mb-6 font-black tracking-widest text-[9px]">PREMIUM INSIGHT</Badge>
                            <h4 className="text-xl font-black uppercase tracking-tight mb-4">Gợi ý từ Antigravity AI</h4>
                            <p className="text-[11px] text-indigo-200 font-bold leading-relaxed mb-8 uppercase opacity-80">
                                Bạn đang giữ phong độ commit rất tốt vào buổi tối. Tuy nhiên, việc phản hồi Issue trên Jira đang chậm hơn 20% so với trung bình nhóm. Hãy tập trung xử lý các task tồn đọng!
                            </p>
                            <Button className="w-full bg-white text-indigo-900 hover:bg-indigo-50 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] shadow-xl">
                                Xem chi tiết gợi ý
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Project Deep Dive */}
            <div className="space-y-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Đóng góp theo dự án</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((p, i) => (
                        <Card key={p.id} className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white hover:shadow-xl transition-all group p-10 flex flex-col md:flex-row gap-8 items-center cursor-pointer">
                            <div className="w-24 h-24 rounded-[32px] bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-teal-50 transition-all shadow-inner relative">
                                <Code2 size={32} className="text-gray-300 group-hover:text-teal-600 transition-colors" />
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white shadow-lg border border-gray-50 flex items-center justify-center text-teal-600 font-black text-xs">
                                    {p.contributionScore || 25}%
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <h4 className="text-lg font-black text-gray-800 uppercase tracking-tight group-hover:text-teal-600 transition-colors truncate">{p.name}</h4>
                                    <StatusBadge status={p.integration?.githubStatus === 'ACTIVE' ? 'success' : 'warning'} label="Synced" />
                                </div>
                                <div className="grid grid-cols-3 gap-6 mt-6 border-t border-gray-50 pt-6">
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5 opacity-60">Commits</p>
                                        <p className="font-black text-xl text-teal-600 tracking-tighter leading-none">{p.commits || 0}</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5 opacity-60">Issues Done</p>
                                        <p className="font-black text-xl text-indigo-500 tracking-tighter leading-none">{p.issuesDone || 0}</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5 opacity-60">Impact</p>
                                        <p className="font-black text-xl text-amber-500 tracking-tighter leading-none">High</p>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="text-gray-200 group-hover:text-teal-500 group-hover:translate-x-2 transition-all" size={32} />
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

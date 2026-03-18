import { Activity, History, Zap } from "lucide-react";

// Components UI
import { Button } from "@/components/ui/Button.jsx";

// Shared Components
import { PageHeader } from "@/components/shared/PageHeader.jsx";

// Local Components
import { ContributionStats } from "@/pages/student/components/StudentContribution/ContributionStats.jsx";
import { ActivityCharts } from "@/pages/student/components/StudentContribution/ActivityCharts.jsx";
import { PerformanceRadarCard } from "@/pages/student/components/StudentContribution/PerformanceRadarCard.jsx";
import { AiInsightsCard } from "@/pages/student/components/StudentContribution/AiInsightsCard.jsx";
import { ProjectContributionList } from "@/pages/student/components/StudentContribution/ProjectContributionList.jsx";

// Hooks
import { useStudentContribution } from "./hooks/useStudentContribution.js";

export default function StudentContribution() {
    const {
        stats,
        heatmapData,
        commitActivity,
        projects,
        isLoading,
        performanceRadar,
        handleRefresh
    } = useStudentContribution();

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center gap-10 bg-gray-50/10">
                <div className="relative w-28 h-28">
                    <Activity className="animate-spin text-teal-600 h-28 w-28 opacity-10" />
                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-teal-600 animate-pulse" size={48} />
                </div>
                <div className="flex flex-col items-center gap-6">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Analyzing Code DNA & Contributions</span>
                    <div className="w-64 h-2 bg-gray-100/50 rounded-full overflow-hidden p-0.5 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500 animate-[loading_2.5s_ease-in-out_infinite] rounded-full" style={{ width: '40%' }}></div>
                    </div>
                </div>
                <style>{`
                    @keyframes loading {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(250%); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
            <PageHeader 
                title="Phân tích hiệu suất Code"
                subtitle="Hệ thống Antigravity AI phân tích dữ liệu chuyên sâu về đóng góp kỹ thuật từ JIRA và GITHUB."
                breadcrumb={["Sinh viên", "Deep Metrics"]}
                actions={[
                    <Button 
                        key="refresh" 
                        variant="outline" 
                        onClick={handleRefresh}
                        className="rounded-[24px] border-teal-100 text-teal-700 h-12 px-8 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-teal-50 hover:border-teal-200 shadow-sm transition-all font-display group"
                    >
                        <History size={18} className="mr-3 group-hover:rotate-180 transition-transform duration-700" /> Refresh Insight
                    </Button>
                ]}
            />

            {/* KPI Overview */}
            <ContributionStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Activity Charts */}
                <div className="lg:col-span-2">
                    <ActivityCharts commitActivity={commitActivity} heatmapData={heatmapData} />
                </div>

                {/* Sidebar Performance Radar & Skills */}
                <div className="space-y-10 lg:sticky lg:top-8">
                    <PerformanceRadarCard performanceRadar={performanceRadar} stats={stats} />
                    <AiInsightsCard stats={stats} />
                </div>
            </div>

            {/* Project Deep Dive */}
            <ProjectContributionList projects={projects} />
        </div>
    );
}







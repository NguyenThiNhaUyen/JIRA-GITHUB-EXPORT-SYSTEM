import { useNavigate } from "react-router-dom";
import { 
    Download, 
    LogOut,
    Sparkles
} from "lucide-react";

// Components UI
import { Button } from "@/components/ui/Button.jsx";

// Shared Components
import { PageHeader } from "@/components/shared/PageHeader.jsx";

// Local Components
import { DashboardKpiCards } from "@/pages/student/components/StudentDashboard/DashboardKpiCards.jsx";
import { ImportantWarnings } from "@/pages/student/components/StudentDashboard/ImportantWarnings.jsx";
import { MyCoursesGrid } from "@/pages/student/components/StudentDashboard/MyCoursesGrid.jsx";
import { WeeklyActivityCharts } from "@/pages/student/components/StudentDashboard/WeeklyActivityCharts.jsx";
import { RecentActivitySidebar } from "@/pages/student/components/StudentDashboard/RecentActivitySidebar.jsx";
import { AcademicGradesCard } from "@/pages/student/components/StudentDashboard/AcademicGradesCard.jsx";
import { QuickAccessPanel } from "@/pages/student/components/StudentDashboard/QuickAccessPanel.jsx";
import { UpcomingDeadlines } from "@/pages/student/components/StudentDashboard/UpcomingDeadlines.jsx";

// Hooks
import { useStudentDashboard } from "./hooks/useStudentDashboard.js";

export default function StudentDashboard() {
  const {
    user,
    isLoading,
    studentKPI,
    studentWarnings,
    courses,
    upcomingDeadlines,
    commitsList,
    grades,
    commitActivity,
    heatmap,
    handleLogout,
    success
  } = useStudentDashboard();
  
  const navigate = useNavigate();

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      <PageHeader
        title={`ChĂ o má»«ng, ${user?.name || "Student"}!`}
        subtitle="Há»‡ thá»‘ng Antigravity Ä‘ang theo dĂµi tiáº¿n Ä‘á»™ GitHub, Jira vĂ  cĂ¡c deadline há»c thuáº­t cá»§a báº¡n."
        breadcrumb={["Student", "Premium Workspace"]}
        actions={[
          <Button 
            key="export" 
            variant="outline" 
            className="rounded-[24px] border-teal-100 text-teal-700 h-12 px-8 text-[11px] font-black hover:bg-teal-50 hover:border-teal-200 shadow-sm transition-all font-display" 
            onClick={() => success?.("BĂ¡o cĂ¡o hiá»‡u suáº¥t Ä‘Ă£ Ä‘Æ°á»£c gá»­i qua Email")}
          >
            <Download size={18} className="mr-3" /> Export Insight
          </Button>,
          <Button 
            key="logout" 
            onClick={handleLogout} 
            className="bg-slate-900 hover:bg-black text-white rounded-[24px] h-12 px-10 text-[11px] font-black shadow-xl shadow-slate-200 border-0 transition-all hover:scale-105 active:scale-95 font-display"
          >
            <LogOut size={18} className="mr-3" /> Sign Out
          </Button>
        ]}
      />

      {/* KPI Cards */}
      <DashboardKpiCards isLoading={isLoading} studentKPI={studentKPI} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-10">
          {/* Alerts / Warnings Section */}
          <ImportantWarnings studentWarnings={studentWarnings} />

          {/* Courses Selection */}
          <MyCoursesGrid 
            isLoading={isLoading} 
            courses={courses} 
            onCourseNavigate={(id) => navigate(`/student/workspace/${id}`)}
            onSeeAll={() => navigate("/student/courses")}
          />

          {/* Activity Logs */}
          <WeeklyActivityCharts 
            isLoading={isLoading} 
            commitActivity={commitActivity} 
            heatmap={heatmap} 
          />
        </div>

        <div className="space-y-10 lg:sticky lg:top-8 animate-in slide-in-from-right-8 duration-700">
          <div className="p-8 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-[44px] text-white shadow-2xl shadow-teal-100 group relative overflow-hidden transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Sparkles size={120} className="animate-pulse" />
              </div>
              <p className="text-[10px] font-black mb-4 opacity-80">AI RECOMMENDATION</p>
              <h4 className="text-2xl font-black leading-tight mb-8 font-display">Optimization Plan Available</h4>
              <p className="text-xs font-bold leading-relaxed mb-10 opacity-80">
                  PhĂ¢n tĂ­ch GitHub cho tháº¥y táº§n suáº¥t code cá»§a báº¡n cao hÆ¡n 40% so vá»›i tuáº§n trÆ°á»›c. HĂ£y duy trĂ¬ phong Ä‘á»™ nĂ y Ä‘á»ƒ Ä‘áº¡t Ä‘iá»ƒm A+ dá»± Ă¡n.
              </p>
              <Button className="w-full h-14 bg-white text-teal-700 hover:bg-teal-50 rounded-[24px] text-[10px] font-black transition-all font-display border-0 shadow-2xl">View Detailed Stats</Button>
          </div>

          {/* Recent Activity */}
          <RecentActivitySidebar isLoading={isLoading} commitsList={commitsList} />

          {/* Academic Performance / Grades */}
          <AcademicGradesCard isLoading={isLoading} grades={grades} />

          {/* Quick Nav */}
          <QuickAccessPanel onNavigate={(to) => navigate(to)} />

          {/* Deadlines */}
          <UpcomingDeadlines 
            isLoading={isLoading} 
            upcomingDeadlines={upcomingDeadlines} 
            onSeeAll={() => navigate("/student/srs")}
          />
        </div>
      </div>
    </div>
  );
}

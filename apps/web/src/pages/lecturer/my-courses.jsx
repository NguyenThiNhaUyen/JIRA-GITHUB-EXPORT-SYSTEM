import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Users,
  BookOpen,
  Search,
  AlertTriangle,
  Settings2,
  BarChart3
} from "lucide-react";

import { Card, CardContent } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { InputField } from "../../components/shared/FormFields.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

// Feature Hooks
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";

export default function MyCourses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  
  // Data Fetching - Backend automatically filters by lecturer based on token role
  const { data: coursesData = { items: [] }, isLoading } = useGetCourses({ pageSize: 100 });
  const courses = coursesData.items || [];

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const keyword = search.toLowerCase();
      return (
        c.code?.toLowerCase().includes(keyword) ||
        c.name?.toLowerCase().includes(keyword) ||
        (c.subjectName || c.subject?.name)?.toLowerCase().includes(keyword)
      );
    });
  }, [courses, search]);

  const totalGroups = courses.reduce((a, c) => a + (c.projects?.length || 0), 0);
  const totalStudents = courses.reduce((a, c) => a + (c.currentStudents || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Lớp của tôi"
        subtitle="Quản lý danh sách các lớp học phần bạn đang trực tiếp giảng dạy."
        breadcrumb={["Giảng viên", "Lớp học"]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Tổng lớp" value={courses.length} icon={GraduationCap} variant="info" />
        <StatsCard label="Tổng nhóm" value={totalGroups} icon={BookOpen} variant="indigo" />
        <StatsCard label="Tổng sinh viên" value={totalStudents} icon={Users} variant="success" />
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/30">
          <InputField 
            placeholder="Tìm kiếm lớp học, mã môn..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            icon={Search}
            className="max-w-md bg-white border border-gray-100"
          />
        </div>

        <div className="p-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"/>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                <GraduationCap size={24} className="text-gray-300" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{search ? "Không tìm thấy lớp học hợp lệ" : "Bạn chưa được phân công lớp nào"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(course => (
                 <CourseCard key={course.id} course={course} onNavigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, onNavigate }) {
  const groupCount = course.projects?.length || 0;
  const alerts = course.alertsCount || 0;

  const activeTeams = course.activeTeams || 0;
  const jiraConnected = course.jiraConnected || 0;

  const semester =
    course.semesterName ||
    course.semester?.name ||
    course.semester ||
    "N/A";



const progress = Math.min(100, Math.round((activeTeams / (groupCount || 1)) * 100));
const lastCommit = course.lastActivityAt ? new Date(course.lastActivityAt).toLocaleDateString() : "—";

/* Course health */
let status = "ACTIVE";
if (activeTeams === 0 && groupCount > 0) {
  status = "NO REPO";
} else if (activeTeams < groupCount / 2) {
  status = "LOW";
}

if (course.status === "COMPLETED") {
  status = "ARCHIVED";
}



return(

<Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white hover:shadow-md transition-all duration-200 group">

<div className="h-1.5 bg-gradient-to-r from-teal-500 to-teal-600"/>

<CardContent className="p-5 space-y-4">



{/* Header */}

<div className="flex items-start justify-between gap-2">

<div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
<GraduationCap size={18} className="text-teal-700"/>
</div>

<span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
{course.subject?.code || course.subjectCode || "—"}
</span>

</div>



{/* Title */}

<div>

<h3 className="font-bold text-gray-800 leading-snug">
{course.code}
</h3>

<p className="text-sm text-gray-500 mt-0.5">
{course.name || course.subject?.name || course.subjectName}
</p>

<p className="text-xs text-gray-400">
Học kỳ: {semester}
</p>

</div>



{/* Students + Teams */}

<div className="flex items-center gap-4 text-xs text-gray-500">

<span className="flex items-center gap-1">
<Users size={11}/>
{course.currentStudents || 0} sinh viên
</span>

<span className="flex items-center gap-1">
<BookOpen size={11}/>
{groupCount} nhóm
</span>

</div>



{/* Commit Trend */}

<MiniCommitChart data={course.commitTrends || []}/>



{/* Progress */}

<div className="space-y-1">

<div className="flex justify-between text-[11px] text-gray-500">
<span>Project progress</span>
<span>{progress}%</span>
</div>

<div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
<div
className="h-full bg-teal-500"
style={{width:`${progress}%`}}
/>
</div>

</div>



{/* Repo + Jira */}

<div className="flex justify-between text-xs text-gray-500">

<span className="flex items-center gap-1">
<GitBranch size={12}/>
Repo: {activeTeams}/{groupCount}
</span>

<span>
Jira: {jiraConnected}/{groupCount}
</span>

</div>



{/* Activity */}

<div className="text-xs text-gray-500 flex justify-between">

<span>
Active teams: {activeTeams}/{groupCount}
</span>

<span>
Last activity: {lastCommit}
</span>

</div>



{/* Alerts */}

{alerts>0 && (

<div className="text-xs text-red-500 flex items-center gap-1">

<AlertTriangle size={12}/>
{alerts} alerts detected

</div>

)}



<StatusBadge status={status}/>



{/* Buttons */}

<div className="grid grid-cols-3 gap-2">

<Button
onClick={()=>navigate(`/lecturer/course/${course.id}/dashboard`)}
variant="outline"
className="text-sm h-9 rounded-xl"
>
Dashboard
</Button>

<Button
onClick={()=>navigate(`/lecturer/course/${course.id}/manage-groups`)}
className="bg-teal-600 hover:bg-teal-700 text-white text-sm h-9 rounded-xl"
>
Manage
</Button>

<Button
onClick={()=>navigate(`/lecturer/course/${course.id}/alerts`)}
variant="outline"
className="text-sm h-9 rounded-xl"
>
Alerts
</Button>

</div>

</CardContent>

</Card>

)

}



/* ---------------- MINI CHART ---------------- */

function MiniCommitChart({ data }) {

if (!data || data.length === 0) {
  return <div className="h-10 w-full" />
}

return (
  <div className="w-full h-[40px]">

    <ResponsiveContainer width="100%" aspect={4}>

      <LineChart data={data}>

        <Line
          type="monotone"
          dataKey="commits"
          stroke="#14b8a6"
          strokeWidth={2}
          dot={false}
        />

      </LineChart>

    </ResponsiveContainer>

  </div>
)
}



/* ---------------- STATUS BADGE ---------------- */

function StatusBadge({status}){

const map={
ACTIVE:"bg-green-50 text-green-700",
LOW:"bg-yellow-50 text-yellow-700",
"NO REPO":"bg-red-50 text-red-600",
ARCHIVED:"bg-gray-100 text-gray-600"
}

return(

<div className="flex justify-end">

<span className={`text-[10px] px-2 py-1 rounded ${map[status]}`}>
{status}
</span>

</div>

)

}



/* ---------------- MINI STATS ---------------- */

function MiniStat({label,value,color}){

return(

<div className={`rounded-2xl px-4 py-3 border flex items-center justify-between ${color}`}>

<span className="text-xs font-semibold opacity-80">
{label}
</span>

<span className="text-xl font-bold">
{value}
</span>

</div>

)

}



/* ---------------- EMPTY STATE ---------------- */

function EmptyState({message}){

return(

<div className="flex flex-col items-center justify-center py-20 gap-3">

<div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center">
<GraduationCap size={28} className="text-gray-400"/>
</div>

<p className="text-sm text-gray-500">
{message}
</p>

</div>

)

}
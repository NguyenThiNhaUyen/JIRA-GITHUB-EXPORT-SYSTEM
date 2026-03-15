// Admin Dashboard — Enterprise SaaS Governance

import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Button } from "../../components/ui/button.jsx"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx"

import {
CalendarDays,
Library,
BookOpen,
Users,
GraduationCap,
FolderKanban,
TrendingUp,
UserCog,
Plus,
ChevronRight,
Activity,
CheckCircle,
AlertCircle,
Clock
} from "lucide-react"

import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer
} from "recharts"

import CalendarHeatmap from "react-calendar-heatmap"
import "react-calendar-heatmap/dist/styles.css"
import { subDays } from "date-fns"

import { useGetCourses } from "../../features/courses/hooks/useCourses.js"
import { useGetProjects } from "../../features/projects/hooks/useProjects.js"
import { useGetSemesters, useGetSubjects } from "../../features/system/hooks/useSystem.js"
import { useGetUsers } from "../../features/users/hooks/useUsers.js"
import {
  useAdminStats,
  useIntegrationStats,
  useTeamRankings,
  useInactiveTeams,
  useActivityLog,
  useCommitTrends,
  useAnalyticsHeatmap
} from "../../features/dashboard/hooks/useDashboard.js"




/* ---------------- DASHBOARD ---------------- */

export default function AdminDashboard(){

const navigate = useNavigate()

const [filters, setFilters] = useState({
  semester: "",
  major: "",
  subject: "",
  classId: ""
})

const { data: coursesData } =
useGetCourses({ page:1, pageSize:6 })

const { data: semesters = [] } = useGetSemesters()
const { data: subjects = [] } = useGetSubjects()
const { data: projectsData } = useGetProjects({ pageSize:1 })

const { data: lecturersRaw = [] } = useGetUsers("LECTURER")
const { data: studentsRaw = [] } = useGetUsers("STUDENT")

const recentCourses = coursesData?.items || []

const { data: adminStats, isLoading: statsLoading } = useAdminStats()
const { data: integrationStatsData } = useIntegrationStats()
const { data: teamRankingsData = [] } = useTeamRankings(4)
const { data: inactiveTeamsData = [] } = useInactiveTeams()
const { data: activityLogData = [] } = useActivityLog(5)
const { data: commitTrendsData = [] } = useCommitTrends(7)
const { data: heatmapData = [] } = useAnalyticsHeatmap(90)

const stats = {
  semesters: adminStats?.totalSubjects !== undefined ? adminStats.totalSubjects : semesters.length,
  subjects: adminStats?.totalSubjects || subjects.length,
  courses: adminStats?.totalCourses || coursesData?.totalCount || 0,
  lecturers: lecturersRaw.length,
  students: adminStats?.totalUsers || studentsRaw.length,
  projects: adminStats?.totalProjects || projectsData?.totalCount || 0
}

const integrationStats = {
  repoConnected: integrationStatsData?.repoConnected || 0,
  repoMissing: integrationStatsData?.repoMissing || 0,
  jiraConnected: integrationStatsData?.jiraConnected || 0,
  syncErrors: integrationStatsData?.syncErrors || 0,
  reportsExported: integrationStatsData?.reportsExported || 0,
}

// Dữ liệu biểu đồ: Dữ liệu thật 100% từ Database
const commitChartData = commitTrendsData || []
const heatmapChartData = heatmapData || []
const teamRankings = teamRankingsData || []
const inactiveTeams = inactiveTeamsData || []
const systemActivity = activityLogData?.length ? activityLogData.map(a => ({
  icon: Activity,
  color: "text-teal-600 bg-teal-50",
  msg: a.message || a.msg,
  time: a.time || a.createdAt
})) : []

const activeSemesters =
semesters.filter(s=>s.status==="ACTIVE").length

const getSemesterName = (id)=>{
const found = semesters.find(s=>s.id===id)
return found?.name || "N/A"
}

const getSubjectName = (id)=>{
const found = subjects.find(s=>s.id===id)
return found?.code || "N/A"
}


return(

<div className="space-y-7">

{/* Breadcrumb */}

<nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
<span className="text-teal-700 font-semibold">Admin</span>
<ChevronRight size={12}/>
<span className="text-gray-800 font-semibold">
Tổng quan hệ thống
</span>
</nav>

{/* Filters: Semester → Major → Subject → Class */}

<DashboardFilters filters={filters} setFilters={setFilters}/>{/* Hero Metrics */}

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

<HeroCard icon={<CalendarDays size={20}/>} color="bg-blue-500" label="Học kỳ" value={stats.semesters} sub={`${activeSemesters} đang mở`} />

<HeroCard icon={<Library size={20}/>} color="bg-indigo-500" label="Môn học" value={stats.subjects} />

<HeroCard icon={<BookOpen size={20}/>} color="bg-blue-600" label="Lớp học phần" value={stats.courses} />

<HeroCard icon={<UserCog size={20}/>} color="bg-purple-500" label="Giảng viên" value={stats.lecturers} />

<HeroCard icon={<GraduationCap size={20}/>} color="bg-teal-500" label="Sinh viên" value={stats.students} />

<HeroCard icon={<FolderKanban size={20}/>} color="bg-orange-400" label="Nhóm dự án" value={stats.projects} />

</div>


{/* GitHub KPI */}

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

<HeroCard icon={<FolderKanban size={20}/>} color="bg-green-500" label="Repo Connected" value={integrationStats.repoConnected}/>

<HeroCard icon={<AlertCircle size={20}/>} color="bg-red-500" label="Missing Repo" value={integrationStats.repoMissing}/>

<HeroCard icon={<CheckCircle size={20}/>} color="bg-blue-500" label="Jira Project" value={integrationStats.jiraConnected}/>

<HeroCard icon={<AlertCircle size={20}/>} color="bg-yellow-500" label="Sync Errors" value={integrationStats.syncErrors}/>

<HeroCard icon={<TrendingUp size={20}/>} color="bg-indigo-500" label="Reports Exported" value={integrationStats.reportsExported}/>

</div>


{/* System Analytics */}

<div className="grid lg:grid-cols-2 gap-5">

<GitHubCommitChart data={commitChartData}/>

<GitHubHeatmap data={heatmapChartData}/>

</div>


{/* Team Analytics */}

<div className="grid lg:grid-cols-2 gap-5">

<TeamContributionRanking data={teamRankings}/>

<InactiveTeamsAI data={inactiveTeams}/>

</div>


{/* Team Activity */}

<TeamActivityTable data={[]}/>


{/* Activity + Quick Actions */}

<div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

<ActivityLog data={systemActivity}/>

<QuickActions navigate={navigate}/>

</div>


{/* Tables */}

<RecentCourses
courses={recentCourses}
navigate={navigate}
getSemesterName={getSemesterName}
getSubjectName={getSubjectName}
/>

<RecentGroups navigate={navigate}/>

</div>

)

}



/* ---------------- COMPONENTS ---------------- */


function HeroCard({icon,color,label,value,sub}){

return(

<div className="bg-white rounded-xl p-5 border flex gap-3 items-center">

<div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center`}>
{icon}
</div>

<div>
<p className="text-xs text-gray-500">{label}</p>
<h3 className="text-xl font-bold">{value}</h3>
{sub && <p className="text-xs text-green-600">{sub}</p>}
</div>

</div>

)

}



function GitHubCommitChart({ data = [] }){

return(

<Card>

<CardHeader>
<CardTitle>GitHub Commit Activity</CardTitle>
</CardHeader>

<CardContent style={{height:250}}>

<ResponsiveContainer width="100%" height="100%">
<LineChart data={data}>
<XAxis dataKey="day"/>
<YAxis/>
<Tooltip/>
<Line type="monotone" dataKey="commits" stroke="#14b8a6" strokeWidth={3}/>
</LineChart>
</ResponsiveContainer>

</CardContent>

</Card>

)

}



function GitHubHeatmap({ data = [] }){

return(

<Card>

<CardHeader>
<CardTitle>Contribution Heatmap</CardTitle>
</CardHeader>

<CardContent>

<CalendarHeatmap
startDate={subDays(new Date(),90)}
endDate={new Date()}
values={data}
/>

</CardContent>

</Card>

)

}



function TeamContributionRanking({ data = [] }){

return(

<Card>

<CardHeader>
<CardTitle>Top Team Contributions</CardTitle>
</CardHeader>

<CardContent>

{data.map((t,i)=>(
<div key={i} className="flex justify-between py-2 border-b text-sm">

<span>{i+1}. {t.team}</span>
<span className="font-semibold">{t.commits} commits</span>

</div>
))}

</CardContent>

</Card>

)

}



function InactiveTeamsAI({ data = [] }){

return(

<Card>

<CardHeader>
<CardTitle>Inactive Teams (AI)</CardTitle>
</CardHeader>

<CardContent>

{data.map((t,i)=>(
<div key={i} className="flex justify-between py-2 border-b text-sm">

<span>{t.team}</span>
<span className="text-red-500">{t.reason}</span>

</div>
))}

</CardContent>

</Card>

)

}



function TeamActivityTable({ data = [] }){

return(

<Card>

<CardHeader>
<CardTitle>Team Activity Overview</CardTitle>
</CardHeader>

<CardContent>

<div className="grid grid-cols-5 text-xs font-semibold text-gray-500 border-b pb-2">
<div>Team</div>
<div className="text-center">Repo</div>
<div className="text-center">Commits</div>
<div className="text-center">Last Commit</div>
<div className="text-center">Status</div>
</div>

{data.map((t, i)=>(
<div key={t.team} className="grid grid-cols-5 py-3 border-b text-sm">

<div className="font-semibold">{t.team}</div>

<div className="text-center">
{t.repo?"✓":"✗"}
</div>

<div className="text-center">
{t.commits}
</div>

<div className="text-center">
{t.lastCommit}
</div>

<div className="text-center">

<span className={`px-2 py-1 rounded text-xs
${t.status==="ACTIVE"?"bg-green-50 text-green-700":
t.status==="LOW"?"bg-yellow-50 text-yellow-700":
"bg-red-50 text-red-600"}`}>

{t.status}

</span>

</div>

</div>
))}

</CardContent>

</Card>

)

}



function ActivityLog({ data = [] }){

return(

<Card className="lg:col-span-3">

<CardHeader>
<CardTitle className="flex gap-2">
<Activity size={16}/> Hoạt động hệ thống
</CardTitle>
</CardHeader>

<CardContent className="p-0">

{data.map((act,i)=>(
<div key={i} className="flex gap-3 px-5 py-3 border-b">

<div className={`w-8 h-8 rounded-xl flex items-center justify-center ${act.color}`}>
<act.icon size={14}/>
</div>

<div>
<p className="text-sm">{act.msg}</p>
<p className="text-xs text-gray-400 flex gap-1 items-center">
<Clock size={10}/> {act.time}
</p>
</div>

</div>
))}

</CardContent>

</Card>

)

}



function QuickActions({navigate}){

const actions=[
{icon:CalendarDays,label:"Tạo học kỳ",to:"/admin/semesters"},
{icon:Library,label:"Tạo môn học",to:"/admin/subjects"},
{icon:BookOpen,label:"Tạo lớp học phần",to:"/admin/courses"},
{icon:Users,label:"Import Students",to:"/admin/import"},
{icon:FolderKanban,label:"Create Groups",to:"/admin/groups"},
{icon:TrendingUp,label:"Export Report",to:"/admin/export"}
]

return(

<Card className="lg:col-span-2">

<CardHeader>
<CardTitle className="flex gap-2">
<Plus size={16}/> Thao tác nhanh
</CardTitle>
</CardHeader>

<CardContent className="grid grid-cols-2 gap-3">

{actions.map(({icon:Icon,label,to})=>(
<button
key={to}
onClick={()=>navigate(to)}
className="p-4 border rounded-xl text-xs flex flex-col items-center gap-2 hover:bg-gray-50"
>
<Icon size={18}/>
{label}
</button>
))}

</CardContent>

</Card>

)

}



function RecentCourses({courses,navigate,getSemesterName,getSubjectName}){

if(!courses.length)
return <div className="text-center text-gray-400 py-10">
No data yet — Create your first course
</div>

return(

<Card>

<CardHeader className="flex justify-between items-center">

<CardTitle>Lớp học phần gần đây</CardTitle>

<Button onClick={()=>navigate("/admin/courses")}>
Xem tất cả
</Button>

</CardHeader>

<CardContent>

{courses.map(course=>{

const subjectCode =
course.subject?.code ??
getSubjectName(course.subjectId)

const semesterName =
course.semester?.name ??
getSemesterName(course.semesterId)

return(

<div key={course.id} className="grid grid-cols-4 py-3 border-t">

<div>
<p className="font-semibold">{course.code}</p>
<p className="text-xs text-gray-400">{course.name}</p>
</div>

<div className="text-center">
{subjectCode}<br/>
{semesterName}
</div>

<div className="text-center">
{course.currentStudents}/{course.maxStudents}
</div>

<div className="text-center">
<CourseStatusBadge status={course.status}/>
</div>

</div>

)

})}

</CardContent>

</Card>

)

}

function DashboardFilters({filters,setFilters}){

return(

<Card>

<CardContent className="grid grid-cols-4 gap-4">

{/* Semester */}

<select
className="border rounded p-2 text-sm"
value={filters.semester}
onChange={(e)=>setFilters({...filters,semester:e.target.value})}
>

<option value="">Semester</option>
<option value="Spring 2026">Spring 2026</option>
<option value="Summer 2026">Summer 2026</option>

</select>


{/* Major */}

<select
className="border rounded p-2 text-sm"
value={filters.major}
onChange={(e)=>setFilters({...filters,major:e.target.value})}
>

<option value="">Major</option>
<option value="SE">Software Engineering</option>
<option value="AI">Artificial Intelligence</option>

</select>


{/* Subject */}

<select
className="border rounded p-2 text-sm"
value={filters.subject}
onChange={(e)=>setFilters({...filters,subject:e.target.value})}
>

<option value="">Subject</option>
<option value="SWD392">SWD392</option>
<option value="PRN222">PRN222</option>

</select>


{/* Class */}

<select
className="border rounded p-2 text-sm"
value={filters.classId}
onChange={(e)=>setFilters({...filters,classId:e.target.value})}
>

<option value="">Class</option>
<option value="SE1830">SE1830</option>
<option value="SE1825">SE1825</option>

</select>

</CardContent>

</Card>

)

}

function RecentGroups({navigate}){

const groups=[
{id:"SE001",course:"SWD392",github:true,jira:true,status:"ACTIVE"},
{id:"SE002",course:"PRN222",github:true,jira:false,status:"MISSING_JIRA"},
{id:"SE003",course:"SWP391",github:false,jira:false,status:"MISSING_REPO"}
]

return(

<Card>

<CardHeader>
<CardTitle>Recent Project Groups</CardTitle>
</CardHeader>

<CardContent>

<div className="grid grid-cols-5 text-xs font-semibold text-gray-500 border-b pb-2">
<div>Group</div>
<div>Class</div>
<div className="text-center">GitHub</div>
<div className="text-center">Jira</div>
<div className="text-center">Status</div>
</div>

{groups.map(g=>(
<div key={g.id} className="grid grid-cols-5 py-3 border-b text-sm">

<div
className="font-semibold cursor-pointer text-teal-600"
onClick={()=>navigate(`/admin/groups/${g.id}`)}
>
{g.id}
</div>

<div>{g.course}</div>

<div className="text-center">
{g.github?"✓":"✗"}
</div>

<div className="text-center">
{g.jira?"✓":"✗"}
</div>

<div className="text-center">
{g.status}
</div>

</div>
))}

</CardContent>

</Card>

)

}



function CourseStatusBadge({status}){

const map={
ACTIVE:"bg-green-50 text-green-700",
UPCOMING:"bg-blue-50 text-blue-700",
COMPLETED:"bg-gray-100 text-gray-500",
CLOSED:"bg-gray-100 text-gray-500"
}

const label={
ACTIVE:"Đang mở",
UPCOMING:"Sắp mở",
COMPLETED:"Đã kết thúc",
CLOSED:"Đã đóng"
}

return(
<span className={`px-2 py-1 text-xs rounded ${map[status]||map.CLOSED}`}>
{label[status]||status}
</span>
)
}
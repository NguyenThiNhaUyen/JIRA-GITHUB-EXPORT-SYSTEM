// My Courses — Lecturer "Lớp của tôi"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Card, CardContent } from "../../components/ui/card.jsx"
import { Button } from "../../components/ui/button.jsx"
import { useToast } from "../../components/ui/toast.jsx"

import {
ChevronRight,
GraduationCap,
Users,
BookOpen,
Settings2,
Search,
BarChart3,
GitBranch,
AlertTriangle
} from "lucide-react"

import {
LineChart,
Line,
ResponsiveContainer
} from "recharts"

import { useGetCourses } from "../../features/courses/hooks/useCourses.js"



/* ---------------- MOCK COMMIT DATA ---------------- */

const MOCK_COMMIT = [
{ day:"Mon", commits:5 },
{ day:"Tue", commits:7 },
{ day:"Wed", commits:3 },
{ day:"Thu", commits:9 },
{ day:"Fri", commits:12 }
]



export default function MyCourses(){

const navigate = useNavigate()
const { error: showError } = useToast()

const [search,setSearch] = useState("")



/* ---------------- DATA ---------------- */

const { data:coursesData={items:[]}, isLoading }
= useGetCourses({pageSize:100})

const courses = coursesData.items || []



/* ---------------- FILTER ---------------- */

const filtered = courses.filter(c=>

c.code?.toLowerCase().includes(search.toLowerCase()) ||

c.name?.toLowerCase().includes(search.toLowerCase()) ||

c.subjectName?.toLowerCase().includes(search.toLowerCase())

)



/* ---------------- STATS ---------------- */

const totalGroups =
courses.reduce((a,c)=>a+(c.projects?.length || 0),0)

const totalStudents =
courses.reduce((a,c)=>a+(c.currentStudents || 0),0)



return(

<div className="space-y-6">

{/* Breadcrumb */}

<nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">

<span className="text-teal-700 font-semibold">
Giảng viên
</span>

<ChevronRight size={12}/>

<span className="text-gray-800 font-semibold">
Lớp của tôi
</span>

</nav>



{/* Header */}

<div className="flex flex-wrap items-start justify-between gap-4">

<div>

<h2 className="text-2xl font-bold tracking-tight text-gray-800">
Lớp của tôi
</h2>

<p className="text-sm text-gray-500 mt-0.5">
Các lớp học bạn đang giảng dạy
</p>

</div>



{/* Search */}

<div className="relative">

<Search
size={15}
className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
/>

<input
value={search}
onChange={e=>setSearch(e.target.value)}
placeholder="Tìm kiếm lớp học..."
className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 w-56 transition-all"
/>

</div>

</div>



{/* Stats */}

<div className="grid grid-cols-3 gap-4">

<MiniStat
label="Tổng lớp"
value={courses.length}
color="text-teal-700 bg-teal-50 border-teal-100"
/>

<MiniStat
label="Tổng nhóm"
value={totalGroups}
color="text-blue-700 bg-blue-50 border-blue-100"
/>

<MiniStat
label="Tổng sinh viên"
value={totalStudents}
color="text-indigo-700 bg-indigo-50 border-indigo-100"
/>

</div>



{/* CONTENT */}

{isLoading ? (

<div className="flex justify-center py-20">

<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"/>

</div>

) : filtered.length===0 ? (

<EmptyState
message={search
? "Không tìm thấy lớp học phù hợp"
: "Bạn chưa được giao lớp nào"}
/>

) : (

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

{filtered.map(course=>(

<CourseCard
key={course.id}
course={course}
navigate={navigate}
/>

))}

</div>

)}

</div>

)

}



/* ---------------- COURSE CARD ---------------- */

function CourseCard({course,navigate}){

const groupCount = course.projects?.length || 0

const activeTeams =
course.projects?.filter(p=>p.repoConnected)?.length || 0

const jiraConnected =
course.projects?.filter(p=>p.jiraConnected)?.length || 0

const lastCommit =
course.lastCommit || "No activity"

const inactiveTeams =
groupCount - activeTeams



/* Course health */

let status = "ACTIVE"

if(activeTeams===0){

status = "NO REPO"

}else if(activeTeams < groupCount/2){

status = "LOW"

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

{course.subjectCode || "—"}

</span>

</div>



{/* Title */}

<div>

<h3 className="font-bold text-gray-800 leading-snug">
{course.code}
</h3>

<p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
{course.name || course.subjectName}
</p>

</div>



{/* Students + Teams */}

<div className="flex items-center gap-4 text-xs text-gray-500">

<span className="flex items-center gap-1">
<Users size={11}/>
{course.currentStudents} sinh viên
</span>

<span className="flex items-center gap-1">
<BookOpen size={11}/>
{groupCount} nhóm
</span>

</div>



{/* Commit Trend */}

<MiniCommitChart data={MOCK_COMMIT}/>



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
Last commit: {lastCommit}
</span>

</div>



{/* Warning */}

{inactiveTeams>0 && (

<div className="text-xs text-red-500 flex items-center gap-1">

<AlertTriangle size={12}/>

{inactiveTeams} teams inactive

</div>

)}



<StatusBadge status={status}/>



{/* Buttons */}

<div className="grid grid-cols-2 gap-2">

<Button
onClick={()=>navigate(`/lecturer/course/${course.id}/manage-groups`)}
className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 text-sm"
>

<Settings2 size={13}/>
Manage

</Button>

<Button
onClick={()=>navigate(`/lecturer/course/${course.id}/analytics`)}
variant="outline"
className="flex items-center justify-center gap-2 text-sm rounded-xl h-9"
>

<BarChart3 size={13}/>
Analytics

</Button>

</div>

</CardContent>

</Card>

)

}



/* ---------------- MINI CHART ---------------- */

function MiniCommitChart({data}){

return(

<div className="h-10 w-full">

<ResponsiveContainer width="100%" height="100%">

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
"NO REPO":"bg-red-50 text-red-600"
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
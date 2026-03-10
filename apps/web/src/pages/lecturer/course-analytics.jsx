import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx"

import CalendarHeatmap from "react-calendar-heatmap"
import "react-calendar-heatmap/dist/styles.css"

import { subDays } from "date-fns"

import {
LineChart,
Line,
ResponsiveContainer,
BarChart,
Bar,
XAxis,
YAxis,
Tooltip
} from "recharts"



/* ---------------- MOCK DATA ---------------- */

const MOCK_HEATMAP = [
{ date:"2026-03-01", count:3 },
{ date:"2026-03-02", count:6 },
{ date:"2026-03-03", count:2 },
{ date:"2026-03-04", count:8 },
{ date:"2026-03-05", count:4 }
]

const MOCK_COMMITS = [
{ day:"Mon", commits:5 },
{ day:"Tue", commits:7 },
{ day:"Wed", commits:3 },
{ day:"Thu", commits:9 },
{ day:"Fri", commits:12 }
]

const MOCK_TEAMS = [
{ name:"Team A", commits:42 },
{ name:"Team B", commits:37 },
{ name:"Team C", commits:31 }
]

const MOCK_INACTIVE = [
{ name:"Team F", reason:"No commits 7 days" },
{ name:"Team H", reason:"Repo missing" }
]

const MOCK_JIRA = [
{ status:"Todo", value:15 },
{ status:"In Progress", value:9 },
{ status:"Done", value:22 }
]



export default function CourseAnalytics(){

const { courseId } = useParams()

return(

<div className="space-y-6">

{/* Header */}

<div>

<h2 className="text-2xl font-bold text-gray-800">
Course Analytics
</h2>

<p className="text-sm text-gray-500">
Class performance insights
</p>

</div>



{/* Overview */}

<div className="grid grid-cols-4 gap-4">

<Stat label="Teams" value={8}/>
<Stat label="Students" value={32}/>
<Stat label="Repo Connected" value={6}/>
<Stat label="Active Teams" value={6}/>

</div>



{/* Heatmap */}

<Card>

<CardHeader>

<CardTitle>
Contribution Heatmap
</CardTitle>

</CardHeader>

<CardContent>

<CalendarHeatmap
startDate={subDays(new Date(),90)}
endDate={new Date()}
values={MOCK_HEATMAP}
/>

</CardContent>

</Card>



{/* Commit Trend */}

<Card>

<CardHeader>

<CardTitle>
Commit Trend
</CardTitle>

</CardHeader>

<CardContent>

<div className="h-64">

<ResponsiveContainer width="100%" height="100%">

<LineChart data={MOCK_COMMITS}>

<XAxis dataKey="day"/>

<YAxis/>

<Tooltip/>

<Line
type="monotone"
dataKey="commits"
stroke="#14b8a6"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

</CardContent>

</Card>



{/* Teams Section */}

<div className="grid lg:grid-cols-2 gap-6">

<TopTeams/>

<InactiveTeams/>

</div>



{/* Jira Stats */}

<Card>

<CardHeader>

<CardTitle>
Jira Issue Stats
</CardTitle>

</CardHeader>

<CardContent>

<div className="h-64">

<ResponsiveContainer width="100%" height="100%">

<BarChart data={MOCK_JIRA}>

<XAxis dataKey="status"/>

<YAxis/>

<Tooltip/>

<Bar
dataKey="value"
fill="#14b8a6"
/>

</BarChart>

</ResponsiveContainer>

</div>

</CardContent>

</Card>



</div>

)

}



/* ---------------- STAT ---------------- */

function Stat({label,value}){

return(

<div className="rounded-xl border bg-white p-4 flex justify-between">

<span className="text-sm text-gray-500">
{label}
</span>

<span className="font-bold text-lg">
{value}
</span>

</div>

)

}



/* ---------------- TOP TEAMS ---------------- */

function TopTeams(){

return(

<Card>

<CardHeader>

<CardTitle>
Top Teams
</CardTitle>

</CardHeader>

<CardContent>

{MOCK_TEAMS.map((t,i)=>(

<div
key={i}
className="flex justify-between py-2 border-b text-sm"
>

<span>
{i+1}. {t.name}
</span>

<span className="font-semibold">

{t.commits} commits

</span>

</div>

))}

</CardContent>

</Card>

)

}



/* ---------------- INACTIVE TEAMS ---------------- */

function InactiveTeams(){

return(

<Card>

<CardHeader>

<CardTitle>
Inactive Teams
</CardTitle>

</CardHeader>

<CardContent>

{MOCK_INACTIVE.map((t,i)=>(

<div
key={i}
className="flex justify-between py-2 border-b text-sm"
>

<span>
{t.name}
</span>

<span className="text-red-500">

{t.reason}

</span>

</div>

))}

</CardContent>

</Card>

)

}
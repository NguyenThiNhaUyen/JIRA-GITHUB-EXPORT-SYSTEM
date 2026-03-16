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
const MOCK_HEATMAP = []
const MOCK_COMMITS = []
const MOCK_TEAMS = []
const MOCK_INACTIVE = []
const MOCK_JIRA = []



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



<div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border shadow-sm">
  <div className="text-xl font-bold text-gray-800 mb-2">Chưa hỗ trợ API</div>
  <p className="text-gray-500">Chức năng Course Analytics hiện chưa có dữ liệu từ backend.</p>
</div>
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
import { GraduationCap, Users, BookOpen, GitBranch, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";

export function CourseCard({ course, onNavigate }) {
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

  let status = "ACTIVE";
  if (activeTeams === 0 && groupCount > 0) {
    status = "NO REPO";
  } else if (activeTeams < groupCount / 2) {
    status = "LOW";
  }
  if (course.status === "COMPLETED") {
    status = "ARCHIVED";
  }

  return (
    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white hover:shadow-md transition-all duration-200 group">
      <div className="h-1.5 bg-gradient-to-r from-teal-500 to-teal-600" />
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
            <GraduationCap size={18} className="text-teal-700" />
          </div>
          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {course.subject?.code || course.subjectCode || "—"}
          </span>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 leading-snug">{course.code}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{course.name || course.subject?.name || course.subjectName}</p>
          <p className="text-xs text-gray-400">Học kỳ: {semester}</p>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Users size={11} /> {course.currentStudents || 0} sinh viên</span>
          <span className="flex items-center gap-1"><BookOpen size={11} /> {groupCount} nhóm</span>
        </div>

        <MiniCommitChart data={course.commitTrends || []} />

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>Project progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1"><GitBranch size={12} /> Repo: {activeTeams}/{groupCount}</span>
          <span>Jira: {jiraConnected}/{groupCount}</span>
        </div>

        <div className="text-xs text-gray-500 flex justify-between">
          <span>Active teams: {activeTeams}/{groupCount}</span>
          <span>Last activity: {lastCommit}</span>
        </div>

        {alerts > 0 && <div className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} /> {alerts} alerts detected</div>}

        <div className="flex justify-end">
          <StatusBadge status={status} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => onNavigate(`/lecturer/course/${course.id}/dashboard`)} variant="outline" className="text-sm h-9 rounded-xl">Dashboard</Button>
          <Button onClick={() => onNavigate(`/lecturer/course/${course.id}/manage-groups`)} className="bg-teal-600 hover:bg-teal-700 text-white text-sm h-9 rounded-xl">Manage</Button>
          <Button onClick={() => onNavigate(`/lecturer/course/${course.id}/alerts`)} variant="outline" className="text-sm h-9 rounded-xl">Alerts</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniCommitChart({ data }) {
  if (!data || data.length === 0) return <div className="h-10 w-full" />;
  return (
    <div className="w-full h-[40px]">
      <ResponsiveContainer width="100%" aspect={4}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="commits" stroke="#14b8a6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE: "bg-green-50 text-green-700",
    LOW: "bg-yellow-50 text-yellow-700",
    "NO REPO": "bg-red-50 text-red-600",
    ARCHIVED: "bg-gray-100 text-gray-600"
  };
  return <span className={`text-[10px] px-2 py-1 rounded ${map[status]}`}>{status}</span>;
}

// Contributions Analytics — Lecturer (Advanced: DB-connected, per-group/student)
import { useState, useEffect } from "react";
import { ChevronRight, BarChart3, GitBranch, CheckSquare, TrendingUp, Users, Activity, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import db from "../../mock/db.js";

const WEEKS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

function buildWeeklyData(commits) {
    // Map commits to 12 week buckets relative to the earliest commit
    const counts = new Array(12).fill(0);
    if (commits.length === 0) return counts;
    const sorted = [...commits].sort((a, b) => new Date(a.committedAt) - new Date(b.committedAt));
    const firstDate = new Date(sorted[0].committedAt);
    for (const c of commits) {
        const weekIndex = Math.min(
            Math.floor((new Date(c.committedAt) - firstDate) / (7 * 24 * 60 * 60 * 1000)),
            11
        );
        if (weekIndex >= 0) counts[weekIndex]++;
    }
    return counts;
}

export default function Contributions() {
    const { user } = useAuth();
    const [selectedCourse, setSelectedCourse] = useState("");
    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [students, setStudents] = useState([]);
    const [commitsByStudent, setCommitsByStudent] = useState({});
    const [weeklyCommits, setWeeklyCommits] = useState(new Array(12).fill(0));

    useEffect(() => {
        if (!user?.id) return;
        const assignments = db.findMany("courseLecturers", { lecturerId: user.id });
        const courseIds = assignments.map((a) => a.courseId);
        const mine = courseIds.map((id) => db.findById("courses", id)).filter(Boolean);
        setCourses(mine);
        if (mine.length > 0 && !selectedCourse) setSelectedCourse(mine[0].id);
    }, [user]);

    useEffect(() => {
        if (!selectedCourse) return;

        const courseGroups = db.getCourseGroups(selectedCourse);
        setGroups(courseGroups);

        // Collect all students in this course
        const enrollments = db.findMany("courseEnrollments", { courseId: selectedCourse });
        const allStudents = enrollments
            .map((e) => db.findById("users.students", e.studentId))
            .filter(Boolean);
        setStudents(allStudents);

        // Collect commits per student via projects
        const projects = db.findMany("projects", { courseId: selectedCourse });
        const allCommits = projects.flatMap((p) => db.findMany("commits", { projectId: p.id }));

        const byStudent = {};
        for (const s of allStudents) {
            byStudent[s.id] = {
                name: s.name,
                studentId: s.studentId,
                commits: allCommits.filter((c) => c.authorStudentId === s.id).length,
            };
        }
        setCommitsByStudent(byStudent);
        setWeeklyCommits(buildWeeklyData(allCommits));
    }, [selectedCourse]);

    const maxWeekly = Math.max(...weeklyCommits, 1);

    const sortedStudents = Object.values(commitsByStudent).sort((a, b) => b.commits - a.commits);

    // Group-level stats
    const groupStats = groups.map((g) => {
        const memberCommits = g.studentIds.reduce(
            (sum, sid) => sum + (commitsByStudent[sid]?.commits || 0),
            0
        );
        return { ...g, totalCommits: memberCommits };
    });

    const totalCommits = sortedStudents.reduce((s, st) => s + st.commits, 0);
    const activeStudents = sortedStudents.filter((s) => s.commits > 0).length;
    const inactiveStudents = sortedStudents.filter((s) => s.commits === 0).length;

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="text-teal-700 font-semibold">Giảng viên</span>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-semibold">Theo dõi đóng góp</span>
            </nav>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-800">Theo dõi đóng góp</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Commit, hoạt động theo nhóm và cá nhân</p>
                </div>
                {courses.length > 1 && (
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-gray-400" />
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
                        >
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>{c.code}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: GitBranch, color: "bg-teal-500", label: "Tổng commits", value: totalCommits },
                    { icon: Users, color: "bg-green-500", label: "Sinh viên tích cực", value: activeStudents },
                    { icon: Activity, color: "bg-red-400", label: "Chưa có commit", value: inactiveStudents },
                    { icon: TrendingUp, color: "bg-blue-500", label: "Số nhóm", value: groups.length },
                ].map(({ icon: Icon, color, label, value }) => (
                    <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                        <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shrink-0`}>
                            <Icon size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{label}</p>
                            <h3 className="text-2xl font-bold text-gray-800 leading-none mt-0.5">{value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly commits bar chart */}
                <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                    <CardHeader className="border-b border-gray-50 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                                <GitBranch size={15} className="text-teal-600" />
                            </div>
                            <CardTitle className="text-base font-semibold text-gray-800">Commits theo tuần</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="flex items-end gap-1.5 h-32">
                            {weeklyCommits.map((v, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                    <span className="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{v}</span>
                                    <div
                                        className="w-full bg-teal-400 hover:bg-teal-500 rounded-t-md transition-all cursor-default"
                                        style={{ height: `${(v / maxWeekly) * 100}%`, minHeight: v > 0 ? 4 : 0 }}
                                        title={`Tuần ${i + 1}: ${v} commits`}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2">
                            {WEEKS.map((w) => (
                                <span key={w} className="text-[9px] text-gray-400 flex-1 text-center">{w}</span>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-3">
                            {/* TODO: Connect to real GitHub API for live commit data */}
                            * Dữ liệu từ mock DB. Sẽ kết nối GitHub API sau khi tích hợp.
                        </p>
                    </CardContent>
                </Card>

                {/* Group-level comparison */}
                <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                    <CardHeader className="border-b border-gray-50 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                <BarChart3 size={15} className="text-blue-600" />
                            </div>
                            <CardTitle className="text-base font-semibold text-gray-800">So sánh đóng góp theo nhóm</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-3">
                        {groupStats.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">Chưa có nhóm nào trong lớp này</p>
                        ) : (
                            groupStats.map((g) => {
                                const maxInGroup = Math.max(...groupStats.map((x) => x.totalCommits), 1);
                                const pct = Math.round((g.totalCommits / maxInGroup) * 100);
                                return (
                                    <div key={g.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-semibold text-gray-700">{g.name}</span>
                                            <span className="text-xs text-gray-500">{g.totalCommits} commits</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-400 rounded-full transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Student ranking */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <Activity size={15} className="text-indigo-600" />
                        </div>
                        <CardTitle className="text-base font-semibold text-gray-800">Xếp hạng đóng góp sinh viên</CardTitle>
                    </div>
                </CardHeader>
                <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5">Sinh viên</div>
                    <div className="col-span-2 text-right">MSSV</div>
                    <div className="col-span-2 text-right">Commits</div>
                    <div className="col-span-2 text-right">Trạng thái</div>
                </div>
                <CardContent className="p-0">
                    {sortedStudents.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">Không có dữ liệu đóng góp</p>
                    ) : (
                        sortedStudents.map((s, i) => (
                            <div key={s.studentId} className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                                <div className="col-span-1 text-sm font-bold text-gray-400">#{i + 1}</div>
                                <div className="col-span-5 flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">
                                        {s.name.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 truncate">{s.name}</span>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className="text-xs font-mono text-gray-500">{s.studentId}</span>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className="text-sm font-semibold text-gray-700">{s.commits}</span>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${s.commits > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                                        }`}>
                                        {s.commits > 0 ? "Tích cực" : "Chưa commit"}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

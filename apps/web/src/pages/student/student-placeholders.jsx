// Student real sub-pages — Contribution, Alerts (personal), SRS standalone view
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, GitBranch, Bell, CheckCircle, AlertTriangle, Clock, BookOpen, BarChart2, Users, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import db from "../../mock/db.js";
import { SRS_STATUS, ALERT_SEVERITY, buildStudentAlerts } from "../../shared/permissions.js";

const SRS_STATUS_CLS = Object.fromEntries(Object.entries(SRS_STATUS).map(([k, v]) => [k, v.cls]));

/* ─── Shared Breadcrumb ─── */
function Breadcrumb({ title }) {
    const navigate = useNavigate();
    return (
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <span className="text-teal-700 font-semibold cursor-pointer hover:underline" onClick={() => navigate("/student")}>Sinh viên</span>
            <ChevronRight size={12} />
            <span className="text-gray-800 font-semibold">{title}</span>
        </nav>
    );
}

/* ═══════════ Contribution Page ═══════════ */
export function StudentContributionPage() {
    const { user } = useAuth();
    const [myGroups, setMyGroups] = useState([]);
    const [commitMap, setCommitMap] = useState({}); // groupId -> { myCommits, totalCommits, members }

    useEffect(() => {
        if (!user?.id) return;
        const allGroups = db.findMany("groups");
        const mine = allGroups.filter(g => g.studentIds?.includes(user.id));
        setMyGroups(mine);

        const map = {};
        for (const g of mine) {
            const proj = db.findMany("projects", { courseId: g.courseId })[0];
            if (!proj) { map[g.id] = { my: 0, total: 0, members: [] }; continue; }
            const commits = db.findMany("commits", { projectId: proj.id });
            const my = commits.filter(c => c.authorStudentId === user.id).length;
            const students = db.getGroupStudents(g.id);
            const members = students.map(s => ({
                ...s,
                commits: commits.filter(c => c.authorStudentId === s.id).length,
                isLeader: s.id === g.teamLeaderId,
            })).sort((a, b) => b.commits - a.commits);
            map[g.id] = { my, total: commits.length, members };
        }
        setCommitMap(map);
    }, [user]);

    const totalMyCommits = Object.values(commitMap).reduce((s, v) => s + v.my, 0);
    const activeGroups = Object.values(commitMap).filter(v => v.total > 0).length;

    return (
        <div className="space-y-6">
            <Breadcrumb title="Đóng góp của tôi" />

            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">Đóng góp của tôi</h2>
                <p className="text-sm text-gray-500 mt-0.5">Tổng quan commit và đóng góp cá nhân theo nhóm</p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { icon: GitBranch, color: "bg-teal-500", label: "Tổng commits của tôi", value: totalMyCommits },
                    { icon: Users, color: "bg-blue-500", label: "Nhóm tham gia", value: myGroups.length },
                    { icon: Activity, color: "bg-green-500", label: "Nhóm có hoạt động", value: activeGroups },
                ].map(({ icon: Icon, color, label, value }) => (
                    <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl ${color} text-white flex items-center justify-center shrink-0`}><Icon size={18} /></div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{label}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Per-group breakdown */}
            {myGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <BarChart2 size={36} className="text-gray-300" />
                    <p className="text-sm text-gray-400">Bạn chưa tham gia nhóm nào</p>
                </div>
            ) : myGroups.map(g => {
                const data = commitMap[g.id] || { my: 0, total: 0, members: [] };
                const course = db.findById("courses", g.courseId);
                const maxCommits = Math.max(...data.members.map(m => m.commits), 1);
                return (
                    <Card key={g.id} className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold text-gray-800">{g.name}</CardTitle>
                                    <p className="text-xs text-gray-400 mt-0.5">{course?.name || g.courseId}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-teal-700">{data.my}</p>
                                        <p className="text-[10px] text-gray-400">My commits</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-700">{data.total}</p>
                                        <p className="text-[10px] text-gray-400">Total</p>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="py-4 px-5 space-y-3">
                            {data.members.map(m => (
                                <div key={m.id} className="flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${m.isLeader ? "bg-amber-100 text-amber-700" : m.id === user?.id ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"}`}>
                                        {m.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-xs font-semibold text-gray-700">{m.name}</span>
                                            {m.id === user?.id && <span className="text-[9px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-full">Bạn</span>}
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${m.id === user?.id ? "bg-teal-500" : "bg-gray-300"}`}
                                                style={{ width: `${(m.commits / maxCommits) * 100}%` }} />
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600 shrink-0">{m.commits}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

/* ═══════════ Alerts Page ═══════════ */
export function StudentAlertsPage() {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        const allGroups = db.findMany("groups");
        const myGroups = allGroups.filter(g => g.studentIds?.includes(user.id));
        // Add course code context to group name for display
        const enriched = myGroups.map(g => ({
            ...g,
            name: `${g.name} (${db.findById("courses", g.courseId)?.code || g.courseId})`,
        }));
        setAlerts(buildStudentAlerts(enriched, user.id));
    }, [user]);

    const sevCls = {
        high: { border: `${ALERT_SEVERITY.high.cls} border`, icon: "text-red-500", text: "text-red-800" },
        medium: { border: `${ALERT_SEVERITY.medium.cls} border`, icon: "text-orange-500", text: "text-orange-800" },
        info: { border: "bg-blue-50 border-blue-100 border", icon: "text-blue-500", text: "text-blue-800" },
    };


    return (
        <div className="space-y-6">
            <Breadcrumb title="Cảnh báo" />
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">Cảnh báo cá nhân</h2>
                <p className="text-sm text-gray-500 mt-0.5">Nhắc nhở từ hệ thống liên quan đến các nhóm của bạn</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-orange-400 text-white flex items-center justify-center shrink-0"><Bell size={18} /></div>
                    <div><p className="text-xs text-gray-500">Tổng cảnh báo</p><h3 className="text-2xl font-bold text-gray-800">{alerts.length}</h3></div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-red-400 text-white flex items-center justify-center shrink-0"><AlertTriangle size={18} /></div>
                    <div><p className="text-xs text-gray-500">Cần xử lý ngay</p><h3 className="text-2xl font-bold text-gray-800">{alerts.filter(a => a.sev === "high").length}</h3></div>
                </div>
            </div>

            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardContent className="p-0">
                    {alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center">
                                <CheckCircle size={32} className="text-green-400" />
                            </div>
                            <p className="font-semibold text-gray-700">Không có cảnh báo nào!</p>
                            <p className="text-sm text-gray-400">Tất cả nhóm của bạn đang hoạt động tốt 🎉</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {alerts.map((a, i) => {
                                const cls = sevCls[a.sev] || sevCls.info;
                                return (
                                    <div key={i} className={`flex items-start gap-3 px-5 py-4 ${cls.border} border-b last:border-0`}>
                                        <AlertTriangle size={15} className={`shrink-0 mt-0.5 ${cls.icon}`} />
                                        <p className={`text-sm ${cls.text}`}>{a.msg}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

/* ═══════════ SRS Standalone Page ═══════════ */
export function StudentSrsPage() {
    const { user } = useAuth();
    const [srsList, setSrsList] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        const allGroups = db.findMany("groups");
        const myGroups = allGroups.filter(g => g.studentIds?.includes(user.id));
        const items = [];
        for (const g of myGroups) {
            const proj = db.findMany("projects", { courseId: g.courseId })[0];
            if (!proj) continue;
            const srs = db.findMany("srsReports", { projectId: proj.id });
            const course = db.findById("courses", g.courseId);
            for (const s of srs) {
                items.push({ ...s, groupName: g.name, courseName: course?.name || "" });
            }
        }
        setSrsList(items);
    }, [user]);



    return (
        <div className="space-y-6">
            <Breadcrumb title="SRS Reports" />
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">SRS Reports của nhóm</h2>
                <p className="text-sm text-gray-500 mt-0.5">Xem lịch sử nộp SRS và nhận xét từ giảng viên</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {["FINAL", "REVIEW", "DRAFT"].map(s => (
                    <div key={s} className={`rounded-2xl px-4 py-3 border flex items-center justify-between ${SRS_STATUS_CLS[s]}`}>
                        <span className="text-xs font-semibold">{s}</span>
                        <span className="text-xl font-bold">{srsList.filter(x => x.status === s).length}</span>
                    </div>
                ))}
            </div>

            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardContent className="p-0">
                    {srsList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <BookOpen size={36} className="text-gray-300" />
                            <p className="text-sm text-gray-400">Nhóm chưa có SRS nào được nộp</p>
                        </div>
                    ) : srsList.map(rpt => (
                        <div key={rpt.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-mono font-semibold text-gray-700">v{rpt.version}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${SRS_STATUS_CLS[rpt.status] || SRS_STATUS_CLS.DRAFT}`}>{rpt.status}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{rpt.groupName} · {rpt.courseName}</p>
                                {rpt.feedback && <p className="text-xs text-blue-600 italic mt-0.5">Nhận xét GV: {rpt.feedback}</p>}
                                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                    <Clock size={9} />{new Date(rpt.submittedAt).toLocaleDateString("vi-VN")}
                                </p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

/* ═══════════ Courses Page ═══════════ */
export default function StudentCoursesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState({});

    useEffect(() => {
        if (!user?.id) return;
        const enrollments = db.findMany("courseEnrollments", { studentId: user.id });
        const myCourses = enrollments.map(e => {
            const c = db.findById("courses", e.courseId);
            if (!c) return null;
            return {
                ...c,
                subject: db.findById("subjects", c.subjectId),
                semester: db.findById("semesters", c.semesterId),
                lecturers: db.getCourseLecturers(c.id),
            };
        }).filter(Boolean);
        setCourses(myCourses);

        const allGroups = db.findMany("groups");
        const myGroups = {};
        for (const g of allGroups) {
            if (g.studentIds?.includes(user.id)) myGroups[g.courseId] = g;
        }
        setGroups(myGroups);
    }, [user]);

    return (
        <div className="space-y-6">
            <Breadcrumb title="Lớp của tôi" />
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">Lớp học của tôi</h2>
                <p className="text-sm text-gray-500 mt-0.5">Tất cả lớp học phần bạn đang tham gia</p>
            </div>

            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <BookOpen size={36} className="text-gray-300" />
                    <p className="text-sm text-gray-400">Bạn chưa được đăng ký lớp nào</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {courses.map(c => {
                        const g = groups[c.id];
                        const isLeader = g?.teamLeaderId === user?.id;
                        return (
                            <Card key={c.id}
                                className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white hover:shadow-md transition-all cursor-pointer"
                                onClick={() => navigate("/student")}
                            >
                                <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-400" />
                                <CardContent className="p-5">
                                    <p className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block mb-1">{c.subject?.code || c.code}</p>
                                    <h4 className="font-bold text-gray-800 text-sm mb-2">{c.name}</h4>
                                    <p className="text-xs text-gray-500">{c.lecturers?.[0]?.name || "Chưa có GV"}</p>
                                    {g && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${isLeader ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                                {isLeader ? "Leader" : "Member"}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{g.name}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* Re-export as alias for convenience */
export { StudentContributionPage as StudentMyProjectPage };

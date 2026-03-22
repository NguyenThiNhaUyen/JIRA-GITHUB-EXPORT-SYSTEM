// Feature Hooks
import { useState, useEffect } from "react";
import { ChevronRight, BarChart3, GitBranch, TrendingUp, Users, Activity, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects, useGetProjectMetrics } from "../../features/projects/hooks/useProjects.js";


const WEEKS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

export default function Contributions() {
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedProject, setSelectedProject] = useState("");

    const { data: coursesData = { items: [] }, isLoading: loadingCourses } = useGetCourses({ pageSize: 100 });
    const courses = coursesData.items || [];

    useEffect(() => {
        if (courses.length > 0 && !selectedCourse) {
            setSelectedCourse(String(courses[0].id));
        }
    }, [courses]);

    // Fetch projects thuộc lớp đã chọn (không dùng course.groups vì list API không include groups)
    const { data: courseProjectsData = { items: [] }, isLoading: loadingProjects } = useGetProjects(
        selectedCourse ? { courseId: selectedCourse, pageSize: 100 } : null
    );
    const groups = courseProjectsData.items || [];

    // Khi đổi lớp, reset nhóm đã chọn
    useEffect(() => {
        setSelectedProject("");
    }, [selectedCourse]);

    // Khi nhóm load xong, tự chọn nhóm đầu tiên
    useEffect(() => {
        if (groups.length > 0 && !selectedProject) {
            setSelectedProject(String(groups[0].id));
        }
    }, [groups]);

    const { data: metrics, isLoading: loadingMetrics } = useGetProjectMetrics(selectedProject);
    
    const weeklyCommits = metrics?.weeklyCommits || new Array(12).fill(0);
    const commitsByStudent = metrics?.contributions || [];


    const maxWeekly = Math.max(...weeklyCommits, 1);

    const sortedStudents = [...commitsByStudent].sort((a, b) => b.commits - a.commits);

    // Group-level stats (Với API hiện tại, thông tin nhóm được gộp chung trong project metrics)
    const totalCommits = sortedStudents.reduce((s, st) => s + (st.commits || 0), 0);
    const activeStudents = sortedStudents.filter((s) => (s.commits || 0) > 0).length;
    const inactiveStudents = sortedStudents.filter((s) => (s.commits || 0) === 0).length;

    return (
        <div className="space-y-6">
            {/* Breadcrumb ... remains same ... */}
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
                {courses.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Khối lớp:</span>
                            <select
                                value={selectedCourse}
                                onChange={(e) => {
                                    setSelectedCourse(e.target.value);
                                    setSelectedProject(""); 
                                }}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none text-xs font-semibold"
                            >
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>{c.code}</option>
                                ))}
                            </select>
                        </div>
                        {groups.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Nhóm:</span>
                                <select
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none text-xs font-semibold"
                                >
                                    {groups.map((g) => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {loadingMetrics || loadingProjects ? (
                <div className="py-20 flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
                    <p className="text-sm text-gray-400">{loadingProjects ? "Đang tải danh sách nhóm..." : "Đang đồng bộ dữ liệu GitHub..."}</p>
                </div>
            ) : !selectedProject ? (
                <div className="py-20 text-center text-gray-400">
                    <Activity size={40} className="mx-auto mb-3 opacity-20" />
                    <p>Vui lòng chọn một dự án để xem báo cáo đóng góp</p>
                </div>
            ) : (
                <>
                    {/* Summary stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: GitBranch, color: "bg-teal-500", label: "Tổng commits", value: totalCommits },
                            { icon: Users, color: "bg-green-500", label: "Sinh viên tích cực", value: activeStudents },
                            { icon: Activity, color: "bg-red-400", label: "Chưa có commit", value: inactiveStudents },
                            { icon: TrendingUp, color: "bg-blue-500", label: "Nhân lực", value: sortedStudents.length },
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
                                <p className="text-[10px] text-gray-400 mt-3 italic">
                                    * Dữ liệu commit 30 ngày gần nhất được tổng hợp từ GitHub.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Summary Info */}
                        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                            <CardHeader className="border-b border-gray-50 pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <BarChart3 size={15} className="text-blue-600" />
                                    </div>
                                    <CardTitle className="text-base font-semibold text-gray-800">Thông tin dự án</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Tên dự án:</span>
                                        <span className="text-sm font-semibold">{metrics?.project?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">GitHub Repo:</span>
                                        <span className="text-sm font-medium text-teal-600">{metrics?.githubStats?.repoName || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Jira Project:</span>
                                        <span className="text-sm font-medium text-blue-600">{metrics?.jiraStats?.projectKey || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Trạng thái:</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-bold">{metrics?.project?.status}</span>
                                    </div>
                                </div>
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
                        <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                            <div className="col-span-1">#</div>
                            <div className="col-span-3 text-left">Sinh viên</div>
                            <div className="col-span-2">MSSV</div>
                            <div className="col-span-2">Commits</div>
                            <div className="col-span-2">PRs</div>
                            <div className="col-span-2">Issues</div>
                        </div>
                        <CardContent className="p-0">
                            {sortedStudents.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-10">Không có dữ liệu đóng góp</p>
                            ) : (
                                sortedStudents.map((s, i) => (
                                    <div key={s.studentCode} className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0 text-center">
                                        <div className="col-span-1 text-sm font-bold text-gray-400">#{i + 1}</div>
                                        <div className="col-span-3 flex items-center gap-2.5 text-left">
                                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">
                                                {s.fullName?.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 truncate">{s.fullName}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-xs font-mono text-gray-500">{s.studentCode}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-sm font-semibold text-gray-700">{s.commits}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-sm font-semibold text-gray-700">{s.pullRequests}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-sm font-semibold text-gray-700">{s.issues}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

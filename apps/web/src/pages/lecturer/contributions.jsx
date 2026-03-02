// Contributions Analytics — Lecturer
import { ChevronRight, BarChart3, GitBranch, CheckSquare, TrendingUp, Users, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";

const WEEKS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
const MOCK_COMMITS = [12, 8, 15, 22, 10, 18, 30, 25, 14, 20, 9, 17];
const MOCK_ISSUES = [4, 2, 6, 8, 3, 7, 10, 9, 5, 8, 3, 6];

const MOCK_STUDENTS = [
    { name: "Nguyễn Văn A", commits: 42, issues: 15, active: true },
    { name: "Trần Thị B", commits: 35, issues: 12, active: true },
    { name: "Lê Văn C", commits: 8, issues: 2, active: false },
    { name: "Phạm Thị D", commits: 28, issues: 10, active: true },
    { name: "Hoàng Văn E", commits: 3, issues: 1, active: false },
];

const maxCommit = Math.max(...MOCK_COMMITS);
const maxIssue = Math.max(...MOCK_ISSUES);

export default function Contributions() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="text-teal-700 font-semibold">Giảng viên</span>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-semibold">Theo dõi đóng góp</span>
            </nav>

            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">Theo dõi đóng góp</h2>
                <p className="text-sm text-gray-500 mt-0.5">Commit, issue, hoạt động theo tuần của các nhóm</p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: GitBranch, color: "bg-teal-500", label: "Tổng commits", value: MOCK_COMMITS.reduce((a, b) => a + b, 0) },
                    { icon: CheckSquare, color: "bg-blue-500", label: "Issues hoàn thành", value: MOCK_ISSUES.reduce((a, b) => a + b, 0) },
                    { icon: Users, color: "bg-green-500", label: "Sinh viên tích cực", value: MOCK_STUDENTS.filter(s => s.active).length },
                    { icon: TrendingUp, color: "bg-orange-400", label: "Sprint đã đóng", value: 4 },
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
                {/* Commits per week chart */}
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
                            {MOCK_COMMITS.map((v, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                    <span className="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{v}</span>
                                    <div
                                        className="w-full bg-teal-400 hover:bg-teal-500 rounded-t-md transition-all cursor-default"
                                        style={{ height: `${(v / maxCommit) * 100}%`, minHeight: 4 }}
                                        title={`Tuần ${i + 1}: ${v} commits`}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2">
                            {WEEKS.map(w => <span key={w} className="text-[9px] text-gray-400 flex-1 text-center">{w}</span>)}
                        </div>
                    </CardContent>
                </Card>

                {/* Issues per week */}
                <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                    <CardHeader className="border-b border-gray-50 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                <CheckSquare size={15} className="text-blue-600" />
                            </div>
                            <CardTitle className="text-base font-semibold text-gray-800">Issues hoàn thành theo tuần</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="flex items-end gap-1.5 h-32">
                            {MOCK_ISSUES.map((v, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                    <span className="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{v}</span>
                                    <div
                                        className="w-full bg-blue-400 hover:bg-blue-500 rounded-t-md transition-all cursor-default"
                                        style={{ height: `${(v / maxIssue) * 100}%`, minHeight: 4 }}
                                        title={`Tuần ${i + 1}: ${v} issues`}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2">
                            {WEEKS.map(w => <span key={w} className="text-[9px] text-gray-400 flex-1 text-center">{w}</span>)}
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
                <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5">Sinh viên</div>
                    <div className="col-span-2 text-right">Commits</div>
                    <div className="col-span-2 text-right">Issues</div>
                    <div className="col-span-2 text-right">Trạng thái</div>
                </div>
                <CardContent className="p-0">
                    {MOCK_STUDENTS.sort((a, b) => b.commits - a.commits).map((s, i) => (
                        <div key={s.name} className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                            <div className="col-span-1 text-sm font-bold text-gray-400">#{i + 1}</div>
                            <div className="col-span-5 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">
                                    {s.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{s.name}</span>
                            </div>
                            <div className="col-span-2 text-right">
                                <span className="text-sm font-semibold text-gray-700">{s.commits}</span>
                            </div>
                            <div className="col-span-2 text-right">
                                <span className="text-sm font-semibold text-gray-700">{s.issues}</span>
                            </div>
                            <div className="col-span-2 text-right">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${s.active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                                    }`}>
                                    {s.active ? "Tích cực" : "Ít hoạt động"}
                                </span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

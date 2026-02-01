// Group Detail - Lecturer approves links and can export
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import db from "../../mock/db.js";

export default function GroupDetail() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { success, error } = useToast();

    const [group, setGroup] = useState(null);
    const [students, setStudents] = useState([]);
    const [course, setCourse] = useState(null);

    useEffect(() => {
        loadGroupData();
    }, [groupId]);

    const loadGroupData = () => {
        try {
            const groupData = db.findById('groups', groupId);
            if (!groupData) {
                error("Không tìm thấy nhóm");
                navigate('/lecturer');
                return;
            }

            setGroup(groupData);

            const groupStudents = db.getGroupStudents(groupId);
            setStudents(groupStudents);

            const courseData = db.findById('courses', groupData.courseId);
            setCourse(courseData);
        } catch (err) {
            error("Không thể tải dữ liệu nhóm");
        }
    };

    const handleApproveLink = (linkType) => {
        if (!group) return;

        try {
            db.approveGroupLink(groupId, linkType, user.id);
            success(`Đã chấp nhận ${linkType === 'github' ? 'GitHub' : 'Jira'} link`);
            loadGroupData();
        } catch (err) {
            error(`Không thể chấp nhận ${linkType} link`);
        }
    };

    const handleExport = () => {
        success("Chức năng export đang được phát triển");
        // TODO: Implement export to Word/PDF
    };

    if (!group) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 flex items-center justify-center">
                <p className="text-gray-500">Đang tải...</p>
            </div>
        );
    }

    const githubApproved = group.githubStatus === 'APPROVED';
    const jiraApproved = group.jiraStatus === 'APPROVED';
    const leader = students.find(s => s.id === group.teamLeaderId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-8">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                                Chi tiết Nhóm: {group.name}
                            </h1>
                            <p className="text-green-100 text-lg">
                                {course ? `${course.code} - ${course.name}` : ''}
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate(`/lecturer/course/${group.courseId}/manage-groups`)}
                            className="bg-white bg-opacity-40 text-green-600 hover:bg-green-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
                        >
                            ← Quay lại
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Group Info */}
                    <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-cyan-100">
                            <CardTitle className="text-2xl text-gray-800 font-bold">Thông tin Nhóm</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhóm</label>
                                    <p className="text-lg font-semibold text-gray-900">{group.name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Đề tài</label>
                                    <p className="text-gray-900">{group.topic || <span className="text-gray-400">Chưa có</span>}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Thành viên ({students.length})
                                    </label>
                                    <div className="space-y-2">
                                        {students.map(student => (
                                            <div key={student.id} className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {student.name}
                                                        {student.id === group.teamLeaderId && (
                                                            <Badge variant="success" size="sm" className="ml-2">Leader</Badge>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{student.studentId}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                                    <p className="text-sm text-gray-600">
                                        {new Date(group.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Link Approval Section */}
                    <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-cyan-100">
                            <CardTitle className="text-2xl text-gray-800 font-bold">Liên kết Dự án</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                {/* GitHub Link */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">GitHub Repository</label>
                                        <Badge variant={githubApproved ? "success" : "secondary"} size="sm">
                                            {githubApproved ? "Đã chấp nhận" : "Chờ duyệt"}
                                        </Badge>
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={group.githubRepoUrl || "Chưa có link"}
                                            readOnly
                                            className={`flex-1 px-3 py-2 border rounded-lg text-sm ${githubApproved
                                                ? 'bg-white text-gray-900 border-green-300'
                                                : 'bg-gray-100 text-gray-400 border-gray-300'
                                                } ${!group.githubRepoUrl ? 'italic' : ''}`}
                                        />
                                        {group.githubRepoUrl && !githubApproved && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleApproveLink('github')}
                                                className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-0"
                                            >
                                                Chấp nhận
                                            </Button>
                                        )}
                                    </div>

                                    {githubApproved && (
                                        <p className="text-xs text-green-600 mt-1">
                                            ✓ Đã chấp nhận lúc {new Date(group.approvedAt).toLocaleString('vi-VN')}
                                        </p>
                                    )}

                                    {group.githubRepoUrl && (
                                        <a
                                            href={group.githubRepoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                        >
                                            Mở link →
                                        </a>
                                    )}
                                </div>

                                {/* Jira Link */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Jira Project</label>
                                        <Badge variant={jiraApproved ? "success" : "secondary"} size="sm">
                                            {jiraApproved ? "Đã chấp nhận" : "Chờ duyệt"}
                                        </Badge>
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={group.jiraProjectUrl || "Chưa có link"}
                                            readOnly
                                            className={`flex-1 px-3 py-2 border rounded-lg text-sm ${jiraApproved
                                                ? 'bg-white text-gray-900 border-green-300'
                                                : 'bg-gray-100 text-gray-400 border-gray-300'
                                                } ${!group.jiraProjectUrl ? 'italic' : ''}`}
                                        />
                                        {group.jiraProjectUrl && !jiraApproved && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleApproveLink('jira')}
                                                className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-0"
                                            >
                                                Chấp nhận
                                            </Button>
                                        )}
                                    </div>

                                    {jiraApproved && (
                                        <p className="text-xs text-green-600 mt-1">
                                            ✓ Đã chấp nhận lúc {new Date(group.approvedAt).toLocaleString('vi-VN')}
                                        </p>
                                    )}

                                    {group.jiraProjectUrl && (
                                        <a
                                            href={group.jiraProjectUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                        >
                                            Mở link →
                                        </a>
                                    )}
                                </div>

                                {/* Export Section */}
                                <div className="border-t border-gray-200 pt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Xuất báo cáo</label>
                                    <Button
                                        onClick={handleExport}
                                        variant="outline"
                                        className="w-full border-teal-500 text-teal-700 hover:bg-teal-50"
                                    >
                                        Xuất Word/PDF
                                    </Button>
                                    <p className="text-xs text-gray-500 mt-2">
                                        * Tính năng đang phát triển. Sẽ gọi API GitHub & Jira để lấy dữ liệu.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Warning Section */}
                <Card className="mt-6 border-0 shadow-lg rounded-2xl bg-orange-50 border-orange-200">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="text-3xl">⚠️</div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-2">Gửi cảnh báo</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Gửi email cảnh báo đến các thành viên có ít hoạt động commit hoặc task.
                                </p>
                                <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0"
                                    onClick={() => success("Đã gửi cảnh báo đến nhóm (chức năng demo)")}
                                >
                                    Gửi cảnh báo đến nhóm
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

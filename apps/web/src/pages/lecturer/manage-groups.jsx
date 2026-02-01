// Manage Groups - Lecturer assigns students to groups and sets topics
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import db from "../../mock/db.js";

export default function ManageGroups() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { success, error } = useToast();

    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [newGroupTopic, setNewGroupTopic] = useState("");

    useEffect(() => {
        loadCourseData();
    }, [courseId]);

    const loadCourseData = () => {
        try {
            const courseData = db.findById('courses', courseId);
            setCourse(courseData);

            // Get all students in course
            const enrollments = db.findMany('courseEnrollments', { courseId });
            const courseStudents = enrollments
                .map(e => db.findById('users.students', e.studentId))
                .filter(Boolean);
            setStudents(courseStudents);

            // Get existing groups
            const courseGroups = db.getCourseGroups(courseId);
            setGroups(courseGroups);
        } catch (err) {
            error("Không thể tải dữ liệu lớp học");
        }
    };

    const handleCreateGroup = () => {
        if (selectedStudents.length === 0) {
            error("Vui lòng chọn ít nhất 1 học sinh");
            return;
        }

        if (!newGroupTopic.trim()) {
            error("Vui lòng nhập đề tài cho nhóm");
            return;
        }

        try {
            const newGroup = {
                courseId,
                name: `Nhóm ${groups.length + 1}`,
                topic: newGroupTopic,
                studentIds: selectedStudents,
                teamLeaderId: selectedStudents[0], // First student as leader
                githubRepoUrl: null,
                jiraProjectUrl: null,
                githubStatus: 'PENDING',
                jiraStatus: 'PENDING',
                approvedByLecturerId: null,
                approvedAt: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            db.create('groups', newGroup);
            success(`Đã tạo nhóm "${newGroup.name}"`);

            // Reset form
            setSelectedStudents([]);
            setNewGroupTopic("");
            loadCourseData();
        } catch (err) {
            error("Không thể tạo nhóm");
        }
    };

    const handleDeleteGroup = (groupId) => {
        if (!confirm("Bạn có chắc muốn xóa nhóm này?")) return;

        try {
            db.delete('groups', groupId);
            success("Đã xóa nhóm");
            loadCourseData();
        } catch (err) {
            error("Không thể xóa nhóm");
        }
    };

    const handleUpdateGroupTopic = (groupId, newTopic) => {
        try {
            db.update('groups', groupId, { topic: newTopic, updatedAt: new Date().toISOString() });
            success("Đã cập nhật đề tài");
            loadCourseData();
        } catch (err) {
            error("Không thể cập nhật đề tài");
        }
    };

    const handleRemoveStudentFromGroup = (groupId, studentId) => {
        try {
            const group = db.findById('groups', groupId);
            const updatedStudentIds = group.studentIds.filter(id => id !== studentId);

            db.update('groups', groupId, {
                studentIds: updatedStudentIds,
                updatedAt: new Date().toISOString()
            });

            success("Đã xóa học sinh khỏi nhóm");
            loadCourseData();
        } catch (err) {
            error("Không thể xóa học sinh");
        }
    };

    const toggleStudentSelection = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    // Get students not in any group
    const assignedStudentIds = new Set(groups.flatMap(g => g.studentIds));
    const availableStudents = students.filter(s => !assignedStudentIds.has(s.id));

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-8">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                                Quản lý Nhóm
                            </h1>
                            <p className="text-green-100 text-lg">
                                {course ? `${course.code} - ${course.name}` : 'Loading...'}
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate('/lecturer')}
                            className="bg-white bg-opacity-40 text-green-600 hover:bg-green-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
                        >
                            ← Quay lại
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Create New Group Card */}
                <Card className="mb-6 border-0 shadow-lg rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-cyan-100">
                        <CardTitle className="text-2xl text-gray-800 font-bold">Tạo Nhóm Mới</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {/* Topic Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Đề tài</label>
                                <input
                                    type="text"
                                    value={newGroupTopic}
                                    onChange={(e) => setNewGroupTopic(e.target.value)}
                                    placeholder="Nhập đề tài cho nhóm..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            {/* Student Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chọn học sinh ({availableStudents.length} có sẵn)
                                </label>
                                <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                                    {availableStudents.length === 0 ? (
                                        <p className="text-gray-500 text-sm">Tất cả học sinh đã được phân nhóm</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {availableStudents.map(student => (
                                                <label key={student.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStudents.includes(student.id)}
                                                        onChange={() => toggleStudentSelection(student.id)}
                                                        className="w-4 h-4 text-teal-600"
                                                    />
                                                    <span className="text-sm text-gray-700">{student.name} ({student.studentId})</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={handleCreateGroup}
                                disabled={selectedStudents.length === 0 || !newGroupTopic.trim()}
                                className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0"
                            >
                                + Tạo nhóm
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Existing Groups */}
                <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-cyan-100">
                        <CardTitle className="text-3xl text-gray-800 font-bold">
                            Danh sách Nhóm ({groups.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {groups.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Chưa có nhóm nào</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {groups.map(group => {
                                    const groupStudents = db.getGroupStudents(group.id);

                                    return (
                                        <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-xl text-gray-900 mb-1">{group.name}</h3>
                                                    <div className="flex gap-2 mb-2">
                                                        <Badge variant={group.githubStatus === 'APPROVED' ? "success" : "secondary"} size="sm">
                                                            GitHub {group.githubStatus === 'APPROVED' ? "✓" : "..."}
                                                        </Badge>
                                                        <Badge variant={group.jiraStatus === 'APPROVED' ? "success" : "secondary"} size="sm">
                                                            Jira {group.jiraStatus === 'APPROVED' ? "✓" : "..."}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => navigate(`/lecturer/group/${group.id}`)}
                                                        className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0"
                                                    >
                                                        Chi tiết
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDeleteGroup(group.id)}
                                                        className="border-red-500 text-red-600 hover:bg-red-50"
                                                    >
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Đề tài</label>
                                                <input
                                                    type="text"
                                                    defaultValue={group.topic}
                                                    onBlur={(e) => {
                                                        if (e.target.value !== group.topic) {
                                                            handleUpdateGroupTopic(group.id, e.target.value);
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Thành viên ({groupStudents.length})
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {groupStudents.map(student => (
                                                        <div
                                                            key={student.id}
                                                            className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
                                                        >
                                                            <span className="text-gray-700">
                                                                {student.name}
                                                                {student.id === group.teamLeaderId && <span className="ml-1 text-teal-600 font-semibold">(Leader)</span>}
                                                            </span>
                                                            <button
                                                                onClick={() => handleRemoveStudentFromGroup(group.id, student.id)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

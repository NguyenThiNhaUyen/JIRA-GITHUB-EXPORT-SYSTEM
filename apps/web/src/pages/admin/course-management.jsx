// Course Management - ADMIN course management page
import { useState } from "react";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Modal } from "../../components/ui/interactive.jsx";
import { mockCourses, mockUsers, mockSemesters, mockSubjects } from "../../mock/data.js";

export default function CourseManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleAddLecturer = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'UPCOMING': return 'warning';
      case 'COMPLETED': return 'default';
      default: return 'default';
    }
  };

  const getSemesterName = (semesterId) => {
    const semester = mockSemesters.find(s => s.id === semesterId);
    return semester?.name || semesterId;
  };

  const getSubjectName = (subjectId) => {
    const subject = mockSubjects.find(s => s.id === subjectId);
    return subject?.name || subjectId;
  };

  const getLecturerName = (lecturerId) => {
    const lecturer = mockUsers.lecturers.find(l => l.id === lecturerId);
    return lecturer?.name || 'N/A';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Khóa học</h1>
              <p className="text-gray-600">Danh sách tất cả khóa học trong hệ thống</p>
            </div>
            <Button>Tạo Course mới</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách Khóa học</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã Course</TableHead>
                  <TableHead>Tên Course</TableHead>
                  <TableHead>Học kỳ</TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead>Giảng viên</TableHead>
                  <TableHead>Số sinh viên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{getSemesterName(course.semesterId)}</TableCell>
                    <TableCell>{getSubjectName(course.subjectId)}</TableCell>
                    <TableCell>{getLecturerName(course.lecturerId)}</TableCell>
                    <TableCell>
                      {course.currentStudents}/{course.maxStudents}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(course.status)}>
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAddLecturer(course)}
                        >
                          Thêm GV
                        </Button>
                        <Button size="sm" variant="ghost">
                          Xem
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Lecturer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm Giảng viên vào Course"
        size="md"
      >
        <div className="space-y-4">
          {selectedCourse && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Course: <span className="font-medium">{selectedCourse.code} - {selectedCourse.name}</span>
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn Giảng viên
            </label>
            <div className="space-y-2">
              {mockUsers.lecturers.map((lecturer) => (
                <div key={lecturer.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="lecturer"
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{lecturer.name}</p>
                    <p className="text-sm text-gray-500">{lecturer.email}</p>
                    <p className="text-xs text-gray-400">{lecturer.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Thêm Giảng viên
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

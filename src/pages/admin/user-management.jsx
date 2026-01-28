// User Management - ADMIN user management page
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/interactive.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Button } from "../../components/ui/button.jsx";
import { mockUsers } from "../../mock/data.js";

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('lecturers');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
              <p className="text-gray-600">Quản lý giảng viên và sinh viên trong hệ thống</p>
            </div>
            <Button>Thêm người dùng</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="lecturers" activeTab={activeTab} setActiveTab={setActiveTab}>
          <TabsList>
            <TabsTrigger value="lecturers">Giảng viên ({mockUsers.lecturers.length})</TabsTrigger>
            <TabsTrigger value="students">Sinh viên ({mockUsers.students.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="lecturers">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách Giảng viên</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã GV</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Khoa</TableHead>
                      <TableHead>Số Course</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.lecturers.map((lecturer) => (
                      <TableRow key={lecturer.id}>
                        <TableCell className="font-medium">{lecturer.id}</TableCell>
                        <TableCell>{lecturer.name}</TableCell>
                        <TableCell>{lecturer.email}</TableCell>
                        <TableCell>{lecturer.department}</TableCell>
                        <TableCell>{lecturer.courses?.length || 0}</TableCell>
                        <TableCell>
                          <Badge variant="success">Đang hoạt động</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              Sửa
                            </Button>
                            <Button size="sm" variant="ghost">
                              Chi tiết
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách Sinh viên</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã SV</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Khoa</TableHead>
                      <TableHead>Khóa</TableHead>
                      <TableHead>Số Course</TableHead>
                      <TableHead>Số Project</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.studentCode}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell>{student.batch}</TableCell>
                        <TableCell>{student.courses?.length || 0}</TableCell>
                        <TableCell>{student.projects?.length || 0}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              Sửa
                            </Button>
                            <Button size="sm" variant="ghost">
                              Chi tiết
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

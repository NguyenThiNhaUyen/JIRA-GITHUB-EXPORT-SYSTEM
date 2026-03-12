import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import { PencilLine, Trash2 } from "lucide-react";

export default function SrsReportsTable({
  selectedProject,
  srsReports,
  onEditReport,
  onDeleteReport,
}) {
  if (!selectedProject) return null;

  const reports = srsReports[selectedProject.id] || [];

  return (
    <section className="mb-8">
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle>Chi tiết Project: {selectedProject.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="outline">{selectedProject.jiraProjectKey}</Badge>
            <Badge variant="success">{selectedProject.status}</Badge>
            <Badge variant="secondary">Team {selectedProject.teamSize} thành viên</Badge>
          </div>
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">Version {report.version}</div>
                  <div className="text-sm text-gray-500">{report.note}</div>
                  <div className="text-xs text-gray-400">{report.submittedAt}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditReport(selectedProject, report)}
                  >
                    <PencilLine className="w-4 h-4 mr-1" /> Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteReport(selectedProject.id, report.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Xóa
                  </Button>
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <div className="text-sm text-gray-500">Chưa có phiên bản SRS nào.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

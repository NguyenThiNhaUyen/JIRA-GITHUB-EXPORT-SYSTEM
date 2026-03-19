import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card.jsx";
import { Button } from"@/components/ui/Button.jsx";
import { FileDown, Users, AlertTriangle, FileSearch } from"lucide-react";

export function GroupExport({
 group,
 students,
 handleExportCsv,
 handleExportSrs,
 handleSendAlert,
 isGeneratingSrs,
 isSendingAlert
}) {
 return (
  <>
  <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white hover:shadow-lg transition-all">
  <CardHeader className="border-b border-gray-50 py-5 px-8 flex flex-row items-center justify-between">
  <CardTitle className="text-base font-black text-gray-800">Báo cáo & Xuất bản</CardTitle>
  </CardHeader>
  <CardContent className="p-8 space-y-4">
  <div className="flex items-center justify-between gap-6">
  <div className="flex-1 min-w-0">
  <h4 className="font-black text-gray-800 text-[10px] mb-1.5 uppercase tracking-wider">Xuất báo cáo SRS</h4>
  <p className="text-[11px] text-gray-400 font-bold opacity-80 leading-relaxed">
  Hệ thống tự động tổng hợp dữ liệu từ Jira (Tasks, User Stories) và GitHub (Commits, PRs) để tạo tài liệu chuẩn ISO 29148.
  </p>
  </div>
  <div className="flex flex-col gap-2 shrink-0">
  <Button
  onClick={() => handleExportSrs(group)}
  disabled={isGeneratingSrs}
  className="rounded-2xl h-12 px-8 text-[10px] font-black bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-100 border-0 transition-all min-w-[140px]"
  >
  <FileDown size={16} className="mr-2" /> {isGeneratingSrs ?"Đang tạo..." :"Xuất SRS PDF"}
  </Button>
  <Button
  onClick={() => window.open("/templates/srs_reference.pdf", "_blank")}
  variant="outline"
  className="rounded-2xl h-10 px-6 text-[10px] font-black border-gray-100 text-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center"
  >
  <FileSearch size={14} className="mr-2" /> Tài liệu Mẫu
  </Button>
  </div>
  </div>

  <div className="h-px bg-gray-50" />

  <div className="flex items-center justify-between gap-6">
  <div className="flex-1 min-w-0">
  <h4 className="font-black text-gray-800 text-[10px] mb-1.5 uppercase tracking-wider">Danh sách Thành viên</h4>
  <p className="text-[11px] text-gray-400 font-bold opacity-80">Kết xuất bảng điểm đóng góp và vai trò của từng sinh viên sang định dạng CSV.</p>
  </div>
  <Button
  onClick={() => handleExportCsv(group, students)}
  variant="outline"
  className="rounded-2xl h-10 px-6 text-[10px] font-black border-gray-100 text-gray-600 hover:bg-gray-50 shadow-sm shrink-0 min-w-[110px]"
  >
  <Users size={14} className="mr-2" /> Xuất CSV
  </Button>
  </div>
  </CardContent>
  </Card>

  <Card className="border border-orange-100 shadow-sm rounded-[32px] overflow-hidden bg-orange-50/20 hover:border-orange-200 transition-all">
  <CardContent className="p-8">
  <div className="flex items-start gap-6">
  <div className="w-14 h-14 rounded-[24px] bg-white flex items-center justify-center shrink-0 shadow-sm border border-orange-50">
  <AlertTriangle size={24} className="text-orange-600" />
  </div>
  <div className="flex-1 min-w-0">
  <h4 className="font-black text-orange-900 text-sm mb-2">Trung tâm Cảnh báo</h4>
  <p className="text-[11px] text-orange-700 font-medium leading-relaxed mb-6 opacity-70">
  Gửi lời nhắc nhở trực tiếp đến hệ thống thông báo của sinh viên đối với các nhóm có tiến độ chậm hoặc thiếu hụt commit/task Jira.
  </p>
  <Button
  className="bg-orange-600 hover:bg-orange-700 text-white border-0 rounded-2xl h-11 px-8 text-[10px] font-black shadow-xl shadow-orange-200"
  disabled={isSendingAlert}
  onClick={() => handleSendAlert("Cảnh báo khẩn: Yêu cầu cập nhật tiến độ nhóm!")}
  >
  <AlertTriangle size={13} className="mr-2" />
  {isSendingAlert ?"Đang gửi..." :"Gửi cảnh báo ngay"}
  </Button>
  </div>
  </div>
  </CardContent>
  </Card>
  </>
 );
}

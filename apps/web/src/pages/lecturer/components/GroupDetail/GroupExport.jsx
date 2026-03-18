import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { FileDown, Users, AlertTriangle } from "lucide-react";

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
                    <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Báo cáo & Xuất bản</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                    <div className="flex items-center justify-between gap-6">
                        <div>
                            <h4 className="font-black text-gray-800 text-[10px] uppercase tracking-widest mb-1.5">Xuất báo cáo SRS</h4>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest opacity-80">Xuất dữ liệu Jira/GitHub sang PDF chuẩn ISO 29148.</p>
                        </div>
                        <Button
                            onClick={() => handleExportSrs(group)}
                            disabled={isGeneratingSrs}
                            variant="outline"
                            className="rounded-2xl h-12 px-8 text-[10px] font-black uppercase tracking-widest border-teal-100 text-teal-600 hover:bg-teal-50 shadow-sm shrink-0"
                        >
                            <FileDown size={16} className="mr-2" /> {isGeneratingSrs ? "Đang tạo..." : "Xuất SRS"}
                        </Button>
                    </div>

                    <div className="h-px bg-gray-50" />

                    <div className="flex items-center justify-between gap-6">
                        <div>
                            <h4 className="font-black text-gray-800 text-[10px] uppercase tracking-widest mb-1.5">Danh sách Thành viên</h4>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest opacity-80">Xuất bảng điểm đóng góp của nhóm sang định dạng CSV.</p>
                        </div>
                        <Button
                            onClick={() => handleExportCsv(group, students)}
                            variant="outline"
                            className="rounded-2xl h-10 px-6 text-[10px] font-black uppercase tracking-widest border-gray-100 text-gray-600 hover:bg-gray-50 shadow-sm shrink-0"
                        >
                            <Users size={14} className="mr-2" /> Xuất CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-orange-100 shadow-sm rounded-[32px] overflow-hidden bg-orange-50/20">
                <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                        <div className="w-14 h-14 rounded-[24px] bg-orange-100 flex items-center justify-center shrink-0 shadow-sm">
                            <AlertTriangle size={24} className="text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-black text-orange-900 text-sm uppercase tracking-widest mb-2">Trung tâm Cảnh báo</h4>
                            <p className="text-[11px] text-orange-700 font-bold uppercase tracking-wider leading-relaxed mb-6 opacity-70">
                                Gửi lời nhắc nhở trực tiếp đến hệ thống thông báo của sinh viên đối với các nhóm có tiến độ chậm hoặc thiếu hụt commit/task Jira.
                            </p>
                            <Button
                                className="bg-orange-600 hover:bg-orange-700 text-white border-0 rounded-2xl h-11 px-8 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-200"
                                disabled={isSendingAlert}
                                onClick={() => handleSendAlert("Cảnh báo khẩn: Yêu cầu cập nhật tiến độ nhóm!")}
                            >
                                <AlertTriangle size={13} className="mr-2" />
                                {isSendingAlert ? "Đang gửi..." : "Gửi cảnh báo ngay"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}







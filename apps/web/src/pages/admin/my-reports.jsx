import React from 'react';
import { ChevronLeft, Download, FileText, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useNavigate } from "react-router-dom";
import { useGetMyReports, useGetReportDownloadLink } from "../../features/admin/hooks/useReports.js";
import { useToast } from "../../components/ui/toast.jsx";

export default function MyReports() {
    const { success, error, info } = useToast();
    const navigate = useNavigate();
    const { data: reports, isLoading, refetch, isFetching } = useGetMyReports();

    const handleDownload = async (report) => {
        // AUDITED: status field is lowercase per API response
        if (report.status !== "COMPLETED") {
            info("Báo cáo đang được xử lý, vui lòng thử lại.");
            return;
        }

        // AUDITED: fileUrl field is lowercase per API response
        const fileUrl = report.fileUrl ?? report.FileUrl;
        if (fileUrl) {
            // Direct download from fileUrl if available (most cases)
            const fullUrl = fileUrl.startsWith("http")
                ? fileUrl
                : `${import.meta.env.VITE_API_URL ?? ""}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
            const a = document.createElement("a");
            a.href = fullUrl;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            if (report.fileName) a.download = report.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
        }

        // Fallback: call download-link API
        try {
            info("Đang lấy link tải...");
            // AUDITED: use VITE_API_URL (not VITE_API_BASE_URL) and accessToken (not token)
            const BASE = import.meta.env.VITE_API_URL ?? "";
            const token = localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");
            const res = await fetch(`${BASE}/api/reports/${report.id}/download-link`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            const dlUrl = data?.data?.downloadUrl ?? data?.downloadUrl;
            if (dlUrl) {
                window.open(dlUrl, "_blank");
            } else {
                error("Báo cáo chưa sẵn sàng hoặc đã hết hạn.");
            }
        } catch (err) {
            error("Lỗi khi lấy link tải: " + (err?.message ?? "Không xác định"));
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="animate-spin text-teal-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ChevronLeft size={24} />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Lịch sử Báo cáo của tôi</h2>
                        <p className="text-sm text-gray-500">Danh sách các báo cáo đã được yêu cầu khởi tạo</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="rounded-xl border-gray-200"
                >
                    <RefreshCw size={16} className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                    Làm mới
                </Button>
            </div>

            {/* Reports List */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên báo cáo / ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Định dạng</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Ngày tạo</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reports?.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-800">
                                                        {/* AUDITED: field 'type' per API response */}
                                                        {report.type ?? report.reportType ?? report.reportName ?? `Báo cáo #${report.id}`}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-mono">
                                                        #{report.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 font-bold text-[10px] uppercase">
                                                {/* AUDITED: field 'format' per API response */}
                                                {(report.format ?? report.Format ?? "PDF") === "DOCX" ? "Word" : (report.format ?? report.Format ?? "PDF")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {/* AUDITED: field 'createdAt' per API response */}
                                                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString("vi-VN") : "—"}
                                                </span>
                                                <span className="text-[10px]">
                                                    {report.createdAt ? new Date(report.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center">
                                                {/* AUDITED: field 'status' per API response */}
                                                {(report.status ?? report.Status) === "COMPLETED" ? (
                                                    <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-medium">
                                                        <CheckCircle size={14} />
                                                        Hoàn thành
                                                    </span>
                                                ) : (report.status ?? report.Status) === "FAILED" ? (
                                                    <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-medium">
                                                        <AlertCircle size={14} />
                                                        Thất bại
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-xs font-medium animate-pulse">
                                                        <RefreshCw size={14} className="animate-spin" />
                                                        Đang xử lý
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={(report.status ?? report.Status) !== "COMPLETED"}
                                                onClick={() => handleDownload(report)}
                                                className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl font-bold"
                                            >
                                                <Download size={16} className="mr-2" />
                                                Tải về
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {(!reports || reports.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText size={40} className="text-gray-200" />
                                                <p>Bạn chưa có báo cáo nào được khởi tạo.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-blue-700">
                <AlertCircle className="shrink-0" size={20} />
                <p className="text-xs leading-relaxed">
                    <strong>Lưu ý:</strong> Báo cáo có thể mất vài phút để hệ thống xử lý (tải dữ liệu từ GitHub/Jira).
                    Sau khi trạng thái chuyển sang <span className="font-bold underline">Hoàn thành</span>, bạn có thể tải về máy.
                </p>
            </div>
        </div>
    );
}

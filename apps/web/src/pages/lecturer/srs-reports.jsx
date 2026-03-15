import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  MoreVertical,
  MessageSquare,
  FileDown
} from "lucide-react";

// Components UI
import { Card, CardContent } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { InputField } from "../../components/shared/FormFields.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

// Hooks
import { useSrsReports } from "../../features/srs/hooks/useSrs.js";

export default function SrsReports() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: reports = [], isLoading } = useSrsReports({
    status: statusFilter === "ALL" ? undefined : statusFilter
  });

  const filteredReports = reports.filter(rpt => {
    const searchLow = searchTerm.toLowerCase();
    return (
      (rpt.projectName?.toLowerCase() || "").includes(searchLow) || 
      (rpt.groupName?.toLowerCase() || "").includes(searchLow) ||
      (rpt.submittedByName?.toLowerCase() || "").includes(searchLow)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Quản lý SRS"
        subtitle="Theo dõi và phê duyệt các tài liệu đặc tả yêu cầu phần mềm từ các nhóm dự án."
        breadcrumb={["Giảng viên", "SRS Reports"]}
        actions={[
          <Button key="export" variant="outline" className="rounded-2xl border-gray-200 h-11 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
            <FileDown size={14} className="mr-2" /> Xuất báo cáo tổng hợp
          </Button>
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          label="Tổng báo cáo" 
          value={reports.length} 
          icon={FileText} 
          variant="info" 
        />
        <StatsCard 
          label="Chờ phê duyệt" 
          value={reports.filter(r => r.status === 'PENDING').length} 
          icon={Clock} 
          variant="warning" 
        />
        <StatsCard 
          label="Đã phê duyệt" 
          value={reports.filter(r => r.status === 'APPROVED').length} 
          icon={CheckCircle} 
          variant="success" 
        />
      </div>

      {/* Filter Bar */}
      <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-teal-600 text-white shadow-lg shadow-teal-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              >
                {status === 'ALL' ? 'Tất cả' : status}
              </button>
            ))}
          </div>
          <div className="w-full md:w-80">
            <InputField 
              placeholder="Tìm dự án, nhóm, sinh viên..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              icon={Search} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Reports Table/Grid */}
      <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Dự án & Nhóm</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Người nộp</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Ngày nộp</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Trạng thái</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredReports.map((rpt, idx) => (
                <tr key={rpt.id || idx} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{rpt.projectName}</p>
                      <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mt-0.5">{rpt.groupName}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-medium text-gray-600">{rpt.submittedByName}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs text-gray-400 font-medium">
                      {rpt.submittedAt ? new Date(rpt.submittedAt).toLocaleDateString('vi-VN') : "---"}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={rpt.status} label={rpt.status} variant={rpt.status === 'APPROVED' ? 'success' : rpt.status === 'PENDING' ? 'warning' : 'danger'} />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-teal-50 hover:text-teal-600" onClick={() => navigate(`/lecturer/srs/${rpt.id}`)}>
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-teal-50 hover:text-teal-600">
                        <MessageSquare size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredReports.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm font-medium">Không tìm thấy báo cáo nào phù hợp.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
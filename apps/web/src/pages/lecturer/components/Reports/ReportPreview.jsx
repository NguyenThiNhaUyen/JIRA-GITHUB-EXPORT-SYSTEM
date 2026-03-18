import { Eye, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { StatusBadge } from "@/components/shared/Badge.jsx";

export function ReportPreview({ selectedConfig, previewData, handleExport }) {
  return (
    <Card className="lg:col-span-8 border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
      <CardHeader className="border-b border-gray-50 py-6 px-8 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center"><Eye size={18} className="text-teal-600" /></div>
          <div>
            <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Preview: {selectedConfig?.title}</CardTitle>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time Data Generation</p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedConfig?.formats.map(fmt => (
            <Button key={fmt} variant="outline" size="sm" className="rounded-xl border-gray-100 text-[10px] font-black uppercase tracking-widest h-9" onClick={() => handleExport(fmt, selectedConfig.id, selectedConfig.title)}>
              <Download size={14} className="mr-2" />{fmt}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100"><p className="text-[9px] font-black text-teal-600 uppercase mb-1">Teams</p><p className="text-xl font-black text-gray-800">{previewData.teams.length}</p></div>
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100"><p className="text-[9px] font-black text-blue-600 uppercase mb-1">Commits</p><p className="text-xl font-black text-gray-800">{previewData.totalCommits}</p></div>
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100"><p className="text-[9px] font-black text-indigo-600 uppercase mb-1">Avg Sync</p><p className="text-xl font-black text-gray-800">{previewData.avgSync}%</p></div>
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100"><p className="text-[9px] font-black text-red-600 uppercase mb-1">Warnings</p><p className="text-xl font-black text-gray-800">{previewData.warnings}</p></div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh sách nhóm rủi ro</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previewData.teams.filter(t => t.riskLevel === 'High' || t.riskLevel === 'Medium').map(t => (
              <div key={t.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/30 flex justify-between items-center group hover:border-red-200 hover:bg-white transition-all">
                <div>
                  <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-1 truncate max-w-[150px]">{t.project}</p>
                </div>
                <StatusBadge status={t.riskLevel} variant={t.riskLevel === 'High' ? 'danger' : 'warning'} label={t.riskLevel} />
              </div>
            ))}
            {previewData.teams.filter(t => t.riskLevel === 'High' || t.riskLevel === 'Medium').length === 0 && (
              <p className="text-xs text-gray-400 italic">Không có nhóm rủi ro nào</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}







import { Sparkles, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/Card.jsx";
import { Button } from "../../../../components/ui/Button.jsx";
import { InputField, SelectField } from "../../../../components/shared/FormFields.jsx";

export function GroupCreationPanel({
  newGroupTopic,
  setNewGroupTopic,
  selectedStudents,
  setSelectedStudents,
  availableStudents,
  handleCreateGroup,
  isBusy,
  autoGroupSize,
  setAutoGroupSize,
  handleAutoCreateGroups
}) {
  return (
    <div className="space-y-8">
      <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 py-5 px-6">
          <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Tạo Nhóm Thủ Công</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Đề tài dự án</label>
            <InputField placeholder="Nhập tên đề tài..." value={newGroupTopic} onChange={e => setNewGroupTopic(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Chọn sinh viên ({selectedStudents.length})</label>
            <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-2xl divide-y divide-gray-50 bg-gray-50/20">
              {availableStudents.length === 0 ? (
                <div className="p-8 text-center"><p className="text-[10px] font-black text-gray-300 uppercase">Tất cả SV đã có nhóm</p></div>
              ) : availableStudents.map(s => (
                <label key={s.id} className="p-4 flex items-center gap-4 hover:bg-white cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(s.id)}
                    onChange={() => setSelectedStudents(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])}
                    className="w-5 h-5 rounded-lg border-gray-200 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{s.name}</p>
                    <p className="text-[10px] font-bold text-gray-400">{s.studentCode || s.id}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <Button
            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-teal-100/50 border-0 transition-all disabled:opacity-50"
            onClick={handleCreateGroup}
            disabled={isBusy || selectedStudents.length === 0 || !newGroupTopic.trim()}
          >
            Tạo nhóm ngay
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-violet-100 shadow-sm rounded-[32px] overflow-hidden bg-violet-50/20">
        <CardHeader className="border-b border-violet-100 py-5 px-6">
          <CardTitle className="text-base font-black text-violet-800 uppercase tracking-widest flex items-center gap-2"><Sparkles size={16} /> Smart Auto-Group</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-[11px] text-violet-600 font-bold leading-relaxed uppercase opacity-80">Tự động phân bổ {availableStudents.length} sinh viên còn lại dựa trên quy mô nhóm chuẩn 4-6 người.</p>
          <SelectField value={autoGroupSize} onChange={e => setAutoGroupSize(Number(e.target.value))} className="border-violet-100 text-[10px] font-black uppercase">
            <option value={4}>4 Sinh viên / Nhóm</option>
            <option value={5}>5 Sinh viên / Nhóm</option>
            <option value={6}>6 Sinh viên / Nhóm</option>
          </SelectField>
          <Button
            className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-violet-100 border-0 transition-all"
            onClick={handleAutoCreateGroups}
            disabled={isBusy || availableStudents.length === 0}
          >
            <Wand2 size={16} className="mr-2" /> Bắt đầu chia nhóm
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

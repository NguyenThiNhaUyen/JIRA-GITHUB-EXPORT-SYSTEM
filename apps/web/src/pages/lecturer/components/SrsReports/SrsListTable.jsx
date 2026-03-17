import { Search } from "lucide-react";

export function SrsListTable({ 
  loadingReports, 
  filtered, 
  selectedId, 
  setSelectedId, 
  search, 
  setSearch, 
  courseFilter, 
  setCourseFilter, 
  statusFilter, 
  setStatusFilter, 
  realCourses, 
  STATUS_META,
  FileText,
  Badge,
  Eye,
  Star,
  Button,
  CardContent
}) {
  return (
    <div className="xl:col-span-8 space-y-6">
      <div className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                placeholder="Tìm tên nhóm, leader..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
              />
            </div>
            <select
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              className="h-11 px-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all cursor-pointer"
            >
              <option value="all">Tất cả lớp</option>
              {realCourses.map(c => <option key={c.id} value={c.code}>{c.code}</option>)}
            </select>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {["all", "SUBMITTED", "REVIEW", "NEED_REVISION", "FINAL"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${statusFilter === status ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-100' : 'bg-white text-gray-400 border-gray-100 hover:border-teal-400 hover:text-teal-600'}`}
              >
                {status === 'all' ? 'Tất cả' : STATUS_META[status]?.label}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/30">
                <tr>
                  <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Dự án & Nhóm</th>
                  <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Version</th>
                  <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Trạng thái</th>
                  <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Điểm</th>
                  <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingReports ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="py-8 px-8"><div className="h-4 bg-gray-50 rounded w-full" /></td>
                    </tr>
                  ))
                ) : filtered.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`group cursor-pointer transition-all ${selectedId === item.id ? 'bg-teal-50/30' : 'hover:bg-gray-50/20'}`}
                  >
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 group-hover:scale-110 transition-transform"><FileText size={18} /></div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-gray-800 uppercase tracking-tight truncate">{item.teamName}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 truncate max-w-[200px]">{item.projectName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8 text-center"><span className="text-[11px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 uppercase">V{item.version || '1.0'}</span></td>
                    <td className="py-6 px-8 text-center">
                      <Badge variant="outline" className={`px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest border transition-all ${STATUS_META[item.status]?.color || ''}`}>{STATUS_META[item.status]?.label}</Badge>
                    </td>
                    <td className="py-6 px-8 text-center">
                      <div className="inline-flex items-center gap-1 font-black text-sm text-gray-800 bg-gray-50 px-3 py-1 rounded-xl shadow-inner border border-gray-100">
                        <Star size={12} className="text-amber-400 fill-amber-400" /> {item.score ? item.score.toFixed(1) : '—'}
                      </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl hover:bg-white shadow-sm border border-transparent hover:border-gray-100 text-gray-400 hover:text-teal-600 transition-all"><Eye size={16} /></Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center opacity-40">
                      <FileText size={48} className="mx-auto mb-4" />
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Không tìm thấy yêu cầu nào</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </div>
    </div>
  );
}

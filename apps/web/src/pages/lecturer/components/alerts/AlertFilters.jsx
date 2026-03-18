import { Search } from"lucide-react";
import { Card, CardContent } from"@/components/ui/Card.jsx";
import { InputField } from"@/components/shared/FormFields.jsx";

export function AlertFilters({ filter, setFilter, search, setSearch }) {
 const filters = [
 { id: 'open', label: 'Chưa xử lý' },
 { id: 'all', label: 'Tất cả' },
 { id: 'high', label: 'Nghiêm trọng' },
 { id: 'medium', label: 'Trung bình' },
 { id: 'low', label: 'Nhẹ' },
 { id: 'resolved', label: 'Đã xử lý' }
 ];

 return (
 <Card>
 <CardContent className="flex flex-col md:flex-row gap-6 items-center justify-between">
 <div className="flex items-center gap-3 flex-wrap">
 {filters.map(f => (
 <button
 key={f.id}
 onClick={() => setFilter(f.id)}
 className={`px-6 py-2.5 rounded-[18px] text-[10px] font-black tracking-[0.2em] font-display transition-all duration-300 active:scale-95 ${filter === f.id
 ? 'bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-xl shadow-teal-200/50 -translate-y-0.5'
 : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
 }`}
 >
 {f.label}
 </button>
 ))}
 </div>
 <div className="w-full md:w-96">
 <InputField
 placeholder="Tìm tên nhóm, mã SV, nội dung..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 icon={Search}
 className="bg-gray-50/50 border-gray-100 focus:bg-white transition-all duration-300"
 />
 </div>
 </CardContent>
 </Card>
 );
}







import { Search } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/Card.jsx";
import { InputField } from "../../../../components/shared/FormFields.jsx";

export function AlertFilters({ filter, setFilter, search, setSearch }) {
  const filters = [
    { id: 'all', label: 'Tất cả' },
    { id: 'high', label: 'Nghiêm trọng' },
    { id: 'medium', label: 'Trung bình' },
    { id: 'low', label: 'Nhẹ' },
    { id: 'resolved', label: 'Đã xử lý' }
  ];

  return (
    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
      <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.id ? 'bg-teal-600 text-white shadow-lg shadow-teal-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="w-full md:w-96">
          <InputField
            placeholder="Tìm tên nhóm, SV, nội dung..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={Search}
          />
        </div>
      </CardContent>
    </Card>
  );
}

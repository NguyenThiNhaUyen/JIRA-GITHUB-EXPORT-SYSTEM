import React from"react";
import { Search, Filter } from"lucide-react";

export function ContributionFilters({ search, setSearch, statusFilter, setStatusFilter, activeTab, setActiveTab }) {
 const tabs = [
 { id:"students", label:"Sinh viên" },
 { id:"groups", label:"Nhóm" },
 { id:"alerts", label:"Cảnh báo" },
 ];

 return (
 <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
 <div className="flex p-1 bg-gray-50 rounded-2xl w-fit">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
 activeTab === tab.id
 ?"bg-white text-teal-600 shadow-sm"
 :"text-gray-400 hover:text-gray-600"
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 <div className="flex flex-col sm:flex-row gap-3">
 <div className="relative group">
 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
 <input
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Tìm tên, MSSV, nhóm..."
 className="h-11 pl-11 pr-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-sm outline-none focus:bg-white focus:border-teal-500 transition-all w-full sm:w-64 font-medium"
 />
 </div>

 {activeTab ==="students" && (
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="h-11 px-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-sm outline-none focus:bg-white focus:border-teal-500 transition-all cursor-pointer font-medium"
 >
 <option value="all">Tất cả trạng thái</option>
 <option value="Tích cực">Tích cực</option>
 <option value="Cần chú ý">Cần chú ý</option>
 <option value="Kém">Kém</option>
 </select>
 )}
 </div>
 </div>
 );
}







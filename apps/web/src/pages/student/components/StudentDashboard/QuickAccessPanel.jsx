import { Target, BookOpen, FolderKanban, BarChart3, FileText, ChevronRight } from"lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from"@/components/ui/Card.jsx";

export function QuickAccessPanel({ onNavigate }) {
 const items = [
 { icon: BookOpen, label:"Lá»›p há»c", to:"/student/courses", color:"text-teal-600", bg:"bg-teal-50" },
 { icon: FolderKanban, label:"Dá»± Ă¡n", to:"/student/my-project", color:"text-indigo-600", bg:"bg-indigo-50" },
 { icon: BarChart3, label:"ÄĂ³ng gĂ³p", to:"/student/contribution", color:"text-orange-600", bg:"bg-orange-50" },
 { icon: FileText, label:"SRS Docs", to:"/student/srs", color:"text-emerald-600", bg:"bg-emerald-50" }
 ];

 return (
 <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white glass-card">
 <CardHeader className="border-b border-gray-50/50 py-8 px-10">
 <CardTitle className="text-[11px] font-black text-gray-400 flex items-center gap-4 font-display">
 <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shadow-inner">
 <Target size={16} className="text-gray-300" />
 </div>
 Truy cáº­p nhanh
 </CardTitle>
 </CardHeader>
 <CardContent className="p-10">
 <div className="grid grid-cols-2 gap-6">
 {items.map((item, idx) => (
 <button 
 key={idx} 
 onClick={() => onNavigate(item.to)} 
 className="flex flex-col items-center justify-center gap-4 p-8 rounded-[36px] border border-gray-50 bg-gray-50/40 hover:bg-white hover:border-teal-500 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden active:scale-95 animate-in slide-in-from-right-4"
 style={{ animationDelay: `${idx * 100}ms` }}
 >
 <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-teal-500/10 to-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
 <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white group-hover:bg-white`}>
 <item.icon size={28} />
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-black text-gray-500 group-hover:text-gray-900 transition-colors font-display">{item.label}</span>
 <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
 </div>
 </button>
 ))}
 </div>
 </CardContent>
 </Card>
 );
}

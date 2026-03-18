import { ShieldAlert, AlertCircle } from"lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from"@/components/ui/Card.jsx";

export function ImportantWarnings({ studentWarnings }) {
 if (studentWarnings.length === 0) return null;

 return (
 <Card className="border-red-100 shadow-sm rounded-[32px] overflow-hidden bg-red-50/20 border group hover:shadow-xl transition-all duration-500 animate-in slide-in-from-top-4">
 <CardHeader className="py-6 px-10 flex flex-row items-center gap-4">
 <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shadow-inner group-hover:scale-110 transition-transform">
 <ShieldAlert size={24} className="animate-pulse" />
 </div>
 <CardTitle className="text-sm font-black text-red-800 tracking-[0.2em] font-display">Cáº£nh bĂ¡o quan trá»ng cáº§n xá»­ lĂ½</CardTitle>
 </CardHeader>
 <CardContent className="px-10 pb-8 pt-0 space-y-4">
 {studentWarnings.map((w, idx) => (
 <div key={idx} className="flex items-center gap-4 p-5 bg-white rounded-[24px] border border-red-100 shadow-sm group/item hover:bg-red-50 transition-colors">
 <AlertCircle size={20} className="text-red-500 shrink-0" />
 <p className="text-sm font-bold text-red-700 leading-relaxed font-display">{w.message || w.content ||"Báº¡n cĂ³ má»™t cáº£nh bĂ¡o má»›i vá» tiáº¿n Ä‘á»™."}</p>
 </div>
 ))}
 </CardContent>
 </Card>
 );
}


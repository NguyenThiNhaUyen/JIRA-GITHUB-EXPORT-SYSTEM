import { Upload } from"lucide-react";
import { Button } from"@/components/ui/Button.jsx";
import { Card } from"@/components/ui/Card.jsx";

export function UploadSrsCard({ onOpenModal }) {
 return (
 <Card className="rounded-[52px] border-0 bg-slate-900 text-white p-14 shadow-2xl shadow-indigo-200 group overflow-hidden relative animate-in slide-in-from-right-8 duration-1000">
 <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500 rounded-full blur-[160px] opacity-10 group-hover:opacity-30 transition-all duration-1000" />
 <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[140px] opacity-10 group-hover:opacity-20 transition-all duration-1000" />
 
 <div className="relative z-10 space-y-12">
 <div className="w-20 h-20 rounded-[32px] bg-white/10 flex items-center justify-center mb-10 shadow-2xl border border-white/5 animate-bounce-slow">
 <Upload size={32} className="text-teal-400" />
 </div>
 <div>
 <h4 className="text-3xl font-black tracking-tighter mb-6 font-display leading-tight">HoĂ n táº¥t tĂ i liá»‡u Ä‘áº·c táº£ SRS?</h4>
 <p className="text-[12px] text-teal-200/80 font-black leading-relaxed mb-12 italic opacity-80">
 Há»‡ thá»‘ng Antigravity há»— trá»£ Ä‘á»‹nh dáº¡ng .pdf chuáº©n IEEE 29148. <br/>Má»i thay Ä‘á»•i Ä‘á»u Ä‘Æ°á»£c ghi váº¿t vĂ  so sĂ¡nh theo cĂ¡c phiĂªn báº£n ná»™p.
 </p>
 </div>
 <Button 
 className="w-full h-20 bg-white text-slate-900 hover:bg-teal-50 rounded-[32px] font-black tracking-[0.4em] text-[13px] border-0 shadow-2xl transition-all hover:scale-[1.03] active:scale-95 group/btn relative overflow-hidden font-display"
 onClick={onOpenModal}
 >
 <div className="absolute inset-0 bg-teal-500/10 translate-y-full group-hover/btn:translate-y-0 transition-all" />
 <span className="relative flex items-center justify-center gap-4">Ná»™p tĂ i liá»‡u ngay <Upload size={20} /></span>
 </Button>
 </div>
 <style>{`
 @keyframes bounce-slow {
 0%, 100% { transform: translateY(0); }
 50% { transform: translateY(-10px); }
 }
 .animate-bounce-slow { animation: bounce-slow 4s infinite ease-in-out; }
 `}</style>
 </Card>
 );
}


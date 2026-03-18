import { FileDown, Target } from"lucide-react";
import { Button } from"@/components/ui/Button.jsx";
import { Card } from"@/components/ui/Card.jsx";

export function SrsTemplatesCard() {
 return (
 <Card className="rounded-[48px] border border-gray-100 bg-white p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] glass-card group hover:shadow-2xl transition-all duration-700">
 <div className="flex items-center gap-6 mb-12">
 <div className="w-16 h-16 rounded-[28px] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-700"><Target size={32}/></div>
 <div>
 <h4 className="font-black text-gray-800 tracking-[0.2em] text-sm font-display leading-tight mb-1">ThÆ° viá»‡n Biá»ƒu máº«u</h4>
 <p className="text-[10px] text-gray-400 font-bold">TĂ i nguyĂªn há»c thuáº­t SRS</p>
 </div>
 </div>
 <ul className="space-y-8">
 <li className="flex items-center justify-between group/item cursor-pointer bg-gray-50/50 p-6 rounded-[28px] hover:bg-white hover:border-indigo-100 border border-transparent transition-all hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1">
 <div className="flex flex-col gap-1.5 min-w-0 pr-4">
 <span className="text-[11px] font-black tracking-[0.1em] text-gray-800 group-hover/item:text-indigo-600 transition-colors truncate">IEEE Standard 29148-2018 (.PDF)</span>
 <span className="text-[9px] text-gray-400 font-bold opacity-60">Software Requirements Guide</span>
 </div>
 <Button variant="ghost" className="h-14 w-14 p-0 bg-white group-hover/item:bg-indigo-600 group-hover/item:text-white group-hover/item:shadow-2xl text-indigo-600 rounded-[20px] transition-all border border-gray-100 group-hover/item:border-indigo-600 scale-90 group-hover/item:scale-100"><FileDown size={24}/></Button>
 </li>
 <li className="flex items-center justify-between group/item cursor-pointer bg-gray-50/50 p-6 rounded-[28px] hover:bg-white hover:border-teal-100 border border-transparent transition-all hover:shadow-xl hover:shadow-teal-500/5 hover:-translate-y-1 opacity-60 hover:opacity-100">
 <div className="flex flex-col gap-1.5 min-w-0 pr-4">
 <span className="text-[11px] font-black tracking-[0.1em] text-gray-800 group-hover/item:text-teal-600 transition-colors truncate">Software Requirements Spec (.DOCX)</span>
 <span className="text-[9px] text-gray-400 font-bold opacity-60">Ready-to-use Template</span>
 </div>
 <Button variant="ghost" className="h-14 w-14 p-0 bg-white group-hover/item:bg-teal-600 group-hover/item:text-white group-hover/item:shadow-2xl text-teal-600 rounded-[20px] transition-all border border-gray-100 group-hover/item:border-teal-600 scale-90 group-hover/item:scale-100"><FileDown size={24}/></Button>
 </li>
 </ul>
 </Card>
 );
}

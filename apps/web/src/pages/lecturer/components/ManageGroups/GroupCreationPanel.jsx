import { Sparkles, Wand2, UserPlus, Info } from"lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card.jsx";
import { Button } from"@/components/ui/Button.jsx";
import { InputField, SelectField } from"@/components/shared/FormFields.jsx";

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
 <div className="space-y-8 animate-in slide-in-from-left duration-700">
 <Card className="shadow-sm rounded-[40px] overflow-hidden bg-white border border-gray-100 p-2">
 <div className="bg-white rounded-[32px] border border-gray-50 h-full">
 <CardHeader className="border-b border-gray-50 py-8 px-10">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 shadow-sm">
 <UserPlus size={20} />
 </div>
 <CardTitle className="font-display">Táº¡o NhĂ³m Thá»§ CĂ´ng</CardTitle>
 </div>
 </CardHeader>
 <CardContent className="p-10 space-y-8">
 <div className="space-y-3">
 <label className="text-[10px] font-black text-gray-400 tracking-[0.2em] px-1">Äá» tĂ i dá»± Ă¡n</label>
 <InputField 
 placeholder="Nháº­p tĂªn Ä‘á» tĂ i..." 
 value={newGroupTopic} 
 onChange={e => setNewGroupTopic(e.target.value)} 
 className="bg-gray-50/50 border-gray-100 focus:bg-white h-14 rounded-2xl transition-all"
 />
 </div>

 <div className="space-y-4">
 <div className="flex justify-between items-center px-1">
 <label className="text-[10px] font-black text-gray-400 tracking-[0.2em]">Chá»n sinh viĂªn</label>
 <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100">{selectedStudents.length} ÄĂ£ chá»n</span>
 </div>
 <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-[24px] divide-y divide-gray-50 bg-gray-50/20 custom-scrollbar p-2">
 {availableStudents.length === 0 ? (
 <div className="p-12 text-center bg-white rounded-[18px]">
 <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
 <Info size={20} className="text-gray-300" />
 </div>
 <p className="text-[10px] font-black text-gray-300 leading-relaxed">Táº¥t cáº£ sinh viĂªn lá»›p há»c<br/>Ä‘Ă£ Ä‘Æ°á»£c phĂ¢n bá»• vĂ o cĂ¡c nhĂ³m</p>
 </div>
 ) : availableStudents.map(s => (
 <label key={s.id} className={`p-4 flex items-center gap-4 rounded-[18px] cursor-pointer transition-all duration-300 group ${selectedStudents.includes(s.id) ? 'bg-teal-50 border-teal-100' : 'hover:bg-white hover:shadow-md'}`}>
 <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedStudents.includes(s.id) ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-200 bg-white group-hover:border-teal-300'}`}>
 {selectedStudents.includes(s.id) && <span className="text-[10px] font-black">âœ“</span>}
 </div>
 <input
 type="checkbox"
 checked={selectedStudents.includes(s.id)}
 onChange={() => setSelectedStudents(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])}
 className="hidden"
 />
 <div className="min-w-0">
 <p className={`text-xs font-black tracking-tight transition-colors ${selectedStudents.includes(s.id) ? 'text-teal-700' : 'text-gray-800'}`}>{s.name || s.fullName}</p>
 <p className={`text-[9px] font-bold mt-0.5 transition-colors ${selectedStudents.includes(s.id) ? 'text-teal-600/60' : 'text-gray-400'}`}>{s.studentCode || s.id}</p>
 </div>
 </label>
 ))}
 </div>
 </div>

 <Button
 className="w-full h-15 bg-gradient-to-br from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white rounded-2xl font-black tracking-[0.2em] shadow-xl shadow-teal-100 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale border-0 mt-4 h-14"
 onClick={handleCreateGroup}
 disabled={isBusy || selectedStudents.length === 0 || !newGroupTopic.trim()}
 >
 PhĂª duyá»‡t táº¡o nhĂ³m
 </Button>
 </CardContent>
 </div>
 </Card>

 <Card className="relative overflow-hidden group border-0 shadow-premium p-1.5 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[40px]">
 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
 <div className="relative bg-white/95 backdrop-blur-sm rounded-[34px] p-8 space-y-6">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200">
 <Sparkles size={18} />
 </div>
 <CardTitle className="font-display text-violet-900 leading-none">Smart Auto-Group</CardTitle>
 </div>

 <div className="bg-violet-50/50 p-4 rounded-2xl border border-violet-100 flex gap-3">
 <Info size={16} className="text-violet-500 shrink-0 mt-0.5" />
 <p className="text-[10px] text-violet-700 font-black leading-relaxed opacity-80">
 Tá»± Ä‘á»™ng tá»‘i Æ°u hĂ³a viá»‡c phĂ¢n bá»• {availableStudents.length} sinh viĂªn cĂ²n láº¡i dá»±a trĂªn thuáº­t toĂ¡n cĂ¢n báº±ng quy mĂ´ nhĂ³m.
 </p>
 </div>

 <div className="space-y-3">
 <label className="text-[10px] font-black text-gray-400 tracking-[0.2em] px-1">Cáº¥u hĂ¬nh Quy mĂ´ NhĂ³m</label>
 <SelectField 
 value={autoGroupSize} 
 onChange={e => setAutoGroupSize(Number(e.target.value))} 
 className="h-12 border-violet-100 bg-white text-[10px] font-black rounded-xl focus:ring-violet-500 focus:border-violet-500"
 >
 <option value={4}>Standard: 4 SV / NhĂ³m</option>
 <option value={5}>Balanced: 5 SV / NhĂ³m</option>
 <option value={6}>Maximum: 6 SV / NhĂ³m</option>
 </SelectField>
 </div>

 <Button
 className="w-full h-14 bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white rounded-2xl font-black tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 border-0"
 onClick={handleAutoCreateGroups}
 disabled={isBusy || availableStudents.length === 0}
 >
 <Wand2 size={18} className="mr-2" /> Báº¯t Ä‘áº§u thuáº­t toĂ¡n
 </Button>
 </div>
 </Card>
 </div>
 );
}

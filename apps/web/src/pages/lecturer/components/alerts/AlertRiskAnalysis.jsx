import { AlertTriangle } from"lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card.jsx";
import { Button } from"@/components/ui/Button.jsx";

export function AlertRiskAnalysis({ selectedAlert, onRemind, remindedIds = new Set() }) {
 if (!selectedAlert) {
 return (
 <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50 py-5 px-6">
 <CardTitle className="text-base font-black text-gray-800">PhĂ¢n tĂ­ch rá»§i ro</CardTitle>
 </CardHeader>
 <CardContent className="p-8 flex items-center justify-center min-h-[300px]">
 <div className="text-center text-gray-300 font-bold text-xs">
 Vui lĂ²ng chá»n cáº£nh bĂ¡o
 </div>
 </CardContent>
 </Card>
 );
 }

 return (
 <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50 py-5 px-6">
 <CardTitle className="text-base font-black text-gray-800">PhĂ¢n tĂ­ch rá»§i ro</CardTitle>
 </CardHeader>
 <CardContent className="p-8 space-y-8">
 <div className="text-center">
 <div className="w-20 h-20 rounded-[32px] bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
 <AlertTriangle size={32} className="text-red-500" />
 </div>
 <h4 className="font-black text-gray-800 text-base">{selectedAlert.targetName || selectedAlert.groupName}</h4>
 <p className="text-xs text-gray-400 font-bold mt-1">{selectedAlert.groupName}</p>
 </div>

 <div className="space-y-4">
 <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
 <p className="text-[10px] font-black text-gray-400 mb-2">Äá» xuáº¥t xá»­ lĂ½</p>
 <p className="text-xs text-gray-700 font-medium leading-relaxed">{selectedAlert.suggestion ||"NĂªn liĂªn há»‡ trá»±c tiáº¿p Ä‘á»ƒ xĂ¡c minh lĂ½ do tham gia kĂ©m vĂ  cáº­p nháº­t láº¡i phĂ¢n chia cĂ´ng viá»‡c."}</p>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="p-4 rounded-2xl border border-gray-100">
 <p className="text-[9px] font-black text-gray-400 mb-1">Score</p>
 <p className="text-xl font-black text-gray-800">{selectedAlert.metrics?.score || 0}</p>
 </div>
 <div className="p-4 rounded-2xl border border-gray-100">
 <p className="text-[9px] font-black text-gray-400 mb-1">Thá»i Ä‘iá»ƒm</p>
 <p className="text-[10px] font-black text-gray-800 mt-2">
 {new Date(selectedAlert.createdAt).toLocaleDateString('vi-VN')}
 </p>
 </div>
 </div>
 </div>

 <div className="pt-4 space-y-3">
 <Button
 className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 border-0 disabled:opacity-50"
 onClick={() => onRemind(selectedAlert)}
 disabled={remindedIds.has(selectedAlert?.id)}
 >
 {remindedIds.has(selectedAlert?.id) ?"ÄĂ£ gá»­i nháº¯c nhá»Ÿ" :"Gá»­i mail thĂ´ng bĂ¡o"}
 </Button>
 </div>
 </CardContent>
 </Card>
 );
}

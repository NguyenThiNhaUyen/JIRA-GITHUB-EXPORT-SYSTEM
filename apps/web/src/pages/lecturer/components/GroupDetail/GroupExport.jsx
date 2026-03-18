import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card.jsx";
import { Button } from"@/components/ui/Button.jsx";
import { FileDown, Users, AlertTriangle } from"lucide-react";

export function GroupExport({
 group,
 students,
 handleExportCsv,
 handleExportSrs,
 handleSendAlert,
 isGeneratingSrs,
 isSendingAlert
}) {
 return (
 <>
 <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white hover:shadow-lg transition-all">
 <CardHeader className="border-b border-gray-50 py-5 px-8 flex flex-row items-center justify-between">
 <CardTitle className="text-base font-black text-gray-800">BĂ¡o cĂ¡o & Xuáº¥t báº£n</CardTitle>
 </CardHeader>
 <CardContent className="p-8 space-y-4">
 <div className="flex items-center justify-between gap-6">
 <div>
 <h4 className="font-black text-gray-800 text-[10px] mb-1.5">Xuáº¥t bĂ¡o cĂ¡o SRS</h4>
 <p className="text-[11px] text-gray-400 font-bold opacity-80">Xuáº¥t dá»¯ liá»‡u Jira/GitHub sang PDF chuáº©n ISO 29148.</p>
 </div>
 <Button
 onClick={() => handleExportSrs(group)}
 disabled={isGeneratingSrs}
 variant="outline"
 className="rounded-2xl h-12 px-8 text-[10px] font-black border-teal-100 text-teal-600 hover:bg-teal-50 shadow-sm shrink-0"
 >
 <FileDown size={16} className="mr-2" /> {isGeneratingSrs ?"Äang táº¡o..." :"Xuáº¥t SRS"}
 </Button>
 </div>

 <div className="h-px bg-gray-50" />

 <div className="flex items-center justify-between gap-6">
 <div>
 <h4 className="font-black text-gray-800 text-[10px] mb-1.5">Danh sĂ¡ch ThĂ nh viĂªn</h4>
 <p className="text-[11px] text-gray-400 font-bold opacity-80">Xuáº¥t báº£ng Ä‘iá»ƒm Ä‘Ă³ng gĂ³p cá»§a nhĂ³m sang Ä‘á»‹nh dáº¡ng CSV.</p>
 </div>
 <Button
 onClick={() => handleExportCsv(group, students)}
 variant="outline"
 className="rounded-2xl h-10 px-6 text-[10px] font-black border-gray-100 text-gray-600 hover:bg-gray-50 shadow-sm shrink-0"
 >
 <Users size={14} className="mr-2" /> Xuáº¥t CSV
 </Button>
 </div>
 </CardContent>
 </Card>

 <Card className="border border-orange-100 shadow-sm rounded-[32px] overflow-hidden bg-orange-50/20">
 <CardContent className="p-8">
 <div className="flex items-start gap-6">
 <div className="w-14 h-14 rounded-[24px] bg-orange-100 flex items-center justify-center shrink-0 shadow-sm">
 <AlertTriangle size={24} className="text-orange-600" />
 </div>
 <div className="flex-1 min-w-0">
 <h4 className="font-black text-orange-900 text-sm mb-2">Trung tĂ¢m Cáº£nh bĂ¡o</h4>
 <p className="text-[11px] text-orange-700 font-medium leading-relaxed mb-6 opacity-70">
 Gá»­i lá»i nháº¯c nhá»Ÿ trá»±c tiáº¿p Ä‘áº¿n há»‡ thá»‘ng thĂ´ng bĂ¡o cá»§a sinh viĂªn Ä‘á»‘i vá»›i cĂ¡c nhĂ³m cĂ³ tiáº¿n Ä‘á»™ cháº­m hoáº·c thiáº¿u há»¥t commit/task Jira.
 </p>
 <Button
 className="bg-orange-600 hover:bg-orange-700 text-white border-0 rounded-2xl h-11 px-8 text-[10px] font-black shadow-xl shadow-orange-200"
 disabled={isSendingAlert}
 onClick={() => handleSendAlert("Cáº£nh bĂ¡o kháº©n: YĂªu cáº§u cáº­p nháº­t tiáº¿n Ä‘á»™ nhĂ³m!")}
 >
 <AlertTriangle size={13} className="mr-2" />
 {isSendingAlert ?"Äang gá»­i..." :"Gá»­i cáº£nh bĂ¡o ngay"}
 </Button>
 </div>
 </div>
 </CardContent>
 </Card>
 </>
 );
}

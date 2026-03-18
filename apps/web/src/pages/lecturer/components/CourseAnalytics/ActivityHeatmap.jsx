import React from"react";
import CalendarHeatmap from"react-calendar-heatmap";
import { subDays } from"date-fns";
import { Calendar } from"lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card.jsx";

export function ActivityHeatmap({ heatmapData }) {
 return (
 <Card className="xl:col-span-12 border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50 py-6 px-10 flex flex-row items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center shadow-inner">
 <Calendar size={18} className="text-teal-600" />
 </div>
 <div>
 <CardTitle className="text-base font-black text-gray-800 leading-none">CÆ°á»ng Ä‘á»™ hoáº¡t Ä‘á»™ng (90 ngĂ y qua)</CardTitle>
 <p className="text-[10px] font-bold text-gray-400 mt-1.5 opacity-70">Tá»•ng sá»‘ commit ghi nháº­n trĂªn GitHub</p>
 </div>
 </div>
 <div className="flex gap-1">
 {[1, 2, 3, 4].map(i => <div key={i} className={`w-3 h-3 rounded-sm color-scale-${i}`} />)}
 <span className="text-[9px] font-black text-gray-300 ml-2">High Activity</span>
 </div>
 </CardHeader>
 <CardContent className="p-10">
 <div className="heatmap-container overflow-x-auto pb-4 custom-scrollbar">
 <CalendarHeatmap
 startDate={subDays(new Date(), 90)}
 endDate={new Date()}
 values={heatmapData}
 classForValue={(value) => {
 if (!value || !value.count) return"color-empty";
 return `color-scale-${Math.min(value.count, 4)}`;
 }}
 tooltipDataAttrs={value => ({ 'data-tip': `${value.date || ''}: ${value.count || 0} commits` })}
 transformDayElement={(element, value, index) => React.cloneElement(element, { key: value?.date || index })}
 />
 </div>
 </CardContent>
 </Card>
 );
}

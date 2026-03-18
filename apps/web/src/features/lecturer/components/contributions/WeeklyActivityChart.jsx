import React from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card.jsx";

const WEEKS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

export function WeeklyActivityChart({ weeklyCommits }) {
  const maxWeekly = Math.max(...weeklyCommits, 1);
  const total = weeklyCommits.reduce((a, b) => a + b, 0);
  const avg = Math.round(total / (weeklyCommits.length || 1));

  return (
    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
      <CardHeader className="border-b border-gray-50 pb-4 px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
            <BarChart3 size={15} className="text-teal-600" />
          </div>
          <CardTitle className="text-base font-black text-gray-800">Hoạt động 12 tuần</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-end gap-1 h-32 mb-4">
          {weeklyCommits.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center group">
              <div 
                className="w-full bg-teal-500/20 group-hover:bg-teal-500 rounded-t-lg transition-all duration-300 relative"
                style={{ height: `${(val / maxWeekly) * 100}%`, minHeight: val > 0 ? '4px' : '0' }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {val} cmt
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between px-1">
          {WEEKS.map(w => <span key={w} className="text-[9px] font-bold text-gray-400">{w}</span>)}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Trung bình</p>
            <p className="text-sm font-black text-gray-700">{avg} commits/tuần</p>
          </div>
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tổng cộng</p>
            <p className="text-sm font-black text-gray-700">{total} commits</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}







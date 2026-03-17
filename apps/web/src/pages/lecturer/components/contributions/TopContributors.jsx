import { Target } from "lucide-react";
import { Card } from "../../../../components/ui/Card.jsx";
import { Button } from "../../../../components/ui/Button.jsx";

export function TopContributors({ students }) {
  const topStudents = [...students]
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 3);

  return (
    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest leading-none">Top Contributors</h3>
        <Target size={18} className="text-teal-600" />
      </div>
      <div className="space-y-6">
        {topStudents.map((s, i) => (
          <div key={s.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-gray-400">
                0{i + 1}
              </div>
              <div>
                <p className="text-sm font-black text-gray-800 truncate max-w-[120px]">{s.name}</p>
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{s.team || s.groupName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-gray-800">{s.commits}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Commits</p>
            </div>
          </div>
        ))}
        {topStudents.length === 0 && (
          <p className="text-center text-[10px] font-black uppercase text-gray-400 tracking-widest py-4">
            Không có dữ liệu
          </p>
        )}
      </div>
      <Button className="w-full mt-8 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl h-11 text-xs font-black uppercase tracking-widest border-0">
        Xem tất cả
      </Button>
    </Card>
  );
}

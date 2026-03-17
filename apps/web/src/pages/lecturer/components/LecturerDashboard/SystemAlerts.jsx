import { AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/Card.jsx";
import { Button } from "../../../../components/ui/Button.jsx";

export function SystemAlerts({ alertsList, handleResolveAlert, onNavigate }) {
  return (
    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
      <CardHeader className="border-b border-gray-50 py-6 px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shadow-sm">
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <CardTitle className="text-sm font-black text-gray-800 uppercase tracking-widest leading-none">Cảnh báo hệ thống</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-4">
          {alertsList.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mọi thứ đều ổn định</p>
            </div>
          ) : alertsList.map(a => (
            <div key={a.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex justify-between items-center group transition-all hover:bg-amber-50">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest truncate">{a.name}</p>
                <p className="text-xs text-amber-700 mt-1 font-bold">{a.msg}</p>
              </div>
              <Button onClick={() => handleResolveAlert(a.id)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-amber-600 hover:bg-white shrink-0 ml-2">
                <CheckCircle size={14}/>
              </Button>
            </div>
          ))}
          <Button 
            variant="ghost" 
            className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all border border-dashed border-gray-100"
            onClick={onNavigate}
          >
            Trung tâm cảnh báo →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { useMemo } from "react";
import { Monitor, Eye, Trash2, PenLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/Card.jsx";
import { Button } from "../../../../components/ui/Button.jsx";
import { InputField, SelectField } from "../../../../components/shared/FormFields.jsx";
import { StatusBadge } from "../../../../components/shared/Badge.jsx";

export function GroupListPanel({ 
  groupSearch, 
  setGroupSearch, 
  groupFilter, 
  setGroupFilter, 
  groupsWithMetrics, 
  navigate, 
  handleDeleteGroup, 
  handleOpenForceAdd, 
  isBusy 
}) {
  const visibleGroups = useMemo(() => {
    const keyword = groupSearch.trim().toLowerCase();
    return groupsWithMetrics.filter((group) => {
      const groupName = group.name?.toLowerCase() || "";
      const groupDescription = group.description?.toLowerCase() || "";
      const matchesSearch = !keyword || groupName.includes(keyword) || groupDescription.includes(keyword);

      const matchesFilter =
        groupFilter === "all" ||
        (groupFilter === "healthy" && group.state === "healthy") ||
        (groupFilter === "watch" && group.state === "watch") ||
        (groupFilter === "warning" && group.state === "warning") ||
        (groupFilter === "critical" && group.state === "critical") ||
        (groupFilter === "missing-github" && !group.githubApproved) ||
        (groupFilter === "missing-jira" && !group.jiraApproved) ||
        (groupFilter === "missing-topic" && group.missingTopic);

      return matchesSearch && matchesFilter;
    });
  }, [groupsWithMetrics, groupSearch, groupFilter]);

  return (
    <div className="lg:col-span-2 space-y-6">
      <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between p-6">
          <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Danh Sách Nhóm ({visibleGroups.length})</CardTitle>
          <div className="flex gap-4">
            <InputField
              placeholder="Tìm nhóm..."
              value={groupSearch}
              onChange={e => setGroupSearch(e.target.value)}
              className="w-48 h-10 text-[10px]"
            />
            <SelectField
              value={groupFilter}
              onChange={e => setGroupFilter(e.target.value)}
              className="w-40 h-10 text-[10px]"
            >
              <option value="all">Tất cả nhóm</option>
              <option value="healthy">Đang ổn định</option>
              <option value="critical">Rủi ro cao</option>
              <option value="missing-topic">Chưa có đề tài</option>
            </SelectField>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-50">
            {visibleGroups.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase italic">Không tìm thấy nhóm nào</p>
              </div>
            ) : visibleGroups.map((group) => (
              <div key={group.id} className="p-8 hover:bg-gray-50/50 transition-all group/item">
                <div className="flex items-start justify-between gap-6 mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-black text-gray-800 uppercase tracking-tight">{group.name}</h4>
                      <StatusBadge status={group.state.toUpperCase()} />
                    </div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 line-clamp-1">
                      <PenLine size={12} /> {group.description || "Chưa thiết lập đề tài"}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      className="h-11 w-11 p-0 rounded-2xl hover:bg-teal-50 hover:text-teal-600 border border-transparent hover:border-teal-100 transition-all"
                      onClick={() => navigate(`/lecturer/group/${group.id}`)}
                    >
                      <Eye size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-11 w-11 p-0 rounded-2xl hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all"
                      onClick={() => handleDeleteGroup(group.id)}
                      disabled={isBusy}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center">
                    <p className="text-[8px] font-black text-gray-300 uppercase mb-2">Thành viên</p>
                    <p className="text-xs font-black text-gray-800">{group.memberCount} SV</p>
                    <Button
                      size="sm"
                      onClick={() => handleOpenForceAdd(group.id)}
                      className="h-5 px-2 mt-2 text-[8px] font-black uppercase tracking-widest bg-teal-50 text-teal-600 hover:bg-teal-100 border-0 rounded-md shadow-none"
                    >
                      + Thêm
                    </Button>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center hover:border-teal-200 transition-all cursor-pointer">
                    <p className="text-[8px] font-black text-gray-300 uppercase mb-2">Tiến độ</p>
                    <p className="text-xs font-black text-teal-600">{group.progress}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center">
                    <p className="text-[8px] font-black text-gray-300 uppercase mb-2">Leader</p>
                    <p className="text-xs font-black text-gray-800 truncate w-full text-center px-1 uppercase tracking-tighter">{group.leader || "Chưa có"}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center">
                    <p className="text-[8px] font-black text-gray-300 uppercase mb-2">Rủi ro</p>
                    <p className={`text-xs font-black ${group.riskScore > 50 ? 'text-red-500' : 'text-green-500'} uppercase tracking-widest`}>{group.riskScore}%</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(group.team || []).map(member => (
                      <div key={member.studentUserId || member.studentId} className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black text-gray-600 uppercase tracking-tighter">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                        {member.studentName}
                        {member.role === "LEADER" && <span className="text-[8px] bg-amber-100 text-amber-700 px-1 rounded">L</span>}
                      </div>
                    ))}
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full transition-all duration-700 ${group.progress > 70 ? 'bg-teal-500' : group.progress > 30 ? 'bg-indigo-500' : 'bg-orange-400'}`} style={{ width: `${group.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="bg-gradient-to-r from-indigo-700 to-blue-600 rounded-[32px] p-8 text-white flex flex-wrap items-center justify-between gap-6 shadow-2xl shadow-indigo-200/50 border border-white/10">
        <div className="flex-1 min-w-[300px]">
          <h4 className="text-lg font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Monitor size={20} /> Đồng bộ Jira/GitHub</h4>
          <p className="text-[11px] text-indigo-100 font-bold uppercase opacity-80 leading-relaxed">Đảm bảo tiến độ dự án được khớp định kỳ giữa các nền tảng kỹ thuật và báo cáo học tập.</p>
        </div>
        <Button className="bg-white text-indigo-700 hover:bg-indigo-50 rounded-2xl h-14 px-10 font-black uppercase tracking-widest border-0 shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95">Sync Data</Button>
      </div>
    </div>
  );
}

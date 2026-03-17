// Tasks page - Kanban board + Flow metrics
import { useState } from "react";
import { Plus } from "lucide-react";
import { useTasksBoard, useCfd, useCycleTime, useAgingWip } from "../hooks/use-api.js";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card.jsx";
import { CfdChart } from "../components/charts/cfd-chart.jsx";
import { CycleTimeChart } from "../components/charts/cycle-time-chart.jsx";

export default function Tasks() {
  const { repoId } = useApp();
  // We'll treat repoId as the projectId for now, as selecting a repo usually means selecting a project in this context
  const projectId = repoId;
  const { data: board, isLoading: boardLoading } = useTasksBoard(projectId);
  const { data: cfd, isLoading: cfdLoading } = useCfd(projectId);
  const { data: cycleTime, isLoading: cycleTimeLoading } = useCycleTime(projectId);
  const { data: agingWip, isLoading: agingWipLoading } = useAgingWip(projectId, 5);

  const columns = board?.columns || { todo: [], in_progress: [], done: [] };
  
  const hasTasks = columns.todo?.length > 0 || columns.in_progress?.length > 0 || columns.done?.length > 0;
  const hasCfd = cfd?.buckets?.length > 0;
  const hasCycleTime = cycleTime?.histogram?.length > 0;
  const hasWip = agingWip?.items?.length > 0;

  const renderColumn = (title, tasks, color) => (
    <div className="flex-1 min-w-[300px] bg-blue-50/50 rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-blue-900 uppercase tracking-wider text-sm flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${color}`} />
          {title}
        </h3>
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg text-xs font-bold">
          {tasks?.length || 0}
        </span>
      </div>
      
      <div className="flex flex-col gap-3 min-h-[500px]">
        {tasks?.map((task) => (
          <Card key={task.id} className="cursor-grab active:scale-95 transition-all border-none shadow-sm hover:shadow-md">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">
                  {task.id}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                  task.priority === 'High' ? 'bg-red-50 text-red-600' : 
                  task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                  'bg-green-50 text-green-600'
                }`}>
                  {task.priority || 'Medium'}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-relaxed">
                {task.title}
              </h4>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                    {task.assignee?.[0] || '?'}
                  </div>
                  <span className="text-xs text-gray-500 truncate max-w-[100px]">
                    {task.assignee || 'Unassigned'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-gray-400">
                  {task.type}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!tasks || tasks.length === 0) && (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-blue-100 rounded-xl text-xs text-blue-300 italic">
            No tasks in this column
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-white to-blue-50/30">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Plus size={24} />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-black text-blue-900 uppercase tracking-tight">Task Overview</h1>
                <p className="text-blue-500 text-xs font-bold uppercase tracking-widest mt-0.5 opacity-70">Kanban board & Flow metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-900 hover:bg-black text-white rounded-xl transition-all shadow-md shadow-blue-100 text-xs font-black uppercase tracking-widest">
                <Plus size={16} />
                <span>New Task</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board Container */}
      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 min-w-max h-full">
          {boardLoading ? (
            <div className="flex-1 text-center py-20 text-blue-500 font-bold animate-pulse uppercase tracking-widest">
              Loading board data...
            </div>
          ) : (
            <>
              {renderColumn("To Do", columns.todo, "bg-gray-400")}
              {renderColumn("In Progress", columns.in_progress, "bg-blue-500")}
              {renderColumn("Done", columns.done, "bg-teal-500")}
            </>
          )}
        </div>
      </div>

      {/* Analytics Panel */}
      {(hasCfd || hasCycleTime) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* CFD Chart */}
          {hasCfd && <CfdChart data={cfd.buckets} isLoading={cfdLoading} isError={false} />}

          {/* Cycle Time */}
          {hasCycleTime && <CycleTimeChart data={cycleTime} isLoading={cycleTimeLoading} isError={false} />}
        </div>
      )}

      {/* Metrics Cards */}
      {(hasCycleTime || hasTasks) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 opacity-60">Median Cycle Time</div>
              <div className="text-3xl font-black text-blue-900 tracking-tighter">{cycleTime?.medianDays || 0} <span className="text-sm uppercase opacity-40">Days</span></div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 opacity-60">P75 Cycle Time</div>
              <div className="text-3xl font-black text-blue-900 tracking-tighter">{cycleTime?.p75Days || 0} <span className="text-sm uppercase opacity-40">Days</span></div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 opacity-60">WIP Count</div>
              <div className="text-3xl font-black text-blue-900 tracking-tighter">{columns.in_progress?.length || 0} <span className="text-sm uppercase opacity-40">Tasks</span></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Aging WIP List */}
      {hasWip && (
        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 lg:p-6 border-b border-gray-50">
            <CardTitle className="text-sm font-black text-blue-900 uppercase tracking-widest">Aging WIP (Nhiệm vụ tồn đọng)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-blue-50">
              {agingWip.items.map((item) => (
                <div key={item.issueId} className="p-6 hover:bg-blue-50/30 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-black text-xs">
                      {item.key}
                    </div>
                    <div>
                      <div className="font-bold text-blue-900 text-sm">{item.summary}</div>
                      <div className="text-[10px] font-black text-blue-400 uppercase tracking-tighter mt-0.5">Assigned to {item.assignee || 'Unknown'}</div>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    item.daysInProgress > 5 ? "bg-red-50 text-red-600" :
                    item.daysInProgress > 3 ? "bg-orange-50 text-orange-600" :
                    "bg-yellow-50 text-yellow-600"
                  }`}>
                    {item.daysInProgress} Days in WIP
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



// Tasks page - Kanban board + Flow metrics
import { useState } from "react";
import { Plus } from "lucide-react";
import { useTasksBoard, useCfd, useCycleTime, useAgingWip } from "../hooks/use-api.js";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card.jsx";
import { CfdChart } from "../components/charts/cfd-chart.jsx";
import { CycleTimeChart } from "../components/charts/cycle-time-chart.jsx";

export default function Tasks() {
  const { data: board, isLoading: boardLoading } = useTasksBoard();
  const { data: cfd, isLoading: cfdLoading } = useCfd();
  const { data: cycleTime, isLoading: cycleTimeLoading } = useCycleTime();
  const { data: agingWip, isLoading: agingWipLoading } = useAgingWip(5);

  const columns = board?.columns || { todo: [], in_progress: [], done: [] };
  
  const hasTasks = columns.todo.length > 0 || columns.in_progress.length > 0 || columns.done.length > 0;
  const hasCfd = cfd?.buckets?.length > 0;
  const hasCycleTime = cycleTime?.histogram?.length > 0;
  const hasWip = agingWip?.items?.length > 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-blue-900">Task Overview</h1>
              <p className="text-blue-600 mt-1 text-sm">Kanban board và flow metrics</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
              <Plus size={18} />
              <span>New Task</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {!hasTasks && !hasCfd && !hasCycleTime && !hasWip && !boardLoading && !cfdLoading && !cycleTimeLoading && !agingWipLoading && (
        <div className="text-center py-10 text-gray-500 italic">
          Tính năng quản lý Task hiện chưa được hỗ trợ từ API. Vui lòng quay lại sau.
        </div>
      )}

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
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-blue-600 mb-2">Median Cycle Time</div>
              <div className="text-3xl font-bold text-blue-900">{cycleTime?.medianDays || 0} days</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-blue-600 mb-2">P75 Cycle Time</div>
              <div className="text-3xl font-bold text-blue-900">{cycleTime?.p75Days || 0} days</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-blue-600 mb-2">WIP Count</div>
              <div className="text-3xl font-bold text-blue-900">{columns.in_progress?.length || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Aging WIP List */}
      {hasWip && (
        <Card>
          <CardHeader className="p-4 lg:p-6">
            <CardTitle>Aging WIP</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-blue-100">
              {agingWip.items.map((item) => (
                <div key={item.issueId} className="p-4 hover:bg-blue-50/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-blue-900">{item.key}</div>
                      <div className="text-sm text-blue-600">{item.summary}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.daysInProgress > 5 ? "bg-red-100 text-red-700" :
                      item.daysInProgress > 3 ? "bg-orange-100 text-orange-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {item.daysInProgress} days
                    </div>
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



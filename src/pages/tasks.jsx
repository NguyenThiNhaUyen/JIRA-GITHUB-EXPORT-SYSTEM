// Tasks page - Kanban board + Flow metrics
import { useState } from "react";
import { Plus, MoreVertical, User } from "lucide-react";
import { useTasksBoard, useCfd, useCycleTime, useAgingWip } from "../hooks/use-api.js";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card.jsx";
import { CfdChart } from "../components/charts/cfd-chart.jsx";
import { CycleTimeChart } from "../components/charts/cycle-time-chart.jsx";
import { mockMembers } from "../lib/mock-data.js";
import { formatDate } from "../lib/date-utils.js";

const badgeColors = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-700",
};

function KanbanColumn({ title, tasks, color, onAddTask }) {
  const colorClasses = {
    blue: "border-blue-200 bg-blue-50/30",
    orange: "border-orange-200 bg-orange-50/30",
    green: "border-green-200 bg-green-50/30",
  };

  return (
    <Card className={colorClasses[color]}>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm lg:text-base">{title}</CardTitle>
          <span className="px-2 py-1 bg-white rounded-full text-xs font-medium text-blue-600">
            {tasks.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        <button
          onClick={onAddTask}
          className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span>Add task</span>
        </button>
      </CardContent>
    </Card>
  );
}

function TaskCard({ task }) {
  const assignee = mockMembers.find((m) => m.id === task.assigneeId);
  return (
    <div className="bg-white rounded-xl border border-blue-100 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-blue-600">{task.key}</span>
        <MoreVertical size={16} className="text-blue-400" />
      </div>
      <h4 className="font-medium text-blue-900 mb-3 text-sm">{task.summary}</h4>
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded text-xs font-medium ${badgeColors[task.priority]}`}>
          {task.priority}
        </span>
        <div className="flex items-center gap-1">
          <User size={14} className="text-blue-400" />
          <span className="text-xs text-blue-600">{assignee?.name.split(" ").pop() || "Unassigned"}</span>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { data: board, isLoading: boardLoading } = useTasksBoard();
  const { data: cfd, isLoading: cfdLoading } = useCfd();
  const { data: cycleTime, isLoading: cycleTimeLoading } = useCycleTime();
  const { data: agingWip, isLoading: agingWipLoading } = useAgingWip(5);

  const columns = board?.columns || { todo: [], in_progress: [], done: [] };

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

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <KanbanColumn
          title="TO DO"
          tasks={columns.todo || []}
          color="blue"
          onAddTask={() => console.log("Add to TODO")}
        />
        <KanbanColumn
          title="IN PROGRESS"
          tasks={columns.in_progress || []}
          color="orange"
          onAddTask={() => console.log("Add to IN PROGRESS")}
        />
        <KanbanColumn
          title="DONE"
          tasks={columns.done || []}
          color="green"
          onAddTask={() => console.log("Add to DONE")}
        />
      </div>

      {/* Analytics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CFD Chart */}
        <CfdChart data={cfd?.buckets || []} isLoading={cfdLoading} isError={false} />

        {/* Cycle Time */}
        <CycleTimeChart data={cycleTime} isLoading={cycleTimeLoading} isError={false} />
      </div>

      {/* Metrics Cards + Aging WIP */}
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

      {/* Aging WIP List */}
      <Card>
        <CardHeader className="p-4 lg:p-6">
          <CardTitle>Aging WIP</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-blue-100">
            {agingWip?.items?.map((item) => (
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
            {(!agingWip?.items || agingWip.items.length === 0) && (
              <div className="p-10 text-center text-blue-500">Không có WIP</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



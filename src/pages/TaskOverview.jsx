// TaskOverview: Trang Kanban board quản lý tasks
import { useState } from "react";
import { Plus, MoreVertical, Calendar, User } from "lucide-react";

const MOCK_TASKS = {
  todo: [
    { id: 1, title: "Task creation", priority: "medium", assignees: 2, hashtag: "#CreateTask" },
    { id: 2, title: "Bug fixes", priority: "high", assignees: 1, hashtag: "#BugFixes" },
    { id: 3, title: "Code review", priority: "low", assignees: 3, hashtag: "#CodeReview" },
  ],
  inProgress: [
    { id: 4, title: "Feature", priority: "high", assignees: 2, hashtag: "#FeatureDev" },
    { id: 5, title: "Testing", priority: "medium", assignees: 3, hashtag: "#Testing" },
    { id: 6, title: "Daily standup", priority: "high", assignees: 2, hashtag: "#Standup" },
  ],
  done: [
    { id: 7, title: "Sprint review", priority: "high", assignees: 2, hashtag: "#SprintReview" },
    { id: 8, title: "Deployment", priority: "low", assignees: 1, hashtag: "#Deployment" },
  ],
};

export default function TaskOverview() {
  const [tasks] = useState(MOCK_TASKS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Task Overview</h1>
            <p className="text-blue-600 mt-1">Quản lý tasks với Kanban board</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* TO DO */}
        <KanbanColumn
          title="TO DO"
          tasks={tasks.todo}
          color="blue"
          onAddTask={() => console.log("Add task to TODO")}
        />

        {/* IN PROGRESS */}
        <KanbanColumn
          title="IN PROGRESS"
          tasks={tasks.inProgress}
          color="orange"
          onAddTask={() => console.log("Add task to IN PROGRESS")}
        />

        {/* DONE */}
        <KanbanColumn
          title="DONE"
          tasks={tasks.done}
          color="green"
          onAddTask={() => console.log("Add task to DONE")}
        />
      </div>
    </div>
  );
}

function KanbanColumn({ title, tasks, color, onAddTask }) {
  const colorClasses = {
    blue: "border-blue-200 bg-blue-50/30",
    orange: "border-orange-200 bg-orange-50/30",
    green: "border-green-200 bg-green-50/30",
  };

  const badgeColors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-gray-100 text-gray-700",
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${colorClasses[color]} p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-blue-900">{title}</h3>
        <span className="px-2 py-1 bg-white rounded-full text-xs font-medium text-blue-600">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} badgeColors={badgeColors} />
        ))}
      </div>

      <button
        onClick={onAddTask}
        className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        <span>Add task</span>
      </button>
    </div>
  );
}

function TaskCard({ task, badgeColors }) {
  return (
    <div className="bg-white rounded-xl border border-blue-100 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-blue-600">{task.hashtag}</span>
        <MoreVertical size={16} className="text-blue-400" />
      </div>
      <h4 className="font-medium text-blue-900 mb-3">{task.title}</h4>
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded text-xs font-medium ${badgeColors[task.priority]}`}>
          {task.priority} priority
        </span>
        <div className="flex items-center gap-1">
          <User size={14} className="text-blue-400" />
          <span className="text-xs text-blue-600">{task.assignees}</span>
        </div>
      </div>
    </div>
  );
}


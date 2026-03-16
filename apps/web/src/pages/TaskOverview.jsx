// TaskOverview: Trang Kanban board quản lý tasks
import { useState } from "react";
import { Plus } from "lucide-react";

export default function TaskOverview() {
  const [tasks] = useState({
    todo: [],
    inProgress: [],
    done: [],
  });

  const hasTasks = tasks.todo.length > 0 || tasks.inProgress.length > 0 || tasks.done.length > 0;

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

      {!hasTasks ? (
        <div className="text-center py-10 text-gray-500 italic">
          Tính năng quản lý Task Overview hiện chưa được hỗ trợ từ API. Vui lòng quay lại sau.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Kanban Board placeholder */}
        </div>
      )}
    </div>
  );
}


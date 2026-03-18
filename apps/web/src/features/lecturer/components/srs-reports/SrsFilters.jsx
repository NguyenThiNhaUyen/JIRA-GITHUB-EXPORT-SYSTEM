import React from "react";
import { Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card.jsx";

export function SrsFilters({
  search,
  setSearch,
  courseFilter,
  setCourseFilter,
  milestoneFilter,
  setMilestoneFilter,
  sortBy,
  setSortBy,
  statusFilter,
  setStatusFilter,
  courses,
  milestoneOptions,
  resultCount,
}) {
  const statusTabs = [
    { key: "all", label: "Táº¥t cáº£" },
    { key: "FINAL", label: "Final" },
    { key: "REVIEW", label: "Review" },
    { key: "SUBMITTED", label: "Submitted" },
    { key: "NEED_REVISION", label: "Need Revision" },
    { key: "DRAFT", label: "Draft" },
    { key: "OVERDUE", label: "Overdue" },
  ];

  return (
    <Card className="rounded-[24px] border border-gray-100 shadow-sm bg-white overflow-hidden">
      <CardContent className="p-4 space-y-4">
        {/* Search and Secondary Filters */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
          <div className="xl:col-span-4 relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="TĂ¬m theo nhĂ³m, project, leader, mĂ´n há»c..."
              className="w-full h-11 rounded-xl border border-gray-100 bg-gray-50/50 pl-10 pr-4 text-sm text-gray-700 outline-none focus:bg-white focus:border-teal-500 transition-all"
            />
          </div>

          <div className="xl:col-span-2">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-100 bg-gray-50/50 px-3 text-sm text-gray-700 outline-none focus:bg-white focus:border-teal-500 transition-all cursor-pointer"
            >
              <option value="all">Táº¥t cáº£ mĂ´n</option>
              {courses.map((course) => (
                <option key={course.id} value={course.code}>
                  {course.code}
                </option>
              ))}
            </select>
          </div>

          <div className="xl:col-span-2">
            <select
              value={milestoneFilter}
              onChange={(e) => setMilestoneFilter(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-100 bg-gray-50/50 px-3 text-sm text-gray-700 outline-none focus:bg-white focus:border-teal-500 transition-all cursor-pointer"
            >
              <option value="all">Táº¥t cáº£ milestone</option>
              {milestoneOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="xl:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-100 bg-gray-50/50 px-3 text-sm text-gray-700 outline-none focus:bg-white focus:border-teal-500 transition-all cursor-pointer"
            >
              <option value="latest">Má»›i cáº­p nháº­t</option>
              <option value="deadline">Sáº¯p Ä‘áº¿n háº¡n</option>
              <option value="score">Äiá»ƒm review</option>
              <option value="coverage">GitHub coverage</option>
            </select>
          </div>

          <div className="xl:col-span-2">
            <div className="h-11 rounded-xl border border-dashed border-teal-200 bg-teal-50/40 flex items-center justify-center gap-2 text-xs font-bold text-teal-700">
              <Filter size={14} />
              {resultCount} báº£n ghi
            </div>
          </div>
        </div>

        {/* Status Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {statusTabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`px-3.5 py-1.5 rounded-xl border text-[11px] font-medium transition-all ${statusFilter === item.key
                  ? "bg-teal-600 border-teal-600 text-white shadow-sm shadow-teal-200"
                  : "bg-white border-gray-100 text-gray-500 hover:border-teal-300 hover:text-teal-600"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { Filter, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { SelectField } from "../../../components/shared/FormFields.jsx";

export function LecturerFilters({ 
  selectedSubject, 
  setSelectedSubject, 
  selectedCourse, 
  setSelectedCourse, 
  filter, 
  setFilter, 
  subjects, 
  courses, 
  onManageGroups 
}) {
  return (
    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
      <CardHeader className="border-b border-gray-50 py-5 px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-teal-600" />
            <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Bộ lọc lớp học</CardTitle>
          </div>
          {selectedCourse && (
            <Button
              onClick={onManageGroups}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider h-9 px-5 shadow-lg shadow-teal-100 border-0 transition-all"
            >
              <Settings2 size={14} />Quản lý nhóm
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SelectField 
            label="Môn học" 
            value={selectedSubject} 
            onChange={e => setSelectedSubject(e.target.value)}
          >
            <option value="">— Chọn môn học —</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.code} – {s.name}</option>)}
          </SelectField>
          
          <SelectField 
            label="Lớp học" 
            value={selectedCourse} 
            onChange={e => setSelectedCourse(e.target.value)} 
            disabled={!selectedSubject || courses.length === 0}
          >
            <option value="">— Chọn lớp học —</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
          </SelectField>
          
          <SelectField 
            label="Bộ lọc nhanh" 
            value={filter} 
            onChange={e => setFilter(e.target.value)} 
            disabled={!selectedCourse}
          >
            <option value="all">Tất cả nhóm</option>
            <option value="inactive-students">Ít commit</option>
            <option value="inactive-groups">Chưa hoàn thành</option>
          </SelectField>
        </div>
      </CardContent>
    </Card>
  );
}

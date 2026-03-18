import React from "react";
import { Filter, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { SelectField } from "@/components/shared/FormFields.jsx";

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
            <CardTitle className="text-base font-black text-gray-800">Bá»™ lá»c lá»›p há»c</CardTitle>
          </div>
          {selectedCourse && (
            <Button
              onClick={onManageGroups}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[11px] font-black h-9 px-5 shadow-lg shadow-teal-100 border-0 transition-all"
            >
              <Settings2 size={14} />Quáº£n lĂ½ nhĂ³m
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SelectField
            label="MĂ´n há»c"
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
          >
            <option value="">â€” Chá»n mĂ´n há»c â€”</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.code} â€“ {s.name}</option>)}
          </SelectField>

          <SelectField
            label="Lá»›p há»c"
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            disabled={!selectedSubject || courses.length === 0}
          >
            <option value="">â€” Chá»n lá»›p há»c â€”</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
          </SelectField>

          <SelectField
            label="Bá»™ lá»c nhanh"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            disabled={!selectedCourse}
          >
            <option value="all">Táº¥t cáº£ nhĂ³m</option>
            <option value="inactive-students">Ăt commit</option>
            <option value="inactive-groups">ChÆ°a hoĂ n thĂ nh</option>
          </SelectField>
        </div>
      </CardContent>
    </Card>
  );
}


import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Target,
  Download,
  GitBranch,
  Activity,
  TrendingUp,
  Filter
} from "lucide-react";

// Components Shared
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { InputField } from "../../components/shared/FormFields.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";

// Local Sub-components
import { ContributionStats } from "../../features/lecturer/components/contributions/ContributionStats.jsx";
import { StudentContributionTable } from "../../features/lecturer/components/contributions/StudentContributionTable.jsx";
import { WeeklyActivityChart } from "../../features/lecturer/components/contributions/WeeklyActivityChart.jsx";

// Hooks
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";

/* ----------------------------- HELPERS ----------------------------- */

function hashString(str = "") {
  let hash = 0;
  const value = String(str);
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededNumber(seed, min, max) {
  const hashed = hashString(seed);
  return min + (hashed % (max - min + 1));
}

function seededPick(seed, items = []) {
  if (!items.length) return null;
  return items[hashString(seed) % items.length];
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function normalizeStudent(raw, index = 0, groupName = "Nhóm") {
  const studentId =
    raw?.studentId ||
    raw?.id ||
    raw?.userId ||
    raw?.accountId ||
    `${groupName}-student-${index + 1}`;

  const studentCode =
    raw?.studentCode ||
    raw?.code ||
    raw?.rollNumber ||
    raw?.mssv ||
    `SE${String(100000 + index * 17).slice(-6)}`;

  const studentName =
    raw?.studentName ||
    raw?.name ||
    raw?.fullName ||
    raw?.username ||
    `Sinh viên ${index + 1}`;

  const email =
    raw?.email ||
    `${String(studentName)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")}@fpt.edu.vn`;

  return {
    studentId: String(studentId),
    studentCode: String(studentCode),
    studentName: String(studentName),
    email: String(email),
  };
}

function normalizeGroup(group, index = 0) {
  const name =
    group?.name || group?.groupName || group?.projectName || `Nhóm ${index + 1}`;

  const teamSource =
    group?.team || group?.members || group?.students || group?.studentList || [];

  const team = Array.isArray(teamSource)
    ? teamSource.map((member, memberIndex) =>
        normalizeStudent(member, memberIndex, name)
      )
    : [];

  const studentIds =
    Array.isArray(group?.studentIds) && group.studentIds.length > 0
      ? group.studentIds.map(String)
      : team.map((m) => String(m.studentId));

  return {
    ...group,
    id: group?.id || `group-${index + 1}`,
    name,
    team,
    studentIds,
  };
}

function buildMockContribution(courseId, groups) {
  const allStudentsMap = {};

  groups.forEach((group, gIndex) => {
    group.team.forEach((member, mIndex) => {
      if (!allStudentsMap[member.studentId]) {
        const seed = `${courseId}-${group.id}-${member.studentId}-${gIndex}-${mIndex}`;

        const profile = seededPick(`${seed}-profile`, [
          "excellent",
          "active",
          "steady",
          "warning",
          "inactive",
        ]);

        let commits = 0;
        let jiraDone = 0;
        let prs = 0;
        let reviews = 0;
        let activeDays = 0;

        if (profile === "excellent") {
          commits = seededNumber(`${seed}-commits`, 18, 34);
          jiraDone = seededNumber(`${seed}-jira`, 12, 22);
          prs = seededNumber(`${seed}-prs`, 4, 9);
          reviews = seededNumber(`${seed}-reviews`, 4, 10);
          activeDays = seededNumber(`${seed}-days`, 8, 12);
        } else if (profile === "active") {
          commits = seededNumber(`${seed}-commits`, 10, 20);
          jiraDone = seededNumber(`${seed}-jira`, 7, 14);
          prs = seededNumber(`${seed}-prs`, 2, 6);
          reviews = seededNumber(`${seed}-reviews`, 2, 7);
          activeDays = seededNumber(`${seed}-days`, 6, 10);
        } else if (profile === "steady") {
          commits = seededNumber(`${seed}-commits`, 4, 11);
          jiraDone = seededNumber(`${seed}-jira`, 4, 10);
          prs = seededNumber(`${seed}-prs`, 1, 4);
          reviews = seededNumber(`${seed}-reviews`, 0, 4);
          activeDays = seededNumber(`${seed}-days`, 3, 8);
        } else if (profile === "warning") {
          commits = seededNumber(`${seed}-commits`, 1, 5);
          jiraDone = seededNumber(`${seed}-jira`, 1, 5);
          prs = seededNumber(`${seed}-prs`, 0, 2);
          reviews = seededNumber(`${seed}-reviews`, 0, 2);
          activeDays = seededNumber(`${seed}-days`, 1, 4);
        } else {
          commits = 0;
          jiraDone = seededNumber(`${seed}-jira-zero`, 0, 1);
          prs = 0;
          reviews = 0;
          activeDays = 0;
        }

        const overdueTasks =
          profile === "inactive"
            ? seededNumber(`${seed}-overdue`, 2, 5)
            : profile === "warning"
              ? seededNumber(`${seed}-overdue`, 1, 3)
              : seededNumber(`${seed}-overdue`, 0, 1);

        const lastActiveDaysAgo =
          commits === 0
            ? seededNumber(`${seed}-inactive-days`, 8, 21)
            : seededNumber(`${seed}-recent-days`, 0, 6);

        let score =
          commits * 2.2 +
          jiraDone * 2 +
          prs * 3 +
          reviews * 1.4 +
          activeDays * 2 -
          overdueTasks * 3;

        score = Math.max(0, Math.min(100, Math.round(score)));

        let status = "Ổn định";
        if (commits === 0) status = "Chưa commit";
        else if (score >= 82) status = "Rất tốt";
        else if (score >= 62) status = "Tích cực";
        else if (score >= 40) status = "Ổn định";
        else status = "Cần chú ý";

        const dailyActivity = Array.from({ length: HEATMAP_DAYS }).map(
          (_, dayIndex) => {
            if (commits === 0) return 0;
            const raw = seededNumber(`${seed}-day-${dayIndex}`, 0, 100);
            if (profile === "excellent") {
              if (raw > 68)
                return seededNumber(`${seed}-day-value-${dayIndex}`, 1, 5);
              return 0;
            }
            if (profile === "active") {
              if (raw > 76)
                return seededNumber(`${seed}-day-value-${dayIndex}`, 1, 4);
              return 0;
            }
            if (profile === "steady") {
              if (raw > 83)
                return seededNumber(`${seed}-day-value-${dayIndex}`, 1, 3);
              return 0;
            }
            if (profile === "warning") {
              if (raw > 91)
                return seededNumber(`${seed}-day-value-${dayIndex}`, 1, 2);
              return 0;
            }
            return 0;
          }
        );

        allStudentsMap[member.studentId] = {
          studentId: member.studentId,
          name: member.studentName,
          studentCode: member.studentCode,
          email: member.email,
          groupId: group.id,
          groupName: group.name,
          commits,
          jiraDone,
          prs,
          reviews,
          activeDays,
          overdueTasks,
          lastActiveDaysAgo,
          score,
          status,
          dailyActivity,
        };
      }
    });
  });

  const students = Object.values(allStudentsMap);

  const weeklyCommits = WEEKS.map((_, weekIndex) => {
    return students.reduce((sum, student) => {
      const weekActivity = student.dailyActivity
        .slice(weekIndex * 7, weekIndex * 7 + 7)
        .reduce((a, b) => a + b, 0);
      return sum + weekActivity;
    }, 0);
  });

  const weeklyJira = WEEKS.map((_, weekIndex) => {
    return students.reduce((sum, student) => {
      const v =
        student.commits === 0
          ? 0
          : seededNumber(
              `${courseId}-${student.studentId}-jira-week-${weekIndex}`,
              0,
              4
            );
      return sum + v;
    }, 0);
  });

  return {
    studentsMap: allStudentsMap,
    weeklyCommits,
    weeklyJira,
  };
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "Rất tốt":
      return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    case "Tích cực":
      return "bg-green-50 text-green-700 border border-green-100";
    case "Ổn định":
      return "bg-blue-50 text-blue-700 border border-blue-100";
    case "Cần chú ý":
      return "bg-amber-50 text-amber-700 border border-amber-100";
    case "Chưa commit":
      return "bg-red-50 text-red-600 border border-red-100";
    default:
      return "bg-gray-50 text-gray-600 border border-gray-100";
  }
}

function getRiskLevel(group) {
  if (group.memberCount === 0) {
    return {
      label: "Chưa có dữ liệu",
      className: "bg-gray-50 text-gray-600 border border-gray-100",
      level: 0,
    };
  }
  if (
    group.zeroCommitMembers >= 2 ||
    group.balancePercent < 35 ||
    group.totalCommits < 8
  ) {
    return {
      label: "Rủi ro cao",
      className: "bg-red-50 text-red-600 border border-red-100",
      level: 3,
    };
  }
  if (
    group.zeroCommitMembers >= 1 ||
    group.balancePercent < 55 ||
    group.totalCommits < 15
  ) {
    return {
      label: "Cần theo dõi",
      className: "bg-amber-50 text-amber-700 border border-amber-100",
      level: 2,
    };
  }
  return {
    label: "Ổn định",
    className: "bg-green-50 text-green-700 border border-green-100",
    level: 1,
  };
}

function getHeatColor(value) {
  if (value <= 0) return "bg-gray-100";
  if (value === 1) return "bg-emerald-100";
  if (value === 2) return "bg-emerald-200";
  if (value === 3) return "bg-emerald-300";
  if (value === 4) return "bg-emerald-400";
  return "bg-emerald-500";
}

function shouldWarnStudent(student) {
  return (
    student.commits === 0 ||
    student.score < 40 ||
    student.lastActiveDaysAgo > 7 ||
    student.overdueTasks >= 2 ||
    student.status === "Cần chú ý"
  );
}

function getWarningReason(student) {
  if (student.commits === 0) return "no_commit";
  if (student.overdueTasks >= 2) return "overdue_tasks";
  if (student.lastActiveDaysAgo > 7) return "inactive";
  if (student.score < 40 || student.status === "Cần chú ý")
    return "low_contribution";
  return "general";
}

function getWarningMessage(student, actionType = "warning") {
  const reason = getWarningReason(student);

  if (actionType === "email") {
    if (reason === "no_commit") {
      return `Chào ${student.name}, hệ thống ghi nhận bạn chưa có commit trong giai đoạn gần đây của học phần. Vui lòng kiểm tra lại tiến độ và cập nhật phần việc của mình sớm để tránh ảnh hưởng đến đánh giá cá nhân.`;
    }
    if (reason === "overdue_tasks") {
      return `Chào ${student.name}, hệ thống ghi nhận bạn đang có nhiều công việc Jira quá hạn hoặc chưa hoàn thành. Vui lòng rà soát lại tiến độ và phối hợp với nhóm để hoàn tất các đầu việc đúng hạn.`;
    }
    if (reason === "inactive") {
      return `Chào ${student.name}, hệ thống ghi nhận bạn đã ít hoạt động trong nhiều ngày gần đây. Vui lòng quay lại cập nhật tiến độ học phần và phối hợp với nhóm để cải thiện mức độ tham gia.`;
    }
    return `Chào ${student.name}, mức độ đóng góp hiện tại của bạn đang thấp hơn kỳ vọng của học phần. Vui lòng kiểm tra lại tiến độ, cập nhật công việc và chủ động phối hợp với nhóm để cải thiện.`;
  }

  if (reason === "no_commit") {
    return "Bạn chưa có commit trong giai đoạn theo dõi. Vui lòng cập nhật tiến độ sớm.";
  }
  if (reason === "overdue_tasks") {
    return "Bạn đang có nhiều task Jira quá hạn. Hãy rà soát và hoàn thành sớm.";
  }
  if (reason === "inactive") {
    return "Hệ thống ghi nhận bạn ít hoạt động trong thời gian gần đây.";
  }
  return "Mức đóng góp của bạn đang thấp hơn kỳ vọng của học phần.";
}

function timeLabel() {
  return new Date().toLocaleString("vi-VN");
}

/* ----------------------------- SUB COMPONENTS ----------------------------- */

function Tabs({ activeTab, onChange }) {
  const tabs = [
    { key: "overview", label: "Tổng quan", icon: LayoutGrid },
    { key: "groups", label: "Nhóm", icon: Users },
    { key: "students", label: "Sinh viên", icon: UserRound },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cx(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all",
              active
                ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-teal-200 hover:text-teal-700"
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value, note }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <h3 className="text-2xl font-bold text-gray-800 leading-none mt-1">
            {value}
          </h3>
          <p className="text-[11px] text-gray-400 mt-2">{note}</p>
        </div>
        <div
          className={`w-11 h-11 rounded-2xl ${color} text-white flex items-center justify-center shrink-0 shadow-sm`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function MiniLineChart({ commits = [], jira = [] }) {
  const maxValue = Math.max(...commits, ...jira, 1);

  const buildPoints = (arr) =>
    arr
      .map((value, index) => {
        const x = (index / (arr.length - 1 || 1)) * 100;
        const y = 100 - (value / maxValue) * 100;
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
      <CardHeader className="border-b border-gray-50 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <TrendingUp size={15} className="text-blue-600" />
          </div>
          <CardTitle className="text-base font-semibold text-gray-800">
            GitHub vs Jira theo tuần
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-xs text-gray-400">
            So sánh nhịp commit và task đã hoàn thành
          </p>
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              GitHub
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Jira
            </div>
          </div>
        </div>

        <div className="relative h-44 rounded-2xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 p-3">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            {[20, 40, 60, 80].map((v) => (
              <line
                key={v}
                x1="0"
                y1={v}
                x2="100"
                y2={v}
                stroke="#edf2f7"
                strokeWidth="0.7"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            <polyline
              fill="none"
              stroke="#14b8a6"
              strokeWidth="2.4"
              points={buildPoints(commits)}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.4"
              points={buildPoints(jira)}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {commits.map((value, index) => {
              const x = (index / (commits.length - 1 || 1)) * 100;
              const y = 100 - (value / maxValue) * 100;
              return <circle key={`c-${index}`} cx={x} cy={y} r="1.6" fill="#14b8a6" />;
            })}
            {jira.map((value, index) => {
              const x = (index / (jira.length - 1 || 1)) * 100;
              const y = 100 - (value / maxValue) * 100;
              return <circle key={`j-${index}`} cx={x} cy={y} r="1.6" fill="#3b82f6" />;
            })}
          </svg>
        </div>

        <div className="grid grid-cols-12 gap-1 mt-3">
          {WEEKS.map((w) => (
            <div key={w} className="text-center text-[9px] text-gray-400">
              {w}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HeatmapCard({ students = [] }) {
  const merged = Array.from({ length: HEATMAP_DAYS }).map((_, dayIndex) => {
    const total = students.reduce(
      (sum, s) => sum + (s.dailyActivity?.[dayIndex] || 0),
      0
    );
    if (total === 0) return 0;
    if (total <= 2) return 1;
    if (total <= 5) return 2;
    if (total <= 8) return 3;
    if (total <= 11) return 4;
    return 5;
  });

  const weeks = [];
  for (let i = 0; i < merged.length; i += 7) {
    weeks.push(merged.slice(i, i + 7));
  }

  return (
    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
      <CardHeader className="border-b border-gray-50 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Activity size={15} className="text-emerald-600" />
          </div>
          <CardTitle className="text-base font-semibold text-gray-800">
            Heatmap hoạt động
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="flex gap-1.5 mb-2 pl-8">
              {WEEKS.map((w) => (
                <div
                  key={w}
                  className="w-[44px] text-center text-[10px] text-gray-400 font-medium"
                >
                  {w}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="w-6 flex flex-col justify-between py-1 text-[9px] text-gray-400">
                <span>T2</span>
                <span>T4</span>
                <span>T6</span>
              </div>

              <div className="flex gap-1.5">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-rows-7 gap-1.5">
                    {week.map((value, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={cx(
                          "w-4 h-4 rounded-[4px] border border-white/70",
                          getHeatColor(value)
                        )}
                        title={`Tuần ${weekIndex + 1} - ngày ${dayIndex + 1}: mức ${value}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
          <p className="text-xs text-gray-400">
            Tổng hợp cường độ hoạt động của cả lớp trong 12 tuần gần nhất
          </p>

          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span>Ít</span>
            {[0, 1, 2, 3, 4, 5].map((v) => (
              <span key={v} className={cx("w-3.5 h-3.5 rounded-[3px]", getHeatColor(v))} />
            ))}
            <span>Nhiều</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentActionButtons({
  student,
  onWarning,
  onEmail,
  compact = false,
  sentMap,
}) {
  const warned = sentMap?.[student.studentId]?.warningCount > 0;
  const emailed = sentMap?.[student.studentId]?.emailCount > 0;
  const canWarn = shouldWarnStudent(student);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-semibold"
        >
          <Eye size={13} />
          Xem
        </button>

        <button
          type="button"
          onClick={() => onWarning(student)}
          disabled={!canWarn}
          className={cx(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
            canWarn
              ? "border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
          )}
        >
          <TriangleAlert size={13} />
          {warned ? "Nhắc lại" : "Cảnh báo"}
        </button>

        <button
          type="button"
          onClick={() => onEmail(student)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all"
        >
          <Mail size={13} />
          {emailed ? "Gửi lại mail" : "Mail"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-[11px] font-semibold"
      >
        <Eye size={13} />
        Xem
      </button>

      <button
        type="button"
        onClick={() => onWarning(student)}
        disabled={!canWarn}
        className={cx(
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all",
          canWarn
            ? "border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100"
            : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
        )}
      >
        <TriangleAlert size={13} />
        {warned ? "Nhắc lại" : "Cảnh báo"}
      </button>

      <button
        type="button"
        onClick={() => onEmail(student)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all"
      >
        <Mail size={13} />
        {emailed ? "Gửi lại" : "Mail"}
      </button>
    </div>
  );
}

function ActionModal({ open, onClose, actionType, targetStudent, onConfirm }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!targetStudent) return;
    setMessage(getWarningMessage(targetStudent, actionType));
  }, [targetStudent, actionType]);

  if (!open || !targetStudent) return null;

  const isEmail = actionType === "email";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl rounded-[24px] bg-white shadow-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {isEmail ? "Gửi email cảnh báo" : "Gửi cảnh báo"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {targetStudent.name} • {targetStudent.studentCode} •{" "}
              {targetStudent.groupName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
              <p className="text-[11px] text-gray-400">Commit</p>
              <p className="text-lg font-bold text-gray-800">
                {targetStudent.commits}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
              <p className="text-[11px] text-gray-400">Jira</p>
              <p className="text-lg font-bold text-gray-800">
                {targetStudent.jiraDone}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
              <p className="text-[11px] text-gray-400">Score</p>
              <p className="text-lg font-bold text-gray-800">
                {targetStudent.score}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
              <p className="text-[11px] text-gray-400">Email</p>
              <p className="text-sm font-semibold text-gray-800 truncate">
                {targetStudent.email}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Nội dung {isEmail ? "email" : "cảnh báo"}
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(message)}
            className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isEmail ? (
              <>
                <Mail size={15} className="mr-2" />
                Gửi email
              </>
            ) : (
              <>
                <Send size={15} className="mr-2" />
                Gửi cảnh báo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- MAIN COMPONENT ----------------------------- */
const WEEKS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
export default function Contributions() {
    const { success } = useToast();
    const [selectedCourse, setSelectedCourse] = useState("");
    const [search, setSearch] = useState("");
    const [commitsByStudent, setCommitsByStudent] = useState({});
    const [weeklyCommits, setWeeklyCommits] = useState(new Array(12).fill(0).map((_, i) => ({ 
        name: `W${i + 1}`, 
        count: 0 
    })));

    const { data: coursesData = { items: [] }, isLoading: loadingCourses } = useGetCourses({ pageSize: 100 });
    const courses = coursesData.items || [];

    // Initialize selected course
    useEffect(() => {
        if (courses.length > 0 && !selectedCourse) {
            setSelectedCourse(String(courses[0].id));
        }
    }, [courses]);

    const currentCourse = courses.find(c => String(c.id) === selectedCourse);
    const groups = currentCourse?.groups || [];

    // Process data from selected course
    useEffect(() => {
        if (!currentCourse) return;

        // Collect all students in this course from groups
        const allStudents = [];
        groups.forEach(g => {
            (g.team || []).forEach(m => {
                if (!allStudents.find(s => s.studentId === m.studentId)) {
                    allStudents.push(m);
                }
            });
        });

        // Mock/Process commits per student (Keeping origin/main mock logic until real API supports per-student history)
        const byStudent = {};
        allStudents.forEach(s => {
            const mockCommits = Math.floor(Math.random() * 50);
            byStudent[s.studentId] = {
                id: s.studentId,
                name: s.studentName,
                studentCode: s.studentCode || s.studentId,
                team: groups.find(g => (g.team || []).some(m => m.studentId === s.studentId))?.name || "No Team",
                commits: mockCommits,
                prs: Math.floor(mockCommits / 5),
                reviews: Math.floor(mockCommits / 4),
                score: Math.min(100, 40 + mockCommits),
                status: mockCommits > 10 ? "stable" : "warning"
            };
        });
        setCommitsByStudent(byStudent);

        // Mock weekly data
        const mockWeekly = new Array(12).fill(0).map((_, i) => ({
            name: `W${i + 1}`,
            count: Math.floor(Math.random() * 50)
        }));
        setWeeklyCommits(mockWeekly);
    }, [selectedCourse, currentCourse, groups]);

    const filteredStudents = useMemo(() => {
        const studentList = Object.values(commitsByStudent);
        if (!search) return studentList;
        
        const q = search.toLowerCase();
        return studentList.filter(s => 
            (s.name || "").toLowerCase().includes(q) || 
            (s.team || "").toLowerCase().includes(q) ||
            (s.studentCode || "").toLowerCase().includes(q)
        );
    }, [commitsByStudent, search]);

    const stats = useMemo(() => {
        const list = Object.values(commitsByStudent);
        return {
            totalCommits: list.reduce((sum, s) => sum + (s.commits || 0), 0),
            activeStudents: list.filter(s => s.commits > 0).length,
            avgScore: list.length > 0 ? Math.round(list.reduce((sum, s) => sum + (s.score || 0), 0) / list.length) : 0,
            totalPRs: list.reduce((sum, s) => sum + (s.prs || 0), 0),
            totalReviews: list.reduce((sum, s) => sum + (s.reviews || 0), 0),
            riskGroupsCount: list.filter(s => s.status === 'warning').length
        };
    }, [commitsByStudent]);

    if (loadingCourses) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
                <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Đang tải dữ liệu đóng góp...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader 
                title="Theo dõi Đóng góp"
                subtitle="Phân tích chi tiết nỗ lực cá nhân của sinh viên qua Commits, Pull Requests và Code Reviews."
                breadcrumb={["Giảng viên", "Đóng góp"]}
                actions={[
                    <Button key="export" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-6 text-xs font-black uppercase tracking-widest border-0 shadow-lg shadow-teal-100">
                        <Download size={16} className="mr-2" /> Xuất báo cáo
                    </Button>
                ]}
            />

            <ContributionStats 
                totalCommits={stats.totalCommits}
                activeStudents={stats.activeStudents}
                avgScore={stats.avgScore}
                totalPRs={stats.totalPRs}
                totalReviews={stats.totalReviews}
                riskGroupsCount={stats.riskGroupsCount}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest leading-none">Chi tiết sinh viên</h3>
                            <div className="flex items-center gap-3">
                                <select 
                                    className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-black text-gray-500 outline-none focus:ring-2 focus:ring-teal-100 uppercase tracking-widest"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                >
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                                </select>
                                <div className="w-64">
                                    <InputField 
                                        placeholder="Tìm sinh viên, nhóm..." 
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        size="sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <StudentContributionTable 
                            students={filteredStudents} 
                            onWarning={(s) => success(`Đã gửi cảnh báo tới ${s.name}`)}
                        />
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white p-8">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6 leading-none">Hoạt động trong tuần</h3>
                        <WeeklyActivityChart weeklyCommits={weeklyCommits} />
                    </Card>

                    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white p-8">
                         <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest leading-none">Top Contributors</h3>
                            <Target size={18} className="text-teal-600" />
                         </div>
                         <div className="space-y-6">
                            {filteredStudents.sort((a,b) => b.commits - a.commits).slice(0, 3).map((s, i) => (
                               <div key={s.id} className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-gray-400">0{i+1}</div>
                                     <div>
                                        <p className="text-sm font-black text-gray-800 truncate max-w-[120px]">{s.name}</p>
                                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{s.team}</p>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-sm font-black text-gray-800">{s.commits}</p>
                                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Commits</p>
                                  </div>
                               </div>
                            ))}
                            {filteredStudents.length === 0 && <p className="text-center text-[10px] font-black uppercase text-gray-400 tracking-widest py-4">Không có dữ liệu</p>}
                         </div>
                         <Button className="w-full mt-8 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl h-11 text-xs font-black uppercase tracking-widest border-0">Xem tất cả</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}

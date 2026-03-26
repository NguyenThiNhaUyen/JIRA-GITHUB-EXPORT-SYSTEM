import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import clsx from "clsx";
import { Button } from "./button.jsx";
import { CalendarDays } from "lucide-react";
import "dayjs/locale/vi";

dayjs.locale("vi");

const ISO_EMPTY = "";

const pad2 = (n) => String(n).padStart(2, "0");

const digitsToMasked = (digits) => {
  const d = digits.replace(/\D/g, "").slice(0, 8);
  if (d.length === 0) return "";
  const dd = d.slice(0, 2);
  const mm = d.slice(2, 4);
  const yyyy = d.slice(4, 8);

  if (d.length <= 2) return dd;
  if (d.length <= 4) return `${dd} / ${mm}`;
  return `${dd} / ${mm} / ${yyyy}`;
};

const digitsToIsoDate = (digits) => {
  const d = digits.replace(/\D/g, "").slice(0, 8);
  if (d.length !== 8) return null;
  const dd = Number(d.slice(0, 2));
  const mm = Number(d.slice(2, 4));
  const yyyy = Number(d.slice(4, 8));

  if (!Number.isFinite(dd) || !Number.isFinite(mm) || !Number.isFinite(yyyy)) return null;
  if (yyyy < 1900 || yyyy > 2200) return null;
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;

  // dayjs sẽ normalize invalid dates; validate lại bằng cách đọc phần ngày sau parse.
  const parsed = dayjs(`${yyyy}-${pad2(mm)}-${pad2(dd)}`, "YYYY-MM-DD", true);
  if (!parsed.isValid()) return null;
  if (parsed.year() !== yyyy || parsed.month() + 1 !== mm || parsed.date() !== dd) return null;
  return parsed.format("YYYY-MM-DD");
};

const isoToMasked = (iso) => {
  if (!iso) return "";
  const parsed = dayjs(iso, "YYYY-MM-DD", true);
  if (!parsed.isValid()) return "";
  return `${pad2(parsed.date())} / ${pad2(parsed.month() + 1)} / ${parsed.year()}`;
};

const toDayjs = (iso) => (iso ? dayjs(iso, "YYYY-MM-DD", true) : null);

const getCalendarMonthStart = ({ startDate, endDate }) => {
  const s = toDayjs(startDate);
  const e = toDayjs(endDate);
  if (s?.isValid()) return s.startOf("month");
  if (e?.isValid()) return e.startOf("month");
  return dayjs().startOf("month");
};

const DateMaskedInput = ({
  label,
  value,
  placeholder = "dd / mm / yyyy",
  onChangeDigits,
  onFocus,
}) => {
  const [display, setDisplay] = useState(value || "");

  useEffect(() => {
    setDisplay(value || "");
  }, [value]);

  return (
    <div className="flex flex-col">
      <span className="text-[12px] font-medium text-gray-600 mb-1">{label}</span>
      <input
        inputMode="numeric"
        placeholder={placeholder}
        value={display}
        onFocus={onFocus}
        onChange={(e) => {
          const next = e.target.value;
          const digits = next.replace(/\D/g, "").slice(0, 8);
          const masked = digitsToMasked(digits);
          setDisplay(masked);
          onChangeDigits(digits);
        }}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
      />
    </div>
  );
};

export function SmartDatePicker({
  startDate = ISO_EMPTY,
  endDate = ISO_EMPTY,
  onChange,
  placeholder = "Chọn khoảng ngày",
}) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  const initialMonth = useMemo(() => getCalendarMonthStart({ startDate, endDate }), [startDate, endDate]);
  const [calendarMonth, setCalendarMonth] = useState(initialMonth);

  useEffect(() => {
    // Neo lịch theo giá trị hiện tại khi mở.
    if (open) setCalendarMonth(getCalendarMonthStart({ startDate, endDate }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const start = toDayjs(startDate);
  const end = toDayjs(endDate);
  const isRangeValid = start?.isValid() && end?.isValid() && end.isAfter(start, "day");

  const startMasked = isoToMasked(startDate);
  const endMasked = isoToMasked(endDate);

  const month1 = calendarMonth.startOf("month");
  const month2 = calendarMonth.add(1, "month").startOf("month");

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!open) return;
      const el = rootRef.current;
      if (!el) return;
      if (e.target && el.contains(e.target)) return;
      setOpen(false);
    };

    const onDocKeyDown = (e) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [open]);

  const applyDates = (nextStart, nextEnd) => {
    const ns = nextStart || ISO_EMPTY;
    const ne = nextEnd || ISO_EMPTY;
    onChange?.({ startDate: ns, endDate: ne });
  };

  const handleSelectDay = (iso) => {
    if (!startDate || (startDate && endDate)) {
      applyDates(iso, ISO_EMPTY);
      return;
    }

    // startDate is set; endDate is empty
    const clicked = dayjs(iso, "YYYY-MM-DD", true);
    if (clicked.isValid() && clicked.isAfter(start, "day")) {
      applyDates(startDate, iso);
      return;
    }

    // Clicked day is not after start -> treat it as new start.
    applyDates(iso, ISO_EMPTY);
  };

  const quickSetStart = (nextStartIso) => {
    const ns = nextStartIso;
    // Giữ một range hợp lệ: nếu end chưa có, set end = start + 1 ngày.
    if (endDate) {
      const hasStart = Boolean(startDate);
      const deltaDays = hasStart ? dayjs(endDate).diff(dayjs(startDate), "day") : 0;
      const safeDelta = Number.isFinite(deltaDays) && deltaDays > 0 ? deltaDays : 1;
      applyDates(ns, dayjs(ns).add(safeDelta, "day").format("YYYY-MM-DD"));
    } else {
      applyDates(ns, dayjs(ns).add(1, "day").format("YYYY-MM-DD"));
    }
  };

  const quickActions = [
    { label: "Hôm nay", action: () => quickSetStart(dayjs().format("YYYY-MM-DD")) },
    { label: "Ngày mai", action: () => quickSetStart(dayjs().add(1, "day").format("YYYY-MM-DD")) },
    { label: "Tuần sau", action: () => quickSetStart(dayjs().add(7, "day").format("YYYY-MM-DD")) },
  ];

  const handleSemesterAction = (months) => {
    const sIso = startDate || dayjs().format("YYYY-MM-DD");
    let nextEndIso = dayjs(sIso).add(months, "month").format("YYYY-MM-DD");
    if (dayjs(nextEndIso).isSame(dayjs(sIso), "day") || dayjs(nextEndIso).isBefore(dayjs(sIso), "day")) {
      nextEndIso = dayjs(sIso).add(1, "day").format("YYYY-MM-DD");
    }
    applyDates(sIso, nextEndIso);
  };

  const renderMonth = (month) => {
    // Monday-first (ISO): 1..7
    const firstOfMonth = month.startOf("month");
    const dayOfWeek = firstOfMonth.day();
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon => 0

    const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const cells = [];

    for (let i = 0; i < 42; i++) {
      const d = firstOfMonth.subtract(offset, "day").add(i, "day");
      const iso = d.format("YYYY-MM-DD");
      const inCurrentMonth = d.month() === month.month();

      let inRange = false;
      if (isRangeValid) {
        inRange = d.isSame(start, "day") || (d.isAfter(start, "day") && d.isBefore(end, "day")) || d.isSame(end, "day");
      }

      const isStart = startDate && d.isSame(start, "day");
      const isEnd = endDate && d.isSame(end, "day");

      cells.push(
        <button
          key={iso + i}
          type="button"
          onClick={() => handleSelectDay(iso)}
          className={clsx(
            "w-9 h-9 rounded-lg text-xs font-medium transition-colors flex items-center justify-center",
            inCurrentMonth ? "text-gray-800" : "text-gray-400",
            inRange && !isStart && !isEnd && "bg-blue-100 text-blue-700",
            (isStart || isEnd) && "bg-blue-600 text-white",
            !inRange && !isStart && !isEnd && "hover:bg-blue-50"
          )}
          aria-label={iso}
        >
          {d.date()}
        </button>
      );
    }

    return (
      <div className="flex-1">
        <div className="text-sm font-semibold text-gray-800 px-2 mb-2">{month.format("MMMM YYYY")}</div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekdays.map((w) => (
            <div key={w} className="text-[11px] font-semibold text-gray-500 text-center">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{cells}</div>
      </div>
    );
  };

  const rangeText = useMemo(() => {
    const s = startMasked;
    const e = endMasked;
    if (startDate && endDate) return `${s} - ${e}`;
    if (startDate) return `${s} - …`;
    return placeholder;
  }, [endDate, endMasked, placeholder, startDate, startMasked]);

  const inputSummaryIsEmpty = !startDate && !endDate;

  return (
    <div
      ref={rootRef}
      className="relative"
      onClick={(e) => {
        const target = e.target;
        if (target && target.tagName === "INPUT") return;
        setOpen(true);
      }}
    >
      <div
        className={clsx(
          "bg-white border border-gray-200 rounded-2xl px-4 py-3 transition-shadow",
          open ? "shadow-md ring-2 ring-blue-500/20 border-blue-300" : "shadow-sm hover:shadow-md"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-gray-800 mb-2">
              Khoảng ngày học kỳ <span className="text-red-500">*</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div
                  className={clsx(
                    "flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/30 px-2 py-2",
                    inputSummaryIsEmpty && "bg-gray-50/50"
                  )}
                >
                  <CalendarDays size={16} className="text-blue-500" />
                  <span
                    className={clsx(
                      "text-sm font-medium text-gray-700",
                      inputSummaryIsEmpty && "text-gray-500"
                    )}
                  >
                    {rangeText}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                aria-label="Mở lịch chọn ngày"
              >
                Chọn
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <DateMaskedInput
                label="Ngày bắt đầu"
                value={startMasked}
                onChangeDigits={(digits) => {
                  const iso = digitsToIsoDate(digits);
                  if (!iso) return;

                  // Nếu end đang là một ngày hợp lệ và <= start mới => clear end để duy trì range hợp lệ.
                  if (endDate && (dayjs(iso).isAfter(dayjs(endDate), "day") || dayjs(iso).isSame(dayjs(endDate), "day"))) {
                    applyDates(iso, ISO_EMPTY);
                    return;
                  }

                  applyDates(iso, endDate);
                }}
                onFocus={() => setOpen(true)}
              />

              <DateMaskedInput
                label="Ngày kết thúc"
                value={endMasked}
                onChangeDigits={(digits) => {
                  const iso = digitsToIsoDate(digits);
                  if (!iso) return;

                  if (!startDate) {
                    // Nhập kết thúc trước -> coi như người dùng vừa chọn ngày bắt đầu mới.
                    applyDates(iso, ISO_EMPTY);
                    return;
                  }

                  if (startDate && (dayjs(iso).isBefore(dayjs(startDate), "day") || dayjs(iso).isSame(dayjs(startDate), "day"))) {
                    applyDates(startDate, ISO_EMPTY);
                    return;
                  }

                  applyDates(startDate, iso);
                }}
                onFocus={() => setOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {quickActions.map((qa) => (
          <Button
            key={qa.label}
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700 bg-white"
            onClick={() => {
              qa.action();
              setOpen(false);
            }}
          >
            {qa.label}
          </Button>
        ))}

        {[
          { label: "3 tháng", months: 3 },
          { label: "4 tháng", months: 4 },
        ].map((a) => (
          <Button
            key={a.label}
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700 bg-white"
            onClick={() => {
              handleSemesterAction(a.months);
              setOpen(false);
            }}
          >
            {a.label}
          </Button>
        ))}
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-10 mt-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-800">Chọn khoảng ngày</div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setCalendarMonth((m) => m.subtract(1, "month").startOf("month"))}
                >
                  Trước
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setCalendarMonth((m) => m.add(1, "month").startOf("month"))}
                >
                  Sau
                </Button>
              </div>
            </div>

            <div className="flex gap-6">
              {renderMonth(month1)}
              {renderMonth(month2)}
            </div>

            <div className="mt-3 text-xs text-gray-600">
              {endDate ? (
                <span>
                  Đang chọn: <span className="font-semibold text-gray-800">{rangeText}</span>
                </span>
              ) : startDate ? (
                <span>Chọn ngày kết thúc (click ngày sau ngày bắt đầu)</span>
              ) : (
                <span>Chọn ngày bắt đầu</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


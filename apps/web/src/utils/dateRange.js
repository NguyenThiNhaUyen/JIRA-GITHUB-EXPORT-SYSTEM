// dateRange: Utilities xử lý date và generate weeks (dùng trong AppContext)
export function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}`;
}

// Tìm thứ 2 đầu tuần của một ngày bất kỳ
export function startOfWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Thêm số ngày vào date
export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Generate danh sách tuần từ start đến end date (mỗi tuần từ thứ 2 đến chủ nhật)
export function generateWeeks(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  let cur = startOfWeekMonday(start);

  const weeks = [];
  let idx = 1;

  while (cur <= end) {
    const from = cur;
    const to = addDays(cur, 6);

    weeks.push({
      id: `${startDateStr}_${idx}`,
      index: idx,
      from,
      to,
      label: `Week ${String(idx).padStart(2, "0")} (${formatDate(from)}–${formatDate(to)})`,
      fromISO: from.toISOString().slice(0, 10),
      toISO: to.toISOString().slice(0, 10),
    });

    cur = addDays(cur, 7);
    idx++;
  }

  return weeks;
}

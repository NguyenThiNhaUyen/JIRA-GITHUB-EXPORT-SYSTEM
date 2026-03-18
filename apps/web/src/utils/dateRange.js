// dateRange: Utilities xá»­ lĂ½ date vĂ  generate weeks (dĂ¹ng trong AppContext)
export function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}`;
}

// TĂ¬m thá»© 2 Ä‘áº§u tuáº§n cá»§a má»™t ngĂ y báº¥t ká»³
export function startOfWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ThĂªm sá»‘ ngĂ y vĂ o date
export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Generate danh sĂ¡ch tuáº§n tá»« start Ä‘áº¿n end date (má»—i tuáº§n tá»« thá»© 2 Ä‘áº¿n chá»§ nháº­t)
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
      label: `Week ${String(idx).padStart(2, "0")} (${formatDate(from)}â€“${formatDate(to)})`,
      fromISO: from.toISOString().slice(0, 10),
      toISO: to.toISOString().slice(0, 10),
    });

    cur = addDays(cur, 7);
    idx++;
  }

  return weeks;
}

// Date utilities using dayjs
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

export const formatDate = (date) => dayjs(date).format("DD/MM/YYYY");
export const formatDateTime = (date) => dayjs(date).format("DD/MM/YYYY HH:mm");
export const formatTime = (date) => dayjs(date).format("HH:mm");
export const formatWeek = (date) => `Week ${dayjs(date).isoWeek()}`;
export const formatMonth = (date) => dayjs(date).format("MMM YYYY");

export const startOfWeek = (date) => dayjs(date).startOf("isoWeek").toISOString();
export const endOfWeek = (date) => dayjs(date).endOf("isoWeek").toISOString();
export const addDays = (date, days) => dayjs(date).add(days, "day").toISOString();
export const addWeeks = (date, weeks) => dayjs(date).add(weeks, "week").toISOString();

export const isToday = (date) => dayjs(date).isSame(dayjs(), "day");
export const isPast = (date) => dayjs(date).isBefore(dayjs(), "day");
export const isFuture = (date) => dayjs(date).isAfter(dayjs(), "day");

export const getDaysInRange = (start, end) => {
  const days = [];
  let current = dayjs(start);
  const endDate = dayjs(end);
  while (current.isSameOrBefore(endDate, "day")) {
    days.push(current.format("YYYY-MM-DD"));
    current = current.add(1, "day");
  }
  return days;
};

export const getWeeksInRange = (start, end) => {
  const weeks = [];
  let current = dayjs(start).startOf("isoWeek");
  const endDate = dayjs(end);
  while (current.isSameOrBefore(endDate, "week")) {
    weeks.push({
      start: current.toISOString(),
      end: current.endOf("isoWeek").toISOString(),
      label: `Week ${current.isoWeek()}`,
    });
    current = current.add(1, "week");
  }
  return weeks;
};



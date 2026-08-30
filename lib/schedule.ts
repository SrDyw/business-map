export const DAYS_OF_WEEK = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const DAY_FULL_NAMES: Record<DayOfWeek, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export type TimePeriod = "AM" | "PM";

export type TimeOfDay = {
  hour: number;
  minute: number;
  period: TimePeriod;
};

export type ScheduleData = {
  days: DayOfWeek[];
  openTime: TimeOfDay;
  closeTime: TimeOfDay;
};

export const DEFAULT_OPEN_TIME: TimeOfDay = {
  hour: 9,
  minute: 0,
  period: "AM",
};

export const DEFAULT_CLOSE_TIME: TimeOfDay = {
  hour: 5,
  minute: 0,
  period: "PM",
};

export function formatTime(time: TimeOfDay): string {
  const hour = String(time.hour).padStart(2, "0");
  const minute = String(time.minute).padStart(2, "0");
  return `${hour}:${minute} ${time.period}`;
}

export function buildScheduleHours(schedule: ScheduleData): string {
  return `${formatTime(schedule.openTime)} - ${formatTime(schedule.closeTime)}`;
}

export function buildScheduleDays(schedule: ScheduleData): string {
  if (schedule.days.length === 0) return "";
  if (schedule.days.length === DAYS_OF_WEEK.length) return "Todos los días";
  return schedule.days.join(", ");
}

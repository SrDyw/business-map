export function getAbbr(sentence: string, length: number = 2) {
  if (!sentence || sentence.trim() === "") return "";

  return sentence
    .trim()
    .split(" ")
    .filter((word) => word.length > 0) // Eliminar espacios vacíos
    .slice(0, length)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function isOpenNow(
  scheduleDays: string | null,
  scheduleHours: string | null
): boolean | null {
  if (!scheduleHours) return null;

  if (
    scheduleDays &&
    scheduleDays !== ALL_DAYS_LABEL &&
    !isTodayIncluded(scheduleDays)
  ) {
    return false;
  }

  const TIME_RANGE_PATTERN =
    /(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|am|p\.?m\.?|pm)?\s*[-–to]\s*(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|pm|p\.?m\.?|am)?/i;

  const match = scheduleHours.match(TIME_RANGE_PATTERN);
  if (!match) return null;

  const openHour = to24Hour(
    Number(match[1]),
    match[2] ? Number(match[2]) : 0,
    match[3]
  );
  const closeHour = to24Hour(
    Number(match[4]),
    match[5] ? Number(match[5]) : 0,
    match[6]
  );

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const openMinutes = openHour * 60;
  const closeMinutes = closeHour * 60;

  if (closeMinutes <= openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

const ALL_DAYS_LABEL = "Todos los días";
const WEEK_DAY_ABBRS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isTodayIncluded(scheduleDays: string): boolean {
  const todayAbbr = WEEK_DAY_ABBRS[new Date().getDay()];
  return scheduleDays
    .split(",")
    .map((day) => day.trim())
    .includes(todayAbbr);
}

function to24Hour(
  hour: number,
  minutes: number,
  period: string | undefined
): number {
  if (!period) return hour;
  const normalized = period.toLowerCase().replace(/\./g, "");

  if (normalized.startsWith("pm") && hour !== 12) return hour + 12;
  if (normalized.startsWith("am") && hour === 12) return 0;

  return hour;
}

export function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

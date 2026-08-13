function normalizeTimeRange(value) {
  if (!value || typeof value !== "string") return null;

  const match = value
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const [, openHourRaw, openMinuteRaw, closeHourRaw, closeMinuteRaw] = match;
  const openHour = Number(openHourRaw);
  const openMinute = Number(openMinuteRaw);
  const closeHour = Number(closeHourRaw);
  const closeMinute = Number(closeMinuteRaw);

  if (
    openHour < 0 ||
    openHour > 23 ||
    closeHour < 0 ||
    closeHour > 23 ||
    openMinute < 0 ||
    openMinute > 59 ||
    closeMinute < 0 ||
    closeMinute > 59
  ) {
    return null;
  }

  return {
    open: `${String(openHour).padStart(2, "0")}:${String(openMinute).padStart(2, "0")}`,
    close: `${String(closeHour).padStart(2, "0")}:${String(closeMinute).padStart(2, "0")}`,
    openMinutes: openHour * 60 + openMinute,
    closeMinutes: closeHour * 60 + closeMinute,
  };
}

function isSimpleDailyHours(rawHours, hours) {
  const normalizedRaw = String(rawHours || "").trim();
  if (!normalizedRaw) return false;

  const range = normalizeTimeRange(normalizedRaw);
  if (!range) return false;

  return hours?.open === range.open && hours?.close === range.close;
}

function getMinutesForTimezone(timezone) {
  if (!timezone || typeof timezone !== "string") return null;

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      hourCycle: "h23",
      timeZone: timezone,
    }).formatToParts(new Date());
    const hour = Number(parts.find((part) => part.type === "hour")?.value);
    const minute = Number(parts.find((part) => part.type === "minute")?.value);

    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    return hour * 60 + minute;
  } catch {
    return null;
  }
}

function isWithinRange(currentMinutes, openMinutes, closeMinutes) {
  if (openMinutes === closeMinutes) return false;
  if (closeMinutes > openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
}

export function buildHoursStatus({
  isOpenNow,
  hours,
  rawHours,
  timezone,
} = {}) {
  if (isOpenNow === true) {
    return {
      state: "confirmed_open",
      source: "provider",
      confidence: "high",
      label: "Open now",
      closesAt: hours?.close,
      timezone,
    };
  }

  if (isOpenNow === false) {
    return {
      state: "confirmed_closed",
      source: "provider",
      confidence: "high",
      label: "Closed now",
      opensAt: hours?.open,
      timezone,
    };
  }

  if (!hours?.open || !hours?.close) {
    return {
      state: "unavailable",
      source: "none",
      confidence: "low",
      label: "Hours unavailable",
    };
  }

  const range = normalizeTimeRange(`${hours.open} - ${hours.close}`);
  const currentMinutes = getMinutesForTimezone(timezone);
  if (!range || !isSimpleDailyHours(rawHours, hours) || currentMinutes === null) {
    return {
      state: "listed_hours_unknown",
      source: "listed_hours",
      confidence: "low",
      label: "Hours listed",
      timezone,
    };
  }

  const isListedOpen = isWithinRange(
    currentMinutes,
    range.openMinutes,
    range.closeMinutes,
  );

  return {
    state: isListedOpen ? "listed_hours_open" : "listed_hours_closed",
    source: "listed_hours",
    confidence: "medium",
    label: isListedOpen
      ? "Likely open from listed hours"
      : "Closed based on listed hours",
    closesAt: isListedOpen ? range.close : undefined,
    opensAt: isListedOpen ? undefined : range.open,
    timezone,
  };
}

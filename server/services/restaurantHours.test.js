import { describe, expect, it } from "vitest";
import { buildHoursStatus } from "./restaurantHours.js";

const HOURS = { open: "10:00", close: "22:00" };
const TIMEZONE = "America/Los_Angeles";
const ACCEPTED_STATES = ["listed_hours_open", "listed_hours_closed"];

describe("buildHoursStatus listed hours parsing", () => {
  it.each([
    "10:00-22:00",
    "10:00 - 22:00",
    "Mo-Su 10:00-22:00",
    "Mo-Su 10:00 - 22:00",
    "Mo\\u2013Su 10:00\\u201322:00",
    "Mo-Sun 10:00-22:00",
    "Mon-Sun 10:00-22:00",
  ])("accepts simple all-week listed hours: %s", (rawHours) => {
    const status = buildHoursStatus({
      hours: HOURS,
      rawHours: rawHours
        .replace(/\\u2013/g, "\u2013")
        .replace(/\\u2014/g, "\u2014"),
      timezone: TIMEZONE,
    });

    expect(ACCEPTED_STATES).toContain(status.state);
    expect(status.source).toBe("listed_hours");
    expect(status.confidence).toBe("medium");
    expect(status.timezone).toBe(TIMEZONE);
  });

  it.each([
    "Mo-Fr 10:00-22:00",
    "Mo-Tu 16:30-20:30; We-Th 11:30-14:00, 16:30-20:30",
    "Fr, Sa 11:30-21:00; Mo-Th, Su 11:30-20:00",
    "11:00-14:00, 17:00-22:00",
    "random text",
  ])("keeps complex listed hours unknown: %s", (rawHours) => {
    const status = buildHoursStatus({
      hours: HOURS,
      rawHours,
      timezone: TIMEZONE,
    });

    expect(status.state).toBe("listed_hours_unknown");
    expect(status.source).toBe("listed_hours");
    expect(status.confidence).toBe("low");
    expect(status.label).toBe("Hours listed");
  });
});

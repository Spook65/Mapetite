import { describe, expect, it } from "vitest";
import { buildHoursStatus } from "./restaurantHours.js";

const HOURS = { open: "10:00", close: "22:00" };
const TIMEZONE = "America/Los_Angeles";
const ACCEPTED_STATES = ["listed_hours_open", "listed_hours_closed"];
const PACIFIC_MIDDAY = new Date("2026-08-29T19:00:00.000Z");
const PACIFIC_AFTER_CLOSE = new Date("2026-08-30T06:00:00.000Z");
const PACIFIC_OVERNIGHT_EVENING = new Date("2026-08-30T05:00:00.000Z");
const PACIFIC_OVERNIGHT_AFTER_MIDNIGHT = new Date("2026-08-30T07:30:00.000Z");
const PACIFIC_OVERNIGHT_AFTER_CLOSE = new Date("2026-08-30T09:00:00.000Z");

describe("buildHoursStatus listed hours parsing", () => {
  it("treats exact 24/7 as likely open from listed hours", () => {
    const status = buildHoursStatus({
      rawHours: "24/7",
      timezone: TIMEZONE,
    });

    expect(status.state).toBe("listed_hours_open");
    expect(status.source).toBe("listed_hours");
    expect(status.confidence).toBe("medium");
    expect(status.label).toBe("Likely open · 24 hours");
    expect(status.timezone).toBe(TIMEZONE);
  });

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
      referenceDate: PACIFIC_MIDDAY,
    });

    expect(status.state).toBe("listed_hours_open");
    expect(status.source).toBe("listed_hours");
    expect(status.confidence).toBe("medium");
    expect(status.closesAt).toBe("22:00");
    expect(status.timezone).toBe(TIMEZONE);
  });

  it("reports a simple all-week range as closed after close", () => {
    const status = buildHoursStatus({
      hours: HOURS,
      rawHours: "Mo-Su 10:00-22:00",
      timezone: TIMEZONE,
      referenceDate: PACIFIC_AFTER_CLOSE,
    });

    expect(status.state).toBe("listed_hours_closed");
    expect(status.source).toBe("listed_hours");
    expect(status.confidence).toBe("medium");
    expect(status.opensAt).toBe("10:00");
    expect(status.timezone).toBe(TIMEZONE);
  });

  it.each([
    ["07:00-1:00", { open: "07:00", close: "1:00" }],
    ["07:00 - 1:00", { open: "07:00", close: "1:00" }],
    ["Mo-Su 07:00-1:00", { open: "07:00", close: "1:00" }],
    ["Mo-Su 07:00 - 1:00", { open: "07:00", close: "1:00" }],
  ])("accepts single-digit overnight close hours: %s", (rawHours, hours) => {
    const status = buildHoursStatus({
      hours,
      rawHours,
      timezone: TIMEZONE,
      referenceDate: PACIFIC_OVERNIGHT_EVENING,
    });

    expect(status.state).toBe("listed_hours_open");
    expect(status.source).toBe("listed_hours");
    expect(status.confidence).toBe("medium");
    expect(status.closesAt).toBe("01:00");
  });

  it("keeps overnight ranges open after midnight before close", () => {
    const status = buildHoursStatus({
      hours: { open: "07:00", close: "1:00" },
      rawHours: "Mo-Su 07:00-1:00",
      timezone: TIMEZONE,
      referenceDate: PACIFIC_OVERNIGHT_AFTER_MIDNIGHT,
    });

    expect(status.state).toBe("listed_hours_open");
    expect(status.closesAt).toBe("01:00");
  });

  it("reports overnight ranges as closed after the overnight close time", () => {
    const status = buildHoursStatus({
      hours: { open: "07:00", close: "1:00" },
      rawHours: "Mo-Su 07:00-1:00",
      timezone: TIMEZONE,
      referenceDate: PACIFIC_OVERNIGHT_AFTER_CLOSE,
    });

    expect(status.state).toBe("listed_hours_closed");
    expect(status.opensAt).toBe("07:00");
  });

  it.each([
    "Mo-Fr 10:00-22:00",
    "Mo-Fr 07:00-1:00",
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

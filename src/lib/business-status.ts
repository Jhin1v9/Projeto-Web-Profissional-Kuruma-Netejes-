import type { BusinessStatus } from "@/types/site-config";

export type BusinessStatusMode = "auto" | "manual";

function timePartsInZone(now: Date, timeZone: string): { hour: number; minute: number } {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return { hour, minute };
}

export function getAutoBusinessStatus(now: Date = new Date(), timeZone = "Europe/Madrid"): BusinessStatus {
  const { hour, minute } = timePartsInZone(now, timeZone);
  const currentMinutes = hour * 60 + minute;
  const openAt = 8 * 60;
  const closingAt = 17 * 60 + 30;
  const closedAt = 18 * 60;

  if (currentMinutes >= openAt && currentMinutes < closingAt) return "open";
  if (currentMinutes >= closingAt && currentMinutes < closedAt) return "closing";
  return "closed";
}

export function resolveBusinessStatus(input: {
  mode?: BusinessStatusMode;
  manualStatus?: BusinessStatus;
  now?: Date;
  timeZone?: string;
}): BusinessStatus {
  const mode = input.mode ?? "auto";
  if (mode === "manual") return input.manualStatus ?? "open";
  return getAutoBusinessStatus(input.now, input.timeZone ?? "Europe/Madrid");
}


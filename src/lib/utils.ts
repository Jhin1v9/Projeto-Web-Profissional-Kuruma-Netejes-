import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PriceValue } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatPhoneForWa(phone: string): string { return phone.replace(/\D/g, ""); }

export function generateWhatsAppLink(phone: string, message?: string): string {
  const formatted = formatPhoneForWa(phone);
  const baseUrl = `https://wa.me/${formatted}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}

export function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export function formatPrice(value: PriceValue): string {
  if (typeof value === "string") return value;
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
}

export const eur = formatPrice;

export function maskedPrice(value: PriceValue | number | string | null | undefined): string {
  if (value === null || value === undefined) return "XXX";
  const normalized = String(value).replace(",", ".").trim();
  const numeric = Number(normalized);

  if (Number.isFinite(numeric)) {
    const digits = Math.max(1, Math.min(3, Math.floor(Math.abs(numeric)).toString().length));
    return "X".repeat(digits);
  }

  const digitCount = (normalized.match(/\d/g) ?? []).length;
  if (digitCount <= 1) return "X";
  if (digitCount === 2) return "XX";
  return "XXX";
}

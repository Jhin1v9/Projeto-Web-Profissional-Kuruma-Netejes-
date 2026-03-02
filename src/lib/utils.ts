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

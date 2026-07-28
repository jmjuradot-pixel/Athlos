import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function formatNumber(n: number | undefined | null, decimals = 1): string {
  if (n == null) return "—";
  return n.toFixed(decimals);
}

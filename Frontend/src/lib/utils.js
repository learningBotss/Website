import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// gabungkan className Tailwind dengan merge
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

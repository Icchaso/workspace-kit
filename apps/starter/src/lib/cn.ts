import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** クラス名を条件付きで足し、Tailwind の同じ種類の指定は後ろを優先する */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

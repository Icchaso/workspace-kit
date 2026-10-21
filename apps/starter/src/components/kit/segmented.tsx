"use client";

import { cn } from "@/lib/cn";

/** 2〜4個から1つ選ぶ切り替え。選んだものだけ白い下地が付く */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex gap-0.5 rounded-full border border-line bg-surface-2 p-[3px]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-h-[30px] rounded-full px-3 text-sm text-fg-2 transition-[color,background-color,box-shadow,scale] duration-[var(--wk-dur-fast)] ease-out active:scale-(--wk-press) active:duration-[var(--wk-dur-press)] pointer-coarse:min-h-hit",
            value === o.value && "bg-surface text-fg shadow-sm",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** 絞り込みなどのチップ（複数並べて1つ選ぶ） */
export function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex h-hit items-center gap-1.5 rounded-full border px-3 text-sm transition-[color,background-color,border-color,scale] duration-[var(--wk-dur-fast)] ease-out active:scale-(--wk-press) active:duration-[var(--wk-dur-press)]",
        pressed ? "border-fg bg-fg text-canvas" : "border-line bg-surface text-fg-2 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

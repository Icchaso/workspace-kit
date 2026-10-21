"use client";

/**
 * 手順の表示（1 / 3 のような進み具合）。手順フォームの上に置く。
 * 終わった手順は ✓、今の手順は塗りつぶし、先の手順は線だけ。押して前の手順に戻れる。
 */
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function Steps({ steps, current, onJump }: { steps: string[]; current: number; onJump?: (i: number) => void }) {
  return (
    <ol aria-label="手順" className="flex items-center gap-1.5">
      {steps.map((label, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-1.5 last:flex-none">
            <button
              type="button"
              disabled={!done || !onJump}
              onClick={() => onJump?.(i)}
              aria-current={now ? "step" : undefined}
              aria-label={`${i + 1}. ${label}${done ? "（済み・押すと戻る）" : now ? "（いまの手順）" : ""}`}
              className="flex min-h-hit min-w-hit flex-none items-center justify-center gap-1.5 disabled:cursor-default"
            >
              <span
                className={cn(
                  "num grid size-6 flex-none place-items-center rounded-full text-xs font-semibold transition-colors duration-[var(--wk-dur-base)]",
                  done ? "bg-accent text-on-accent" : now ? "bg-fg text-canvas" : "border border-line text-fg-3",
                )}
              >
                {done ? <Check aria-hidden size={14} strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn("text-xs whitespace-nowrap", now ? "font-medium text-fg" : "text-fg-3", !now && "max-rail:sr-only")}>{label}</span>
            </button>
            {i < steps.length - 1 && <span aria-hidden className={cn("h-px min-w-3 flex-1", done ? "bg-accent" : "bg-line")} />}
          </li>
        );
      })}
    </ol>
  );
}

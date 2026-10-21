"use client";

/**
 * 右下の丸い主ボタン（スマホだけ）。親指が届く位置に、その画面でいちばん多い操作を1つだけ置く。
 * 下タブのすぐ上に浮かせる。768px 以上では出さない（見出しの右のボタンを使う）。
 */
import { cn } from "@/lib/cn";

export function Fab({ label, onClick, children, className }: { label: string; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "fixed right-4 z-30 grid size-14 place-items-center rounded-full bg-accent text-on-accent shadow-float transition-transform duration-[var(--wk-dur-fast)] ease-out active:scale-[0.94] active:duration-[var(--wk-dur-press)] rail:hidden",
        className,
      )}
      style={{ bottom: "calc(var(--wk-tabbar-h) + var(--wk-tabbar-gap) + var(--wk-safe-b) + 14px)", right: "max(16px, env(safe-area-inset-right, 0px))" }}
    >
      {children}
    </button>
  );
}

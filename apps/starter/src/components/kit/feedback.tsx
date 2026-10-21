import { CircleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/** 空の状態。「何もありません」で終わらせず、次にできることを1つ出す */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid justify-items-center gap-2 px-5 py-10 text-center", className)}>
      {Icon && <Icon aria-hidden size={28} className="mb-1 text-fg-3" />}
      <h3 className="text-base font-semibold">{title}</h3>
      {body && <p className="max-w-[36ch] text-sm text-fg-3">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** 読み込みの骨。150ms 待ってから出るので、速く読み込めたときはチラつかない */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("wk-skeleton h-4", className)} />;
}

/** その場に出すエラー。何が起きたか＋どうすればいいかを1文で */
export function InlineError({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      role="alert"
      // 出た瞬間に目が向くよう、少し上からふわっと出す（揺らしはしない）
      className={cn(
        "flex items-start gap-1.5 text-sm text-danger transition-[opacity,translate] duration-[var(--wk-dur-fast)] ease-out starting:opacity-0 motion-safe:starting:-translate-y-1",
        className,
      )}
    >
      <CircleAlert aria-hidden size={16} className="mt-0.5 flex-none" />
      <span>{children}</span>
    </p>
  );
}

/** 数字のカード。注意が要るとき（tone="alert"）は面ごと赤みにして一目で分かるようにする */
export function StatCard({
  label,
  value,
  unit,
  tone = "plain",
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  tone?: "plain" | "alert";
}) {
  return (
    <div className={cn("rounded-md border px-4 py-3.5", tone === "alert" ? "border-transparent bg-danger-soft text-danger" : "border-line bg-surface")}>
      <div className={cn("text-xs tracking-wide", tone === "alert" ? "text-danger" : "text-fg-3")}>{label}</div>
      <div className="num mt-0.5 text-[30px] leading-tight font-semibold">
        {value}
        {unit && <small className={cn("ml-0.5 text-sm font-normal", tone === "alert" ? "text-danger" : "text-fg-3")}>{unit}</small>}
      </div>
    </div>
  );
}

/** 画面の見出し。上に貼り付き、下の内容がすりガラス越しに透ける */
export function PageHeader({ title, sub, actions }: { title: string; sub?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <header className="wk-glass-top sticky top-0 z-20 -mx-4 mb-2 flex items-end justify-between gap-3 px-4 pt-[calc(18px+env(safe-area-inset-top,0px))] pb-3 rail:-mx-7 rail:px-7 rail:pt-6">
      <div className="min-w-0">
        <h1 className="text-xl leading-tight font-semibold">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-fg-3">{sub}</p>}
      </div>
      {actions && <div className="flex flex-none gap-2">{actions}</div>}
    </header>
  );
}

/** 本文の箱。幅を読みやすい範囲に抑え、左右の余白をそろえる */
export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[920px] px-4 pb-12 rail:px-7", className)}>{children}</div>;
}

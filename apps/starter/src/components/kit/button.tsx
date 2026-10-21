"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

/**
 * ボタン。高さは「指かマウスか」で自動（マウス 36px／指 44px）。押すと少し縮む。
 * 1つの画面で primary（塗りつぶし）は1個まで。ほかは secondary か ghost。
 * 使えない状態（disabled）は極力使わず、押されたときに理由を出す。
 */
export const buttonVariants = cva(
  "inline-flex h-hit items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3.5 text-sm font-medium select-none " +
    "transition-[background-color,border-color,color,scale] duration-[var(--wk-dur-fast)] ease-out active:scale-(--wk-press) active:duration-[var(--wk-dur-press)] " +
    "aria-busy:cursor-progress aria-busy:opacity-85 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:bg-[color-mix(in_oklab,var(--wk-accent)_88%,var(--wk-fg))]",
        secondary: "border border-line bg-surface text-fg hover:bg-surface-2",
        // 主ボタンは1画面に1つ。同じ画面の2つ目の「進める」操作はこちら（主色の淡い地）
        soft: "bg-accent-soft text-accent-text hover:bg-[color-mix(in_oklab,var(--wk-accent-soft)_85%,var(--wk-accent))]",
        ghost: "text-fg-2 hover:bg-surface-2 hover:text-fg",
        danger: "text-danger hover:bg-danger-soft",
      },
      size: {
        md: "",
        lg: "h-12 px-5 text-base",
        icon: "w-hit px-0",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});

/**
 * 押してから結果が出るまで時間がかかるボタン。
 * pending の間は「◯◯しています…」に変わり、二度押しを受け付けない（disabled にはしない＝色が薄くならない）。
 */
export function PendingButton({
  pending,
  pendingLabel,
  children,
  onClick,
  ...props
}: ButtonProps & { pending: boolean; pendingLabel: string }) {
  return (
    <Button
      {...props}
      aria-busy={pending || undefined}
      onClick={(e) => {
        if (pending) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    >
      {pending ? (
        <>
          <span aria-hidden className="wk-spin size-3.5 rounded-full border-2 border-current border-r-transparent" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

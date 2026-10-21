"use client";

/**
 * トースト（画面下に数秒出るお知らせ）。押した操作の結果は必ずここで知らせる。
 * 取り消せる操作は「取り消す」を付ける。スマホでは下タブに重ならない高さに出す。
 */
import { Toaster as SonnerToaster, toast } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      offset={24}
      mobileOffset={{ bottom: "calc(var(--wk-tabbar-h) + var(--wk-tabbar-gap) * 2 + var(--wk-safe-b))" }}
      toastOptions={{
        duration: 4200,
        classNames: {
          toast: "!rounded-[14px] !border-0 !bg-fg !text-canvas !shadow-float !text-sm !font-sans",
          actionButton: "!bg-transparent !text-canvas !font-semibold !underline !underline-offset-2 !h-hit !text-sm",
        },
      }}
    />
  );
}

/** 結果のお知らせ。undo を渡すと「取り消す」ボタンが付く */
export function notify(message: string, undo?: () => void) {
  toast(message, undo ? { action: { label: "取り消す", onClick: undo } } : undefined);
}

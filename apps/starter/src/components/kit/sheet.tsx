"use client";

/**
 * シート。スマホ（767px 以下）は下から出て、つまみを下に引くと閉じる。PC・タブレットは右から浮いた引き出しで出る。
 * 作業を止めるもの（追加・編集）は背景を暗くする。閉じたら、開く前に触っていた場所へ戻る。
 * 開いたら中の最初の入力欄（無ければ最初のボタン）へフォーカスを移す。出ていたお知らせは消す（シートの入力欄に重なるため）。
 */
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

const query = "(max-width: 47.99rem)";
function subscribe(cb: () => void) {
  const m = window.matchMedia(query);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
export function useIsPhone() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const phone = useIsPhone();
  useEffect(() => {
    if (open) toast.dismiss();
  }, [open]);
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction={phone ? "bottom" : "right"} repositionInputs={false} autoFocus>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-scrim" />
        <Drawer.Content
          onOpenAutoFocus={(e) => {
            // 既定は最初に押せる物（PC では右上の ×）。入力欄があればそこへ移す（開いてすぐ書ける）
            const field = (e.currentTarget as HTMLElement | null)?.querySelector<HTMLElement>(
              "input:not([type=hidden]):not(:disabled), textarea:not(:disabled), select:not(:disabled)",
            );
            if (field) {
              e.preventDefault();
              field.focus({ preventScroll: true });
            }
          }}
          className={cn(
            "fixed z-50 flex flex-col bg-surface shadow-float outline-none",
            phone
              ? "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-[22px] pb-[env(safe-area-inset-bottom,0px)]"
              : "top-3 right-3 bottom-3 w-[min(420px,calc(100vw-24px))] rounded-lg",
          )}
        >
          {phone && <div aria-hidden className="mx-auto mt-2.5 mb-1 h-[5px] w-10 flex-none rounded-full bg-line" />}
          <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2 rail:px-6 rail:pt-5">
            <div className="min-w-0">
              <Drawer.Title className="text-lg font-semibold">{title}</Drawer.Title>
              {description ? (
                <Drawer.Description className="mt-0.5 text-sm text-fg-3">{description}</Drawer.Description>
              ) : (
                <Drawer.Description className="sr-only">{title}</Drawer.Description>
              )}
            </div>
            {!phone && (
              <Drawer.Close className="-mt-1 -mr-2 grid size-hit place-items-center rounded-md text-fg-3 hover:bg-surface-2 hover:text-fg" aria-label="閉じる">
                <X aria-hidden size={18} />
              </Drawer.Close>
            )}
          </div>
          <div className="overflow-y-auto overscroll-contain px-5 pb-6 rail:px-6">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

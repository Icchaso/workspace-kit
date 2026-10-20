"use client";

/**
 * 確認ダイアログ。元に戻せない操作のときだけ使う（取り消せる操作は確認を挟まず、トーストの「取り消す」で戻す）。
 * 押すボタンには何が起きるかを動詞で書く（「OK」にしない）。
 */
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "./button";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-scrim transition-opacity duration-[var(--wk-dur-base)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 grid w-[min(400px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 gap-3 rounded-lg bg-surface p-5 shadow-float transition-[opacity,scale] duration-[var(--wk-dur-base)] ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <AlertDialog.Title className="text-lg font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-fg-2">{body}</AlertDialog.Description>
          <div className="mt-2 flex justify-end gap-2">
            <AlertDialog.Close render={<Button variant="ghost" />}>やめる</AlertDialog.Close>
            <Button
              className="bg-danger text-on-danger hover:bg-[color-mix(in_oklab,var(--wk-danger)_88%,var(--wk-fg))]"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

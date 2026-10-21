"use client";

/**
 * タスク1件への操作（完了・今日やる・明日に回す・削除）。どの画面から操作しても、同じ文面でお知らせ＋「取り消す」が出る。
 *   マウス … 行の「…」ボタンでメニュー（キーボードの矢印でも選べる）
 *   指     … 行・カードの長押し、または「…」で下から操作シート
 * 削除も取り消せるので、確認ダイアログは挟まない（元に戻せない操作だけ確認する）。
 */
import { Menu } from "@base-ui/react/menu";
import { ArrowRight, Check, FileText, MoreHorizontal, RotateCcw, Sun, Trash2, type LucideIcon } from "lucide-react";
import { Sheet } from "@/components/kit/sheet";
import { notify } from "@/components/kit/toast";
import { useCoarsePointer } from "@/lib/prefs";
import { useTasks, type Task } from "@/lib/tasks";
import { cn } from "@/lib/cn";

export function useTaskCommands() {
  const { toggle, setDue, remove, undo } = useTasks();
  return {
    toggle: (t: Task) => {
      const r = toggle(t.id);
      if (r) notify(r.done ? `「${r.title}」を完了にしました` : "未完了に戻しました", undo);
    },
    today: (t: Task) => {
      setDue([t.id], "today");
      notify("今日のタスクに入れました", undo);
    },
    tomorrow: (t: Task) => {
      setDue([t.id], "tomorrow");
      notify("明日に回しました", undo);
    },
    remove: (t: Task) => {
      remove(t.id);
      notify(`「${t.title}」を削除しました`, undo);
    },
  };
}

type Action = { key: string; label: string; icon: LucideIcon; run: () => void; danger?: boolean };

function useActionList(task: Task | null, onOpenDetail?: (t: Task) => void): Action[] {
  const cmd = useTaskCommands();
  if (!task) return [];
  const list: Action[] = [
    { key: "toggle", label: task.done ? "未完了に戻す" : "完了にする", icon: task.done ? RotateCcw : Check, run: () => cmd.toggle(task) },
  ];
  if (!task.done && task.due !== "today") list.push({ key: "today", label: "今日やる", icon: Sun, run: () => cmd.today(task) });
  if (!task.done && (task.due === "today" || task.due === "overdue")) list.push({ key: "tomorrow", label: "明日に回す", icon: ArrowRight, run: () => cmd.tomorrow(task) });
  if (onOpenDetail) list.push({ key: "detail", label: "詳細を見る", icon: FileText, run: () => onOpenDetail(task) });
  list.push({ key: "delete", label: "削除", icon: Trash2, run: () => cmd.remove(task), danger: true });
  return list;
}

/**
 * 指で触る端末の操作シート（長押し・… から開く）。
 * 閉じる動きの間も中身を出しておくため、task は閉じた後も残し、開閉は open で渡す。
 */
export function TaskActionSheet({
  task,
  open,
  onOpenChange,
  onOpenDetail,
}: {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenDetail?: (t: Task) => void;
}) {
  const actions = useActionList(task, onOpenDetail);
  return (
    <Sheet open={open && !!task} onOpenChange={onOpenChange} title={task?.title ?? ""} description="このタスクへの操作">
      <div className="grid gap-1 pb-2">
        {actions.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => {
              onOpenChange(false);
              a.run();
            }}
            className={cn(
              "flex min-h-row items-center gap-3 rounded-md px-3 text-left text-base transition-colors duration-[var(--wk-dur-fast)] active:bg-surface-2",
              a.danger ? "text-danger" : "text-fg",
            )}
          >
            <a.icon aria-hidden size={20} className={a.danger ? "" : "text-fg-2"} />
            {a.label}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/** 行の「…」ボタン。マウスではその場のメニュー、指では操作シートを開く */
export function TaskMoreButton({ task, onSheet, onOpenDetail }: { task: Task; onSheet: (t: Task) => void; onOpenDetail?: (t: Task) => void }) {
  const coarse = useCoarsePointer();
  const actions = useActionList(task, onOpenDetail);
  const triggerClass =
    "wk-row-more relative z-10 grid size-hit flex-none place-items-center rounded-md text-fg-3 transition-colors duration-[var(--wk-dur-fast)] hover:bg-surface-2 hover:text-fg active:bg-surface-2 data-[popup-open]:bg-surface-2 data-[popup-open]:text-fg";
  const label = `「${task.title}」の操作`;

  if (coarse) {
    return (
      <button type="button" data-no-longpress aria-label={label} onClick={() => onSheet(task)} className={triggerClass}>
        <MoreHorizontal aria-hidden size={18} />
      </button>
    );
  }
  return (
    <Menu.Root>
      <Menu.Trigger aria-label={label} className={triggerClass}>
        <MoreHorizontal aria-hidden size={18} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={4} align="end" className="z-50 outline-none">
          <Menu.Popup className="min-w-44 origin-[var(--transform-origin)] rounded-md border border-line bg-surface p-1 shadow-float outline-none transition-[opacity,scale] duration-[var(--wk-dur-fast)] ease-out data-[ending-style]:scale-(--wk-pop) data-[ending-style]:opacity-0 data-[ending-style]:duration-[var(--wk-dur-exit)] data-[starting-style]:scale-(--wk-pop) data-[starting-style]:opacity-0">
            {actions.map((a) => (
              <Menu.Item
                key={a.key}
                onClick={a.run}
                className={cn(
                  "flex h-hit cursor-default items-center gap-2.5 rounded-sm px-2.5 text-sm outline-none select-none data-[highlighted]:bg-surface-2 data-[highlighted]:shadow-[inset_2px_0_0_var(--wk-accent)]",
                  a.danger ? "text-danger" : "text-fg",
                )}
              >
                <a.icon aria-hidden size={16} className={a.danger ? "" : "text-fg-3"} />
                {a.label}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

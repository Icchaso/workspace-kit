"use client";

import { Check } from "lucide-react";
import { DUE_LABEL, type Task } from "@/lib/tasks";
import { cn } from "@/lib/cn";

/** 丸いチェック。押せる範囲は 36px（指なら 44px）、見た目の丸は 20px */
export function CheckButton({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label={task.done ? `「${task.title}」を未完了に戻す` : `「${task.title}」を完了にする`}
      aria-pressed={task.done}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="group grid size-hit flex-none place-items-center rounded-full"
    >
      <span
        className={cn(
          "grid size-5 place-items-center rounded-full border-[1.8px] transition-[background-color,border-color,transform] duration-[var(--wk-dur-base)] ease-out group-active:scale-85",
          task.done ? "border-accent bg-accent" : "border-fg-3",
        )}
      >
        <Check
          aria-hidden
          size={13}
          strokeWidth={3}
          className={cn("text-on-accent transition-[opacity,scale] duration-[var(--wk-dur-base)] ease-out", task.done ? "scale-100 opacity-100" : "scale-40 opacity-0")}
        />
      </span>
    </button>
  );
}

export function DueTag({ task }: { task: Task }) {
  const tone = task.done ? "" : task.due === "overdue" ? "bg-danger-soft text-danger" : task.due === "today" ? "bg-accent-soft text-accent-text" : "";
  return <span className={cn("inline-flex items-center rounded-full bg-surface-2 px-2 py-1 text-xs leading-none whitespace-nowrap text-fg-2", tone)}>{DUE_LABEL[task.due]}</span>;
}

export function ProjectTag({ name }: { name: string }) {
  return <span className="inline-flex items-center rounded-full bg-surface-2 px-2 py-1 text-xs leading-none whitespace-nowrap text-fg-2">{name}</span>;
}

export function PriorityTag({ task }: { task: Task }) {
  const dot = task.priority === "高" ? "bg-danger" : task.priority === "中" ? "bg-warn" : "bg-fg-3";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap text-fg-2">
      <span aria-hidden className={cn("size-2 rounded-full", dot)} />
      優先度 {task.priority}
    </span>
  );
}

/** タスクのカード（今日の画面で使う大きめの形） */
export function TaskCard({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-line bg-surface py-2 pr-3 pl-1.5">
      <CheckButton task={task} onToggle={onToggle} />
      <div className="grid min-w-0 flex-1 gap-1.5 py-1">
        <span className={cn("text-base font-medium", task.done && "text-fg-3 line-through")}>{task.title}</span>
        <span className="flex flex-wrap items-center gap-1.5">
          <DueTag task={task} />
          <ProjectTag name={task.project} />
          <PriorityTag task={task} />
        </span>
      </div>
    </div>
  );
}

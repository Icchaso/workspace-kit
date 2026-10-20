"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { PendingButton } from "@/components/ui/button";
import { Chip } from "@/components/ui/segmented";
import { InlineError } from "@/components/ui/feedback";
import { notify } from "@/components/ui/toast";
import { PROJECTS, useTasks, type Due, type Priority } from "@/lib/tasks";

const DUES: { value: Due; label: string }[] = [
  { value: "today", label: "今日" },
  { value: "tomorrow", label: "明日" },
  { value: "week", label: "今週" },
  { value: "later", label: "日付なし" },
];

export function AddTaskSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="タスクを追加">
      {/* 閉じるたびに入力を空に戻すため、開いている間だけ中身を作る */}
      {open && <AddTaskForm onDone={() => onOpenChange(false)} />}
    </Sheet>
  );
}

function AddTaskForm({ onDone }: { onDone: () => void }) {
  const { add, undo } = useTasks();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState<Due>("today");
  const [project, setProject] = useState(PROJECTS[0]);
  const [priority, setPriority] = useState<Priority>("中");
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <form
      noValidate
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (pending) return;
        const v = title.trim();
        if (!v) {
          setError(true);
          document.getElementById("task-title")?.focus();
          return;
        }
        setPending(true);
        // 保存にかかる時間の見本（本番ではデータベースへの保存を待つ）
        setTimeout(() => {
          add({ title: v, due, project, priority, note: "" });
          onDone();
          notify(`「${v}」を追加しました`, undo);
        }, 600);
      }}
    >
      <div className="grid gap-1.5">
        <label htmlFor="task-title" className="text-sm text-fg-2">
          タスク名
        </label>
        <input
          id="task-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(false);
          }}
          placeholder="見積書を送る"
          autoComplete="off"
          aria-invalid={error || undefined}
          aria-describedby={error ? "task-title-error" : undefined}
          className="h-hit w-full rounded-sm border border-line bg-canvas px-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 aria-invalid:border-danger"
        />
        {error && <InlineError>タスク名を入れてください</InlineError>}
      </div>

      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-sm text-fg-2">期限</legend>
        <div className="flex flex-wrap gap-1.5">
          {DUES.map((d) => (
            <Chip key={d.value} pressed={due === d.value} onClick={() => setDue(d.value)}>
              {d.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-1.5">
        <label htmlFor="task-project" className="text-sm text-fg-2">
          案件
        </label>
        <select
          id="task-project"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="h-hit w-full rounded-sm border border-line bg-canvas px-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
        >
          {PROJECTS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-sm text-fg-2">優先度</legend>
        <div className="flex flex-wrap gap-1.5">
          {(["高", "中", "低"] as Priority[]).map((p) => (
            <Chip key={p} pressed={priority === p} onClick={() => setPriority(p)}>
              {p}
            </Chip>
          ))}
        </div>
      </fieldset>

      <PendingButton type="submit" variant="primary" size="lg" pending={pending} pendingLabel="追加しています…" className="mt-1 w-full">
        <Plus aria-hidden size={18} />
        追加する
      </PendingButton>
    </form>
  );
}

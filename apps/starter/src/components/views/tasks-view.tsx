"use client";

/**
 * タスク一覧（A 指令室型）。
 *   1280px 以上 … 一覧の表＋右の詳細パネル（↑↓ キーで選ぶ、… でメニュー）
 *   それより狭い … カードに近い行。押すと詳細シート、長押し（指）で操作シート
 * 絞り込みと選んだタスクは URL に入れる（?f=today&id=3）。再読み込み・共有・戻るで同じ画面に戻れる。
 */
import { CheckCheck, CircleCheck, Plus, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useShell } from "@/components/shell/app-frame";
import { Button } from "@/components/kit/button";
import { EmptyState, Page, PageHeader, Skeleton } from "@/components/kit/feedback";
import { Chip } from "@/components/kit/segmented";
import { CheckButton, DueTag, PriorityTag, ProjectTag } from "@/components/tasks/task-parts";
import { TaskActionSheet, TaskMoreButton, useTaskCommands } from "@/components/tasks/task-actions";
import { TaskDetail, TaskDetailSheet } from "@/components/tasks/task-detail";
import { useCoarsePointer, useWide } from "@/lib/prefs";
import { counts, useTasks, type Task } from "@/lib/tasks";
import { useLongPress } from "@/lib/use-long-press";
import { cn } from "@/lib/cn";
import { APP } from "@/config/shell";

type Filter = "open" | "today" | "overdue" | "done";
const FILTERS: Filter[] = ["open", "today", "overdue", "done"];
const LABEL: Record<Filter, string> = { open: "未完了", today: "今日", overdue: "期限切れ", done: "完了" };
const EMPTY: Record<Filter, [string, string]> = {
  open: ["未完了のタスクはありません", "新しいタスクを追加して始めましょう"],
  today: ["今日のタスクはありません", "明日以降のタスクを今日に入れることもできます"],
  overdue: ["期限切れはありません", "この調子です"],
  done: ["完了したタスクはまだありません", "チェックを付けるとここに入ります"],
};
const match = (f: Filter) => (t: Task) =>
  f === "open" ? !t.done : f === "today" ? !t.done && t.due === "today" : f === "overdue" ? !t.done && t.due === "overdue" : t.done;

/** URL の一部だけを書き換える（画面の読み込み直しはしない） */
function setQuery(patch: Record<string, string | null>) {
  const p = new URLSearchParams(window.location.search);
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) p.delete(k);
    else p.set(k, v);
  }
  const q = p.toString();
  window.history.replaceState(null, "", q ? `?${q}` : window.location.pathname);
}

function Header() {
  const { openAdd, openSearch } = useShell();
  const { tasks } = useTasks();
  return (
    <PageHeader
      title="タスク"
      sub={`${counts(tasks).open}件が未完了`}
      actions={
        <>
          <Button onClick={openSearch} aria-label="検索・操作" title="検索・操作（⌘K）" className="max-rail:w-hit max-rail:px-0">
            <Search aria-hidden size={18} />
            <span className="max-rail:hidden">検索</span>
            <kbd className="font-sans text-xs text-fg-3 max-rail:hidden pointer-coarse:hidden">⌘K</kbd>
          </Button>
          <Button variant="primary" onClick={openAdd}>
            <Plus aria-hidden size={18} />
            <span className="max-rail:sr-only">{APP.addLabel}</span>
            <span className="rail:hidden" aria-hidden>
              追加
            </span>
          </Button>
        </>
      }
    />
  );
}

/** 読み込み中（URL を読む前）の形。見出しは同じものを先に出しておく */
export function TasksFallback() {
  return (
    <Page className="side:max-w-[1240px]">
      <Header />
      <div className="mt-1 mb-3.5 flex gap-1.5">
        {FILTERS.map((f) => (
          <Skeleton key={f} className="h-hit w-20 rounded-full" />
        ))}
      </div>
      <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex h-row items-center gap-3 bg-surface px-3">
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
        ))}
      </div>
    </Page>
  );
}

export function TasksView() {
  const { tasks } = useTasks();
  const cmd = useTaskCommands();
  const params = useSearchParams();
  const wide = useWide();
  const coarse = useCoarsePointer();
  const listRef = useRef<HTMLUListElement>(null);
  const [acting, setActing] = useState<{ id: number; open: boolean } | null>(null);
  const press = useLongPress((t: Task) => setActing({ id: t.id, open: true }));

  const f = params.get("f");
  const filter: Filter = FILTERS.includes(f as Filter) ? (f as Filter) : "open";
  const rows = tasks.filter(match(filter));
  const c = counts(tasks);
  const idParam = Number(params.get("id")) || null;
  const picked = idParam ? (tasks.find((t) => t.id === idParam) ?? null) : null;
  // 広い画面では、何も選んでいなければ先頭を出しておく（右のパネルを空にしない）
  const selected = picked ?? (wide ? (rows[0] ?? null) : null);
  // 詳細シートは「狭い画面で選んだとき」だけ。閉じる動きの間も中身を出すため、最後に選んだタスクを覚えておく
  const [lastPicked, setLastPicked] = useState<Task | null>(null);
  if (picked && picked !== lastPicked) setLastPicked(picked);

  const select = (t: Task | null) => setQuery({ id: t ? String(t.id) : null });

  const moveSelection = (dir: 1 | -1) => {
    if (!rows.length) return;
    const i = selected ? rows.findIndex((t) => t.id === selected.id) : -1;
    const next = rows[Math.min(rows.length - 1, Math.max(0, i + dir))];
    select(next);
    listRef.current?.querySelector<HTMLElement>(`[data-row="${next.id}"] [data-open]`)?.focus();
  };

  return (
    <Page className="side:max-w-[1240px]">
      <Header />
      <div role="group" aria-label="絞り込み" className="mt-1 mb-3.5 flex flex-wrap gap-1.5">
        {FILTERS.map((k) => (
          <Chip key={k} pressed={filter === k} onClick={() => setQuery({ f: k === "open" ? null : k, id: null })}>
            {LABEL[k]}
            <span className="num text-xs opacity-80">{c[k]}</span>
          </Chip>
        ))}
      </div>

      <div className="grid gap-5 side:grid-cols-[minmax(0,1fr)_340px] side:items-start">
        <div className="overflow-hidden rounded-md border border-line bg-surface">
          {rows.length ? (
            <>
              <div aria-hidden className="hidden h-9 grid-cols-[var(--wk-hit)_minmax(0,1fr)_88px_88px_76px_var(--wk-hit)] items-center gap-x-2 border-b border-line px-2 text-xs text-fg-3 side:grid">
                <span />
                <span>タスク</span>
                <span>期限</span>
                <span>案件</span>
                <span>優先度</span>
                <span />
              </div>
              <ul
                ref={listRef}
                aria-label={`${LABEL[filter]}のタスク`}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    moveSelection(e.key === "ArrowDown" ? 1 : -1);
                  }
                }}
              >
                {rows.map((t) => {
                  const on = wide && selected?.id === t.id;
                  return (
                    <li
                      key={t.id}
                      data-row={t.id}
                      data-on={on || undefined}
                      {...press.bind(t)}
                      className={cn(
                        "relative grid min-h-row grid-cols-[var(--wk-hit)_minmax(0,1fr)_var(--wk-hit)] items-center gap-x-2 border-b border-line px-2 py-2 transition-colors duration-[var(--wk-dur-fast)] select-none last:border-b-0 [-webkit-touch-callout:none]",
                        "side:grid-cols-[var(--wk-hit)_minmax(0,1fr)_88px_88px_76px_var(--wk-hit)] side:py-0",
                        on ? "bg-accent-soft" : "hover:bg-surface-2 active:bg-surface-2 data-[held]:bg-surface-2",
                      )}
                    >
                      {on && <span aria-hidden className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-accent" />}
                      <span className="row-span-2 side:row-span-1">
                        <CheckButton task={t} onToggle={() => cmd.toggle(t)} />
                      </span>
                      {/* 行全体を押せるように、題名のボタンを行いっぱいに広げる */}
                      <button
                        type="button"
                        data-open
                        aria-current={on || undefined}
                        onClick={() => {
                          if (!press.consumed()) select(t);
                        }}
                        className={cn(
                          "min-w-0 text-left text-sm after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent",
                          "max-side:font-medium side:truncate",
                          t.done && "text-fg-3 line-through",
                        )}
                      >
                        {t.title}
                      </button>
                      {/* 広い画面は表の列、狭い画面はタイトルの下に並べる */}
                      <span className="col-start-2 row-start-2 flex flex-wrap items-center gap-1.5 side:contents">
                        <span className="side:col-start-3 side:row-start-1 side:justify-self-start">
                          <DueTag task={t} />
                        </span>
                        <span className="side:col-start-4 side:row-start-1 side:justify-self-start">
                          <ProjectTag name={t.project} />
                        </span>
                        <span className="side:col-start-5 side:row-start-1">
                          <PriorityTag task={t} />
                        </span>
                      </span>
                      <span className="col-start-3 row-span-2 row-start-1 side:col-start-6 side:row-span-1">
                        <TaskMoreButton task={t} onSheet={(x) => setActing({ id: x.id, open: true })} onOpenDetail={coarse || !wide ? select : undefined} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <EmptyState
              icon={filter === "done" ? CircleCheck : CheckCheck}
              title={EMPTY[filter][0]}
              body={EMPTY[filter][1]}
              action={<AddButton />}
            />
          )}
        </div>

        {/* 右の詳細パネル（1280px 以上だけ） */}
        <aside aria-label="タスクの詳細" className="sticky top-24 hidden rounded-md border border-line bg-surface p-5 side:block">
          <TaskDetail task={selected} onRemoved={() => select(null)} />
        </aside>
      </div>

      <TaskDetailSheet task={lastPicked} open={!wide && !!picked} onOpenChange={(open) => !open && select(null)} />
      <TaskActionSheet
        task={acting ? (tasks.find((t) => t.id === acting.id) ?? null) : null}
        open={!!acting?.open}
        onOpenChange={(open) => setActing((a) => a && { ...a, open })}
        onOpenDetail={(t) => setTimeout(() => select(t), 280)}
      />
    </Page>
  );
}

function AddButton() {
  const { openAdd } = useShell();
  return (
    <Button onClick={openAdd}>
      <Plus aria-hidden size={18} />
      {APP.addLabel}
    </Button>
  );
}

"use client";

/**
 * タスク一覧（A 指令室型）。
 *   1280px 以上 … 一覧の表＋右の詳細パネル（↑↓ キーで選ぶ、… でメニュー）
 *   それより狭い … カードに近い行。押すと詳細シート、長押し（指）で操作シート
 * 絞り込みと選んだタスクは URL に入れる（?f=today&id=3）。再読み込み・共有・戻るで同じ画面に戻れる。
 * 並びは「塊（期限ごと・案件ごと）＋塊の中は優先度の高い順」が既定。まとめ方はこの端末で覚える（人ごとの好みなので URL には入れない）。
 */
import { CheckCheck, CircleCheck, Plus, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useShell } from "@/components/shell/app-frame";
import { Button } from "@/components/kit/button";
import { EmptyState, Page, PageHeader, Skeleton } from "@/components/kit/feedback";
import { Chip, Segmented } from "@/components/kit/segmented";
import { CheckButton, DueTag, PriorityTag, ProjectTag } from "@/components/tasks/task-parts";
import { TaskActionSheet, TaskMoreButton, useTaskCommands } from "@/components/tasks/task-actions";
import { TaskDetail, TaskDetailSheet } from "@/components/tasks/task-detail";
import { useCoarsePointer, useWide } from "@/lib/prefs";
import { DUE_LABEL, PROJECTS, counts, useTasks, type Due, type Task } from "@/lib/tasks";
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
// ---- まとめ方（塊）と並び ----
type Group = "due" | "project" | "priority";
const GROUPS: { value: Group; label: string }[] = [
  { value: "due", label: "期限" },
  { value: "project", label: "案件" },
  { value: "priority", label: "優先度" },
];
const DUE_ORDER: Due[] = ["overdue", "today", "tomorrow", "week", "later"];
const PRI = { 高: 0, 中: 1, 低: 2 } as const;
const byPriority = (a: Task, b: Task) => PRI[a.priority] - PRI[b.priority] || DUE_ORDER.indexOf(a.due) - DUE_ORDER.indexOf(b.due) || a.id - b.id;
const byDue = (a: Task, b: Task) => DUE_ORDER.indexOf(a.due) - DUE_ORDER.indexOf(b.due) || PRI[a.priority] - PRI[b.priority] || a.id - b.id;

/** 塊に分ける。塊の中は、期限ごとなら優先度の高い順、それ以外は期限の近い順 */
// 行が詰まるときのすべり（今日の画面と同じ 0.24 秒・--wk-ease-out）
const SLIDE = { duration: 0.24, ease: [0.23, 1, 0.32, 1] } as const;

function groupRows(rows: Task[], g: Group): { key: string; label: string; items: Task[] }[] {
  const keyOf = (t: Task) => (g === "due" ? t.due : g === "project" ? t.project : t.priority);
  const order: string[] = g === "due" ? DUE_ORDER : g === "project" ? [...PROJECTS, ...new Set(rows.map((t) => t.project).filter((x) => !PROJECTS.includes(x)))] : ["高", "中", "低"];
  const label = (k: string) => (g === "due" ? DUE_LABEL[k as Due] : g === "priority" ? `優先度 ${k}` : k);
  return order
    .map((k) => ({ key: k, label: label(k), items: rows.filter((t) => keyOf(t) === k).sort(g === "due" ? byPriority : byDue) }))
    .filter((x) => x.items.length > 0);
}

const GROUP_KEY = "wk.tasks.group";
const groupListeners = new Set<() => void>();
function useGroup(): [Group, (g: Group) => void] {
  const g = useSyncExternalStore(
    (cb) => {
      groupListeners.add(cb);
      return () => groupListeners.delete(cb);
    },
    () => {
      try {
        const v = localStorage.getItem(GROUP_KEY);
        return GROUPS.some((x) => x.value === v) ? (v as Group) : "due";
      } catch {
        return "due";
      }
    },
    () => "due" as Group,
  );
  const set = (v: Group) => {
    try {
      if (v === "due") localStorage.removeItem(GROUP_KEY);
      else localStorage.setItem(GROUP_KEY, v);
    } catch {}
    groupListeners.forEach((f) => f());
  };
  return [g, set];
}

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
  const reduce = useReducedMotion();
  const params = useSearchParams();
  const wide = useWide();
  const coarse = useCoarsePointer();
  const listRef = useRef<HTMLDivElement>(null);
  const [acting, setActing] = useState<{ id: number; open: boolean } | null>(null);
  const press = useLongPress((t: Task) => setActing({ id: t.id, open: true }));

  const f = params.get("f");
  const filter: Filter = FILTERS.includes(f as Filter) ? (f as Filter) : "open";
  const [group, setGroup] = useGroup();
  // 完了にして今の絞り込みから外れる行は、すぐには消さず、チェックと打ち消し線を付けたまま残す。
  // 最後のチェックから 1 秒何もしなければ、残っていた行をまとめて外し、下の行はすべって詰まる。
  // （1行ずつすぐ消すと、続けてチェックしている指の下で行が入れ替わり、別のタスクを押してしまう）
  const [leaving, setLeaving] = useState<number[]>([]);
  // すべらせるのは「まとめて外した直後」だけ。絞り込みの切り替え・追加・↑↓では位置を測り直さない
  const [swept, setSwept] = useState(0);
  // 絞り込みを切り替えたら、外す予定の行は持ち越さない（条件に合わない行が残って見えないように）
  const [leavingFor, setLeavingFor] = useState(filter);
  if (leavingFor !== filter) {
    setLeavingFor(filter);
    setLeaving([]);
  }
  const sweep = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toggle = (t: Task) => {
    const stays = match(filter)({ ...t, done: !t.done });
    setLeaving((l) => (stays ? l.filter((x) => x !== t.id) : [...l, t.id]));
    if (sweep.current) clearTimeout(sweep.current);
    sweep.current = setTimeout(() => {
      setLeaving([]);
      setSwept((n) => n + 1);
    }, 1000);
    cmd.toggle(t);
  };
  useEffect(() => () => {
    if (sweep.current) clearTimeout(sweep.current);
  }, []);
  const slide = reduce ? false : ("position" as const);
  const sections = groupRows(tasks.filter((t) => match(filter)(t) || leaving.includes(t.id)), group);
  // ↑↓ キーで動く順＝画面に並んでいる順
  const rows = sections.flatMap((x) => x.items);
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
      <div className="mt-1 mb-3.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5">
        <div role="group" aria-label="絞り込み" className="flex flex-wrap gap-1.5">
          {FILTERS.map((k) => (
            <Chip key={k} pressed={filter === k} onClick={() => setQuery({ f: k === "open" ? null : k, id: null })}>
              {LABEL[k]}
              <span className="num text-xs opacity-80">{c[k]}</span>
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-fg-3">
          <span aria-hidden>まとめ方</span>
          <Segmented<Group> label="まとめ方" value={group} onChange={setGroup} options={GROUPS} />
        </div>
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
              <div
                ref={listRef}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    moveSelection(e.key === "ArrowDown" ? 1 : -1);
                  }
                }}
              >
                {sections.map((sec, gi) => (
                  <Fragment key={sec.key}>
                    {/* 塊の見出し：何の塊か・何件か */}
                    <motion.h3
                      layout={slide}
                      layoutDependency={swept}
                      transition={SLIDE}
                      id={`g-${gi}`}
                      className="flex h-8 items-center gap-2 border-y border-line bg-canvas px-3 first:border-t-0 text-xs font-semibold text-fg-2 side:pl-[calc(var(--wk-hit)+1rem)]"
                    >
                      {sec.label}
                      <span className="num font-normal text-fg-3">{sec.items.length}</span>
                    </motion.h3>
                    <ul aria-labelledby={`g-${gi}`}>
                      {sec.items.map((t) => {
                        const on = wide && selected?.id === t.id;
                        return (
                          <motion.li
                            layout={slide}
                            layoutDependency={swept}
                            transition={SLIDE}
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
                              <CheckButton task={t} onToggle={() => toggle(t)} />
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
                          </motion.li>
                        );
                      })}
                    </ul>
                  </Fragment>
                ))}
              </div>
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

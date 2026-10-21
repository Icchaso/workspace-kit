"use client";

/**
 * ⌘K パレット（検索と操作の入口）。⌘K / Ctrl+K・「/」・サイドバーの「検索・操作」・一覧の「検索」で開く。
 *   文字を打つと、操作とアプリの中身（config/shell.tsx の useExtraCommands）を同時に絞り込む。↑↓ で選んで Enter、esc で閉じる。
 * 操作を増やすときは commands の配列に、アプリの中身は useExtraCommands に足す（group が見出しになる）。
 */
import { Dialog } from "@base-ui/react/dialog";
import { CornerDownLeft, Monitor, Moon, Palette, Plus, Rows3, Search, Sun, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { NAV } from "@/config/nav";
import { PALETTES } from "@workspace-kit/themes/catalog";
import { setDensity, setPalette, setTheme } from "@/lib/prefs";
import { APP, AddSheet, useExtraCommands } from "@/config/shell";
import { cn } from "@/lib/cn";

export type PaletteItem = { id: string; group: string; label: string; hint?: string; icon: LucideIcon; keywords?: string; run: () => void };

export function CommandPalette({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (open: boolean) => void; onAdd?: () => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-scrim transition-opacity duration-[var(--wk-dur-fast)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed top-[max(12px,env(safe-area-inset-top,0px))] left-1/2 z-50 flex max-h-[min(560px,calc(100dvh-24px))] w-[min(600px,calc(100vw-24px))] -translate-x-1/2 flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-float outline-none transition-[opacity,scale] duration-[var(--wk-dur-fast)] ease-out data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 rail:top-[12vh]">
          <Dialog.Title className="sr-only">検索・操作</Dialog.Title>
          <Body
            onRun={(run) => {
              onOpenChange(false);
              // 閉じてから実行する（次に開くシートとフォーカスを取り合わないように）
              setTimeout(run, 0);
            }}
            onAdd={onAdd}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Body({ onRun, onAdd }: { onRun: (run: () => void) => void; onAdd?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const extra = useExtraCommands(needle);
  const [active, setActive] = useState(0);
  const listId = useId();

  const commands: PaletteItem[] = [
    ...(AddSheet && onAdd ? [{ id: "add", group: "操作", label: APP.addLabel, hint: "N", icon: Plus, keywords: "新規 つくる 追加", run: onAdd }] : []),
    ...NAV.map((n, i) => ({ id: `go-${n.href}`, group: "移動", label: `${n.label}を開く`, hint: String(i + 1), icon: n.icon, run: () => router.push(n.href) })),
    { id: "light", group: "見た目", label: "明るさ：ライト", icon: Sun, keywords: "テーマ 白", run: () => setTheme("light") },
    { id: "dark", group: "見た目", label: "明るさ：ダーク", icon: Moon, keywords: "テーマ 黒 夜", run: () => setTheme("dark") },
    { id: "system", group: "見た目", label: "明るさ：端末に合わせる", icon: Monitor, keywords: "テーマ 自動", run: () => setTheme("system") },
    { id: "compact", group: "見た目", label: "行の高さ：詰める", icon: Rows3, keywords: "密度", run: () => setDensity("compact") },
    { id: "comfy", group: "見た目", label: "行の高さ：ゆったり", icon: Rows3, keywords: "密度", run: () => setDensity("comfy") },
    ...PALETTES.map((p) => ({ id: `palette-${p.id}`, group: "テーマ", label: `テーマ：${p.label}`, icon: Palette, keywords: `色 ${p.desc}`, run: () => setPalette(p.id) })),
  ];

  const hit = (s: string) => s.toLowerCase().includes(needle);
  const items = [...commands.filter((c) => !needle || hit(c.label) || hit(c.keywords ?? "")), ...extra];
  const cur = Math.min(active, Math.max(0, items.length - 1));
  const optionId = (i: number) => `${listId}-${i}`;

  const groups: { name: string; rows: { item: PaletteItem; index: number }[] }[] = [];
  items.forEach((item, index) => {
    const g = groups.find((x) => x.name === item.group) ?? groups[groups.push({ name: item.group, rows: [] }) - 1];
    g.rows.push({ item, index });
  });

  return (
    <>
      <div className="flex flex-none items-center gap-2.5 border-b border-line px-4">
        <Search aria-hidden size={18} className="flex-none text-fg-3" />
        <input
          autoFocus
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={items.length ? optionId(cur) : undefined}
          aria-label={APP.searchLabel}
          placeholder={APP.searchLabel}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              const n = items.length;
              if (n) setActive((cur + (e.key === "ArrowDown" ? 1 : n - 1)) % n);
            } else if (e.key === "Enter" && items[cur]) {
              e.preventDefault();
              onRun(items[cur].run);
            }
          }}
          className="h-14 min-w-0 flex-1 bg-transparent outline-none placeholder:text-fg-3 focus-visible:outline-none"
          autoComplete="off"
          enterKeyHint="go"
        />
        <Dialog.Close className="h-hit flex-none rounded-sm px-2 text-xs text-fg-3 hover:bg-surface-2 hover:text-fg">
          <span className="pointer-coarse:hidden">esc</span>
          <span className="hidden pointer-coarse:inline">閉じる</span>
        </Dialog.Close>
      </div>

      <div id={listId} role="listbox" aria-label="候補" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5">
        {items.length ? (
          groups.map((g) => (
            <div key={g.name} role="group" aria-label={g.name}>
              <div aria-hidden className="px-2.5 pt-2.5 pb-1 text-xs text-fg-3">
                {g.name}
              </div>
              {g.rows.map(({ item, index }) => (
                <div
                  key={item.id}
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === cur}
                  onPointerMove={() => index !== cur && setActive(index)}
                  onClick={() => onRun(item.run)}
                  className={cn("flex min-h-hit cursor-pointer items-center gap-3 rounded-md px-2.5 py-1.5 text-sm", index === cur && "bg-surface-2")}
                >
                  <item.icon aria-hidden size={16} className="flex-none text-fg-3" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.hint && <span className="flex-none text-xs text-fg-3">{item.hint}</span>}
                  {index === cur && <CornerDownLeft aria-hidden size={14} className="flex-none text-fg-3 pointer-coarse:hidden" />}
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="px-3 py-8 text-center text-sm text-fg-3">「{q}」に合うものはありません</p>
        )}
      </div>

      <div aria-hidden className="flex flex-none gap-4 border-t border-line px-4 py-2 text-xs text-fg-3 pointer-coarse:hidden">
        <span>↑↓ 選ぶ</span>
        <span>Enter 実行</span>
        <span>esc 閉じる</span>
      </div>
    </>
  );
}

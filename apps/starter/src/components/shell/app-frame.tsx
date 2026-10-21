"use client";

/**
 * アプリの骨組み。どの画面もこの中に入る。
 *   767px 以下   … 下タブ（BottomTabBar）
 *   768〜1279px  … アイコン列（SideNav）
 *   1280px 以上  … サイドバー（SideNav・畳める）
 * どの画面からでも使うもの（タスクの追加・⌘K パレット・キーボードの近道）は、ここで1つだけ持つ。
 *
 * キーボードの近道（文字を入力中・シートやダイアログが開いている間は効かない）
 *   ⌘K / Ctrl+K / 「/」 … 検索・操作
 *   N                    … タスクを追加
 *   1〜4                 … ナビの1〜4番目へ移動
 */
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { NAV } from "@/config/nav";
import { TaskProvider } from "@/lib/tasks";
import { Toaster } from "@/components/ui/toast";
import { AddTaskSheet } from "@/components/tasks/add-task-sheet";
import { BottomTabBar } from "./bottom-tab-bar";
import { CommandPalette } from "./command-palette";
import { SideNav } from "./side-nav";

const ShellCtx = createContext<{ openAdd: () => void; openSearch: () => void }>({ openAdd: () => {}, openSearch: () => {} });
export const useShell = () => useContext(ShellCtx);

const typing = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
const overlayOpen = () => !!document.querySelector('[role="dialog"],[role="alertdialog"],[role="menu"]');

export function AppFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [searching, setSearching] = useState(false);
  const openAdd = () => setAdding(true);
  const openSearch = () => setSearching(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearching((s) => !s);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target) || overlayOpen()) return;
      if (e.key === "/") {
        e.preventDefault();
        setSearching(true);
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setAdding(true);
      } else if (/^[1-9]$/.test(e.key) && NAV[Number(e.key) - 1]) {
        router.push(NAV[Number(e.key) - 1].href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <TaskProvider>
      <ShellCtx.Provider value={{ openAdd, openSearch }}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2">
          本文へ移動
        </a>
        <SideNav onAdd={openAdd} onSearch={openSearch} />
        <div className="wk-content">
          <main id="main">{children}</main>
        </div>
        <BottomTabBar />
        <AddTaskSheet open={adding} onOpenChange={setAdding} />
        <CommandPalette open={searching} onOpenChange={setSearching} onAdd={openAdd} />
        <Toaster />
      </ShellCtx.Provider>
    </TaskProvider>
  );
}

"use client";

/**
 * アプリの骨組み。どの画面もこの中に入る。
 *   767px 以下   … 下タブ（BottomTabBar）
 *   768〜1279px  … アイコン列（SideNav）
 *   1280px 以上  … サイドバー（SideNav・畳める）
 * 「タスクを追加」のシートはどの画面からでも開けるように、ここで1つだけ持つ。
 */
import { createContext, useContext, useState } from "react";
import { TaskProvider } from "@/lib/tasks";
import { Toaster } from "@/components/ui/toast";
import { AddTaskSheet } from "@/components/tasks/add-task-sheet";
import { BottomTabBar } from "./bottom-tab-bar";
import { SideNav } from "./side-nav";

const ShellCtx = createContext<{ openAdd: () => void }>({ openAdd: () => {} });
export const useShell = () => useContext(ShellCtx);

export function AppFrame({ children }: { children: React.ReactNode }) {
  const [adding, setAdding] = useState(false);
  const openAdd = () => setAdding(true);
  return (
    <TaskProvider>
      <ShellCtx.Provider value={{ openAdd }}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2">
          本文へ移動
        </a>
        <SideNav onAdd={openAdd} />
        <div className="wk-content">
          <main id="main">{children}</main>
        </div>
        <BottomTabBar />
        <AddTaskSheet open={adding} onOpenChange={setAdding} />
        <Toaster />
      </ShellCtx.Provider>
    </TaskProvider>
  );
}

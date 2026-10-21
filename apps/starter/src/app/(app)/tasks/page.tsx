import type { Metadata } from "next";
import { Suspense } from "react";
import { TasksFallback, TasksView } from "@/components/views/tasks-view";

export const metadata: Metadata = { title: "タスク" };

// 一覧は URL（?f=…&id=…）を読むので、読むまでの間は同じ見出し＋骨の形を出す
export default function TasksPage() {
  return (
    <Suspense fallback={<TasksFallback />}>
      <TasksView />
    </Suspense>
  );
}

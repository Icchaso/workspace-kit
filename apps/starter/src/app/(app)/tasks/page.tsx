import type { Metadata } from "next";
import { TasksView } from "@/components/views/tasks-view";

export const metadata: Metadata = { title: "タスク" };

export default function TasksPage() {
  return <TasksView />;
}

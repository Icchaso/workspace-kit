"use client";

/**
 * カードを押したら詳細シート、長押し（または …）で操作シート、を1か所で持つ。
 * 操作シートの「詳細を見る」は、操作シートが閉じ切ってから詳細シートを開く（シートを2枚重ねない）。
 */
import { useReducedMotion } from "motion/react";
import { useState } from "react";
import { useTasks, type Task } from "@/lib/tasks";
import { TaskActionSheet } from "./task-actions";
import { TaskDetailSheet } from "./task-detail";

export function useTaskSheets() {
  const { tasks } = useTasks();
  const reduce = useReducedMotion();
  const [detail, setDetail] = useState<{ id: number; open: boolean } | null>(null);
  const [actions, setActions] = useState<{ id: number; open: boolean } | null>(null);
  const find = (id?: number) => (id === undefined ? null : (tasks.find((t) => t.id === id) ?? null));

  const openDetail = (t: Task) => setDetail({ id: t.id, open: true });
  const openActions = (t: Task) => setActions({ id: t.id, open: true });

  const sheets = (
    <>
      <TaskDetailSheet task={find(detail?.id)} open={!!detail?.open} onOpenChange={(open) => setDetail((d) => d && { ...d, open })} />
      <TaskActionSheet
        task={find(actions?.id)}
        open={!!actions?.open}
        onOpenChange={(open) => setActions((a) => a && { ...a, open })}
        onOpenDetail={(t) => setTimeout(() => openDetail(t), reduce ? 0 : 280)}
      />
    </>
  );
  return { openDetail, openActions, sheets };
}

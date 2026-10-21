"use client";

/**
 * 「今日を締める」手順フォーム（B 現場型の見本）。1回に1つだけ聞き、3つの手順で終える。
 *   1. 残ったタスク … 明日に回すものに印を付ける（最初は全部に印）
 *   2. ひとこと     … 今日のメモ（書かなくてもよい）
 *   3. 確認         … まとめを見て「締める」
 * 手順の途中で閉じても、もう一度開けば最初からやり直せる（途中の入力は捨てる）。
 */
import { ArrowLeft, ArrowRight, Check, MoonStar } from "lucide-react";
import { useState } from "react";
import { Button, PendingButton } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Steps } from "@/components/ui/steps";
import { notify } from "@/components/ui/toast";
import { useTasks } from "@/lib/tasks";
import { cn } from "@/lib/cn";

const STEPS = ["残ったタスク", "ひとこと", "確認"];

export function WrapUpSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="今日を締める" description="残りを明日に回して、今日を終えます">
      {open && <WrapUpForm onDone={() => onOpenChange(false)} />}
    </Sheet>
  );
}

function WrapUpForm({ onDone }: { onDone: () => void }) {
  const { tasks, setDue, undo } = useTasks();
  const left = tasks.filter((t) => !t.done && (t.due === "today" || t.due === "overdue"));
  const doneToday = tasks.filter((t) => t.done && (t.due === "today" || t.due === "overdue")).length;
  const [step, setStep] = useState(0);
  const [moving, setMoving] = useState<number[]>(() => left.map((t) => t.id));
  const [memo, setMemo] = useState("");
  const [pending, setPending] = useState(false);

  const flip = (id: number) => setMoving((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  return (
    <div className="grid gap-5">
      <Steps steps={STEPS} current={step} onJump={setStep} />

      {step === 0 && (
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm text-fg-2">明日に回すタスクに印を付けてください</legend>
          {left.length ? (
            left.map((t) => {
              const on = moving.includes(t.id);
              return (
                <label
                  key={t.id}
                  className={cn(
                    "flex min-h-row cursor-pointer items-center gap-3 rounded-md border px-3 transition-colors duration-[var(--wk-dur-fast)]",
                    on ? "border-accent bg-accent-soft" : "border-line bg-surface",
                  )}
                >
                  <input type="checkbox" checked={on} onChange={() => flip(t.id)} className="size-5 flex-none accent-[var(--wk-accent)]" />
                  <span className="min-w-0 flex-1 text-sm">{t.title}</span>
                  {t.due === "overdue" && <span className="text-xs text-danger">期限切れ</span>}
                </label>
              );
            })
          ) : (
            <p className="rounded-md bg-surface-2 px-3.5 py-3 text-sm text-fg-2">今日のタスクは全部終わっています。このまま次へ進んでください。</p>
          )}
        </fieldset>
      )}

      {step === 1 && (
        <div className="grid gap-1.5">
          <label htmlFor="wrap-memo" className="text-sm text-fg-2">
            今日のひとこと（書かなくても締められます）
          </label>
          <textarea
            id="wrap-memo"
            rows={4}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="よかったこと・明日の自分への申し送り"
            className="w-full resize-none rounded-sm border border-line bg-canvas px-3 py-2.5 leading-relaxed outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </div>
      )}

      {step === 2 && (
        <dl className="grid grid-cols-[7em_1fr] gap-x-3 gap-y-2.5 rounded-md bg-surface-2 px-4 py-3.5 text-sm">
          <dt className="text-fg-3">終えたタスク</dt>
          <dd className="num">{doneToday}件</dd>
          <dt className="text-fg-3">明日に回す</dt>
          <dd className="num">{moving.length}件</dd>
          <dt className="text-fg-3">ひとこと</dt>
          <dd className="whitespace-pre-wrap">{memo.trim() || "なし"}</dd>
        </dl>
      )}

      <div className="flex gap-2">
        {step > 0 && (
          <Button variant="ghost" size="lg" onClick={() => setStep(step - 1)}>
            <ArrowLeft aria-hidden size={18} />
            戻る
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep(step + 1)}>
            次へ
            <ArrowRight aria-hidden size={18} />
          </Button>
        ) : (
          <PendingButton
            variant="primary"
            size="lg"
            className="flex-1"
            pending={pending}
            pendingLabel="締めています…"
            onClick={() => {
              setPending(true);
              // 保存にかかる時間の見本（本番ではデータベースへの保存を待つ）
              setTimeout(() => {
                if (moving.length) setDue(moving, "tomorrow");
                onDone();
                notify(moving.length ? `今日を締めました。${moving.length}件を明日に回しました` : "今日を締めました。おつかれさまでした", moving.length ? undo : undefined);
              }, 600);
            }}
          >
            {moving.length ? <Check aria-hidden size={18} /> : <MoonStar aria-hidden size={18} />}
            締める
          </PendingButton>
        )}
      </div>
    </div>
  );
}

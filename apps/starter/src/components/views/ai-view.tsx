"use client";

/**
 * AI に相談（C AI相棒型）。
 *   会話は左（スマホでは全幅）、AI が作った表や計画（成果物）は
 *     1280px 以上 … 右のパネルに並べる
 *     それより狭い … 会話の中のカードを押すとシートで開く
 *   返事は文字が少しずつ届く（動きを減らす設定では一度に出す）。届いている間は次の依頼を受け付けない。
 *   過去の会話は「履歴」から開く。
 * 返事の中身は lib/ai-script.ts の台本。本番ではそこを AI の呼び出しに差し替える。
 */
import { ArrowUp, ChevronRight, ClipboardCopy, FileText, History, MessageSquarePlus, Sparkles, Sun } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/kit/button";
import { EmptyState, InlineError, Page, PageHeader } from "@/components/kit/feedback";
import { Sheet } from "@/components/kit/sheet";
import { notify } from "@/components/kit/toast";
import { SAMPLE_HISTORY, SUGGESTIONS, answer, type Artifact } from "@/lib/ai-script";
import { useCoarsePointer, useWide } from "@/lib/prefs";
import { useTasks } from "@/lib/tasks";
import { cn } from "@/lib/cn";

type Msg = { id: number; who: "u" | "a" | "art"; text?: string; live?: boolean; art?: Artifact };
type Saved = { id: string; title: string; when: string; messages: { who: "u" | "a"; text: string }[] };

/**
 * 最後のやりとりが見えるところまで送る。もう見えていれば動かさない（短い会話で、最初の吹き出しが上の見出しの下に潜らないように）。
 * soft のときは、すでに下の方を見ているときだけ（読み返し中は邪魔しない）
 */
function scrollToEnd(soft = false) {
  requestAnimationFrame(() => {
    const el = document.documentElement;
    if (soft && el.scrollHeight - (window.scrollY + window.innerHeight) > 200) return;
    document.querySelector<HTMLElement>('[role="log"] > :last-child')?.scrollIntoView({ block: "nearest" });
  });
}

export function AiView() {
  const { tasks, setDue, undo } = useTasks();
  const reduce = useReducedMotion();
  const wide = useWide();
  const coarse = useCoarsePointer();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [art, setArt] = useState<Artifact | null>(null);
  const [artOpen, setArtOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saved, setSaved] = useState<Saved[]>(SAMPLE_HISTORY);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(false);
  const seq = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 画面を離れたら、届きかけの返事を止める
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const ask = (q: string) => {
    if (busy) return;
    const a = answer(q, tasks);
    const id = (seq.current += 3);
    setMsgs((m) => [...m, { id, who: "u", text: q }, { id: id + 1, who: "a", text: "", live: true }]);
    setBusy(true);
    scrollToEnd();

    const finish = () => {
      timer.current = null;
      setMsgs((m) => {
        const out = m.map((x) => (x.id === id + 1 ? { ...x, text: a.text, live: false } : x));
        return a.artifact ? [...out, { id: id + 2, who: "art" as const, art: a.artifact }] : out;
      });
      if (a.artifact) setArt(a.artifact);
      setBusy(false);
      scrollToEnd(true);
    };
    if (reduce) {
      finish();
      return;
    }
    // 見本の「届く速さ」：考える間 0.38 秒 → 22ms ごとに2文字
    let i = 0;
    const tick = () => {
      i = Math.min(a.text.length, i + 2);
      setMsgs((m) => m.map((x) => (x.id === id + 1 ? { ...x, text: a.text.slice(0, i) } : x)));
      scrollToEnd(true);
      timer.current = i < a.text.length ? setTimeout(tick, 22) : null;
      if (i >= a.text.length) finish();
    };
    timer.current = setTimeout(tick, 380);
  };

  const submit = () => {
    const v = draft.trim();
    if (!v) {
      setError(true);
      inputRef.current?.focus();
      return;
    }
    if (busy) return;
    setDraft("");
    if (inputRef.current) inputRef.current.style.height = "";
    ask(v);
  };

  const openArt = (a: Artifact) => {
    setArt(a);
    if (!wide) setArtOpen(true);
  };

  const apply = (a: Artifact) => {
    const ids = [...new Set(a.items.map((x) => x.taskId).filter((x): x is number => x !== undefined))];
    setDue(ids, "today");
    setArtOpen(false);
    notify(`${ids.length}件を今日のタスクに入れました`, undo);
  };

  const copy = (a: Artifact) => {
    const text = `${a.title}\n${a.items.map((x) => `・${x.text}（${x.sub}）`).join("\n")}`;
    const fail = () => notify("コピーできませんでした。文章を選んでコピーしてください");
    try {
      navigator.clipboard.writeText(text).then(() => notify("振り返りの文章をコピーしました"), fail);
    } catch {
      fail();
    }
  };

  const newChat = () => {
    if (busy) return;
    const first = msgs.find((m) => m.who === "u");
    if (first) {
      const messages = msgs.filter((m) => m.who !== "art").map((m) => ({ who: m.who as "u" | "a", text: m.text ?? "" }));
      setSaved((s) => [{ id: `s${seq.current}`, title: first.text ?? "", when: "さっき", messages }, ...s]);
    }
    setMsgs([]);
    setArt(null);
    setHistoryOpen(false);
  };

  const openSaved = (h: Saved) => {
    if (busy) return;
    setMsgs(h.messages.map((m) => ({ id: (seq.current += 1), who: m.who, text: m.text })));
    setArt(null);
    setHistoryOpen(false);
    scrollToEnd();
  };

  return (
    <Page className="side:max-w-[1240px]">
      <PageHeader
        title="AIに相談"
        sub="見本なので、返事は決まった台本です"
        actions={
          <>
            <Button onClick={newChat} disabled={busy} aria-label="新しい会話" title="新しい会話" className="max-rail:w-hit max-rail:px-0">
              <MessageSquarePlus aria-hidden size={18} />
              <span className="max-rail:hidden">新しい会話</span>
            </Button>
            <Button onClick={() => setHistoryOpen(true)} aria-label="履歴" title="履歴" className="max-rail:w-hit max-rail:px-0">
              <History aria-hidden size={18} />
              <span className="max-rail:hidden">履歴</span>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 side:grid-cols-[minmax(0,1fr)_360px] side:items-start">
        <div className="flex min-h-[calc(100dvh-150px)] min-w-0 flex-col max-rail:min-h-[calc(100dvh-var(--wk-tabbar-space)-96px)]">
          {/* 吹き出しの上下の余白：上は見出し、下は入力欄（スマホは＋下タブ）の高さ。見えているかの判定に使う */}
          <div
            role="log"
            aria-label="会話"
            className="grid flex-1 content-start gap-4 pt-2 pb-4 [&>*]:scroll-mt-28 [&>*]:scroll-mb-[calc(var(--wk-tabbar-space)+8.5rem)] rail:[&>*]:scroll-mb-40"
          >
            {msgs.length === 0 && (
              <div className="grid gap-2 py-2">
                <Sparkles aria-hidden size={22} className="text-accent" />
                <p className="text-fg-2">タスクの並べ替えや、計画づくりを手伝います。下の候補から選ぶか、頼みたいことを書いてください。</p>
              </div>
            )}
            {msgs.map((m) =>
              m.who === "u" ? (
                <p key={m.id} className="max-w-[min(560px,88%)] justify-self-end rounded-[18px_18px_6px_18px] bg-surface-2 px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap">
                  {m.text}
                </p>
              ) : m.who === "a" ? (
                <div key={m.id} aria-busy={m.live || undefined} className="max-w-[min(600px,96%)] justify-self-start leading-[1.8]">
                  <div className="mb-0.5 flex items-center gap-1.5 text-xs text-fg-3">
                    <Sparkles aria-hidden size={14} />
                    アシスタント
                  </div>
                  {m.live && !m.text ? (
                    <span className="inline-flex items-center gap-1 text-sm text-fg-3">
                      考えています
                      <span aria-hidden className="wk-dots" />
                    </span>
                  ) : (
                    <p className="whitespace-pre-wrap">
                      {m.text}
                      {m.live && <span aria-hidden className="wk-caret" />}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => openArt(m.art!)}
                  className={cn(
                    "flex w-[min(440px,100%)] items-center gap-3 justify-self-start rounded-md border bg-surface px-3.5 py-3 text-left transition-colors duration-[var(--wk-dur-fast)] hover:bg-surface-2",
                    wide && art === m.art ? "border-accent" : "border-line",
                  )}
                >
                  <span className="grid size-9 flex-none place-items-center rounded-sm bg-accent-soft text-accent-text">
                    <FileText aria-hidden size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block text-sm font-semibold">{m.art!.title}</b>
                    <span className="text-xs text-fg-3">{wide ? (art === m.art ? "右のパネルに表示中" : "押すと右のパネルに出します") : "押して開く"}</span>
                  </span>
                  <ChevronRight aria-hidden size={18} className="flex-none text-fg-3" />
                </button>
              ),
            )}
          </div>

          {/* 入力欄：画面の下に貼り付く（スマホでは下タブの上） */}
          <div className="sticky bottom-[calc(var(--wk-tabbar-h)+var(--wk-tabbar-gap)*2+var(--wk-safe-b))] z-10 grid gap-2 bg-linear-to-t from-canvas from-75% to-transparent pt-4 pb-1 rail:bottom-0 rail:pb-5">
            {!busy && (
              <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] rail:flex-wrap">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="h-hit flex-none rounded-full border border-line bg-surface px-3.5 text-sm text-fg-2 transition-colors duration-[var(--wk-dur-fast)] hover:border-accent hover:text-accent-text"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="flex items-end gap-2 rounded-[20px] border border-line bg-surface py-1.5 pr-1.5 pl-4 shadow-float focus-within:border-accent"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setError(false);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(140, e.target.scrollHeight)}px`;
                }}
                onKeyDown={(e) => {
                  // PC は Enter で送る（Shift+Enter で改行）。指の端末は送るボタンで送る（Enter は改行）
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && !coarse) {
                    e.preventDefault();
                    submit();
                  }
                }}
                aria-label="AIへの依頼"
                aria-invalid={error || undefined}
                aria-describedby={error ? "ai-error" : undefined}
                placeholder="AIに頼みたいことを書く"
                className="max-h-[140px] min-h-hit min-w-0 flex-1 resize-none bg-transparent py-[calc((var(--wk-hit)-1.5em)/2)] leading-normal outline-none placeholder:text-fg-3"
              />
              <button
                type="submit"
                aria-label="送る"
                aria-disabled={busy || undefined}
                // 空のうちは控えめな色（押すと「書いてください」と案内する）。書いたら主色になる
                className={cn(
                  "grid size-hit flex-none place-items-center rounded-full transition-[transform,opacity,background-color,color] duration-[var(--wk-dur-fast)] active:scale-[0.94] aria-disabled:opacity-50",
                  draft.trim() ? "bg-accent text-on-accent" : "bg-surface-2 text-fg-3",
                )}
              >
                <ArrowUp aria-hidden size={18} />
              </button>
            </form>
            {error && (
              <InlineError className="mx-2">
                <span id="ai-error">頼みたいことを書くか、上の候補から選んでください</span>
              </InlineError>
            )}
          </div>
        </div>

        {/* 右の成果物パネル（1280px 以上だけ） */}
        <aside aria-label="AIの成果物" className="sticky top-24 hidden rounded-md border border-line bg-surface p-5 side:block">
          {art ? <ArtifactView art={art} onApply={apply} onCopy={copy} /> : <EmptyState icon={Sparkles} title="AIが作った表や計画は、ここに並びます" body="下の候補から1つ頼んでみてください。" />}
        </aside>
      </div>

      <Sheet open={artOpen && !!art && !wide} onOpenChange={setArtOpen} title="AIの成果物">
        {art && <ArtifactView art={art} onApply={apply} onCopy={copy} inSheet />}
      </Sheet>

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen} title="会話の履歴" description="見本なので、この画面を離れると消えます">
        <div className="grid gap-1 pb-2">
          <button type="button" onClick={newChat} className="flex min-h-row items-center gap-3 rounded-md px-3 text-left font-medium text-accent-text hover:bg-surface-2">
            <MessageSquarePlus aria-hidden size={18} />
            新しい会話を始める
          </button>
          {saved.map((h) => (
            <button key={h.id} type="button" onClick={() => openSaved(h)} className="flex min-h-row items-center gap-3 rounded-md px-3 text-left hover:bg-surface-2">
              <History aria-hidden size={18} className="flex-none text-fg-3" />
              <span className="min-w-0 flex-1 truncate text-sm">{h.title}</span>
              <span className="flex-none text-xs text-fg-3">{h.when}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </Page>
  );
}

function ArtifactView({ art, onApply, onCopy, inSheet }: { art: Artifact; onApply: (a: Artifact) => void; onCopy: (a: Artifact) => void; inSheet?: boolean }) {
  return (
    <div className="grid gap-4">
      <div>
        {/* シートでは見出しに「AIの成果物」と出ているので重ねない */}
        {!inSheet && <div className="text-xs text-fg-3">AIの成果物</div>}
        <h2 className="text-lg leading-snug font-semibold">{art.title}</h2>
      </div>
      <ol className="grid gap-2.5">
        {art.items.map((x, i) => (
          <li key={i} className="flex gap-3">
            <span className="num grid size-6 flex-none place-items-center rounded-full bg-surface-2 text-xs font-semibold text-fg-2">{i + 1}</span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{x.text}</span>
              <span className="text-xs text-fg-3">{x.sub}</span>
            </span>
          </li>
        ))}
      </ol>
      {art.apply ? (
        <Button variant="primary" onClick={() => onApply(art)} className="justify-self-start max-rail:w-full max-rail:justify-self-stretch">
          <Sun aria-hidden size={16} />
          {art.apply}
        </Button>
      ) : (
        <Button onClick={() => onCopy(art)} className="justify-self-start max-rail:w-full max-rail:justify-self-stretch">
          <ClipboardCopy aria-hidden size={16} />
          文章をコピー
        </Button>
      )}
    </div>
  );
}

"use client";

/** 知らせる部屋：お知らせ・確認ダイアログ・バッジ・読み込み中の骨組み・空の表示 */
import { Bell, Inbox, Mail, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/kit/button";
import { ConfirmDialog } from "@/components/kit/confirm-dialog";
import { EmptyState, Skeleton } from "@/components/kit/feedback";
import { notify } from "@/components/kit/toast";
import { cn } from "@/lib/cn";
import { Exhibit, Room } from "../exhibit";

function Toasts() {
  const [count, setCount] = useState(3);
  return (
    <Exhibit
      id="toast"
      title="お知らせ（画面の下に数秒）"
      lead="押した操作の結果を画面の下に数秒出します。取り消せる操作には「取り消す」が付きます。"
      stage="plain"
      specs={["4.2 秒で自然に消える。指で払っても消える", "取り消せる操作には「取り消す」を付ける", "スマホでは下タブに重ならない高さに出る"]}
    >
      <div className="grid justify-items-center gap-3">
        <p className="text-sm text-fg-2">
          残りの下書き <span className="num font-semibold text-fg">{count}</span> 件
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="secondary" onClick={() => notify("保存しました")}>
            保存する
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (count === 0) return notify("消せる下書きはありません");
              setCount((c) => c - 1);
              notify("下書きを1件削除しました", () => setCount((c) => c + 1));
            }}
          >
            下書きを消す
          </Button>
        </div>
      </div>
    </Exhibit>
  );
}

function Confirm() {
  const [open, setOpen] = useState(false);
  const [gone, setGone] = useState(false);
  return (
    <Exhibit
      id="confirm"
      title="確認ダイアログ"
      lead="元に戻せない操作のときだけ出します。押すボタンには何が起きるかを書きます（「OK」にしない）。"
      stage="plain"
      specs={["取り消せる操作には出さない（お知らせの「取り消す」で戻す）", "ボタンは「解約する」など動詞で書く", "後ろを押す・Esc で閉じる"]}
    >
      <div className="grid justify-items-center gap-3">
        <p className="text-sm text-fg-2">{gone ? "アカウントを削除しました（見本なので何も起きていません）" : "山田工務店のアカウント"}</p>
        {gone ? (
          <Button variant="secondary" onClick={() => setGone(false)}>
            元に戻す
          </Button>
        ) : (
          <Button variant="secondary" className="text-danger" onClick={() => setOpen(true)}>
            アカウントを削除
          </Button>
        )}
      </div>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="アカウントを削除しますか？"
        body="履歴と書類もすべて消え、元に戻せません。"
        confirmLabel="削除する"
        onConfirm={() => setGone(true)}
      />
    </Exhibit>
  );
}

function Badges() {
  const [n, setN] = useState(3);
  const [bump, setBump] = useState(0);
  return (
    <Exhibit
      id="badge"
      title="バッジ（未読の数）"
      lead="アイコンの右上に数を出します。増えるとぽんと弾み、99 を超えると「99+」になります。"
      stage="plain"
      knobs={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setN((x) => x + 1);
              setBump((b) => b + 1);
            }}
            className="flex min-h-hit items-center gap-1 rounded-full border border-line px-3 text-sm"
          >
            <Plus aria-hidden size={14} />1件届く
          </button>
          <button type="button" onClick={() => setN(0)} className="min-h-hit rounded-full border border-line px-3 text-sm">
            全部読む
          </button>
          <button type="button" onClick={() => setN(120)} className="min-h-hit rounded-full border border-line px-3 text-sm">
            120件
          </button>
        </div>
      }
      specs={["数のバッジと、数を出さない点のバッジ", "増えた瞬間に弾む。0 になると消える", "99 を超えると「99+」"]}
    >
      <div className="flex items-center gap-8">
        {[
          { icon: Mail, label: "メール", dot: false },
          { icon: Bell, label: "通知", dot: true },
        ].map((b) => (
          <div key={b.label} className="relative grid justify-items-center gap-1">
            <span className="relative grid size-12 place-items-center rounded-full bg-surface-2">
              <b.icon aria-hidden size={22} />
              {n > 0 &&
                (b.dot ? (
                  <span key={bump} className="museum-pop absolute top-1 right-1 size-2.5 rounded-full bg-danger ring-2 ring-surface" />
                ) : (
                  <span key={bump} className="museum-pop num absolute -top-1 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-semibold text-on-danger ring-2 ring-surface">
                    {n > 99 ? "99+" : n}
                  </span>
                ))}
            </span>
            <span className="text-xs text-fg-2">
              {b.label}
              <span className="sr-only">（未読 {n} 件）</span>
            </span>
          </div>
        ))}
      </div>
    </Exhibit>
  );
}

function Loading() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, [loading]);
  return (
    <Exhibit
      id="skeleton"
      title="読み込み中の骨組み"
      lead="中身が届くまで、形だけの灰色の骨組みを出します。届いたら同じ場所に中身がふわっと入ります。"
      stage="plain"
      knobs={
        <button type="button" onClick={() => setLoading(true)} className="min-h-hit rounded-full border border-line px-3 text-sm">
          もう一度読み込む
        </button>
      }
      specs={["0.15 秒待ってから出す（速く読めたときにチラつかない）", "中身と同じ形・同じ高さにして、届いたときに画面がずれない", "くるくるより、何が来るかが分かる"]}
    >
      <div className="grid w-full max-w-[300px] gap-3 rounded-lg border border-line bg-surface p-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            {loading ? (
              <>
                <Skeleton className="size-10 flex-none rounded-full" />
                <div className="grid flex-1 gap-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </>
            ) : (
              <div className="flex animate-[wk-fade-in_240ms_ease-out] items-center gap-3">
                <span className="grid size-10 flex-none place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent-text">{["山", "佐", "鈴"][i]}</span>
                <div className="grid">
                  <span className="text-sm font-medium">{["山田様", "佐藤様", "鈴木様"][i]}</span>
                  <span className="text-xs text-fg-3">{["見積の返信が届きました", "契約書を確認しました", "内見の日程の相談"][i]}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Exhibit>
  );
}

function Empty() {
  const [added, setAdded] = useState(false);
  return (
    <Exhibit
      id="empty"
      title="中身が空のときの表示"
      lead="「何もありません」で終わらせず、次にできることを1つ出します。"
      stage="plain"
      specs={["何が入る場所かを見出しで言う", "次にできることのボタンを1つだけ置く", "検索で見つからないときは、条件のゆるめ方を出す"]}
    >
      <div className={cn("w-full max-w-[300px] rounded-lg border border-dashed border-line bg-surface")}>
        {added ? (
          <p className="px-4 py-10 text-center text-sm">最初のお客様を登録しました（見本なので保存はされません）</p>
        ) : (
          <EmptyState icon={Inbox} title="まだお客様がいません" body="最初の1件を登録すると、ここに一覧で並びます。" action={<Button onClick={() => setAdded(true)}>お客様を登録</Button>} />
        )}
      </div>
    </Exhibit>
  );
}

export function NotifyRoom() {
  return (
    <Room id="notify" title="知らせる" lead="結果・確認・未読・待ち時間・空の状態。使う人に状況を伝える部品の部屋です。">
      <Toasts />
      <Confirm />
      <Badges />
      <Loading />
      <Empty />
    </Room>
  );
}

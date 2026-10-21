/**
 * 表 → カードの一覧。768px 以上は普通の表、それより狭いと1行を1枚のカードにして縦に並べる（横にずらさなくても全部読める）。
 * 既存のツールの <table> を置き換えるときに使う。列の定義を1回書けば、表とカードの両方がそこから作られる。
 *
 *   <DataList
 *     label="お客さま"
 *     rows={customers}
 *     rowKey={(c) => c.id}
 *     onOpen={(c) => router.push(`/customers/${c.id}`)}
 *     columns={[
 *       { key: "name", label: "名前", cell: (c) => c.name, role: "title" },
 *       { key: "status", label: "状態", cell: (c) => <Badge>{c.status}</Badge>, role: "badge" },
 *       { key: "tel", label: "電話", cell: (c) => c.tel },
 *       { key: "amount", label: "金額", cell: (c) => yen(c.amount), align: "end" },
 *     ]}
 *   />
 *
 * role … カードでの置き場所。title＝1行目の題名（1つだけ）／badge＝題名の横の印／無し＝「名前：値」の行／hidden＝カードでは出さない
 * 表では題名以外の列は折り返さない（電話番号・金額・日付が途中で切れないように）。長い文章の列は wrap: true にする
 */
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type DataColumn<T> = {
  key: string;
  label: string;
  cell: (row: T) => React.ReactNode;
  role?: "title" | "badge" | "hidden";
  align?: "start" | "end";
  /** 表での列の幅（例："120px"・"20%"）。無ければ中身に合わせる */
  width?: string;
  /** 表でこの列の折り返しを許す（題名の列は常に折り返す） */
  wrap?: boolean;
};

export function DataList<T>({
  label,
  rows,
  columns,
  rowKey,
  onOpen,
  empty,
}: {
  /** 一覧の名前（読み上げ用。例：「お客さま」） */
  label: string;
  rows: T[];
  columns: DataColumn<T>[];
  rowKey: (row: T) => string | number;
  /** 行を押したとき（詳細へ移る・シートを開く）。無ければ押せない一覧になる */
  onOpen?: (row: T) => void;
  /** 0件のときに出す物（components/kit/feedback.tsx の EmptyState など） */
  empty?: React.ReactNode;
}) {
  if (rows.length === 0) return <>{empty}</>;
  const title = columns.find((c) => c.role === "title") ?? columns[0];
  const badges = columns.filter((c) => c.role === "badge");
  const fields = columns.filter((c) => c !== title && !c.role);

  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface">
      {/* 768px 以上：表 */}
      {/* 列が多くて収まらないときは、表の中だけ横にずらせる（画面全体は横にずれない） */}
      <div className="hidden overflow-x-auto rail:block">
        <table aria-label={label} className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-fg-3">
              {columns.map((c) => (
                <th key={c.key} scope="col" style={c.width ? { width: c.width } : undefined} className={cn("h-9 px-3 font-normal whitespace-nowrap", c.align === "end" && "text-right")}>
                  {c.label}
                </th>
              ))}
              {onOpen && <th aria-hidden className="w-hit" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={rowKey(r)}
                className={cn("border-b border-line last:border-b-0", onOpen && "transition-colors duration-[var(--wk-dur-fast)] hover:bg-surface-2")}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("h-row px-3 py-2 align-middle", c.align === "end" && "num text-right", c === title ? "min-w-48 font-medium" : !c.wrap && "whitespace-nowrap")}>
                    {c === title && onOpen ? <OpenButton onClick={() => onOpen(r)}>{c.cell(r)}</OpenButton> : c.cell(r)}
                  </td>
                ))}
                {onOpen && (
                  <td aria-hidden className="pr-2 text-fg-3">
                    <ChevronRight size={16} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 767px 以下：1行＝1枚のカード */}
      <ul aria-label={label} className="rail:hidden">
        {rows.map((r) => (
          <li
            key={rowKey(r)}
            className={cn("relative grid gap-1.5 border-b border-line px-4 py-3 last:border-b-0", onOpen && "active:bg-surface-2")}
          >
            <div className="flex min-w-0 items-start gap-2">
              <div className="min-w-0 flex-1 font-medium">{onOpen ? <OpenButton stretch onClick={() => onOpen(r)}>{title.cell(r)}</OpenButton> : title.cell(r)}</div>
              {badges.length > 0 && <div className="flex flex-none flex-wrap items-center justify-end gap-1">{badges.map((c) => <span key={c.key}>{c.cell(r)}</span>)}</div>}
              {onOpen && <ChevronRight aria-hidden size={18} className="mt-0.5 flex-none text-fg-3" />}
            </div>
            {fields.length > 0 && (
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-sm">
                {fields.map((c) => (
                  <div key={c.key} className="contents">
                    <dt className="text-fg-3">{c.label}</dt>
                    <dd className={cn("min-w-0 break-words text-fg-2", c.align === "end" && "num")}>{c.cell(r)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 題名を押せるボタンにする。stretch はカード全体に押せる範囲を広げる（表の行は Safari が position を効かせないので広げない） */
function OpenButton({ onClick, stretch, children }: { onClick: () => void; stretch?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-hit min-w-0 text-left underline-offset-4 hover:underline",
        stretch && "min-h-0 hover:no-underline after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent",
      )}
    >
      {children}
    </button>
  );
}

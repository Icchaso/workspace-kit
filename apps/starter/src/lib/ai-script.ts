/**
 * AI の返事の台本（見本）。雛形ではお金のかかる AI を呼ばず、決まった3つの依頼にだけ答える。
 * 本番では、この answer() を AI の呼び出し（AI SDK の streamText など）に差し替える。
 * 画面側は「文字が少しずつ届く」「最後に成果物が付く」形のまま使える。
 */
import type { Task } from "./tasks";

export type Artifact = {
  title: string;
  items: { text: string; sub: string; taskId?: number }[];
  /** 成果物に付ける主ボタン（例：この5件を今日に入れる）。無ければ「文章をコピー」 */
  apply?: string;
};
export type Answer = { text: string; artifact: Artifact | null };

export const SUGGESTIONS = ["今日のタスクを優先順に並べて", "期限切れを片付ける計画を立てて", "今週の振り返りを書いて"];

const DUE_TEXT: Record<Task["due"], string> = { overdue: "期限切れ", today: "今日", tomorrow: "明日", week: "今週", later: "日付なし" };
const rank = (t: Task) => ({ overdue: 0, today: 10, tomorrow: 20, week: 30, later: 40 })[t.due] + "高中低".indexOf(t.priority);

export function answer(question: string, tasks: Task[]): Answer {
  const open = tasks.filter((t) => !t.done);

  if (question === SUGGESTIONS[0]) {
    const top = [...open].sort((a, b) => rank(a) - rank(b)).slice(0, 5);
    if (!top.length) return { text: "未完了のタスクはありません。新しいタスクを追加すると、ここで並べ替えられます。", artifact: null };
    return {
      text: `未完了は${open.length}件です。「${top[0].title}」から始めて、次に優先度の高い今日のタスクへ進む順番がおすすめです。上から${top.length}件を今日の順番として並べました。`,
      artifact: {
        title: `今日の優先順（${top.length}件）`,
        items: top.map((t) => ({ text: t.title, sub: `${t.project} ・ ${DUE_TEXT[t.due]} ・ 優先度 ${t.priority}`, taskId: t.id })),
        apply: `この${top.length}件を今日に入れる`,
      },
    };
  }

  if (question === SUGGESTIONS[1]) {
    const late = open.filter((t) => t.due === "overdue");
    if (!late.length) return { text: "期限切れのタスクはありません。今のうちに明日の分を少し進めておくと安心です。", artifact: null };
    return {
      text: `期限切れは${late.length}件です。どれも15分で終わる大きさに分けました。午前中に片付ける計画です。`,
      artifact: {
        title: "期限切れを片付ける計画",
        items: late.flatMap((t) => [
          { text: `${t.title}（下準備 15分）`, sub: `${t.project} ・ まず材料をそろえる`, taskId: t.id },
          { text: `${t.title}（仕上げ 15分）`, sub: "終わったらチェックを付ける", taskId: t.id },
        ]),
        apply: "この計画のタスクを今日に入れる",
      },
    };
  }

  if (question === SUGGESTIONS[2]) {
    const done = tasks.filter((t) => t.done);
    const by = new Map<string, number>();
    done.forEach((t) => by.set(t.project, (by.get(t.project) ?? 0) + 1));
    return {
      text: `今週は${done.length}件を終えました。来週に持ち越すのは${open.length}件です。振り返りの文章を作ったので、そのまま貼れます。`,
      artifact: {
        title: "今週の振り返り",
        items: [
          { text: `終えたタスク ${done.length}件`, sub: [...by].map(([k, v]) => `${k} ${v}件`).join(" ・ ") || "まだありません" },
          { text: `持ち越し ${open.length}件`, sub: `うち期限切れ ${open.filter((t) => t.due === "overdue").length}件` },
          { text: "来週の一手", sub: "期限切れを月曜の午前に片付ける" },
        ],
      },
    };
  }

  return { text: "見本なので、決まった3つの依頼にだけ答えます。下の候補から選んでください。", artifact: null };
}

/** 履歴の見本（本番では保存した会話の一覧に差し替える） */
export const SAMPLE_HISTORY = [
  { id: "h1", title: "請求書の段取り", when: "昨日", messages: [{ who: "u" as const, text: "請求書を出す順番を決めて" }, { who: "a" as const, text: "先月と金額が同じ2社を先に出し、内容が変わる1社は確認してから出す順番にしました。" }] },
  { id: "h2", title: "講座の準備リスト", when: "3日前", messages: [{ who: "u" as const, text: "第3回講座の準備を洗い出して" }, { who: "a" as const, text: "スライド・事例2つ・質問への回答の3つに分けました。事例は前回の受講生の声から選ぶと早いです。" }] },
];

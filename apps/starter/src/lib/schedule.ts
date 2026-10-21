/** 今日の予定の見本（本番ではカレンダーの読み込みに差し替える） */
export type Slot = { time: string; end: string; title: string; place?: string };

export const SCHEDULE: Slot[] = [
  { time: "09:30", end: "10:00", title: "朝の確認", place: "オンライン" },
  { time: "11:00", end: "12:00", title: "物件の内見", place: "駅前の3階" },
  { time: "14:00", end: "15:00", title: "講座の打ち合わせ", place: "オンライン" },
  { time: "17:30", end: "18:00", title: "今日を締める" },
];

/** "HH:MM" を、その日の 0 時からの分に */
export const toMin = (hm: string) => {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
};

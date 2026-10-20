import type { Metadata } from "next";
import { TodayView } from "@/components/views/today-view";

export const metadata: Metadata = { title: "今日" };

export default function TodayPage() {
  return <TodayView />;
}

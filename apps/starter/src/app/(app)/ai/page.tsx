import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { EmptyState, Page, PageHeader } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "AIに相談" };

// AI相棒型の画面（会話＋成果物）は段階3で作る。今は骨格の確認用
export default function AiPage() {
  return (
    <Page>
      <PageHeader title="AIに相談" sub="タスクの並べ替えや計画づくりを手伝う画面" />
      <EmptyState icon={Sparkles} title="ここに AI との会話が入ります" body="PCでは右に成果物のパネル、スマホでは成果物を全画面で開く形になります。" />
    </Page>
  );
}

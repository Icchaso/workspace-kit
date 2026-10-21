import type { Metadata } from "next";
import { AiView } from "@/components/views/ai-view";

export const metadata: Metadata = { title: "AIに相談" };

export default function AiPage() {
  return <AiView />;
}

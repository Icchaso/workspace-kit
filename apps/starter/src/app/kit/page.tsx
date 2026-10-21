import type { Metadata } from "next";
import { KitShowcase } from "./showcase";

export const metadata: Metadata = {
  title: "見本",
  description: "Workspace Kit の見本。テーマと画面の型を切り替えて、スマホと PC の見え方を並べて確かめられます。",
};

export default function KitPage() {
  return <KitShowcase />;
}

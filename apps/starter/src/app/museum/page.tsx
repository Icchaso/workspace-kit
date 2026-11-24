import type { Metadata } from "next";
import { Museum } from "./museum";

export const metadata: Metadata = {
  title: "UI博物館",
  description: "Workspace Kit で作れる UI の部品と動きを、その場で触って試せる見本。ボタン・スイッチ・スライダー・ゲージ・スクロール・シートなど。",
};

export default function MuseumPage() {
  return <Museum />;
}

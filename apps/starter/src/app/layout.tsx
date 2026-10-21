import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_JP } from "next/font/google";
import { WorkspaceBoot } from "@/components/shell/boot-script";
import "./globals.css";

/*
 * 日本語フォントは文字数が多いので先読みしない（preload: false）。
 * 読み込み中は端末の日本語フォント（ヒラギノ・Yu Gothic UI・メイリオ）で表示され、届いたら差し替わる。
 */
const plex = IBM_Plex_Sans_JP({
  weight: ["400", "500", "600"],
  preload: false,
  display: "swap",
  variable: "--wk-font-jp",
});

export const metadata: Metadata = {
  title: { default: "Kit タスク帳", template: "%s | Kit タスク帳" },
  description: "Workspace Kit の雛形。PCでもスマホでも整ったUI/UXで動くタスク管理ツール",
  appleWebApp: { capable: true, title: "Kit タスク帳", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#161615" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={plex.variable} suppressHydrationWarning>
      <head>
        <WorkspaceBoot />
      </head>
      <body>{children}</body>
    </html>
  );
}

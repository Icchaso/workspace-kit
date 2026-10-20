import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_JP } from "next/font/google";
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

/*
 * 明るさ・密度・サイドバーの開閉を、描画の前に <html> へ反映する（ちらつき防止）。
 * 保存先はこのブラウザだけ（localStorage）。読めなくても既定値で正しく表示される。
 */
const bootScript = `try{var d=document.documentElement,s=localStorage;var t=s.getItem("wk.theme");if(t==="light"||t==="dark")d.dataset.theme=t;var n=s.getItem("wk.density");if(n==="compact")d.dataset.density=n;if(s.getItem("wk.sidebar")==="collapsed")d.dataset.sidebar="collapsed"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={plex.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

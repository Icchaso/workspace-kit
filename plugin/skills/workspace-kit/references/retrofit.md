# 今のツールに入れる（後付け）

完了の定義：相手のツールの機能（ログイン・一覧・保存・送信など）が今まで通り動き、ナビ・色・文字が Workspace Kit にそろい、検査台本が全部合格し、入れる前と後の画像（375px と 1280px）を並べて見せた状態。

必ず別のブランチで作業する（`git switch -c workspace-kit`）。本番への反映は相手が決める。

## 1. 偵察（読むだけ。まだ何も変えない）
| 見る物 | どこで | 決まること |
|---|---|---|
| Next.js と Tailwind の版 | `package.json` | 入れ方（SKILL.md の「対応している環境」） |
| `src/` があるか・`app/` の場所 | フォルダ | 置き先（shadcn は `src/` があれば自動でその下に置く） |
| `globals.css` の場所と中身 | `app/globals.css` | CSS の差し込み先。色の書き方（HEX・OKLCH・HSL・shadcn の変数） |
| 今のナビ | `layout.tsx`・`components/` の header・sidebar・nav を grep | 骨格に差し替える範囲 |
| 画面の一覧 | `app/**/page.tsx` | `config/nav.ts` の項目。ナビが要らない画面（ログインなど） |
| ブランド色 | CSS とよく使われる色のクラス | `--wk-accent` 系に移す色 |
| 名前がぶつかる物 | `components/kit/`・`components/shell/`・`config/nav.ts`・`config/shell.tsx`・`lib/cn.ts`・`lib/prefs.ts`・`app/workspace-kit.css` | 有れば相手に見せて、名前を変えるか決めてもらう |
| `components.json` | ルート | 無ければ作る（new.md と同じ中身。`css` は相手の globals.css の場所に合わせる） |

入れる前の画像を撮っておく：SKILL.md の「検査」を `ROUTES=<主な画面>` で流し、`screenshots/wk-before/` に保存する（落ちた項目の数も控える）。
- ログインが要るツールは、本物のパスワードを使わない。手元だけの試験用の利用者でログインしたクッキーを `COOKIES='名前=値;名前=値'` で検査台本に渡す（Supabase なら試験用のプロジェクトか、手元のにせの認証サーバー。本番の顧客データの画面を撮って人に見せない）

## 2. 計画を見せて承認を取る
次の形で1枚にまとめて見せる。承認が出るまで手を付けない。
| # | 変えること | 相手から見えるもの | 戻し方 |
|---|---|---|---|
| 1 | CSS（トークン・テーマ・土台）を足す | 文字の字体・背景の色が少し変わる | `@import` の1行を消す |
| 2 | 骨格に差し替える（今のヘッダー／サイドバーを外す） | スマホは下タブ、PC はサイドバーになる | ブランチを戻す |
| 3 | 色をトークンに置き換える | ボタン・枠・文字の色がそろう | 〃 |
| 4 | 部品を置き換える（確認ダイアログ→取り消し、など） | 操作の作法が変わる | 〃 |
3〜4 は画面ごとに分けて進めてよいかも聞く。

## 3. 入れる
### 3-1. CSS
```bash
pnpm dlx shadcn@4.21.3 add https://workspace-kit.vercel.app/r/workspace-kit-css.json --yes
```
`globals.css` の `@import "tailwindcss";` のすぐ後に `@import "./workspace-kit.css";` を足す。
- `globals.css` に残っている「層の外の `body { font-family / background / color }`」と、`@theme` の `--font-sans` の上書きは外す（create-next-app の初期の CSS にも入っている）。残すと Workspace Kit の字体と色が負け、テーマを変えても地の色が変わらない
- shadcn の変数（`--background`・`--primary` など）を使っている場合は、消さずに Workspace Kit の値へつなぎ替える（例：`--background: var(--wk-canvas); --foreground: var(--wk-fg); --primary: var(--wk-accent); --primary-foreground: var(--wk-on-accent); --border: var(--wk-line); --muted-foreground: var(--wk-fg-3);`）。既存の部品はそのまま新しい色になる
- 相手のブランド色は `--wk-accent`・`--wk-on-accent`・`--wk-accent-soft`・`--wk-accent-text` の4つだけを上書きする（ライトとダークの両方。文字と背景の差 4.5:1 以上を確かめる）。近い色のテーマがあれば、それを `defaultPalette` にするほうが早い（緑ならクリニック）
- **色の橋**：既存の画面が Tailwind の色の名前（`text-gray-500`・`bg-green-600`・`text-red-600` など）を直接使っているときは、何百か所を書き換える前に、`globals.css` の `@theme inline` でその名前の行き先をトークンにつなぎ替える。テーマを変えると既存の画面も一緒に変わり、コントラストもトークン側でそろう。種類を見分ける印に使っている色（青・紫のバッジなど）は残す
```css
@theme inline {
  --color-gray-50: var(--wk-canvas);   --color-gray-100: var(--wk-surface-2);
  --color-gray-200: var(--wk-line);    --color-gray-300: var(--wk-line);
  --color-gray-400: var(--wk-fg-3);    --color-gray-500: var(--wk-fg-3);
  --color-gray-600: var(--wk-fg-2);    --color-gray-700: var(--wk-fg-2);
  --color-gray-800: var(--wk-fg);      --color-gray-900: var(--wk-fg);
  --color-green-50: var(--wk-accent-soft); --color-green-600: var(--wk-accent); --color-green-700: var(--wk-accent-text);
  --color-red-50: var(--wk-danger-soft);   --color-red-600: var(--wk-danger);
  --color-yellow-100: var(--wk-warn-soft); --color-yellow-700: var(--wk-warn);
  --color-white: var(--wk-surface);
}
```
- `text-[10px]`・`text-[11px]` は `text-xs`（12px）に、色コードの直書き（`text-[#E57373]` など）は近い意味のトークンにする
- **指の端末の底上げ**：PC 向けの大きさ（`py-2`・`text-sm`）で作られた画面が多いときは、画面ごとに直す前に `globals.css` の層の外に次を足す。マウスの PC の見た目は変わらない
```css
@media (pointer: coarse) {
  #main :is(a[href], button, select, [role="button"]):not(:where(p a, li > p a, span a)) { min-height: var(--wk-hit); min-width: var(--wk-hit); }
  #main :is(a[href], button):is(:not([class*="flex"]):not([class*="block"]):not([class*="grid"])) { display: inline-flex; align-items: center; }
  #main :is(input:not([type="checkbox"]):not([type="radio"]), select, textarea) { font-size: max(16px, 1em); min-height: var(--wk-hit); }
  #main label:has(> input:is([type="checkbox"], [type="radio"])) { min-height: var(--wk-hit); }
}
```

### 3-2. 骨格
```bash
pnpm dlx shadcn@4.21.3 add https://workspace-kit.vercel.app/r/workspace-kit-shell.json --yes
```
つなぐ場所は4つ：
1. ルートの `app/layout.tsx`：`<html lang="ja" suppressHydrationWarning>`、`<head>` に `<WorkspaceBoot />`（`@/components/shell/boot-script` から）。既存の画面にダーク表示の用意が無いときは `<WorkspaceBoot forceTheme="light" />` で明るさを固定する（⌘K の明るさの切り替えも隠れる。ダーク対応は画面ごとに後から）。日本語の字体は `next/font/google` の `IBM_Plex_Sans_JP`（`weight: ["400","500","600"]`, `preload: false`, `display: "swap"`, `variable: "--wk-font-jp"`）を `<html className>` に付ける
2. ナビを出す画面をまとめたレイアウト（例：`app/(app)/layout.tsx`）で `<AppFrame>{children}</AppFrame>` で包む。ログインなどナビの要らない画面はこのグループの外に置く。サーバー側でログインを確かめている入れ物（`AppShell` など）があれば、その確認は残して中身だけ `AppFrame` に差し替える。二重に包んでいる画面が無いか grep する
3. `config/nav.ts` の `NAV` を相手の画面に書き換える（`short` は全角4文字まで・アイコンは lucide-react）。項目が6つ以上か、`useAccount` を使うときは、スマホの下タブは先頭4つ＋「もっと」になり、残りはその中のシートに並ぶ。よく使う順に並べる
4. `config/shell.tsx` の `APP`（名前・頭文字）。ログイン中の人の名前とログアウトは `useAccount()` に返す（PC はサイドバーの下、スマホは「もっと」の中、⌘K にも出る）。メールなどサーバーで分かる値は、入れ物から Context で渡す。「追加」の操作があるなら `AddSheet` にそのシートを、⌘K で探させたい物があれば `useExtraCommands` に足す。データの入れ物（Provider）があれば `ShellProviders` で包む

今のヘッダー・サイドバー・下のナビは外す（残すとナビが2つになる。検査台本がナビの数を数えて落とす）。
`useSearchParams` を使う画面は `<Suspense>` で包む（Next.js 16 で事前の描画が止まるため）。

### 3-3. 部品と色
```bash
pnpm dlx shadcn@4.21.3 add https://workspace-kit.vercel.app/r/workspace-kit-ui.json --yes
```
画面ごとに、相手のコードを読んでから置き換える。全部を一度に変えない。
- 色コード（`#2563eb`・`bg-blue-600`・`text-gray-500` など）→ トークンのクラス（`bg-accent`・`text-fg-3` など。対応は [rules.md](rules.md)）
- 押せる物の高さ → `h-hit`（マウス 36px／指 44px を自動で切り替え）
- 確認ダイアログ → 元に戻せる操作は確認を挟まず、お知らせの「取り消す」で戻す（`components/kit/toast.tsx` の `notify`）
- スマホでの詳細 → 下から出るシート（`components/kit/sheet.tsx`）
- 待ちのあるボタン → `components/kit/button.tsx` の `PendingButton`（`pending` と `pendingLabel`。押した瞬間に「◯◯しています」に変わり、二度押しを受け付けない）

## 4. 確かめる
1. `pnpm build` と `pnpm lint` が通る
2. 相手のツールの主な操作を実際に押して通す（ログイン → 一覧 → 保存・送信は、外に送る物なら送る直前で止める）。画面が開くだけでは確かめたことにしない
3. 検査台本を入れる前と同じ `ROUTES` で流し、全部合格にする
4. 前後の画像（375px と 1280px）を横に並べて見せ、変えたことを表にして報告する

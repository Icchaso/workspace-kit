# 新しく作る

完了の定義：相手のパソコンで新しいアプリが動き、検査台本が全部合格し、スマホ幅と PC 幅の画像を見せた状態。

## 1. 聞くこと（1回にまとめて聞く）
| 項目 | 例 | 決まらなければ |
|---|---|---|
| アプリの名前と頭文字 | 「受注ノート」「受」 | 仮の名前で進め、後で `config/shell.tsx` を直せばよいと伝える |
| 画面（ナビの項目）と並び順 | 今日・受注・お客さま・設定 | 見本の4画面のまま始める |
| 画面の型 | A 指令室（一覧＋詳細）／B 現場（大きいカード＋主ボタン）／C AI相棒（会話＋成果物） | 見本は3つとも入っているので、使わない型は後で消す |
| テーマ | https://workspace-kit.vercel.app/kit を開いて選んでもらう | グラファイト（落ち着いた灰色と青） |
| 置き場所 | `~/projects/juchu-note` | 今いるフォルダの下 |

## 2. 作る
フォルダ名は英小文字とハイフン。Node.js 20 以上と pnpm が要る（無ければ `npm i -g pnpm`）。
```bash
pnpm dlx create-next-app@16.4.2 juchu-note --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes --disable-git
cd juchu-note
```
shadcn の設定ファイル `components.json` を置く（`shadcn init` は使わない。init が入れる別の色の変数とボタンが混ざるため）：
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": { "config": "", "css": "src/app/globals.css", "baseColor": "neutral", "cssVariables": true, "prefix": "" },
  "iconLibrary": "lucide",
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" }
}
```
雛形一式を入れて、create-next-app が作った最初のページを消す（見本の「今日」の画面と同じ `/` を取り合うため）：
```bash
pnpm dlx shadcn@4.21.3 add https://workspace-kit.vercel.app/r/workspace-kit-starter.json --yes --overwrite
rm src/app/page.tsx
pnpm build
```
`pnpm build` が通らなければ、エラーを読んで直してから先へ進む。

`next.config.ts` に `allowedDevOrigins: ["127.0.0.1"]` を足す（Next.js 16 の開発サーバーは、許可していない住所から開くと画面の部品が動かないことがある。スマホで見るならパソコンの IP アドレスも足す）。

## 3. 相手のアプリにする
| 直す場所 | 何を |
|---|---|
| `src/config/shell.tsx` の `APP` | 名前・頭文字・追加ボタンの文言・⌘K の案内文 |
| `src/config/nav.ts` の `NAV` | 画面の項目と順番（下タブに出るのは先頭5つ。`short` は全角4文字まで） |
| `src/app/layout.tsx` | `metadata` の題名と説明、`<WorkspaceBoot defaultPalette="sky" />` で既定のテーマ（グラファイトなら指定なし） |
| `src/app/(app)/` | 画面を足すときはここにフォルダを作る。ナビに出すなら `NAV` にも足す |
| 見本のタスク | `src/lib/tasks.tsx` が見本データ（このブラウザの中だけに保存）。本物のデータ（データベース）につなぐのは次の段階として別に相談する |

画面を足すときは見本の画面（`src/components/views/`）を真似る。数値と作法は [rules.md](rules.md)。

## 4. 確かめて見せる
1. SKILL.md の「検査」を流す（見本のままなら `DEMO=1` を付けると見本の操作も確かめる）
2. 落ちた項目を直して全部合格にする
3. スマホ 390 と PC 1440 の画像（ライト/ダーク）を見せる
4. `pnpm dev` で起動し、相手に `http://127.0.0.1:3000` を開いてもらう（localhost より 127.0.0.1 のほうが古い Cookie で開かなくなる事故が起きにくい）。スマホで触るなら、同じ Wi-Fi で `pnpm dev -H 0.0.0.0` にしてパソコンの IP アドレスで開く

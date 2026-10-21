---
name: workspace-kit
description: Workspace Kit で業務ツールの画面を PC でもスマホでも整える。「Workspace Kit で新しくツールを作りたい」「今のツールを Workspace Kit で整えて」「テーマを〇〇にして」「スマホで崩れてないか見て」と言われたとき、または Next.js＋Tailwind のアプリでナビ・ボタン・シート・色・文字・動きを整えたいときに使う。
---

# Workspace Kit

業務ツールの土台一式。入れると、ナビ（スマホ＝下タブ／タブレット＝アイコン列／PC＝サイドバー）・ボタン・下から出るシート・お知らせ・⌘K パレット・色・文字・動きがそろう。
見本：https://workspace-kit.vercel.app/kit （テーマと画面の型を切り替えて、スマホ幅と PC 幅を並べて見られる）

部品は shadcn の registry 形式で配っている。相手のアプリにソースが直接入るので、入れた後は自由に直してよい。

| 名前 | 中身 | URL |
|---|---|---|
| workspace-kit-css | トークン（色・文字・余白・角丸・影・動き・押せる大きさ）＋テーマ12種＋土台と骨格の CSS。`app/workspace-kit.css` の1枚 | https://workspace-kit.vercel.app/r/workspace-kit-css.json |
| workspace-kit-ui | 部品（`components/kit/`）：ボタン・シート・お知らせ・確認ダイアログ・切り替え・空の状態・数字が回る表示・右下の主ボタン・手順表示 | https://workspace-kit.vercel.app/r/workspace-kit-ui.json |
| workspace-kit-shell | 骨格（`components/shell/`）：3段階のナビ・⌘K パレット・キーボードの近道・描画前の台本。アプリごとに書くのは `config/nav.ts` と `config/shell.tsx` だけ | https://workspace-kit.vercel.app/r/workspace-kit-shell.json |
| workspace-kit-starter | 上の全部＋見本のタスク管理アプリ（画面の型 A 指令室・B 現場・C AI相棒・設定） | https://workspace-kit.vercel.app/r/workspace-kit-starter.json |

下の部品は上の部品を自動で連れてくる（starter → shell → ui → css）。
版を固定したいときは `/r/v0.2.0/<名前>.json`（出した版：v0.1.0・v0.2.0） を使う（つながる部品も同じ版になる）。後で「Workspace Kit を更新して」と頼まれたら、入れた版と最新の差分を見せてから当てる。

## 最初に必ずやること
1. 相手（使う人）は非エンジニアのことが多い。説明は日本語で、専門用語は残して初出で括弧書きの意味を添える
2. どの使い方かを決める。言葉から分からなければ1回だけ聞く：
   - 新しく作る → [references/new.md](references/new.md)
   - 今のツールに入れる（後付け） → [references/retrofit.md](references/retrofit.md)
   - テーマを変える → [references/themes.md](references/themes.md)
   - スマホで崩れていないか見る → 下の「検査」
3. 画面を作る・直すときの数値と作法は [references/rules.md](references/rules.md) に従う（ここに書いた数値は見本と検査台本と同じ）

## 対応している環境
| 相手のアプリ | できること |
|---|---|
| Next.js（App Router）＋ Tailwind v4 | 全部（新規・後付け・テーマ・検査） |
| Next.js ＋ Tailwind v3 | 先に公式の移行ツール `npx @tailwindcss/upgrade` で v4 にする（相手の承認を取ってから・別ブランチで）。しないなら「軽い入れ方」 |
| React＋Tailwind v4（Vite など Next.js 以外） | 「軽い入れ方」：workspace-kit-css と workspace-kit-ui だけ（骨格は next/link・next/navigation を使うので入らない） |
| それ以外 | CSS の変数（トークン）と rules.md の作法だけを入れる |

## 検査（スマホで崩れていないか見る）
検査台本 `scripts/check-ui.mjs`（このスキルのフォルダにある）を相手のプロジェクトの `scripts/wk-check-ui.mjs` にコピーして使う（読み込む部品が相手の node_modules に要るため）。
```bash
pnpm add -D @playwright/test @axe-core/playwright
pnpm exec playwright install chromium
pnpm build && pnpm start --port 3999
node scripts/wk-check-ui.mjs http://127.0.0.1:3999 screenshots/wk-check
```
- 見る画面は `ROUTES=/,/orders,/settings` のように並べる。ナビが無いのが正しい画面（ログインなど）は `NO_NAV=/login`
- ログインが要る画面は、手元の試験用の利用者のクッキーを `COOKIES='名前=値'` で渡す。本物のパスワードや本番の顧客データは使わない
- 6つの幅（375・390＝指／768・1024・1280・1440＝マウス）× ライト/ダークで撮影し、はみ出し・ナビの有無・12px 未満の文字・指で 44px 未満の押せる物・16px 未満の入力欄・axe（コントラストなど）・下タブの動き・コンソールのエラーを数値で合否にする
- 落ちた項目は日本語でそのまま伝え、直してからもう一度流す。全部合格したら、撮った画像（スマホ 390 と PC 1440 のライト/ダーク）を見せて終える
- 検査はサーバーを立ててから流す。`next dev` ではなく `next build` → `next start` で測る（dev は遅く、動きの数値がぶれる）

## やってはいけないこと
- 相手の既存のファイルを黙って上書きしない。`shadcn add` の前に、同じパス（`components/kit/`・`components/shell/`・`config/nav.ts`・`config/shell.tsx`・`lib/cn.ts`・`lib/prefs.ts`・`app/workspace-kit.css`）が無いか確かめ、あれば相手に見せて決めてもらう
- 後付けで画面の見た目を3か所以上変えるときは、先に計画を見せて承認を取る
- 部品に色コードを直接書かない。必ずトークン（`bg-surface`・`text-fg-2`・`border-line`・`bg-accent` など）を通す
- 「検査に合格した」を「実機で問題ない」と言い換えない。iPhone の Safari での手触り（下タブ・シート・キーボード）は相手に実機で触ってもらう

# Workspace Kit

業務ツールの画面を、PC でもスマホでも整った UI/UX にする土台一式。
入れると、ナビ（スマホ＝下タブ／タブレット＝アイコン列／PC＝サイドバー）・ボタン・下から出るシート・お知らせと取り消し・⌘K パレット・色・文字・動きがそろう。

- 見本：https://workspace-kit.vercel.app/kit （テーマ12種と画面の型を切り替えて、スマホ幅と PC 幅を並べて見られる）
- 見本のアプリ：https://workspace-kit.vercel.app （タスク管理。スマホでも開ける）

![PC とスマホで同じタスク一覧を開いたところ。PC は左のサイドバー・一覧・右の詳細、スマホはカードの並びと下の浮いたタブ](docs/images/hero.jpg)

## どんな見た目か
落ち着いた業務ツールの見た目です。主役は中身（一覧・数字・文章）で、色は「押せる物」と「状態（期限切れなど）」にだけ使います。
下の画像はすべて見本のタスク管理アプリを、そのまま撮ったものです（左が PC 1440px、右がスマホ 390px）。

### 画面の幅で、ナビの形だけが変わる
| 画面の幅 | ナビの形 |
|---|---|
| 1280px 以上（PC） | 左のサイドバー（畳める） |
| 768〜1279px（タブレット・PC の画面を半分にした時） | アイコンだけの細い列 |
| 767px 以下（スマホ） | 下に浮いたタブ（5つまで。6つ以上は先頭4つ＋「もっと」） |

項目と並び順はどの幅でも同じなので、PC で覚えた場所がスマホでもそのまま使えます。

### 画面の型は3つ（混ぜて使える）
**A 指令室**：一覧＋詳細。PC は表と右の詳細パネル、スマホは1行1枚のカードになり、押すと下から詳細が出ます（上の画像）。

**B 現場**：大きな数字のカード・今日の予定・右下の主ボタン。片手で操作する人向け。
![今日の画面。PC は数字のカード3枚と今日やること・今日の予定の2列、スマホは縦に1列](docs/images/type-b.jpg)

**C AI相棒**：会話と成果物。PC は成果物が右のパネルに出て、スマホは成果物のカードを押すと下からシートで開きます。
![AIに相談の画面。PC は会話の右に成果物「今週の振り返り」、スマホは会話と成果物のカード](docs/images/type-c.jpg)

### 操作の作法
⌘K（Ctrl+K）で、どの画面からでも探す・移動する・操作するができます。スマホでは詳細や操作が下から出るシートになり、つまみを下に引くと閉じます。
![左：PC で ⌘K を開いて「請求」で探したところ。中：スマホの詳細シート。右：長押しで出る操作のシート](docs/images/interactions.jpg)

- 戻せる操作（完了・明日に回す・削除）は確認を挟まず、お知らせの「取り消す」で戻せます。確認の画面を出すのは、戻せない操作（外への送信・お金・本番データの削除）だけ、という作法です
- 待ちのあるボタンは、押した瞬間に「◯◯しています」に変わり、二度押しを受け付けません
- 押せる物の大きさは、画面の幅ではなく「指かマウスか」で変わります（マウス 36px／指 44px）

### ダーク表示
すべての色はライトとダークの両方を持っています。端末の設定に合わせるか、⌘K と設定画面で切り替えます。
![ダーク表示。PC のタスク一覧とスマホの今日の画面](docs/images/dark.jpg)

### テーマ12種
色・字体・角丸の組み合わせを12種から選べます（自分のブランド色1色だけ差し替えることもできる）。どのテーマも文字と背景の明るさの差（コントラスト比）が 4.5:1 以上になるよう自動で確かめています。ナイトはダーク専用です。
![テーマ6種：グラファイト・クリニック・ナイト・スカイ・ネイビー・ラベンダー](docs/images/themes-1.jpg)
![テーマ6種：インク・カフェ・リーフ・テラコッタ・ポップ・ディープティール](docs/images/themes-2.jpg)

### 細かい決まり
- 文字：本文 15px、入力欄 16px（iPhone で入力欄を押した時の自動の拡大を防ぐ）。12px より小さい文字は使わない
- 上下のバーだけ半透明でぼかし、本文は不透明（iOS 26 の Liquid Glass と同じ役割分担）。端末の「透明度を下げる」「視差効果を減らす（動きを減らす）」に従う
- 下タブの選択の板は約 0.18 秒で次のタブへ滑る。行き過ぎて揺れる動きは使わない
- 色は直接書かず、名前の付いた色（トークン。`bg-surface`・`text-fg-2`・`bg-accent` など）を通す。テーマを変えると全部の画面が一緒に変わる

画像は検査台本と同じ見本アプリから撮っています。実物は https://workspace-kit.vercel.app （スマホでも開けます）。

## 使い方（Claude Code から）
```
/plugin marketplace add Icchaso/workspace-kit
/plugin install workspace-kit@workspace-kit
```
あとは日本語で頼むだけ：「Workspace Kit で新しくツールを作りたい」「今のツールを Workspace Kit で整えて」「テーマをラベンダーにして」「スマホで崩れてないか見て」。
手順の中身は [plugin/skills/workspace-kit/](plugin/skills/workspace-kit/SKILL.md)。

## 使い方（shadcn CLI で部品だけ）
```bash
pnpm dlx shadcn@4.21.3 add https://workspace-kit.vercel.app/r/workspace-kit-shell.json
```
| 名前 | 中身 |
|---|---|
| `workspace-kit-css` | トークン＋テーマ12種＋土台と骨格の CSS（`app/workspace-kit.css`） |
| `workspace-kit-ui` | 部品（`components/kit/`） |
| `workspace-kit-shell` | 骨格（`components/shell/`）。アプリごとに書くのは `config/nav.ts` と `config/shell.tsx` だけ |
| `workspace-kit-starter` | 上の全部＋見本のタスク管理アプリ |

## このリポジトリの中身
| 場所 | 中身 |
|---|---|
| `apps/starter/` | 雛形（見本のタスク管理アプリ）と見本サイト（`/kit`）。配る部品の正本 |
| `packages/tokens/` | トークン（色・文字・余白・角丸・影・動き・押せる大きさ）と土台の CSS |
| `packages/themes/` | テーマ変換（awesome-design-skills の67種 → 日本語の字体の組み合わせ＋コントラスト調整）。`pnpm --filter @workspace-kit/themes build` |
| `registry/templates/` | 後付け用の `config/` の最小の見本 |
| `scripts/build-registry.mjs` | 配る部品（`apps/starter/public/r/*.json`）とプラグインの写しを作る。雛形のビルドのたびに自動で動く |
| `scripts/check-ui.mjs` | 画面の検査台本（6つの幅 × ライト/ダーク。はみ出し・ナビ・文字・押せる大きさ・コントラスト・動き） |
| `plugin/` | Claude Code プラグイン（スキル `workspace-kit`） |
| `設計書/判断記録/` | 決めたことと理由 |

## 作業の命令
```bash
pnpm install
pnpm dev                      # 雛形を開発用に起動
pnpm build                    # 全部ビルド（配る部品も作り直す）
pnpm check:ui http://127.0.0.1:3456 screenshots/check   # next start で起動してから検査
```

## ライセンス
未定（決まり次第ここに書く）。第三者の著作物は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

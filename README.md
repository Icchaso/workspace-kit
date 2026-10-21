# Workspace Kit

業務ツールの画面を、PC でもスマホでも整った UI/UX にする土台一式。
入れると、ナビ（スマホ＝下タブ／タブレット＝アイコン列／PC＝サイドバー）・ボタン・下から出るシート・お知らせと取り消し・⌘K パレット・色・文字・動きがそろう。

- 見本：https://workspace-kit.vercel.app/kit （テーマ12種と画面の型を切り替えて、スマホ幅と PC 幅を並べて見られる）
- 見本のアプリ：https://workspace-kit.vercel.app （タスク管理。スマホでも開ける）

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

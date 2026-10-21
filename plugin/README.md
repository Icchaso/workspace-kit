# Workspace Kit（Claude Code プラグイン）

業務ツールの画面を、PC でもスマホでも整った UI/UX にする土台一式です。
見本：https://workspace-kit.vercel.app/kit

## 入れ方
Claude Code で次の2行を打ちます。
```
/plugin marketplace add Icchaso/workspace-kit
/plugin install workspace-kit@workspace-kit
```

## 使い方（Claude Code に日本語で頼むだけ）
| 頼み方 | すること |
|---|---|
| 「Workspace Kit で新しくツールを作りたい」 | 名前・画面・テーマを聞いて、見本と同じ土台のアプリを作り、検査して画像を見せる |
| 「今のツールを Workspace Kit で整えて」 | 今の作りを読み、変える場所の計画を見せる。承認すると別のブランチで差し替える |
| 「テーマをラベンダーにして」 | 12種のテーマから変える。ブランド色だけ変えることもできる |
| 「スマホで崩れてないか見て」 | 6つの幅 × ライト/ダークで撮影し、はみ出し・押せる大きさ・文字の小ささ・コントラスト・動きを数字で確かめる |

## 動く環境
- Next.js（App Router）＋ Tailwind CSS v4：全部
- React ＋ Tailwind CSS v4（Next.js 以外）：色・文字のトークンと部品だけ
- Node.js 20 以上、pnpm

## 著作権の表示
テーマの元の色・文字は awesome-design-skills（Copyright (c) 2026 Bergside, MIT License）。詳しくはリポジトリの THIRD_PARTY_NOTICES.md。

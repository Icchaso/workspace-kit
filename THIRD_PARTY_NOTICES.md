# 第三者の著作物の表示（THIRD_PARTY_NOTICES）

Workspace Kit は次の著作物を使っています。各ライセンスの条件に従って表示します。

## 配布物に含めているもの

### awesome-design-skills（テーマの元の色・文字・角丸）
- 使い方：67種のテーマの色・字体・角丸の値を読み取り、日本語の字体の組み合わせとコントラストの調整を加えて `packages/themes/dist/*.css` に変換した（配る `workspace-kit.css` の「テーマ12種」の部分）
- ライセンス：MIT License
- 著作権：Copyright (c) 2026 Bergside
- 全文：`packages/themes/source/LICENSE-awesome-design-skills`（配る `workspace-kit.css` の先頭にも、この表示と全文の場所を書いている）

## 使う人のアプリに入る部品（npm から入る。配布物には含めていない）
| 名前 | 版 | ライセンス |
|---|---|---|
| @base-ui/react | 1.9.0 | MIT |
| class-variance-authority | 0.7.1 | Apache-2.0 |
| clsx | 2.1.1 | MIT |
| lucide-react | 1.59.0 | ISC |
| motion | 14.4.0 | MIT |
| sonner | 2.0.8 | MIT |
| tailwind-merge | 3.7.0 | MIT |
| vaul | 1.1.2 | MIT |
| next / react / tailwindcss | 16.4.2 / 19.3.0 / 4.x | MIT |

## 道具（作るときと検査のときだけ使う）
| 名前 | 版 | ライセンス |
|---|---|---|
| shadcn（CLI。部品を入れる道具として使う。shadcn/ui の部品のコードは含めていない） | 4.21.3 | MIT |
| @playwright/test | 1.64.1 | Apache-2.0 |
| @axe-core/playwright / axe-core | 4.14.0 | MPL-2.0 |
| culori（テーマ変換の色計算） | 4.0.2 | MIT |

## 字体（Google Fonts。配布物には含めていない）
Next.js の `next/font` を使うと、作るときに Google Fonts から字体を取り寄せ、使う人のアプリ自身のサーバーから配る（見る人の端末が Google へ直接つながらない）。`<link>` で Google Fonts を読み込む作りに変えた場合は、見る人の端末が Google のサーバーにつながる点をプライバシーの説明に書くこと。

仕上げ12種が使う字体：IBM Plex Sans・IBM Plex Sans JP・Noto Sans JP・Noto Serif JP・Zen Maru Gothic・M PLUS Rounded 1c・Plus Jakarta Sans・Inter・Roboto・Open Sans・Poppins・Nunito・DM Serif Display・Oswald。いずれも Google Fonts で SIL Open Font License 1.1（OFL）として公開されているもの。変換のみの56種が使う字体は `packages/themes/dist/catalog.json` の `fonts` にあります。

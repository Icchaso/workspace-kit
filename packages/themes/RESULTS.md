# テーマの変換結果

`node packages/themes/convert.mjs` が書き出す（手で書き換えない）。元は awesome-design-skills の 67種（MIT）。

- 合否の基準：文字と背景の組（15組：fg/canvas、fg/surface、fg-2/surface、fg-2/canvas、fg-3/surface、fg-3/canvas、fg-3/surface-2、accent-text/surface、accent-text/accent-soft、on-accent/accent、ok/ok-soft、warn/warn-soft、danger/danger-soft、danger/surface、on-danger/danger）の、いちばん低いコントラスト比が 4.5 以上
- 落ちた色は、色味を保ったまま明るさだけを 0.01 ずつ動かして 4.6 まで直す（「明るさを直した色」の欄）。それでも届かないものは除外
- 数：仕上げ 12種／変換済み・手直し前 56種／除外（コントラスト） 0種／除外（他社名） 11種
- 主色からは 50〜950 の11段階を作り、`--wk-accent-50` … `--wk-accent-950` で使える（Tailwind では `bg-accent-100` など）
- 元の余白（spacing の sm／md）は `--wk-space-sm`／`--wk-space-md` に入れる。4px／8px を下限にする

## 仕上げた12種（dist/curated.css・画面のテーマ選びに出る）

| id | 名前 | 元テーマ | 区分 | ライトの最小比 | ダークの最小比 | 4.5 以上 | 明るさを直した色 | 除外の理由 |
|---|---|---|---|---|---|---|---|---|
| graphite | グラファイト | （独自） | 仕上げ済み | 4.73 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| clinic | クリニック | （独自） | 仕上げ済み | 4.69 | 5.39 | ✓ | ライト：fg-3・accent・accent-text |  |
| night | ナイト | （独自） | 仕上げ済み | —（常に暗い） | 5.40 | ✓ | なし |  |
| sky | スカイ | ant | 仕上げ済み | 4.64 | 5.39 | ✓ | ライト：fg-3・accent・accent-text |  |
| navy | ネイビー | enterprise | 仕上げ済み | 4.73 | 5.40 | ✓ | ライト：fg-3 |  |
| lavender | ラベンダー | material | 仕上げ済み | 4.74 | 5.39 | ✓ | ライト：fg-3 |  |
| ink | インク | minimal | 仕上げ済み | 4.73 | 5.39 | ✓ | ライト：fg-3 |  |
| cafe | カフェ | cafe | 仕上げ済み | 4.74 | 5.39 | ✓ | ライト：fg-3 |  |
| leaf | リーフ | lingo | 仕上げ済み | 4.68 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| terracotta | テラコッタ | terracotta | 仕上げ済み | 4.70 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| pop | ポップ | neobrutalism | 仕上げ済み | 4.72 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| teal | ディープティール | stitch | 仕上げ済み | 4.70 | 5.39 | ✓ | ライト：fg-3 |  |

## 変換済み・手直し前（dist/all.css にだけ入る）

| id | 名前 | 元テーマ | 区分 | ライトの最小比 | ダークの最小比 | 4.5 以上 | 明るさを直した色 | 除外の理由 |
|---|---|---|---|---|---|---|---|---|
| agentic | Agentic | agentic | 変換済み・手直し前 | 4.62 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| artistic | Artistic | artistic | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| basic | Basic | basic | 変換済み・手直し前 | 4.61 | 5.39 | ✓ | ライト：fg-3 |  |
| bento | Bento | bento | 変換済み・手直し前 | 4.73 | 5.40 | ✓ | ライト：fg-3・accent-text |  |
| bold | Bold | bold | 変換済み・手直し前 | 4.67 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| brutalism | Brutalism | brutalism | 変換済み・手直し前 | 4.62 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| cafe | Cafe | cafe | 変換済み・手直し前 | 4.74 | 5.39 | ✓ | ライト：fg-3 |  |
| claymorphism | Claymorphism | claymorphism | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| clean | Clean | clean | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| colorful | Colorful | colorful | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| contemporary | Contemporary | contemporary | 変換済み・手直し前 | 4.64 | 5.39 | ✓ | ライト：fg-3 |  |
| corporate | Corporate | corporate | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| cosmic | Cosmic | cosmic | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| creative | Creative | creative | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| dithered | Dithered | dithered | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| doodle | Doodle | doodle | 変換済み・手直し前 | 4.61 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| dramatic | Dramatic | dramatic | 変換済み・手直し前 | 4.61 | 5.39 | ✓ | ライト：fg-3・accent・accent-text |  |
| editorial | Editorial | editorial | 変換済み・手直し前 | 4.74 | 5.39 | ✓ | ライト：fg-3 |  |
| enterprise | Enterprise | enterprise | 変換済み・手直し前 | 4.73 | 5.39 | ✓ | ライト：fg-3 |  |
| expressive | Expressive | expressive | 変換済み・手直し前 | 4.61 | 5.39 | ✓ | ライト：fg-3・accent |  |
| fantasy | Fantasy | fantasy | 変換済み・手直し前 | 4.73 | 5.39 | ✓ | ライト：fg-3 |  |
| fiction | Fiction | fiction | 変換済み・手直し前 | 4.74 | 5.39 | ✓ | ライト：fg-3 |  |
| flat | Flat | flat | 変換済み・手直し前 | 4.65 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| friendly | Friendly | friendly | 変換済み・手直し前 | 4.74 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| futuristic | Futuristic | futuristic | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| geometric | Geometric | geometric | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| glassmorphism | Glassmorphism | glassmorphism | 変換済み・手直し前 | 4.69 | 5.39 | ✓ | ライト：fg-3 |  |
| gradient | Gradient | gradient | 変換済み・手直し前 | 4.74 | 5.39 | ✓ | ライト：fg-3 |  |
| immersive | Immersive | immersive | 変換済み・手直し前 | 4.72 | 5.39 | ✓ | ライト：fg-3 |  |
| levels | Levels | levels | 変換済み・手直し前 | 4.74 | 5.39 | ✓ | ライト：fg-3 |  |
| matrix | Matrix | matrix | 変換済み・手直し前 | 4.69 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| minimal | Minimal | minimal | 変換済み・手直し前 | 4.73 | 5.39 | ✓ | ライト：fg-3 |  |
| modern | Modern | modern | 変換済み・手直し前 | 4.73 | 5.41 | ✓ | ライト：fg-3 |  |
| mono | Mono | mono | 変換済み・手直し前 | 4.64 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| neobrutalism | Neobrutalism | neobrutalism | 変換済み・手直し前 | 4.72 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| neon | Neon | neon | 変換済み・手直し前 | 4.72 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| neumorphism | Neumorphism | neumorphism | 変換済み・手直し前 | 4.72 | 5.39 | ✓ | ライト：fg-3 |  |
| paper | Paper | paper | 変換済み・手直し前 | 4.74 | 5.39 | ✓ | ライト：fg-3 |  |
| perspective | Perspective | perspective | 変換済み・手直し前 | 4.69 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| power | Power | power | 変換済み・手直し前 | 4.69 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| premium | Premium | premium | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| professional | Professional | professional | 変換済み・手直し前 | 4.71 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| pulse | Pulse | pulse | 変換済み・手直し前 | 4.60 | 5.40 | ✓ | ライト：fg-3・accent-text |  |
| refined | Refined | refined | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| retro | Retro | retro | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| riso | Riso | riso | 変換済み・手直し前 | 4.64 | 5.39 | ✓ | ライト：fg-3 |  |
| sketch | Sketch | sketch | 変換済み・手直し前 | 4.71 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| skeumorphism | Skeumorphism | skeumorphism | 変換済み・手直し前 | 4.70 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| sleek | Sleek | sleek | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| spacious | Spacious | spacious | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| square | Square | square | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| stitch | Stitch | stitch | 変換済み・手直し前 | 4.73 | 5.39 | ✓ | ライト：fg-3 |  |
| storytelling | Storytelling | storytelling | 変換済み・手直し前 | 4.63 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| terracotta | Terracotta | terracotta | 変換済み・手直し前 | 4.70 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| vibrant | Vibrant | vibrant | 変換済み・手直し前 | 4.65 | 5.39 | ✓ | ライト：fg-3・accent-text |  |
| vintage | Vintage | vintage | 変換済み・手直し前 | 4.67 | 5.39 | ✓ | ライト：fg-3・accent-text |  |

## 除外

| id | 名前 | 元テーマ | 区分 | ライトの最小比 | ダークの最小比 | 4.5 以上 | 明るさを直した色 | 除外の理由 |
|---|---|---|---|---|---|---|---|---|
| ant | Ant | ant | 除外（他社名） | 4.66 | 5.39 | ✓ | ライト：fg-3・accent・accent-text | テーマ名が他社の名前（配る物に他社名を看板として出さない）。色は仕上げの「スカイ」の元に使っている |
| claude | Claude | claude | 除外（他社名） | 4.73 | 5.39 | ✓ | ライト：fg-3 | テーマ名が他社の名前（配る物に他社名を看板として出さない） |
| codex | Codex | codex | 除外（他社名） | 4.74 | 5.39 | ✓ | ライト：fg-3 | テーマ名が他社の名前（配る物に他社名を看板として出さない） |
| impeccable | Impeccable | impeccable | 除外（他社名） | 4.73 | 5.39 | ✓ | ライト：fg-3・accent-text | テーマ名が他社の名前（配る物に他社名を看板として出さない） |
| lingo | Lingo | lingo | 除外（他社名） | 4.68 | 5.39 | ✓ | ライト：fg-3・accent-text | テーマ名が他社の名前（配る物に他社名を看板として出さない）。色は仕上げの「リーフ」の元に使っている |
| material | Material | material | 除外（他社名） | 4.74 | 5.39 | ✓ | ライト：fg-3 | テーマ名が他社の名前（配る物に他社名を看板として出さない）。色は仕上げの「ラベンダー」の元に使っている |
| pacman | Pacman | pacman | 除外（他社名） | 4.73 | 5.39 | ✓ | ライト：fg-3 | テーマ名が他社の名前（配る物に他社名を看板として出さない） |
| roku | Roku | roku | 除外（他社名） | 4.70 | 5.39 | ✓ | ライト：fg-3 | テーマ名が他社の名前（配る物に他社名を看板として出さない） |
| sega | Sega | sega | 除外（他社名） | 4.73 | 5.39 | ✓ | ライト：fg-3 | テーマ名が他社の名前（配る物に他社名を看板として出さない） |
| shadcn | Shadcn | shadcn | 除外（他社名） | 4.74 | 5.39 | ✓ | ライト：fg-3 | テーマ名が他社の名前（配る物に他社名を看板として出さない） |
| tetris | Tetris | tetris | 除外（他社名） | 4.73 | 5.40 | ✓ | ライト：fg-3 | テーマ名が他社の名前（配る物に他社名を看板として出さない） |

## 英字 → 日本語の字体の対応表

英字の字体に、形の近い日本語の字体を組み合わせる。Google Fonts に無い字体は近いものに置き換える。手で仕上げた12種は `curated.json` の `fonts.jp` で個別に決めているものがある（例：クリニック→Zen Maru Gothic、リーフ→M PLUS Rounded 1c）。

| 元の英字の字体 | 置き換え | 使い方 | 日本語の字体 |
|---|---|---|---|
| Abril Fatface |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | Noto Serif JP（見出し） |
| Anthropic Sans | Inter | 本文・見出し（ゴシック） | Noto Sans JP |
| Archivo Black |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |
| Audiowide |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |
| Bangers |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |
| Chakra Petch |  | 本文・見出し（ゴシック） | Noto Sans JP |
| Cossette Texte | Gelasio | 本文・見出し（明朝） | Noto Serif JP |
| Darker Grotesque |  | 本文・見出し（ゴシック） | Noto Sans JP |
| Delicious Handrawn |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |
| Delius Swash Caps |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |
| DM Serif Display |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | Noto Serif JP（見出し） |
| Fascinate |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |
| Geist |  | 本文・見出し（ゴシック） | Noto Sans JP |
| Gelasio |  | 本文・見出し（明朝） | Noto Serif JP |
| Germania One |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |
| Google Sans | Inter | 本文・見出し（ゴシック） | Noto Sans JP |
| IBM Plex Mono |  | 本文・見出し（等幅） | M PLUS 1 Code |
| IBM Plex Sans |  | 本文・見出し（ゴシック） | IBM Plex Sans JP |
| IBM Plex Serif |  | 本文・見出し（明朝） | Noto Serif JP |
| Inter |  | 本文・見出し（ゴシック） | Noto Sans JP |
| Jost |  | 本文・見出し（ゴシック） | Noto Sans JP |
| Limelight |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |
| Macondo |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |
| Montserrat |  | 本文・見出し（ゴシック） | Noto Sans JP |
| New Rocker |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |
| Noto Sans |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |
| Noto Serif Display |  | 本文・見出し（明朝） | Noto Serif JP |
| Nunito |  | 本文・見出し（ゴシック） | M PLUS Rounded 1c |
| Open Sans |  | 本文・見出し（ゴシック） | Noto Sans JP |
| Oswald |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |
| Outfit |  | 本文・見出し（ゴシック） | Noto Sans JP |
| Playfair Display |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | Noto Serif JP（見出し） |
| Plus Jakarta Sans |  | 本文・見出し（ゴシック） | Noto Sans JP |
| Poppins |  | 本文・見出し（ゴシック） | Noto Sans JP |
| Press Start 2P |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |
| Roboto |  | 本文・見出し（ゴシック） | Noto Sans JP |
| Silkscreen |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |
| Space Grotesk |  | 本文・見出し（ゴシック） | Noto Sans JP |
| Space Mono |  | 本文・見出し（等幅） | M PLUS 1 Code |
| STIX Two Text |  | 本文・見出し（明朝） | Noto Serif JP |
| Ubuntu |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |
| VT323 |  | 見出しだけ（飾り文字。本文は Noto Sans JP） | 本文側の日本語の字体に合わせる |

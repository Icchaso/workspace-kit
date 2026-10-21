#!/usr/bin/env node
/**
 * 部品を配るファイル（shadcn registry 形式）を作る。
 *   node scripts/build-registry.mjs                 … apps/starter/public/r/ に書き出す（本番の URL で）
 *   BASE=http://127.0.0.1:4000 OUT=/tmp/r node …    … 手元で入れて試すとき
 *
 * 入れる側は `npx shadcn@4.21.3 add <BASE>/r/<名前>.json` で使う。中身は雛形（apps/starter）のソースそのもの。
 *   workspace-kit-css     … 色・文字・余白・動きのトークン＋テーマ12種＋土台と骨格の CSS（1枚にまとめた workspace-kit.css）
 *   workspace-kit-ui      … ボタン・シート・お知らせ・確認ダイアログなどの部品
 *   workspace-kit-shell   … 3段階に変わるナビ（下タブ／アイコン列／サイドバー）・⌘K パレット・描画前の台本
 *   workspace-kit-starter … 上の全部＋見本のタスク管理アプリ（新しく作るとき用。画面とレイアウトも上書きする）
 *
 * ついでに Claude Code プラグイン（plugin/）へ、検査台本とテーマ一覧を写す（手で写すとずれるため）。
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "apps/starter/src");
const BASE = (process.env.BASE ?? "https://workspace-kit.vercel.app").replace(/\/$/, "");
const OUT = process.env.OUT ?? join(ROOT, "apps/starter/public/r");
const VERSION = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version ?? "0.1.0";

const read = (p) => readFileSync(p, "utf8");
/** 配る先には @workspace-kit/* の入れ物が無いので、テーマ一覧は lib/palettes.ts を読むように書き換える */
const rewrite = (code) => code.replaceAll('"@workspace-kit/themes/catalog"', '"@/lib/palettes"');

/** src からの相対パス → 配るファイル1つ（置き先は相手のプロジェクトでも同じ相対パス） */
const fromSrc = (rel, type = "registry:file") => ({ path: rel, type, target: rel, content: rewrite(read(join(SRC, rel))) });
const fromTemplate = (rel) => ({ path: rel, type: "registry:file", target: rel, content: read(join(ROOT, "registry/templates", rel)) });

/** テーマ一覧（見本サイト・設定・⌘K が使う）を TS にする */
async function palettesFile() {
  const { PALETTES } = await import(pathToFileURL(join(ROOT, "packages/themes/dist/catalog.mjs")).href);
  const items = PALETTES.map(({ id, label, desc, darkOnly, swatch, href }) => ({ id, label, desc, darkOnly: !!darkOnly, swatch, href }));
  const content = `/** テーマ一覧（Workspace Kit が生成。手で直さない） */
export type Palette = { id: string; label: string; desc: string; darkOnly: boolean; swatch: string[]; href: string };

export const PALETTES: Palette[] = ${JSON.stringify(items, null, 2)};
`;
  return { path: "lib/palettes.ts", type: "registry:file", target: "lib/palettes.ts", content };
}

/** CSS を1枚にまとめる（tokens → Tailwind の対応表 → テーマ12種 → 土台と骨格） */
function cssFile() {
  const parts = [
    ["色・文字・余白・角丸・影・動き・押せる大きさ", "packages/tokens/tokens.css"],
    ["Tailwind のクラス名との対応", "packages/tokens/tailwind.css"],
    ["テーマ12種（<html data-palette=\"…\"> で切り替え）", "packages/themes/dist/curated.css"],
    ["土台と骨格", "packages/tokens/base.css"],
  ];
  const content =
    `/*\n * Workspace Kit ${VERSION}（${BASE}/kit）\n * globals.css の \`@import "tailwindcss";\` のすぐ後に \`@import "./workspace-kit.css";\` と書いて読み込む。\n * テーマの元：awesome-design-skills（Copyright (c) 2026 Bergside, MIT License）\n */\n\n` +
    parts.map(([title, p]) => `/* ======== ${title} ======== */\n${read(join(ROOT, p)).trim()}\n`).join("\n");
  return { path: "app/workspace-kit.css", type: "registry:file", target: "app/workspace-kit.css", content };
}

const DEPS = JSON.parse(read(join(ROOT, "apps/starter/package.json"))).dependencies;
const dep = (name) => `${name}@${DEPS[name]}`;
const url = (name) => `${BASE}/r/${name}.json`;

const UI = ["button", "confirm-dialog", "count-up", "fab", "feedback", "segmented", "sheet", "steps", "toast"];
const SHELL = ["app-frame", "bottom-tab-bar", "boot-script", "command-palette", "side-nav", "theme-fonts"];
const DEMO = [
  "components/tasks/add-task-sheet.tsx",
  "components/tasks/task-actions.tsx",
  "components/tasks/task-detail.tsx",
  "components/tasks/task-parts.tsx",
  "components/tasks/use-task-sheets.tsx",
  "components/tasks/wrap-up-sheet.tsx",
  "components/views/ai-view.tsx",
  "components/views/settings-view.tsx",
  "components/views/tasks-view.tsx",
  "components/views/today-view.tsx",
  "lib/ai-script.ts",
  "lib/schedule.ts",
  "lib/tasks.tsx",
  "config/nav.ts",
  "config/shell.tsx",
  "app/layout.tsx",
  "app/globals.css",
  "app/(app)/layout.tsx",
  "app/(app)/page.tsx",
  "app/(app)/tasks/page.tsx",
  "app/(app)/ai/page.tsx",
  "app/(app)/settings/page.tsx",
];

const items = [
  {
    name: "workspace-kit-css",
    type: "registry:style",
    title: "Workspace Kit：トークンとテーマ",
    description: "色・文字・余白・角丸・影・動き・押せる大きさのトークン、テーマ12種、土台と骨格の CSS を1枚にまとめた workspace-kit.css",
    files: [cssFile()],
  },
  {
    name: "workspace-kit-ui",
    type: "registry:ui",
    title: "Workspace Kit：部品",
    description: "ボタン（押した瞬間の待ち表示つき）・下から出るシート・お知らせと取り消し・確認ダイアログ・切り替え・空の状態・数字が回るカードなど",
    dependencies: ["@base-ui/react", "class-variance-authority", "clsx", "lucide-react", "motion", "sonner", "tailwind-merge", "vaul"].map(dep),
    registryDependencies: [url("workspace-kit-css")],
    files: [
      ...UI.map((n) => fromSrc(`components/kit/${n}.tsx`)),
      fromSrc("lib/cn.ts"),
      fromSrc("lib/prefs.ts"),
      fromSrc("lib/use-long-press.ts"),
    ],
  },
  {
    name: "workspace-kit-shell",
    type: "registry:block",
    title: "Workspace Kit：骨格",
    description: "画面幅で3段階に変わるナビ（767px 以下＝下タブ／768px〜＝アイコン列／1280px〜＝サイドバー）、⌘K パレット、キーボードの近道、描画前の台本",
    dependencies: ["@base-ui/react", "lucide-react", "motion"].map(dep),
    registryDependencies: [url("workspace-kit-ui")],
    files: [
      ...SHELL.map((n) => fromSrc(`components/shell/${n}.tsx`)),
      await palettesFile(),
      fromTemplate("config/nav.ts"),
      fromTemplate("config/shell.tsx"),
    ],
  },
  {
    name: "workspace-kit-starter",
    type: "registry:block",
    title: "Workspace Kit：雛形（見本のタスク管理アプリ）",
    description: "骨格と部品の全部に、画面の型 A 指令室（/tasks）・B 現場（/）・C AI相棒（/ai）・設定（/settings）の見本を足した一式。新しく作るとき用",
    dependencies: ["lucide-react", "motion"].map(dep),
    registryDependencies: [url("workspace-kit-shell")],
    files: DEMO.map((p) =>
      p === "app/globals.css"
        ? { path: p, type: "registry:file", target: p, content: '@import "tailwindcss";\n/* Workspace Kit（トークン・テーマ12種・土台と骨格） */\n@import "./workspace-kit.css";\n' }
        : fromSrc(p),
    ),
  },
];

// 最新（/r/<名前>.json）と、版で固定した住所（/r/v<版>/<名前>.json）の両方に書く。
// 版で固定した物は、つながる部品も同じ版を指す（後から配信元が変わっても、入れた版の中身は変わらない）
const pinned = (it) => ({ ...it, registryDependencies: it.registryDependencies?.map((u) => u.replace(`${BASE}/r/`, `${BASE}/r/v${VERSION}/`)) });
mkdirSync(join(OUT, `v${VERSION}`), { recursive: true });
for (const it of items) {
  const body = (x) => JSON.stringify({ $schema: "https://ui.shadcn.com/schema/registry-item.json", ...x }, null, 2) + "\n";
  writeFileSync(join(OUT, `${it.name}.json`), body(it));
  writeFileSync(join(OUT, `v${VERSION}`, `${it.name}.json`), body(pinned(it)));
}
writeFileSync(
  join(OUT, "registry.json"),
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "workspace-kit",
      homepage: `${BASE}/kit`,
      items: items.map(({ files, ...rest }) => ({ ...rest, files: files.map(({ content, ...f }) => f) })),
    },
    null,
    2,
  ) + "\n",
);
const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
for (const it of items) console.log(`${it.name}: ${it.files.length}ファイル ${kb(JSON.stringify(it).length)}`);
console.log(`→ ${OUT}（${BASE}）`);

// ---- プラグインへ写す（手元で試すとき＝OUT を指定したときは写さない。手元の住所が混ざるため） ----
if (!process.env.OUT) {
const SKILL = join(ROOT, "plugin/skills/workspace-kit");
mkdirSync(join(SKILL, "scripts"), { recursive: true });
copyFileSync(join(ROOT, "scripts/check-ui.mjs"), join(SKILL, "scripts/check-ui.mjs"));
const { PALETTES } = await import(pathToFileURL(join(ROOT, "packages/themes/dist/catalog.mjs")).href);
writeFileSync(
  join(SKILL, "references/themes.md"),
  `# テーマを変える

テーマは色・文字・角丸のひとそろい。12種すべて、ライトとダークの両方で文字と背景の差 4.5:1 以上に調整してある。
見本：${BASE}/kit （選ぶとスマホ幅と PC 幅で並べて見られる）

| id | 名前 | 雰囲気 | 明るさ |
|---|---|---|---|
${PALETTES.map((p) => `| \`${p.id}\` | ${p.label} | ${p.desc} | ${p.darkOnly ? "常に暗い" : "ライト／ダーク"} |`).join("\n")}

## 変え方
| したいこと | やり方 |
|---|---|
| アプリの既定のテーマを変える | ルートの \`app/layout.tsx\` の \`<WorkspaceBoot defaultPalette="sky" />\`（グラファイトは指定なし） |
| 使う人が自分で選ぶ | 設定画面の「テーマ」か ⌘K で「テーマ：〇〇」。その端末だけに覚える（\`lib/prefs.ts\` の \`setPalette\`） |
| ブランド色だけ変える | \`globals.css\` の \`@import "./workspace-kit.css";\` の後で \`--wk-accent\`・\`--wk-on-accent\`・\`--wk-accent-soft\`・\`--wk-accent-text\` を上書き（ライトとダークの両方）。差 4.5:1 以上を検査台本の axe で確かめる |

- テーマの字体は Google Fonts から読み込む（\`components/shell/theme-fonts.tsx\`）。届くまでは端末の日本語の字体で表示される
- 名前で頼まれたら上の表の「名前」か「id」で探す。無い名前（例：「赤っぽいの」）なら近いものを2〜3個、雰囲気の欄と一緒に出して選んでもらう
- 変えたら検査台本を \`PALETTE=<id> QUICK=1\` で流す（390px と 1440px だけ撮って色の検査をする）

テーマの元の色・文字：awesome-design-skills（Copyright (c) 2026 Bergside, MIT License）。日本語の字体の組み合わせとコントラストの調整は Workspace Kit。
`,
);
console.log("→ plugin/skills/workspace-kit に検査台本とテーマ一覧を写した");
}

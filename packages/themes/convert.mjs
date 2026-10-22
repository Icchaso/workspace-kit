/**
 * テーマ変換：awesome-design-skills（67種・MIT）の色・文字・角丸・余白 → Workspace Kit のトークン（--wk-*）
 *
 *   node convert.mjs                                 … 元の DESIGN.md を探して読み直し、書き出す（見つからなければ取り込み済みの source/ を使う）
 *   node convert.mjs <awesome-design-skills のフォルダ>
 *
 * やること
 *   0. 元の skills/<名前>/DESIGN.md の先頭の YAML（色・文字・角丸・余白）を読み、source/awesome-design-skills.json に取り込み直す
 *      （配る人の手元には元のフォルダが無いので、取り込んだ結果もリポジトリに置いておく）
 *   1. 元テーマの主色・状態色・面の色を OKLCH（人の目の明るさに沿った色の表し方）で読み、
 *      ライト／ダークの両方の面・文字・ブランド色を作り直す（元の面の色はそのまま使わない＝暗いテーマも明るい版を持てる）
 *      主色からは 50〜950 の11段階（--wk-accent-50 … --wk-accent-950）も作る
 *   2. 文字と背景の差（コントラスト比）を 4.5:1 以上になるまで明るさだけ動かして直す。直しても届かない組は除外
 *   3. 英字フォントに日本語フォントを組み合わせる（本文に向かない飾り文字は見出しだけに使う）
 *   4. 書き出し：dist/curated.css（仕上げた12種）・dist/all.css（全部）・dist/catalog.json（一覧と検査結果）・dist/catalog.mjs
 *      ・RESULTS.md（テーマごとの合否・除外理由・直した色、英字→日本語の字体の対応表）
 * 色は計算を OKLCH で行い、書き出しは 16進（#rrggbb）にする（どのブラウザ・検査ツールでも同じ色として読めるように）。
 */
import { clampChroma, converter, formatHex, wcagContrast } from "culori";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const oklch = converter("oklch");
const MIN = 4.6; // 4.5 に少し余裕を持たせる
const HERE = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT = join(HERE, "source/awesome-design-skills.json");
const curated = JSON.parse(readFileSync(join(HERE, "curated.json")));

// ---- 0：元の DESIGN.md を読む ----
/** 先頭の --- と --- の間の YAML を読む（字下げで入れ子になった「名前: 値」だけの簡単な形に限る。それ以外の形は止める） */
function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error("先頭に --- で囲んだ YAML が無い");
  const root = {};
  const stack = [{ indent: -1, obj: root }];
  for (const line of m[1].split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const kv = line.match(/^(\s*)([^:\s][^:]*):\s*(.*)$/);
    if (!kv) throw new Error(`読めない行：${line}`);
    const indent = kv[1].length;
    while (stack.at(-1).indent >= indent) stack.pop();
    const parent = stack.at(-1).obj;
    const key = kv[2].trim();
    const raw = kv[3].trim();
    if (raw === "") {
      parent[key] = {};
      stack.push({ indent, obj: parent[key] });
    } else parent[key] = raw.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  }
  return root;
}
function readDesign(file) {
  const text = readFileSync(file, "utf8");
  const y = frontMatter(text);
  const ty = y.typography ?? {};
  return {
    name: y.name,
    colors: y.colors,
    fonts: { heading: ty.h1?.fontFamily, body: ty["body-md"]?.fontFamily, mono: ty["label-caps"]?.fontFamily },
    rounded: y.rounded,
    spacing: y.spacing ? { sm: y.spacing.sm, md: y.spacing.md } : undefined,
    style: text.match(/\*\*Visual style:\*\*\s*(.+)/)?.[1].trim(),
    overview: text.match(/## Overview\s*\n+([^\n]+)/)?.[1].trim(),
  };
}
/** 元のフォルダ：引数 → 環境変数 AWESOME_DESIGN_SKILLS → このファイルから上へたどって見つかる awesome-design-skills */
function findSourceDir() {
  const given = process.argv[2] ?? process.env.AWESOME_DESIGN_SKILLS;
  if (given) {
    const dir = existsSync(join(given, "skills")) ? join(given, "skills") : given;
    if (!existsSync(dir)) {
      console.error(`✗ 元のフォルダが無い：${given}`);
      process.exit(1);
    }
    return dir;
  }
  for (let d = HERE; d !== dirname(d); d = dirname(d)) {
    const c = join(d, "awesome-design-skills", "skills");
    if (existsSync(c)) return c;
  }
  return null;
}
const sourceDir = findSourceDir();
let src;
if (sourceDir) {
  src = {};
  const readErrors = [];
  for (const key of readdirSync(sourceDir).sort()) {
    const f = join(sourceDir, key, "DESIGN.md");
    if (!existsSync(f)) continue;
    try {
      const d = readDesign(f);
      if (!d.colors?.primary) throw new Error("colors.primary が無い");
      src[key] = d;
    } catch (e) {
      readErrors.push(`${key}：${e.message}`);
    }
  }
  if (readErrors.length) {
    console.error(`✗ 読めなかった DESIGN.md があるので止める：\n  ${readErrors.join("\n  ")}`);
    process.exit(1);
  }
  writeFileSync(SNAPSHOT, JSON.stringify(src, null, 1) + "\n");
  console.log(`元の DESIGN.md を ${Object.keys(src).length}種 読み直した：${sourceDir}`);
} else {
  src = JSON.parse(readFileSync(SNAPSHOT));
  console.log(`元のフォルダが見つからないので、取り込み済みの ${Object.keys(src).length}種（source/awesome-design-skills.json）を使う`);
}

// ---- 色の道具 ----
const C = (l, c, h) => clampChroma({ mode: "oklch", l: Math.min(1, Math.max(0, l)), c: Math.max(0, c), h: h ?? 0 }, "oklch");
const hex = (c) => formatHex(c);
const cr = (a, b) => wcagContrast(a, b);
const lch = (s) => {
  const o = oklch(s);
  return { l: o.l, c: o.c ?? 0, h: o.h ?? 0 };
};
/** 背景のどれに対しても min 以上の差になるまで、明るさだけを dir の向きに動かす */
function fit(color, bgs, dir, min = MIN) {
  let c = color;
  for (let i = 0; i < 120 && !bgs.every((b) => cr(c, b) >= min); i++) c = C(c.l + dir * 0.01, c.c, c.h);
  return c;
}

/**
 * 主色1色から 50〜950 の11段階。明るさ（L）は段ごとに固定し、色味の強さ（C）は真ん中の段で最大・両端で弱くする。
 * 色相（H）は主色のまま。表示できる範囲を超える色味は clampChroma で範囲内に収める
 */
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const STEP_L = [0.975, 0.945, 0.89, 0.82, 0.73, 0.64, 0.555, 0.48, 0.405, 0.34, 0.26];
const STEP_C = [0.12, 0.22, 0.42, 0.65, 0.85, 1, 1, 0.92, 0.8, 0.66, 0.5];
function scale(primary) {
  const p = lch(primary);
  return Object.fromEntries(STEPS.map((s, i) => [`accent-${s}`, C(STEP_L[i], p.c * STEP_C[i], p.h)]));
}

// ---- フォント（英字 → 日本語の対応表） ----
const TEXT_SANS = ["Inter", "Poppins", "Plus Jakarta Sans", "Open Sans", "Roboto", "Montserrat", "Jost", "Outfit", "Geist", "Space Grotesk", "IBM Plex Sans", "Nunito", "Chakra Petch", "Darker Grotesque", "Zen Maru Gothic"];
const TEXT_SERIF = ["Gelasio", "IBM Plex Serif", "STIX Two Text", "Noto Serif Display"];
const TEXT_MONO = ["JetBrains Mono", "IBM Plex Mono", "Space Mono"];
const SERIF_DISPLAY = ["Playfair Display", "DM Serif Display", "Abril Fatface"];
// Google Fonts に無いもの → 近いものに置き換える
const SUBSTITUTE = { "Anthropic Sans": "Inter", "Google Sans": "Inter", "Cossette Texte": "Gelasio" };
// 英字の字体ごとに決めた日本語の字体（ここに無いものは種類で決める：ゴシック→Noto Sans JP、明朝→Noto Serif JP、等幅→M PLUS 1 Code）
const JP_FOR = { "IBM Plex Sans": "IBM Plex Sans JP", Nunito: "M PLUS Rounded 1c", "Zen Maru Gothic": "Zen Maru Gothic" };
// 1つの太さしか無いフォント（太さを指定すると Google Fonts がエラーを返す）
const WEIGHTS = {
  "Zen Maru Gothic": "400;500;700",
  "M PLUS Rounded 1c": "400;500;700",
  "Space Mono": "400;700",
  "Silkscreen": "400;700",
};
const SINGLE = ["Bangers", "Limelight", "Audiowide", "Delius Swash Caps", "New Rocker", "Macondo", "Fascinate", "Germania One", "Delicious Handrawn", "VT323", "Press Start 2P", "Archivo Black", "DM Serif Display", "Abril Fatface"];

const kindOf = (f) => (TEXT_SERIF.includes(f) ? "serif" : TEXT_MONO.includes(f) ? "mono" : "sans");
const jpOf = (f) => JP_FOR[f] ?? { serif: "Noto Serif JP", mono: "M PLUS 1 Code", sans: "Noto Sans JP" }[kindOf(f)];
const isText = (f) => [...TEXT_SANS, ...TEXT_SERIF, ...TEXT_MONO].includes(f);

function pairFonts(fonts = {}, jpOverride) {
  const fix = (f) => (f ? (SUBSTITUTE[f] ?? f) : null);
  const head = fix(fonts.heading) ?? fix(fonts.body) ?? "Inter";
  let body = fix(fonts.body) ?? head;
  if (!isText(body)) body = null; // 飾り文字は本文に使わない
  const bodyKind = body ? kindOf(body) : "sans";
  const jp = jpOverride ?? (body ? jpOf(body) : "Noto Sans JP");
  const headJp = SERIF_DISPLAY.includes(head) || TEXT_SERIF.includes(head) ? "Noto Serif JP" : jp;
  const stack = (latin, j, kind) =>
    [latin && latin !== j ? `"${latin}"` : null, `"${j}"`, kind === "serif" ? '"Hiragino Mincho ProN", "Yu Mincho", serif' : '"Hiragino Sans", "Yu Gothic UI", "Meiryo", system-ui, sans-serif'].filter(Boolean).join(", ");
  const families = [...new Set([body, head, jp, headJp].filter(Boolean))];
  const href =
    "https://fonts.googleapis.com/css2?" +
    families.map((f) => `family=${f.replace(/ /g, "+")}${SINGLE.includes(f) ? "" : `:wght@${WEIGHTS[f] ?? "400;500;600"}`}`).join("&") +
    "&display=swap";
  return {
    body: body ?? jp,
    head,
    jp,
    font: stack(body, jp, bodyKind),
    fontHead: stack(head, headJp, headJp === "Noto Serif JP" ? "serif" : "sans"),
    href,
  };
}

// ---- 1テーマ分の色を作る ----
/** adjusted：コントラストが足りず明るさを動かした色の名前を入れる（RESULTS.md の「直した色」） */
function palette(colors, scheme, adjusted = []) {
  const p = lch(colors.primary);
  const surf = colors.surface ? lch(colors.surface) : { l: 1, c: 0, h: p.h };
  // 面の色味：元の面に色があればその色相、無ければ主色の色相をほんの少しだけ
  const hn = surf.c > 0.01 ? surf.h : p.h;
  const tint = surf.c > 0.01 ? Math.min(surf.c, 0.02) : 0.004;
  const dark = scheme === "dark";
  const t = {};
  const F = (name, color, bgs, dir) => {
    const r = fit(color, bgs, dir);
    if (Math.abs(r.l - color.l) > 0.005) adjusted.push(name);
    return r;
  };

  if (!dark) {
    t.canvas = C(0.975, tint, hn);
    t.sidebar = C(0.952, tint * 1.3, hn);
    t.surface = C(0.997, tint * 0.3, hn);
    t["surface-2"] = C(0.948, tint * 1.3, hn);
    t.line = C(0.895, tint * 1.5, hn);
    t.fg = C(0.22, Math.min(tint * 2, 0.02), hn);
    t["fg-2"] = F("fg-2", C(0.43, Math.min(tint * 2, 0.02), hn), [t.surface, t.canvas, t["surface-2"]], -1);
    t["fg-3"] = F("fg-3", C(0.56, Math.min(tint * 2, 0.02), hn), [t.surface, t.canvas, t["surface-2"]], -1);
  } else {
    t.canvas = C(0.17, tint * 1.2, hn);
    t.sidebar = C(0.15, tint * 1.2, hn);
    t.surface = C(0.215, tint * 1.2, hn);
    t["surface-2"] = C(0.26, tint * 1.3, hn);
    t.line = C(0.31, tint * 1.4, hn);
    t.fg = C(0.94, Math.min(tint, 0.012), hn);
    t["fg-2"] = F("fg-2", C(0.8, Math.min(tint, 0.012), hn), [t.surface, t.canvas, t["surface-2"]], 1);
    t["fg-3"] = F("fg-3", C(0.68, Math.min(tint, 0.012), hn), [t.surface, t.canvas, t["surface-2"]], 1);
  }

  // ブランド色：塗り（accent）と、その上の文字（on-accent）
  let accent = dark ? C(Math.max(p.l, 0.72), p.c, p.h) : C(p.l, p.c, p.h);
  const white = C(1, 0, 0);
  const ink = dark ? C(0.18, Math.min(p.c * 0.3, 0.04), p.h) : C(0.2, Math.min(p.c * 0.3, 0.04), p.h);
  let onAccent = cr(white, accent) >= cr(ink, accent) ? white : ink;
  if (cr(onAccent, accent) < MIN) {
    // どちらでも足りない中間の明るさ → 白文字が読めるところまで塗りを暗く（ダークでは黒文字が読めるところまで明るく）
    accent = dark ? F("accent", accent, [ink], 1) : F("accent", accent, [white], -1);
    onAccent = dark ? ink : white;
  }
  t.accent = accent;
  t["on-accent"] = onAccent;
  t["accent-soft"] = dark ? C(0.29, Math.min(p.c * 0.45, 0.07), p.h) : C(0.945, Math.min(p.c * 0.28, 0.045), p.h);
  t["accent-text"] = F("accent-text", C(dark ? Math.max(p.l, 0.75) : Math.min(p.l, 0.55), p.c, p.h), [t.surface, t.canvas, t["accent-soft"], t["surface-2"]], dark ? 1 : -1);

  // 状態の色（文字として読める濃さ＋淡い下地）
  for (const [name, key] of [["ok", "success"], ["warn", "warning"], ["danger", "danger"]]) {
    const s = lch(colors[key] ?? { success: "#16a34a", warning: "#d97706", danger: "#dc2626" }[key]);
    t[`${name}-soft`] = dark ? C(0.27, Math.min(s.c * 0.4, 0.06), s.h) : C(0.955, Math.min(s.c * 0.25, 0.04), s.h);
    t[name] = F(name, C(dark ? 0.78 : 0.5, s.c, s.h), [t.surface, t.canvas, t[`${name}-soft`]], dark ? 1 : -1);
  }
  t["on-danger"] = dark ? F("on-danger", C(0.2, 0.03, t.danger.h), [t.danger], -1) : F("on-danger", C(1, 0, 0), [t.danger], -1);
  return t;
}

/** 検査：文字と背景の組ごとのコントラスト比 */
const PAIRS = [
  ["fg", "canvas"], ["fg", "surface"], ["fg-2", "surface"], ["fg-2", "canvas"], ["fg-3", "surface"], ["fg-3", "canvas"], ["fg-3", "surface-2"],
  ["accent-text", "surface"], ["accent-text", "accent-soft"], ["on-accent", "accent"],
  ["ok", "ok-soft"], ["warn", "warn-soft"], ["danger", "danger-soft"], ["danger", "surface"], ["on-danger", "danger"],
];
function audit(t) {
  const rows = PAIRS.map(([a, b]) => ({ pair: `${a} / ${b}`, ratio: Math.round(cr(t[a], t[b]) * 100) / 100 }));
  const min = Math.min(...rows.map((r) => r.ratio));
  return { min, pass: min >= 4.5, fails: rows.filter((r) => r.ratio < 4.5) };
}

const decl = (t) => Object.entries(t).map(([k, v]) => `--wk-${k}: ${hex(v)};`).join(" ");

function block(id, theme) {
  const { light, dark, steps, fonts, r, sp, darkOnly, title } = theme;
  // 段階・字体・角丸・余白はライト／ダークで変えない
  const common = `${decl(steps)} --wk-font: ${fonts.font}; --wk-font-head: ${fonts.fontHead}; --wk-r-sm: ${r.sm}px; --wk-r-md: ${r.md}px; --wk-r-lg: ${r.lg}px; --wk-space-sm: ${sp.sm}px; --wk-space-md: ${sp.md}px;`;
  const sel = `:root[data-palette="${id}"]`;
  const lightDecl = darkOnly ? `${decl(dark)} color-scheme: dark;` : decl(light);
  return [
    `/* ${title} */`,
    `${sel} { ${lightDecl} ${common} }`,
    darkOnly ? "" : `@media (prefers-color-scheme: dark) { ${sel}:not([data-theme="light"]) { ${decl(dark)} color-scheme: dark; } }`,
    `${sel}[data-theme="dark"] { ${decl(dark)} color-scheme: dark; }`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ---- 全部を変換 ----
const px = (v, d) => (v == null ? d : typeof v === "number" ? v : parseInt(v, 10) || d);
// 余白：元が 2px／4px のような詰めすぎの値でも、指で押す画面が窮屈にならないよう 4px／8px を下限にする
const spacing = (s = {}) => ({ sm: Math.max(4, px(s.sm, 8)), md: Math.max(8, px(s.md, 16)) });
const all = [];
for (const c of curated.themes) {
  const s = c.from ? src[c.from] : null;
  if (c.from && !s) throw new Error(`curated.json の ${c.id} の元テーマ ${c.from} が source に無い`);
  const colors = { ...(s?.colors ?? {}), ...(c.colors ?? {}) };
  const fonts = pairFonts({ ...(s?.fonts ?? {}), ...(c.fonts?.body ? { heading: c.fonts.heading ?? c.fonts.body, body: c.fonts.body } : {}) }, c.fonts?.jp);
  const rr = { ...(s?.rounded ?? {}), ...(c.rounded ?? {}) };
  const r = { sm: px(rr.sm, 6), md: px(rr.md, 10), lg: px(rr.lg, px(rr.md, 10) + 4) };
  const sp = spacing({ ...(s?.spacing ?? {}), ...(c.spacing ?? {}) });
  all.push({ id: c.id, label: c.label, desc: c.desc, from: c.from, status: "curated", darkOnly: !!c.darkOnly, colors, fonts, r, sp, title: `${c.label}${c.from ? `（元：${c.from} ／ awesome-design-skills・MIT）` : "（Workspace Kit 独自）"}` });
}
// 元の67種は全部変換して検査する。他社の名前がテーマ名のもの（excludeBrandNamed）は検査まで行い、書き出しからだけ外す
for (const [key, s] of Object.entries(src)) {
  const rr = s.rounded ?? {};
  const brand = curated.excludeBrandNamed.includes(key);
  all.push({ id: key, label: s.name, desc: s.overview, from: key, status: brand ? "brand" : "converted", darkOnly: false, colors: s.colors, fonts: pairFonts(s.fonts), r: { sm: px(rr.sm, 4), md: px(rr.md, 8), lg: px(rr.md, 8) + 4 }, sp: spacing(s.spacing), title: `${s.name}（元：${key} ／ awesome-design-skills・MIT／手直し前）` });
}

const catalog = [];
const css = { curated: [], all: [] };
for (const th of all) {
  const adjLight = [];
  const adjDark = [];
  th.light = palette(th.colors, "light", adjLight);
  th.dark = palette(th.colors, "dark", adjDark);
  th.steps = scale(th.colors.primary);
  const la = audit(th.light);
  const da = audit(th.dark);
  const contrastOk = (th.darkOnly || la.pass) && da.pass;
  const status = !contrastOk ? "excluded" : th.status === "brand" ? "excluded-brand" : th.status;
  const swatchFrom = th.darkOnly ? th.dark : th.light;
  catalog.push({
    id: th.id,
    label: th.label,
    desc: th.desc,
    from: th.from,
    status,
    darkOnly: th.darkOnly,
    swatch: ["canvas", "fg", "accent", "accent-soft"].map((k) => hex(swatchFrom[k])),
    scale: Object.fromEntries(Object.entries(th.steps).map(([k, v]) => [k.replace("accent-", ""), hex(v)])),
    fonts: { body: th.fonts.body, head: th.fonts.head, jp: th.fonts.jp, href: th.fonts.href },
    radius: th.r,
    spacing: th.sp,
    contrast: {
      light: th.darkOnly ? null : { min: la.min, fails: la.fails, adjusted: adjLight },
      dark: { min: da.min, fails: da.fails, adjusted: adjDark },
    },
  });
  if (status === "excluded" || status === "excluded-brand") continue;
  const b = block(th.id, th);
  css.all.push(b);
  if (th.status === "curated") css.curated.push(b);
}

// 基準のグラファイトは tokens.css そのもの（data-palette を付けない）なので、段階の値が tokens.css とずれていないかだけ確かめる
{
  const tokens = readFileSync(join(HERE, "../tokens/tokens.css"), "utf8");
  const g = catalog.find((t) => t.id === "graphite");
  const drift = Object.entries(g.scale).filter(([s, v]) => !tokens.includes(`--wk-accent-${s}: ${v};`));
  if (drift.length) {
    console.error(`✗ tokens.css の --wk-accent-50〜950 がグラファイトの主色から作った値とずれている：${drift.map(([s, v]) => `${s}=${v}`).join(" ")}`);
    process.exitCode = 1;
  }
}

const head = (what) =>
  `/*\n * Workspace Kit テーマ集：${what}（packages/themes/convert.mjs が生成。手で書き換えない）\n * 使い方：<html data-palette="テーマの id">。明るさ（data-theme）・密度（data-density）とは別に切り替えられる\n * 元の色・文字・角丸・余白：awesome-design-skills（Copyright (c) 2026 Bergside, MIT License）。名前と日本語対応・コントラスト調整は Workspace Kit\n */\n`;
mkdirSync(join(HERE, "dist"), { recursive: true });
writeFileSync(join(HERE, "dist/curated.css"), head("仕上げた12種") + css.curated.join("\n\n") + "\n");
writeFileSync(join(HERE, "dist/all.css"), head("全部（仕上げた12種＋変換のみ）") + css.all.join("\n\n") + "\n");
writeFileSync(join(HERE, "dist/catalog.json"), JSON.stringify(catalog, null, 1) + "\n");
const lite = catalog.filter((t) => t.status === "curated").map(({ id, label, desc, darkOnly, swatch, fonts }) => ({ id, label, desc, darkOnly, swatch, href: fonts.href }));
writeFileSync(
  join(HERE, "dist/catalog.mjs"),
  `// packages/themes/convert.mjs が生成。仕上げた12種の一覧（画面のテーマ選びに使う）\nexport const PALETTES = ${JSON.stringify(lite, null, 1)};\n`,
);
writeFileSync(
  join(HERE, "dist/catalog.d.mts"),
  `export type Palette = { id: string; label: string; desc: string; darkOnly: boolean; swatch: string[]; href: string };\nexport declare const PALETTES: Palette[];\n`,
);

// ---- RESULTS.md：結果の表 ----
const STATUS_JA = { curated: "仕上げ済み", converted: "変換済み・手直し前", excluded: "除外（コントラスト）", "excluded-brand": "除外（他社名）" };
const ratio = (a) => (a ? a.min.toFixed(2) : "—（常に暗い）");
const reason = (t) => {
  if (t.status === "excluded-brand") {
    const reused = catalog.find((c) => c.status === "curated" && c.from === t.id);
    return `テーマ名が他社の名前（配る物に他社名を看板として出さない）${reused ? `。色は仕上げの「${reused.label}」の元に使っている` : ""}`;
  }
  if (t.status !== "excluded") return "";
  const f = [...(t.contrast.light?.fails ?? []).map((x) => `ライト ${x.pair} ${x.ratio}`), ...t.contrast.dark.fails.map((x) => `ダーク ${x.pair} ${x.ratio}`)];
  return `明るさを動かしても 4.5 に届かない：${f.join("、")}`;
};
const adjustedText = (t) => {
  const l = t.contrast.light?.adjusted ?? [];
  const d = t.contrast.dark.adjusted;
  return [l.length ? `ライト：${l.join("・")}` : "", d.length ? `ダーク：${d.join("・")}` : ""].filter(Boolean).join(" ／ ") || "なし";
};
const row = (t) =>
  `| ${t.id} | ${t.label} | ${t.from ?? "（独自）"} | ${STATUS_JA[t.status]} | ${ratio(t.contrast.light)} | ${ratio(t.contrast.dark)} | ${t.status === "excluded" ? "✗" : "✓"} | ${adjustedText(t)} | ${reason(t)} |`;
const TABLE_HEAD = "| id | 名前 | 元テーマ | 区分 | ライトの最小比 | ダークの最小比 | 4.5 以上 | 明るさを直した色 | 除外の理由 |\n|---|---|---|---|---|---|---|---|---|";
const groups = [
  ["仕上げた12種（dist/curated.css・画面のテーマ選びに出る）", (t) => t.status === "curated"],
  ["変換済み・手直し前（dist/all.css にだけ入る）", (t) => t.status === "converted"],
  ["除外", (t) => t.status === "excluded" || t.status === "excluded-brand"],
];
// 字体の対応表：元の67種が使う英字の字体ごとに、置き換え・本文に使うか・組み合わせる日本語
const latinFonts = [...new Set(Object.values(src).flatMap((s) => [s.fonts.heading, s.fonts.body]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const fontRows = latinFonts.map((f) => {
  const g = SUBSTITUTE[f] ?? f;
  const text = isText(g);
  const jp = text ? jpOf(g) : SERIF_DISPLAY.includes(g) ? "Noto Serif JP（見出し）" : "本文側の日本語の字体に合わせる";
  return `| ${f} | ${g === f ? "" : g} | ${text ? `本文・見出し（${{ sans: "ゴシック", serif: "明朝", mono: "等幅" }[kindOf(g)]}）` : "見出しだけ（飾り文字。本文は Noto Sans JP）"} | ${jp} |`;
});
const count = (s) => catalog.filter((t) => t.status === s).length;
const md = `# テーマの変換結果

\`node packages/themes/convert.mjs\` が書き出す（手で書き換えない）。元は awesome-design-skills の ${Object.keys(src).length}種（MIT）。

- 合否の基準：文字と背景の組（${PAIRS.length}組：${PAIRS.map((p) => p.join("/")).join("、")}）の、いちばん低いコントラスト比が 4.5 以上
- 落ちた色は、色味を保ったまま明るさだけを 0.01 ずつ動かして 4.6 まで直す（「明るさを直した色」の欄）。それでも届かないものは除外
- 数：仕上げ ${count("curated")}種／変換済み・手直し前 ${count("converted")}種／除外（コントラスト） ${count("excluded")}種／除外（他社名） ${count("excluded-brand")}種
- 主色からは 50〜950 の11段階を作り、\`--wk-accent-50\` … \`--wk-accent-950\` で使える（Tailwind では \`bg-accent-100\` など）
- 元の余白（spacing の sm／md）は \`--wk-space-sm\`／\`--wk-space-md\` に入れる。4px／8px を下限にする

${groups.map(([title, pick]) => `## ${title}\n\n${TABLE_HEAD}\n${catalog.filter(pick).map(row).join("\n") || "| （なし） |||||||||"}`).join("\n\n")}

## 英字 → 日本語の字体の対応表

英字の字体に、形の近い日本語の字体を組み合わせる。Google Fonts に無い字体は近いものに置き換える。手で仕上げた12種は \`curated.json\` の \`fonts.jp\` で個別に決めているものがある（例：クリニック→Zen Maru Gothic、リーフ→M PLUS Rounded 1c）。

| 元の英字の字体 | 置き換え | 使い方 | 日本語の字体 |
|---|---|---|---|
${fontRows.join("\n")}
`;
writeFileSync(join(HERE, "RESULTS.md"), md);

console.log(`仕上げ ${count("curated")}種／変換のみ ${count("converted")}種／除外（コントラスト不足） ${count("excluded")}種／除外（他社名） ${count("excluded-brand")}種（元 ${Object.keys(src).length}種を全部変換・検査）`);
for (const t of catalog.filter((x) => x.status === "excluded")) console.log(`  除外：${t.id}`, reason(t));

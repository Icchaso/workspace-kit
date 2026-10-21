/**
 * テーマ変換：awesome-design-skills（67種・MIT）の色・文字・角丸 → Workspace Kit のトークン（--wk-*）
 *
 *   node convert.mjs
 *
 * やること
 *   1. 元テーマの主色・状態色・面の色を OKLCH（人の目の明るさに沿った色の表し方）で読み、
 *      ライト／ダークの両方の面・文字・ブランド色を作り直す（元の面の色はそのまま使わない＝暗いテーマも明るい版を持てる）
 *   2. 文字と背景の差（コントラスト比）を 4.5:1 以上になるまで明るさだけ動かして直す。直しても届かない組は除外
 *   3. 英字フォントに日本語フォントを組み合わせる（本文に向かない飾り文字は見出しだけに使う）
 *   4. 書き出し：dist/curated.css（仕上げた12種）・dist/all.css（全部）・dist/catalog.json（一覧と検査結果）・dist/catalog.mjs
 * 色は計算を OKLCH で行い、書き出しは 16進（#rrggbb）にする（どのブラウザ・検査ツールでも同じ色として読めるように）。
 */
import { clampChroma, converter, formatHex, wcagContrast } from "culori";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const oklch = converter("oklch");
const MIN = 4.6; // 4.5 に少し余裕を持たせる
const src = JSON.parse(readFileSync(new URL("./source/awesome-design-skills.json", import.meta.url)));
const curated = JSON.parse(readFileSync(new URL("./curated.json", import.meta.url)));

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
const worst = (fg, bgs) => Math.min(...bgs.map((b) => cr(fg, b)));

// ---- フォント ----
const TEXT_SANS = ["Inter", "Poppins", "Plus Jakarta Sans", "Open Sans", "Roboto", "Montserrat", "Jost", "Outfit", "Geist", "Space Grotesk", "IBM Plex Sans", "Nunito", "Chakra Petch", "Darker Grotesque", "Zen Maru Gothic"];
const TEXT_SERIF = ["Gelasio", "IBM Plex Serif", "STIX Two Text", "Noto Serif Display"];
const TEXT_MONO = ["JetBrains Mono", "IBM Plex Mono", "Space Mono"];
const SERIF_DISPLAY = ["Playfair Display", "DM Serif Display", "Abril Fatface"];
// Google Fonts に無いもの → 近いものに置き換える
const SUBSTITUTE = { "Anthropic Sans": "Inter", "Google Sans": "Inter", "Cossette Texte": "Gelasio" };
// 1つの太さしか無いフォント（太さを指定すると Google Fonts がエラーを返す）
const WEIGHTS = {
  "Zen Maru Gothic": "400;500;700",
  "M PLUS Rounded 1c": "400;500;700",
  "Space Mono": "400;700",
  "Silkscreen": "400;700",
};
const SINGLE = ["Bangers", "Limelight", "Audiowide", "Delius Swash Caps", "New Rocker", "Macondo", "Fascinate", "Germania One", "Delicious Handrawn", "VT323", "Press Start 2P", "Archivo Black", "DM Serif Display", "Abril Fatface"];

function pairFonts(fonts = {}, jpOverride) {
  const fix = (f) => (f ? (SUBSTITUTE[f] ?? f) : null);
  const head = fix(fonts.heading) ?? fix(fonts.body) ?? "Inter";
  let body = fix(fonts.body) ?? head;
  if (![...TEXT_SANS, ...TEXT_SERIF, ...TEXT_MONO].includes(body)) body = null; // 飾り文字は本文に使わない
  const bodyKind = !body ? "sans" : TEXT_SERIF.includes(body) ? "serif" : TEXT_MONO.includes(body) ? "mono" : "sans";
  const jp =
    jpOverride ??
    (body === "IBM Plex Sans" ? "IBM Plex Sans JP" : body === "Nunito" ? "M PLUS Rounded 1c" : body === "Zen Maru Gothic" ? "Zen Maru Gothic" : bodyKind === "serif" ? "Noto Serif JP" : bodyKind === "mono" ? "M PLUS 1 Code" : "Noto Sans JP");
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
function palette(colors, scheme) {
  const p = lch(colors.primary);
  const surf = colors.surface ? lch(colors.surface) : { l: 1, c: 0, h: p.h };
  // 面の色味：元の面に色があればその色相、無ければ主色の色相をほんの少しだけ
  const hn = surf.c > 0.01 ? surf.h : p.h;
  const tint = surf.c > 0.01 ? Math.min(surf.c, 0.02) : 0.004;
  const dark = scheme === "dark";
  const t = {};

  if (!dark) {
    t.canvas = C(0.975, tint, hn);
    t.sidebar = C(0.952, tint * 1.3, hn);
    t.surface = C(0.997, tint * 0.3, hn);
    t["surface-2"] = C(0.948, tint * 1.3, hn);
    t.line = C(0.895, tint * 1.5, hn);
    t.fg = C(0.22, Math.min(tint * 2, 0.02), hn);
    t["fg-2"] = fit(C(0.43, Math.min(tint * 2, 0.02), hn), [t.surface, t.canvas, t["surface-2"]], -1);
    t["fg-3"] = fit(C(0.56, Math.min(tint * 2, 0.02), hn), [t.surface, t.canvas, t["surface-2"]], -1);
  } else {
    t.canvas = C(0.17, tint * 1.2, hn);
    t.sidebar = C(0.15, tint * 1.2, hn);
    t.surface = C(0.215, tint * 1.2, hn);
    t["surface-2"] = C(0.26, tint * 1.3, hn);
    t.line = C(0.31, tint * 1.4, hn);
    t.fg = C(0.94, Math.min(tint, 0.012), hn);
    t["fg-2"] = fit(C(0.8, Math.min(tint, 0.012), hn), [t.surface, t.canvas, t["surface-2"]], 1);
    t["fg-3"] = fit(C(0.68, Math.min(tint, 0.012), hn), [t.surface, t.canvas, t["surface-2"]], 1);
  }

  // ブランド色：塗り（accent）と、その上の文字（on-accent）
  let accent = dark ? C(Math.max(p.l, 0.72), p.c, p.h) : C(p.l, p.c, p.h);
  const white = C(1, 0, 0);
  const ink = dark ? C(0.18, Math.min(p.c * 0.3, 0.04), p.h) : C(0.2, Math.min(p.c * 0.3, 0.04), p.h);
  let onAccent = cr(white, accent) >= cr(ink, accent) ? white : ink;
  if (cr(onAccent, accent) < MIN) {
    // どちらでも足りない中間の明るさ → 白文字が読めるところまで塗りを暗く（ダークでは黒文字が読めるところまで明るく）
    accent = dark ? fit(accent, [ink], 1) : fit(accent, [white], -1);
    onAccent = dark ? ink : white;
  }
  t.accent = accent;
  t["on-accent"] = onAccent;
  t["accent-soft"] = dark ? C(0.29, Math.min(p.c * 0.45, 0.07), p.h) : C(0.945, Math.min(p.c * 0.28, 0.045), p.h);
  t["accent-text"] = fit(C(dark ? Math.max(p.l, 0.75) : Math.min(p.l, 0.55), p.c, p.h), [t.surface, t.canvas, t["accent-soft"], t["surface-2"]], dark ? 1 : -1);

  // 状態の色（文字として読める濃さ＋淡い下地）
  for (const [name, key] of [["ok", "success"], ["warn", "warning"], ["danger", "danger"]]) {
    const s = lch(colors[key] ?? { success: "#16a34a", warning: "#d97706", danger: "#dc2626" }[key]);
    t[`${name}-soft`] = dark ? C(0.27, Math.min(s.c * 0.4, 0.06), s.h) : C(0.955, Math.min(s.c * 0.25, 0.04), s.h);
    t[name] = fit(C(dark ? 0.78 : 0.5, s.c, s.h), [t.surface, t.canvas, t[`${name}-soft`]], dark ? 1 : -1);
  }
  t["on-danger"] = dark ? fit(C(0.2, 0.03, t.danger.h), [t.danger], -1) : fit(C(1, 0, 0), [t.danger], -1);
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
  const { light, dark, fonts, r, darkOnly, title } = theme;
  const common = `--wk-font: ${fonts.font}; --wk-font-head: ${fonts.fontHead}; --wk-r-sm: ${r.sm}px; --wk-r-md: ${r.md}px; --wk-r-lg: ${r.lg}px;`;
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
const all = [];
for (const c of curated.themes) {
  const s = c.from ? src[c.from] : null;
  const colors = { ...(s?.colors ?? {}), ...(c.colors ?? {}) };
  const fonts = pairFonts({ ...(s?.fonts ?? {}), ...(c.fonts?.body ? { heading: c.fonts.heading ?? c.fonts.body, body: c.fonts.body } : {}) }, c.fonts?.jp);
  const rr = { ...(s?.rounded ?? {}), ...(c.rounded ?? {}) };
  const r = { sm: px(rr.sm, 6), md: px(rr.md, 10), lg: px(rr.lg, px(rr.md, 10) + 4) };
  all.push({ id: c.id, label: c.label, desc: c.desc, from: c.from, status: "curated", darkOnly: !!c.darkOnly, colors, fonts, r, title: `${c.label}${c.from ? `（元：${c.from} ／ awesome-design-skills・MIT）` : "（Workspace Kit 独自）"}` });
}
for (const [key, s] of Object.entries(src)) {
  if (curated.excludeBrandNamed.includes(key)) continue;
  const rr = s.rounded ?? {};
  all.push({ id: key, label: s.name, desc: s.overview, from: key, status: "converted", darkOnly: false, colors: s.colors, fonts: pairFonts(s.fonts), r: { sm: px(rr.sm, 4), md: px(rr.md, 8), lg: px(rr.md, 8) + 4 }, title: `${s.name}（元：${key} ／ awesome-design-skills・MIT／手直し前）` });
}

const catalog = [];
const css = { curated: [], all: [] };
for (const th of all) {
  th.light = palette(th.colors, "light");
  th.dark = palette(th.colors, "dark");
  const la = audit(th.light);
  const da = audit(th.dark);
  const ok = (th.darkOnly || la.pass) && da.pass;
  const swatchFrom = th.darkOnly ? th.dark : th.light;
  catalog.push({
    id: th.id,
    label: th.label,
    desc: th.desc,
    from: th.from,
    status: ok ? th.status : "excluded",
    darkOnly: th.darkOnly,
    swatch: ["canvas", "fg", "accent", "accent-soft"].map((k) => hex(swatchFrom[k])),
    fonts: { body: th.fonts.body, head: th.fonts.head, jp: th.fonts.jp, href: th.fonts.href },
    radius: th.r,
    contrast: { light: th.darkOnly ? null : { min: la.min, fails: la.fails }, dark: { min: da.min, fails: da.fails } },
  });
  if (!ok) continue;
  const b = block(th.id, th);
  css.all.push(b);
  if (th.status === "curated") css.curated.push(b);
}

const head = (what) =>
  `/*\n * Workspace Kit テーマ集：${what}（packages/themes/convert.mjs が生成。手で書き換えない）\n * 使い方：<html data-palette="テーマの id">。明るさ（data-theme）・密度（data-density）とは別に切り替えられる\n * 元の色・文字・角丸：awesome-design-skills（Copyright (c) 2026 Bergside, MIT License）。名前と日本語対応・コントラスト調整は Workspace Kit\n */\n`;
mkdirSync(new URL("./dist/", import.meta.url), { recursive: true });
writeFileSync(new URL("./dist/curated.css", import.meta.url), head("仕上げた12種") + css.curated.join("\n\n") + "\n");
writeFileSync(new URL("./dist/all.css", import.meta.url), head("全部（仕上げた12種＋変換のみ）") + css.all.join("\n\n") + "\n");
writeFileSync(new URL("./dist/catalog.json", import.meta.url), JSON.stringify(catalog, null, 1) + "\n");
const lite = catalog.filter((t) => t.status === "curated").map(({ id, label, desc, darkOnly, swatch, fonts }) => ({ id, label, desc, darkOnly, swatch, href: fonts.href }));
writeFileSync(
  new URL("./dist/catalog.mjs", import.meta.url),
  `// packages/themes/convert.mjs が生成。仕上げた12種の一覧（画面のテーマ選びに使う）\nexport const PALETTES = ${JSON.stringify(lite, null, 1)};\n`,
);
writeFileSync(
  new URL("./dist/catalog.d.mts", import.meta.url),
  `export type Palette = { id: string; label: string; desc: string; darkOnly: boolean; swatch: string[]; href: string };\nexport declare const PALETTES: Palette[];\n`,
);

const n = (s) => catalog.filter((t) => t.status === s).length;
console.log(`仕上げ ${n("curated")}種／変換のみ ${n("converted")}種／除外（コントラスト不足） ${n("excluded")}種／ブランド名で除外 ${curated.excludeBrandNamed.length}種`);
for (const t of catalog.filter((x) => x.status === "excluded")) console.log(`  除外：${t.id}`, JSON.stringify(t.contrast).slice(0, 200));

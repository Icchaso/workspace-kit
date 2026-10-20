/**
 * Workspace Kit の画面チェック（数値で合否を出す）
 *
 *   node scripts/check-ui.mjs [ベースURL] [出力フォルダ]
 *   例）node scripts/check-ui.mjs http://127.0.0.1:3456 screenshots/check
 *
 * 6つの幅（スマホ 375・390 は指、768・1024・1280・1440 はマウス）× ライト/ダーク × 全画面 で撮影し、次を確かめる：
 *   1. 横へのはみ出しが無い
 *   2. ナビがどの幅でも1つ見える（767px 以下＝下タブ、768px 以上＝サイドバーかアイコン列）
 *   3. 12px より小さい文字が無い
 *   4. 指で触る幅では、押せるものが 44px 以上
 *   5. 文字と背景の差（コントラスト）など、axe-core の WCAG A/AA の指摘が無い
 *   6. 下タブの動き：押した瞬間に選択表示／丸い板が 120〜260ms で止まる／途中で 1.12 倍以上に伸びる／動きを減らす設定では瞬間移動
 *   7. 画面の切り替え：下タブを押してから見出しが変わるまで 150ms 未満
 *   8. コンソールにエラーが出ていない
 * 1つでも落ちたら終了コード 1。
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const base = process.argv[2] ?? "http://127.0.0.1:3456";
const out = process.argv[3] ?? "screenshots/check";
const ROUTES = (process.env.ROUTES ?? "/,/tasks,/ai,/settings").split(",");
const VIEWPORTS = [
  { name: "phone-375", width: 375, height: 812, touch: true },
  { name: "phone-390", width: 390, height: 844, touch: true },
  { name: "tablet-768", width: 768, height: 1024, touch: false },
  { name: "pc-1024", width: 1024, height: 768, touch: false },
  { name: "pc-1280", width: 1280, height: 800, touch: false },
  { name: "pc-1440", width: 1440, height: 900, touch: false },
];
mkdirSync(out, { recursive: true });

const failures = [];
const notes = [];
const consoleErrors = [];
const fail = (where, msg) => failures.push(`✗ ${where}：${msg}`);

const browser = await chromium.launch();

async function open(vp, { dark = false, reduced = false } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    hasTouch: vp.touch,
    isMobile: vp.touch,
    colorScheme: dark ? "dark" : "light",
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(`[${vp.name}] ${m.text()}`));
  page.on("pageerror", (e) => consoleErrors.push(`[${vp.name}] ${e.message}`));
  return { ctx, page };
}

const slug = (r) => (r === "/" ? "today" : r.replace(/\//g, ""));

// ---- 1〜5：幅 × 明るさ × 画面 ----
for (const vp of VIEWPORTS) {
  for (const dark of [false, true]) {
    const { ctx, page } = await open(vp, { dark });
    for (const route of ROUTES) {
      const where = `${slug(route)} ${vp.name} ${dark ? "ダーク" : "ライト"}`;
      await page.goto(base + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(250);
      await page.screenshot({ path: join(out, `${slug(route)}-${vp.name}-${dark ? "dark" : "light"}.png`) });

      const r = await page.evaluate((touch) => {
        const visible = (el) => {
          const s = getComputedStyle(el);
          const b = el.getBoundingClientRect();
          return s.display !== "none" && s.visibility !== "hidden" && b.width > 0 && b.height > 0 && !el.closest(".sr-only,[aria-hidden=true]");
        };
        const nav = [...document.querySelectorAll("[data-nav]")].filter(visible).map((n) => n.dataset.nav);
        const tiny = [];
        for (const el of document.querySelectorAll("body *")) {
          if (!visible(el)) continue;
          const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          if (own && parseFloat(getComputedStyle(el).fontSize) < 12) tiny.push(el.textContent.trim().slice(0, 20));
        }
        const small = [];
        if (touch) {
          for (const el of document.querySelectorAll("a[href],button,input,select,textarea,[role=button]")) {
            if (!visible(el)) continue;
            const b = el.getBoundingClientRect();
            if (b.width < 44 || b.height < 44) small.push(`${(el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 16)} ${Math.round(b.width)}×${Math.round(b.height)}`);
          }
        }
        return { overflow: document.documentElement.scrollWidth - innerWidth, nav, tiny, small };
      }, vp.touch);

      if (r.overflow > 1) fail(where, `横に ${r.overflow}px はみ出している`);
      const expect = vp.width < 768 ? "tabbar" : "side";
      if (r.nav.length !== 1 || r.nav[0] !== expect) fail(where, `ナビが「${r.nav.join("・") || "無し"}」（期待：${expect}）`);
      if (r.tiny.length) fail(where, `12px 未満の文字 ${r.tiny.length}件（例：${r.tiny.slice(0, 3).join(" / ")}）`);
      if (r.small.length) fail(where, `44px 未満の押せるもの ${r.small.length}件（例：${r.small.slice(0, 3).join(" / ")}）`);

      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      for (const v of axe.violations) fail(where, `axe「${v.id}」${v.nodes.length}か所（${v.help}）`);
    }
    await ctx.close();
  }
}

// ---- 6・7：下タブの動きと切り替えの速さ（スマホ 390・ライト） ----
async function measureTab(reduced) {
  const vp = VIEWPORTS[1];
  const { ctx, page } = await open(vp, { reduced });
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const nav = page.locator("[data-nav=tabbar]");
  const box = await nav.boundingBox();
  const count = await nav.locator("a").count();
  // ページの中で、押した瞬間からの変化を毎フレーム記録する
  await page.evaluate(() => {
    const nav = document.querySelector("[data-nav=tabbar]");
    const pill = nav.children[1];
    const h1 = () => document.querySelector("h1")?.textContent;
    const firstH1 = h1();
    const log = (window.__tab = { t0: 0, frames: [], h1At: null, onAt: null });
    nav.addEventListener("pointerdown", () => {
      log.t0 = performance.now();
      const loop = () => {
        const t = performance.now() - log.t0;
        const m = new DOMMatrixReadOnly(getComputedStyle(pill).transform);
        const bar = new DOMMatrixReadOnly(getComputedStyle(nav.children[0]).transform);
        log.frames.push({ t, x: m.m41, sx: m.a, bar: bar.a });
        if (log.onAt === null && nav.querySelectorAll("a")[1].classList.contains("text-fg")) log.onAt = t;
        if (log.h1At === null && h1() !== firstH1) log.h1At = t;
        if (t < 700) requestAnimationFrame(loop);
      };
      loop();
    }, { capture: true });
  });
  // 2番目のタブを押して 90ms 後に離す（人の指の速さ）
  const x = box.x + (box.width / count) * 1.5;
  const y = box.y + box.height / 2;
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await page.waitForTimeout(90);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(800);
  const log = await page.evaluate(() => window.__tab);
  await ctx.close();
  const target = log.frames.at(-1).x;
  const release = 90;
  const settled = log.frames.find((f, i) => f.t > release && log.frames.slice(i).every((g) => Math.abs(g.x - target) < 2));
  return {
    onAt: log.onAt,
    h1At: log.h1At,
    settleMs: settled ? settled.t - release : null,
    maxStretch: Math.max(...log.frames.map((f) => f.sx)),
    maxBar: Math.max(...log.frames.map((f) => f.bar)),
  };
}

const m = await measureTab(false);
notes.push(
  `下タブ：選択表示 ${m.onAt?.toFixed(0)}ms／板が止まるまで ${m.settleMs?.toFixed(0)}ms（離してから）／伸び 最大 ${m.maxStretch.toFixed(2)}倍／バー 最大 ${m.maxBar.toFixed(3)}倍／見出しが変わるまで ${m.h1At?.toFixed(0)}ms`,
);
if (m.onAt === null || m.onAt > 50) fail("下タブ", `押してから選択表示まで ${m.onAt}ms（50ms 以内のはず）`);
if (m.settleMs === null || m.settleMs < 120 || m.settleMs > 260) fail("下タブ", `板が止まるまで ${m.settleMs}ms（120〜260ms のはず）`);
if (m.maxStretch < 1.12) fail("下タブ", `移動中の伸びが ${m.maxStretch.toFixed(2)}倍（1.12倍以上のはず）`);
if (m.maxBar < 1.015) fail("下タブ", `押している間のふくらみが ${m.maxBar.toFixed(3)}倍（1.03倍前後のはず）`);
if (m.h1At === null || m.h1At - 90 > 150) fail("画面の切り替え", `指を離してから見出しが変わるまで ${m.h1At === null ? "変わらない" : (m.h1At - 90).toFixed(0) + "ms"}（150ms 未満のはず）`);

const r = await measureTab(true);
notes.push(`下タブ（動きを減らす）：板が止まるまで ${r.settleMs?.toFixed(0)}ms／伸び 最大 ${r.maxStretch.toFixed(2)}倍／バー 最大 ${r.maxBar.toFixed(3)}倍`);
if (r.settleMs === null || r.settleMs > 40) fail("下タブ（動きを減らす）", `板が止まるまで ${r.settleMs}ms（瞬間移動のはず）`);
if (r.maxBar > 1.001 || r.maxStretch > 1.001) fail("下タブ（動きを減らす）", "ふくらみ・伸びが残っている");

await browser.close();

// ---- 8：コンソールエラー ----
for (const e of [...new Set(consoleErrors)]) fail("コンソール", e.slice(0, 160));

const total = VIEWPORTS.length * 2 * ROUTES.length;
const report = [
  `画面チェック：${total} 画面を撮影（${out}）`,
  ...notes,
  failures.length ? `\n落ちた項目 ${failures.length}件：` : "\n全項目 合格",
  ...failures,
].join("\n");
writeFileSync(join(out, "report.txt"), report + "\n");
console.log(report);
process.exit(failures.length ? 1 : 0);

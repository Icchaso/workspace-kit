"use client";

/** 設定：明るさ・行の高さ・この端末の操作方法・見本データの初期化（元に戻せないので確認を挟む） */
import { useState } from "react";
import { Button } from "@/components/kit/button";
import { ConfirmDialog } from "@/components/kit/confirm-dialog";
import { Page, PageHeader } from "@/components/kit/feedback";
import { Segmented } from "@/components/kit/segmented";
import { notify } from "@/components/kit/toast";
import { PALETTES } from "@workspace-kit/themes/catalog";
import { setDensity, setPalette, setTheme, useCoarsePointer, useDensity, usePalette, useTheme, type Density, type Theme } from "@/lib/prefs";
import { cn } from "@/lib/cn";
import { useTasks } from "@/lib/tasks";

function Row({ title, help, children }: { title: string; help: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3.5">
      <div>
        <div className="text-sm">{title}</div>
        <div className="text-xs text-fg-3">{help}</div>
      </div>
      {children}
    </div>
  );
}

export function SettingsView() {
  const theme = useTheme();
  const density = useDensity();
  const coarse = useCoarsePointer();
  const palette = usePalette();
  const darkOnly = PALETTES.find((p) => p.id === palette)?.darkOnly;
  const { reset } = useTasks();
  const [confirming, setConfirming] = useState(false);

  return (
    <Page>
      <PageHeader title="設定" sub="見た目と、この端末での使い心地" />
      <section className="mt-2" aria-labelledby="palette-h">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="palette-h" className="text-base font-semibold">
            テーマ
          </h2>
          <span className="text-xs text-fg-3">色・文字・角の丸みがまとめて変わります</span>
        </div>
        <div role="group" aria-label="テーマ" className="grid grid-cols-1 gap-2 rail:grid-cols-2 side:grid-cols-3">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={palette === p.id}
              onClick={() => setPalette(p.id)}
              className={cn(
                "flex min-h-row items-center gap-3 rounded-md border bg-surface px-3 py-2.5 text-left transition-[background-color,border-color,scale] ease-out hover:bg-surface-2 active:scale-(--wk-press-card) active:duration-[var(--wk-dur-press)]",
                palette === p.id ? "border-accent ring-1 ring-accent" : "border-line",
              )}
            >
              <span aria-hidden className="grid flex-none grid-cols-2 overflow-hidden rounded-sm border border-line">
                {p.swatch.map((c, i) => (
                  <i key={i} className="block size-3.5" style={{ background: c }} />
                ))}
              </span>
              <span className="min-w-0">
                <b className="block text-sm font-semibold">{p.label}</b>
                <span className="block text-xs text-fg-3">{p.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="mb-1 text-base font-semibold">表示</h2>
        <Row title="明るさ" help={darkOnly ? "このテーマは常に暗い表示です" : "端末の設定に合わせるか、固定するか"}>
          <Segmented<Theme>
            label="明るさ"
            value={theme}
            onChange={setTheme}
            options={[
              { value: "system", label: "端末に合わせる" },
              { value: "light", label: "ライト" },
              { value: "dark", label: "ダーク" },
            ]}
          />
        </Row>
        <Row title="行の高さ" help="詰めると一覧に多く並びます（指で触る端末では詰めすぎない）">
          <Segmented<Density>
            label="行の高さ"
            value={density}
            onChange={setDensity}
            options={[
              { value: "comfy", label: "ゆったり" },
              { value: "compact", label: "詰める" },
            ]}
          />
        </Row>
        <Row title="この端末の操作" help="ボタンの大きさは画面幅ではなく「指かマウスか」で決めています">
          <b className="text-sm font-medium">{coarse ? "指（ボタン 44px）" : "マウス（ボタン 36px）"}</b>
        </Row>
      </section>
      <section className="mt-8">
        <h2 className="mb-1 text-base font-semibold">データ</h2>
        <Row title="見本データに戻す" help="追加・完了・削除した内容が消えます。元に戻せません">
          <Button variant="danger" onClick={() => setConfirming(true)}>
            見本データに戻す
          </Button>
        </Row>
      </section>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="見本データに戻しますか？"
        body="追加・完了・削除した内容はすべて消え、元に戻せません。"
        confirmLabel="戻す"
        onConfirm={() => {
          reset();
          notify("見本データに戻しました");
        }}
      />
    </Page>
  );
}

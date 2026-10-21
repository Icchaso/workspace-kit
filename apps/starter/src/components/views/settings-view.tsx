"use client";

/** 設定：明るさ・行の高さ・この端末の操作方法・見本データの初期化（元に戻せないので確認を挟む） */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Page, PageHeader } from "@/components/ui/feedback";
import { Segmented } from "@/components/ui/segmented";
import { notify } from "@/components/ui/toast";
import { setDensity, setTheme, useCoarsePointer, useDensity, useTheme, type Density, type Theme } from "@/lib/prefs";
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
  const { reset } = useTasks();
  const [confirming, setConfirming] = useState(false);

  return (
    <Page>
      <PageHeader title="設定" sub="見た目と、この端末での使い心地" />
      <section className="mt-2">
        <h2 className="mb-1 text-base font-semibold">表示</h2>
        <Row title="明るさ" help="端末の設定に合わせるか、固定するか">
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

"use client";

/*
 * Workspace Kit の下タブのガラスの入れ物。元は @zakisheriff/liquid-glass 4.0.3 の LensTrack（Copyright (c) 2026 Zaki Sheriff、MIT License。全文は同じフォルダの LICENSE）。
 * WK: 中の項目（リンク・ボタン）は呼ぶ側が描く。役割（tablist/tab）は付けず、下タブはリンクの並び（nav）のままにする。
 *
 *   止まっているとき … 選んだタブの下に、バーより少し灰色の薄い玉（.lg-track__select）
 *   指が触れた瞬間   … 玉が持ち上がって澄んだ泡のレンズになり、下のアイコンを拡大して色を塗る（onPress）
 *   なぞる           … レンズが指についてきて、速さに応じて伸び、止まるとぷるんと揺れる
 *   離した瞬間       … 一番近いタブへ落ちて揺れながら収まる（onSelect）
 */
import React, { useRef } from "react";
import { useLensTrack } from "./lensTrack";
import { useRefraction } from "./refraction";

export type LensTrackItemProps = {
  "data-lg-item": number;
  className: string;
};

export type LensTrackProps = {
  count: number;
  /** 選んでいる項目。-1 はどれも選ばない（玉を隠す） */
  index: number;
  /** 離した瞬間（今の項目でも呼ぶ） */
  onSelect: (index: number) => void;
  /** 触れた瞬間・なぞって別の項目に乗った瞬間 */
  onPress?: (index: number) => void;
  /** i 番目の項目を描く。渡した props（data-lg-item・className）をそのまま付ける */
  renderItem: (index: number, props: LensTrackItemProps) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const ZOOM = 1.04;

export function LensTrack({ count, index, onSelect, onPress, renderItem, className, style }: LensTrackProps) {
  const bar = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLSpanElement>(null);
  const lens = useRef<HTMLSpanElement>(null);
  const select = useRef<HTMLSpanElement>(null);

  useRefraction(glass, { kind: "surface", strength: 1 });
  // レンズはバーの拡大した写しを映し、縁で曲げる（Chrome は本物の屈折、Safari は写しを SVG で曲げる）
  useRefraction(
    lens,
    { kind: "lens", strength: 1, stretch: 1, bezel: 24, zoom: ZOOM, dispersion: 1, copy: "refract", copyOnly: true },
    true,
    bar,
    () => bar.current?.hasAttribute("data-lifted") ?? false,
  );

  useLensTrack(
    { bar, glass, lens, select },
    {
      count,
      index: Math.max(0, index),
      onSelect,
      onPress,
      arrowKeys: false,
      overhang: 14,
      spread: 0.3,
      contentZoom: ZOOM,
      copied: true,
      // WK: スライム感を強める（元は 14）。触っている間、バー全体が横に少しふくらむ
      swell: 22,
      pull: true,
    },
  );

  return (
    <div
      ref={bar}
      className={["lg-track", "lg-track--tabbar", "lg-nav", className].filter(Boolean).join(" ")}
      data-liquid-glass=""
      data-wk-none={index < 0 ? "" : undefined}
      style={{ ...style, "--lg-count": count, "--lg-index": Math.max(0, index) } as React.CSSProperties}
    >
      <span ref={glass} className="lg-glass lg-track__glass" aria-hidden="true" />
      <span ref={select} className="lg-track__select" aria-hidden="true" />
      {Array.from({ length: count }, (_, i) => (
        <React.Fragment key={i}>{renderItem(i, { "data-lg-item": i, className: "lg-track__item" })}</React.Fragment>
      ))}
      <span ref={lens} className="lg-glass lg-track__lens" data-lg-mirror-bare="" aria-hidden="true" />
    </div>
  );
}

"use client";

/**
 * 長押し（指で触る端末だけ）。0.45 秒押し続けると、押している物が少し沈み（data-held）、軽く震える。
 * シートは「指を離したとき」に開く（押したまま開くと、指を離した瞬間にシートが閉じてしまうため）。
 * 8px 以上動いたらスクロールとみなして取り消す。長押しのあとに来る「タップ」は捨てる。
 * マウスでは何もしない（マウスは … ボタンで操作する）。
 */
import { useRef } from "react";

const DELAY = 450;
const SLOP = 8;

export function useLongPress<T>(onLongPress: (item: T) => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef<[number, number] | null>(null);
  const fired = useRef(false);
  const held = useRef<HTMLElement | null>(null);

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    start.current = null;
    if (held.current) delete held.current.dataset.held;
    held.current = null;
  };

  return {
    /** 行やカードに付ける */
    bind: (item: T) => ({
      onPointerDown: (e: React.PointerEvent) => {
        if (e.pointerType === "mouse" || (e.target as HTMLElement).closest("[data-no-longpress]")) return;
        fired.current = false;
        start.current = [e.clientX, e.clientY];
        const el = e.currentTarget as HTMLElement;
        timer.current = setTimeout(() => {
          fired.current = true;
          timer.current = null;
          held.current = el;
          el.dataset.held = "";
          try {
            navigator.vibrate?.(8);
          } catch {}
        }, DELAY);
      },
      onPointerMove: (e: React.PointerEvent) => {
        if (start.current && Math.hypot(e.clientX - start.current[0], e.clientY - start.current[1]) > SLOP) cancel();
      },
      onPointerUp: () => {
        const open = fired.current;
        cancel();
        // 指を離した直後の「タップ」が済んでから開く
        if (open) setTimeout(() => onLongPress(item), 0);
      },
      onPointerCancel: () => {
        cancel();
        fired.current = false;
      },
      // 長押し中に OS のメニュー（コピーなど）を出さない
      onContextMenu: (e: React.MouseEvent) => {
        if (fired.current || timer.current) e.preventDefault();
      },
    }),
    /** タップの処理の先頭で呼ぶ。長押しの直後なら true（＝そのタップは無視する） */
    consumed: () => {
      const f = fired.current;
      fired.current = false;
      return f;
    },
  };
}

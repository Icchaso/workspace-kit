"use client";

/**
 * 数字が回って止まる表示（数字カード用）。0.52 秒で目標の数まで数え上げる。値が変わったら今の数から数え直す。
 * 動きを減らす設定では、最初から目標の数を出す。
 */
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect } from "react";

export function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const shown = useTransform(mv, (v) => String(Math.round(v)));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const c = animate(mv, value, { duration: 0.52, ease: [0.23, 1, 0.32, 1] });
    return () => c.stop();
  }, [value, reduce, mv]);

  return (
    <>
      <motion.span aria-hidden className="num">
        {shown}
      </motion.span>
      {/* 読み上げには最終の数だけを渡す */}
      <span className="sr-only">{value}</span>
    </>
  );
}

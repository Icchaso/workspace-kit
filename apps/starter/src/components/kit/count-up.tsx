"use client";

/**
 * 数字が回って止まる表示（数字カード用）。値が変わったときだけ、今の数から 0.24 秒で数え直す（何が増えた・減ったかが分かる）。
 * 画面を開いたときは最初から目標の数を出す（開くたびに 0 から数えると、毎日見る画面ではうるさく、読めるまで待たされる）。
 * 動きを減らす設定では数えずに切り替える。
 */
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect } from "react";

export function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const shown = useTransform(mv, (v) => String(Math.round(v)));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const c = animate(mv, value, { duration: 0.24, ease: [0.23, 1, 0.32, 1] }); // --wk-dur-base・--wk-ease-out
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

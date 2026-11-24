"use client";

/** 入れる部屋：スライダー・検索欄・チェック/ラジオ・星・時刻のホイール・コード入力 */
import { Mic, Star, Sun, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { GlassInput } from "../_glass/components/GlassInput";
import { GlassSlider } from "../_glass/components/GlassSlider";
import { Exhibit, KnobPick, Room, useDeck } from "../exhibit";

function Sliders() {
  const { intensity } = useDeck();
  const [v, setV] = useState(40);
  const [light, setLight] = useState(70);
  const [vol, setVol] = useState(35);
  const [step, setStep] = useState<number | "any">("any");
  return (
    <Exhibit
      id="slider"
      title="スライダー"
      lead="細い溝にレンズのつまみが乗る型と、コントロールセンターのような太い板の型があります。"
      minHeight={240}
      knobs={
        <KnobPick
          label="刻み"
          value={step}
          onChange={setStep}
          options={[
            { value: "any", label: "なめらか" },
            { value: 10, label: "10ずつ" },
            { value: 25, label: "25ずつ" },
          ]}
        />
      }
      specs={["なめらかにも、決まった刻みにも止められる", "端まで引くとゴムのように伸びて戻る", "太い板の型はアイコンと名前を中に置ける", "色は好きな色にできる"]}
    >
      <div className="grid w-full max-w-[320px] gap-5">
        <div className="grid gap-1">
          <GlassSlider value={v} onChange={setV} step={step} intensity={intensity} aria-label="値" />
          <p className="num text-center text-sm text-fg-2">{Math.round(v)}</p>
        </div>
        <div className="grid gap-3">
          <GlassSlider value={light} onChange={setLight} showThumb={false} icon={<Sun size={20} />} label="明るさ" step={step} intensity={intensity} aria-label="明るさ" />
          <GlassSlider value={vol} onChange={setVol} showThumb={false} icon={<Volume2 size={20} />} label="音量" step={step} intensity={intensity} aria-label="音量" />
        </div>
      </div>
    </Exhibit>
  );
}

function Inputs() {
  const { intensity } = useDeck();
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const words = ["見積書", "請求書", "議事録", "日報", "契約書", "見積の控え"];
  const hits = q ? words.filter((w) => w.includes(q)) : [];
  return (
    <Exhibit
      id="text-input"
      title="検索・入力欄"
      lead="ガラスの入力欄。書くと右に × が出て、押すと一度で消せます。検索は打つたびに候補が絞られます。"
      minHeight={240}
      specs={["検索の型は虫めがねが付く", "右端にマイクなどの小物を置ける", "× で一度に消せる", "上に小さな名前を付けられる"]}
    >
      <div className="grid w-full max-w-[320px] gap-3">
        <GlassInput type="search" value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ("")} placeholder="書類を探す" trailing={<Mic size={18} />} intensity={intensity} aria-label="書類を探す" />
        {q && (
          <ul className="grid gap-0.5 rounded-md bg-surface/85 p-1 text-sm">
            {hits.length ? hits.map((w) => <li key={w} className="rounded px-2 py-1.5">{w}</li>) : <li className="px-2 py-1.5 text-fg-3">「{q}」は見つかりません</li>}
          </ul>
        )}
        <GlassInput label="お名前" value={name} onChange={(e) => setName(e.target.value)} placeholder="山田 花子" intensity={intensity} />
      </div>
    </Exhibit>
  );
}

function Checks() {
  const [todo, setTodo] = useState([true, false, false]);
  const [plan, setPlan] = useState("month");
  return (
    <Exhibit
      id="check"
      title="チェック・ラジオ"
      lead="チェックは印が線を描くように入り、ラジオは選んだ丸が中からふくらみます。"
      stage="plain"
      specs={["チェック＝いくつでも選べる。ラジオ＝1つだけ選ぶ", "行のどこを押しても切り替わる（押せる所が広い）", "印の動きは 0.2 秒。動きを減らす設定では一瞬で入る"]}
    >
      <div className="grid w-full max-w-[300px] gap-4">
        <fieldset className="grid gap-1">
          <legend className="mb-1 text-xs text-fg-3">今日やること</legend>
          {["見積書を送る", "請求書を作る", "日報を書く"].map((t, i) => (
            <label key={t} className="flex min-h-hit cursor-pointer items-center gap-3 rounded-md px-2 hover:bg-surface-2">
              <input type="checkbox" className="peer sr-only" checked={todo[i]} onChange={() => setTodo((s) => s.map((v, j) => (j === i ? !v : v)))} />
              <span className="grid size-5 place-items-center rounded-[6px] border-[1.5px] border-fg-3 transition-colors duration-[var(--wk-dur-fast)] peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40">
                <svg viewBox="0 0 16 16" className="size-3.5 text-on-accent" aria-hidden>
                  <path
                    d="M3.5 8.5l3 3 6-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={todo[i] ? 0 : 1}
                    className="transition-[stroke-dashoffset] duration-200 ease-out motion-reduce:transition-none"
                  />
                </svg>
              </span>
              <span className={cn("text-sm transition-colors", todo[i] && "text-fg-3 line-through")}>{t}</span>
            </label>
          ))}
        </fieldset>
        <fieldset className="grid gap-1">
          <legend className="mb-1 text-xs text-fg-3">お支払い</legend>
          {[
            { v: "month", l: "毎月" },
            { v: "year", l: "1年まとめて（2か月分お得）" },
          ].map((o) => (
            <label key={o.v} className="flex min-h-hit cursor-pointer items-center gap-3 rounded-md px-2 hover:bg-surface-2">
              <input type="radio" name="museum-plan" className="peer sr-only" checked={plan === o.v} onChange={() => setPlan(o.v)} />
              <span className="grid size-5 place-items-center rounded-full border-[1.5px] border-fg-3 transition-colors peer-checked:border-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40">
                <span className={cn("size-2.5 rounded-full bg-accent transition-[scale] duration-200 ease-out motion-reduce:transition-none", plan === o.v ? "scale-100" : "scale-0")} />
              </span>
              <span className="text-sm">{o.l}</span>
            </label>
          ))}
        </fieldset>
      </div>
    </Exhibit>
  );
}

function Stars() {
  const [rate, setRate] = useState(3);
  const [hover, setHover] = useState<number | null>(null);
  const [popped, setPopped] = useState<number | null>(null);
  const [pressing, setPressing] = useState(false);
  const row = useRef<HTMLDivElement>(null);
  const shown = hover ?? rate;
  // マウスを乗せているだけ（押していない）ときは「下見」。薄い星で見せ、決まった評価とは見分けがつくようにする
  const preview = hover !== null && !pressing;
  const at = (x: number) => {
    const r = row.current!.getBoundingClientRect();
    return Math.min(5, Math.max(1, Math.ceil(((x - r.left) / r.width) * 5)));
  };
  const labels = ["", "いまいち", "ふつう", "よい", "とてもよい", "最高"];
  return (
    <Exhibit
      id="stars"
      title="星の評価"
      lead="押した星がぽんと弾みます。指で星の上をなぞると、離した所の数で決まります。PC ではマウスを乗せると薄い星で下見でき、押すと決まります。"
      stage="plain"
      specs={["タップでも、なぞっても選べる", "PC はマウスを乗せると薄い星で下見（押すまで決まらない）。下見を出さない作りにもできる", "星の数（5つ・10段階）や半分の星にもできる", "選んだ数に合わせて言葉を出せる"]}
    >
      <div className="grid justify-items-center gap-2">
        <div
          ref={row}
          role="radiogroup"
          aria-label="評価"
          className="flex touch-none gap-1"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setPressing(true);
            setHover(at(e.clientX));
          }}
          onPointerMove={(e) => {
            if (e.buttons || e.pointerType === "mouse") setHover(at(e.clientX));
          }}
          onPointerUp={(e) => {
            const n = at(e.clientX);
            setRate(n);
            setPopped(n);
            setPressing(false);
            setHover(e.pointerType === "mouse" ? n : null);
          }}
          onPointerCancel={() => {
            setPressing(false);
            setHover(null);
          }}
          onPointerLeave={() => setHover(null)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n + (popped === n ? "p" : "")}
              type="button"
              role="radio"
              aria-checked={rate === n}
              aria-label={`${n}つ星`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setRate(n);
              }}
              className={cn("grid size-11 place-items-center", popped === n && "museum-pop")}
            >
              <Star aria-hidden size={30} strokeWidth={1.6} className={cn("transition-colors duration-[var(--wk-dur-fast)]", n > shown ? "text-fg-3" : preview && !(hover === rate) ? "fill-[#ffb800]/30 text-[#e5a500]/70" : "fill-[#ffb800] text-[#e5a500]")} />
            </button>
          ))}
        </div>
        <p className="text-sm text-fg-2">
          {preview && hover !== rate ? (
            <>
              {labels[shown]}
              <span className="text-fg-3">（押すと決まる・いまは{rate}つ星）</span>
            </>
          ) : (
            labels[shown]
          )}
        </p>
      </div>
    </Exhibit>
  );
}

const ROW = 40;
function Wheel({ items, value, onChange, label }: { items: string[]; value: number; onChange: (i: number) => void; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    box.current?.scrollTo({ top: value * ROW });
    // 最初の位置だけ合わせる（あとは指で回す）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      ref={box}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      onScroll={(e) => {
        const i = Math.round(e.currentTarget.scrollTop / ROW);
        if (i !== value && i >= 0 && i < items.length) onChange(i);
      }}
      onKeyDown={(e) => {
        const d = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        box.current?.scrollTo({ top: Math.min(items.length - 1, Math.max(0, value + d)) * ROW, behavior: "smooth" });
      }}
      className="museum-wheel h-[200px] w-16 snap-y snap-mandatory overflow-y-auto overscroll-contain"
      style={{ paddingBlock: ROW * 2 }}
    >
      {items.map((t, i) => (
        <div key={t} role="option" aria-selected={i === value} className={cn("num grid snap-center place-items-center text-xl transition-colors", i === value ? "font-semibold text-fg" : "text-fg-3")} style={{ height: ROW }}>
          {t}
        </div>
      ))}
    </div>
  );
}

function TimeWheel() {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const mins = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
  const [h, setH] = useState(9);
  const [m, setM] = useState(6);
  return (
    <Exhibit
      id="wheel"
      title="時刻のホイール"
      lead="指で上下に回すと、真ん中の行でカチッと止まります。iPhone の時刻選びと同じ型です。"
      stage="plain"
      minHeight={240}
      specs={["回すと1行ずつ吸い付くように止まる", "日付・時刻・数・好きな言葉の列にできる", "上下の矢印キーでも動かせる", "分は5分刻みなど、刻みを決められる"]}
    >
      <div className="grid justify-items-center gap-2">
        <div className="relative flex items-center gap-1 rounded-lg bg-surface px-3">
          <span aria-hidden className="pointer-events-none absolute inset-x-2 top-1/2 h-10 -translate-y-1/2 rounded-md bg-surface-2" />
          <div className="relative flex items-center">
            <Wheel items={hours} value={h} onChange={setH} label="時" />
            <span className="text-xl font-semibold">:</span>
            <Wheel items={mins} value={m} onChange={setM} label="分" />
          </div>
        </div>
        <p className="text-sm text-fg-2">
          選んだ時刻：<span className="num font-medium text-fg">{hours[h]}:{mins[m]}</span>
        </p>
      </div>
    </Exhibit>
  );
}

const ANSWER = "123456";
function Code() {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [state, setState] = useState<"idle" | "ok" | "ng">("idle");
  const [shake, setShake] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const check = (next: string[]) => {
    if (next.every(Boolean)) {
      if (next.join("") === ANSWER) setState("ok");
      else {
        setState("ng");
        setShake((s) => s + 1);
        setTimeout(() => {
          setDigits(Array(6).fill(""));
          refs.current[0]?.focus();
        }, 450);
      }
    } else setState("idle");
  };
  const put = (i: number, raw: string) => {
    const chars = raw.replace(/\D/g, "").split("");
    if (!chars.length) return;
    const next = [...digits];
    chars.slice(0, 6 - i).forEach((c, k) => (next[i + k] = c));
    setDigits(next);
    refs.current[Math.min(5, i + chars.length)]?.focus();
    check(next);
  };
  return (
    <Exhibit
      id="code"
      title="6桁コードの入力"
      lead="1文字打つと次の枠へ進み、まとめて貼り付けると全部の枠に入ります。正しいコードは 123456 です。"
      stage="plain"
      specs={["打つと次の枠へ自動で進む。消すと前へ戻る", "SMS のコードを貼り付けると6枠に一度に入る", "違うときは横に揺れて、最初からやり直せる", "iPhone では届いた SMS のコードが候補に出る"]}
    >
      <div className="grid justify-items-center gap-3">
        <div key={shake} className={cn("flex gap-1.5", shake > 0 && "museum-shake")}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={`${i + 1}桁目`}
              maxLength={6}
              onChange={(e) => put(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digits[i] && i > 0) {
                  const next = [...digits];
                  next[i - 1] = "";
                  setDigits(next);
                  setState("idle");
                  refs.current[i - 1]?.focus();
                } else if (e.key === "Backspace") {
                  const next = [...digits];
                  next[i] = "";
                  setDigits(next);
                  setState("idle");
                }
              }}
              onFocus={(e) => e.currentTarget.select()}
              className={cn(
                "num h-12 w-10 rounded-md border-[1.5px] bg-surface text-center text-xl font-semibold outline-none transition-colors focus:border-accent",
                state === "ok" ? "border-ok" : state === "ng" ? "border-danger" : "border-line",
              )}
            />
          ))}
        </div>
        <p aria-live="polite" className={cn("text-sm", state === "ok" ? "text-ok" : state === "ng" ? "text-danger" : "text-fg-3")}>
          {state === "ok" ? "確認できました" : state === "ng" ? "コードが違います。もう一度入れてください" : "6桁の数字を入れてください"}
        </p>
      </div>
    </Exhibit>
  );
}

export function InputRoom() {
  return (
    <Room id="input" title="入れる" lead="数・文字・選択を入れる部品。指で動かしたときの手ごたえを確かめる部屋です。">
      <Sliders />
      <Inputs />
      <Checks />
      <Stars />
      <TimeWheel />
      <Code />
    </Room>
  );
}

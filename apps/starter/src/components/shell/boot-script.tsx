/*
 * テーマ・明るさ・密度・サイドバーの開閉を、描画の前に <html> へ反映する（ちらつき防止）。
 * 保存先はこのブラウザだけ（localStorage）。読めなくても既定値で正しく表示される。
 * テーマの優先順：URL の ?palette=…（見本サイトの並べ比べ用。覚えさせない）→ この端末で選んだテーマ → アプリの既定テーマ
 */
export function bootScript(defaultPalette = "graphite", forceTheme?: "light" | "dark") {
  const def = JSON.stringify(/^[a-z0-9-]+$/.test(defaultPalette) ? defaultPalette : "graphite");
  // 明るさを固定するアプリ（ダーク未対応の画面が残っている後付けなど）は、保存された明るさより優先し、切り替えの操作も隠す
  const lock = forceTheme === "light" || forceTheme === "dark" ? `d.dataset.theme="${forceTheme}";d.dataset.themeLocked="1";` : "";
  return `try{var d=document.documentElement,q=new URLSearchParams(location.search),v=${def},p=q.get("palette"),ok=/^[a-z0-9-]+$/;try{var x=localStorage.getItem("wk.palette");if(x&&ok.test(x))v=x}catch(e){}if(p&&ok.test(p))v=p;if(v!=="graphite")d.dataset.palette=v;var m=q.get("theme");if(m==="light"||m==="dark")d.dataset.theme=m;${lock}}catch(e){}try{var d=document.documentElement,s=localStorage;var t=s.getItem("wk.theme");if(!d.dataset.theme&&(t==="light"||t==="dark"))d.dataset.theme=t;var n=s.getItem("wk.density");if(n==="compact")d.dataset.density=n;if(s.getItem("wk.sidebar")==="collapsed")d.dataset.sidebar="collapsed"}catch(e){}`;
}

/**
 * ルートの layout の <head> の中に置く。既存のアプリに入れるときも、これを1行足すだけでよい。
 * defaultPalette … このアプリの既定のテーマ（例："sky"）。使う人が設定や ⌘K で選ぶと、その端末ではそちらが優先される
 * forceTheme     … 明るさを固定する（"light" か "dark"）。ダーク表示に対応していない画面が残っているうちに使う
 */
export function WorkspaceBoot({ defaultPalette = "graphite", forceTheme }: { defaultPalette?: string; forceTheme?: "light" | "dark" }) {
  return <script dangerouslySetInnerHTML={{ __html: bootScript(defaultPalette, forceTheme) }} />;
}

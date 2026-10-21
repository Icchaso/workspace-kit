/*
 * テーマ・明るさ・密度・サイドバーの開閉を、描画の前に <html> へ反映する（ちらつき防止）。
 * 保存先はこのブラウザだけ（localStorage）。読めなくても既定値で正しく表示される。
 * テーマの優先順：URL の ?palette=…（見本サイトの並べ比べ用。覚えさせない）→ この端末で選んだテーマ → アプリの既定テーマ
 */
export function bootScript(defaultPalette = "graphite") {
  const def = JSON.stringify(/^[a-z0-9-]+$/.test(defaultPalette) ? defaultPalette : "graphite");
  return `try{var d=document.documentElement,q=new URLSearchParams(location.search),v=${def},p=q.get("palette"),ok=/^[a-z0-9-]+$/;try{var x=localStorage.getItem("wk.palette");if(x&&ok.test(x))v=x}catch(e){}if(p&&ok.test(p))v=p;if(v!=="graphite")d.dataset.palette=v;var m=q.get("theme");if(m==="light"||m==="dark")d.dataset.theme=m}catch(e){}try{var d=document.documentElement,s=localStorage;var t=s.getItem("wk.theme");if(!d.dataset.theme&&(t==="light"||t==="dark"))d.dataset.theme=t;var n=s.getItem("wk.density");if(n==="compact")d.dataset.density=n;if(s.getItem("wk.sidebar")==="collapsed")d.dataset.sidebar="collapsed"}catch(e){}`;
}

/**
 * ルートの layout の <head> の中に置く。既存のアプリに入れるときも、これを1行足すだけでよい。
 * defaultPalette … このアプリの既定のテーマ（例："sky"）。使う人が設定や ⌘K で選ぶと、その端末ではそちらが優先される
 */
export function WorkspaceBoot({ defaultPalette = "graphite" }: { defaultPalette?: string }) {
  return <script dangerouslySetInnerHTML={{ __html: bootScript(defaultPalette) }} />;
}

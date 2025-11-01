// Klein, ohne deps: throttle, debounce, rAF-batching, DPR-scale helper
export function throttle<T extends (...a:any[])=>any>(fn:T, ms=150){
  let t=0, last:any; let pending=false;
  return (...args:Parameters<T>)=>{
    const now=Date.now();
    if (now-t>=ms){ t=now; return fn(...args); }
    if (!pending){
      pending=true;
      setTimeout(()=>{ pending=false; t=Date.now(); last=fn(...args); }, (t+ms)-now);
    }
    return last;
  };
}
export function debounce<T extends (...a:any[])=>any>(fn:T, ms=200){
  let id:any=null;
  return (...args:Parameters<T>)=>{
    clearTimeout(id); id=setTimeout(()=>fn(...args), ms);
  };
}
export function rafBatch<T extends (...a:any[])=>any>(fn:T){
  let scheduled=false; let lastArgs:any[]=[];
  return (...args:Parameters<T>)=>{
    lastArgs=args;
    if (scheduled) return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      // @ts-ignore
      fn(...lastArgs);
    });
  };
}
export function scaleCanvas(el: HTMLCanvasElement, widthCss: number, heightCss: number){
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap @2 for perf
  el.width  = Math.floor(widthCss * dpr);
  el.height = Math.floor(heightCss * dpr);
  const ctx = el.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, dpr };
}

// Geometrie-Helpers für Hit-Testing & Abstände

export function dist(a:{x:number;y:number}, b:{x:number;y:number}) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function distPointToSegment(p:{x:number;y:number}, a:{x:number;y:number}, b:{x:number;y:number}) {
  const vx = b.x - a.x, vy = b.y - a.y;
  const wx = p.x - a.x, wy = p.y - a.y;
  const c1 = vx*wx + vy*wy;
  if (c1 <= 0) return dist(p, a);
  const c2 = vx*vx + vy*vy;
  if (c2 <= c1) return dist(p, b);
  const t = c1 / c2;
  const proj = { x: a.x + t*vx, y: a.y + t*vy };
  return dist(p, proj);
}

// Snap helpers
export function snapPriceToOhlc(idx:number, price:number, points:{h:number;l:number;o:number;c:number}[]) {
  const p = points[idx];
  if (!p) return { idx, price };
  const candidates = [p.o, p.h, p.l, p.c];
  let best = candidates[0], d = Math.abs(price - candidates[0]);
  for (let i=1;i<candidates.length;i++){
    const di = Math.abs(price - candidates[i]);
    if (di < d) { d = di; best = candidates[i]; }
  }
  return { idx, price: best };
}

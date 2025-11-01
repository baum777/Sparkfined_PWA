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

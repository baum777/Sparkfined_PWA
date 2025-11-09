// Upstash Redis REST client (Edge-compatible)
const base = ()=> process.env.UPSTASH_REDIS_REST_URL;
const token = ()=> process.env.UPSTASH_REDIS_REST_TOKEN;

function headers(){ return { Authorization: `Bearer ${token()}` }; }

export async function kvSet<T=any>(key:string, value:T, opts?:{ ttlSec?:number }): Promise<boolean> {
  const url = opts?.ttlSec
    ? `${base()}/SET/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}/EX/${opts.ttlSec}`
    : `${base()}/SET/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}`;
  const r = await fetch(url, { headers:headers() });
  const j = await r.json();
  return j?.result === "OK";
}

export async function kvGet<T=any>(key:string): Promise<T|null> {
  const r = await fetch(`${base()}/GET/${encodeURIComponent(key)}`, { headers:headers() });
  const j = await r.json();
  if (!j?.result) return null;
  try { return JSON.parse(j.result); }
  catch { return j.result; }
}

export async function kvDel(key:string): Promise<number> {
  const r = await fetch(`${base()}/DEL/${encodeURIComponent(key)}`, { headers:headers() });
  const j = await r.json();
  return j?.result ?? 0;
}

export async function kvSAdd(key:string, member:string): Promise<number> {
  const r = await fetch(`${base()}/SADD/${encodeURIComponent(key)}/${encodeURIComponent(member)}`, { headers:headers() });
  const j = await r.json();
  return j?.result ?? 0;
}

export async function kvLPush(key:string, value:any): Promise<number> {
  const r = await fetch(`${base()}/LPUSH/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}`, { headers:headers() });
  const j = await r.json();
  return j?.result ?? 0;
}

export async function kvLRange(key:string, start:number, stop:number): Promise<any[]> {
  const r = await fetch(`${base()}/LRANGE/${encodeURIComponent(key)}/${start}/${stop}`, { headers:headers() });
  const j = await r.json();
  return (j?.result||[]).map((s:string)=>{ try{return JSON.parse(s);}catch{return s;} });
}

export async function kvSMembers(key:string): Promise<string[]> {
  const r = await fetch(`${base()}/SMEMBERS/${encodeURIComponent(key)}`, { headers:headers() });
  const j = await r.json();
  return j?.result ?? [];
}

export async function kvSRem(key:string, member:string): Promise<number> {
  const r = await fetch(`${base()}/SREM/${encodeURIComponent(key)}/${encodeURIComponent(member)}`, { headers:headers() });
  const j = await r.json();
  return j?.result ?? 0;
}

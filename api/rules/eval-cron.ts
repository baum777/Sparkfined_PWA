// Edge CRON: Lädt aktive Server-Rules, gruppiert nach (address, tf), evaluiert & dispatcht Treffer
export const config = { runtime: "edge" };
import type { ServerRule } from "../../src/lib/serverRules";

async function j(r: Response){ try{ return await r.json(); } catch{ return null; } }
function json(obj:any, status=200){ return new Response(JSON.stringify(obj), { status, headers:{ "content-type":"application/json" }}); }

export default async function handler(req: Request){
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || "anon";         // optional: nur subset evaluieren
  const limitGroups = Number(url.searchParams.get("groups") || "12"); // max (address,tf) Gruppen pro Lauf
  const limitRules  = Number(url.searchParams.get("rules") || "200"); // max rules pro Lauf
  try{
    // 1) Regeln laden
    const list = await fetch(`${originOf(req)}/api/rules?userId=${encodeURIComponent(userId)}`, { cache:"no-store" }).then(j);
    const rules: ServerRule[] = (list?.rules || []).filter((r:ServerRule)=>r.active);
    if (!rules.length) return json({ ok:true, evaluated:0, dispatched:0 });
    // 2) Gruppen bilden
    const groups = new Map<string, { address:string; tf:string; rules:ServerRule[] }>();
    for (const r of rules.slice(0, limitRules)){
      const k = `${r.address}|${r.tf}`;
      if (!groups.has(k)) groups.set(k, { address:r.address, tf:r.tf, rules:[]});
      groups.get(k)!.rules.push(r);
    }
    const groupArr = Array.from(groups.values()).slice(0, limitGroups);
    let dispatched = 0, evaluated = 0;
    // 3) Pro Gruppe OHLC holen & Regeln evaluieren
    for (const g of groupArr){
      const ohlcRes = await fetch(`${originOf(req)}/api/data/ohlc?address=${encodeURIComponent(g.address)}&tf=${g.tf}&limit=600`, { cache:"no-store" }).then(j);
      const data = (ohlcRes?.data || []) as any[];
      if (!data.length) continue;
      for (const r of g.rules){
        evaluated++;
        const match = evalRule(r.rule, data);
        if (!match) continue;
        // 4) Dispatch → E-7 Pipeline
        const body = {
          ruleId: r.id, address: r.address, tf: r.tf,
          title: `Rule ${r.rule.kind} match`,
          body: `${r.address} · ${r.rule.kind}`,
          url: `/chart?address=${encodeURIComponent(r.address)}&tf=${r.tf}`
        };
        await fetch(`${originOf(req)}/api/alerts/dispatch`, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(body) }).catch(()=>{});
        dispatched++;
      }
    }
    return json({ ok:true, evaluated, dispatched, groups: groupArr.length });
  }catch(e:any){
    return json({ ok:false, error:String(e?.message ?? e) }, 200);
  }
}

function originOf(req:Request){
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

// --- einfache Server-Eval (spiegelt /api/rules/eval)
function evalRule(rule:any, d:any[]){
  const n = d.length-1; if (n<1) return false;
  const p = d[n]; const prev = d[n-1];
  const close = (x:any)=> Number(x.c);
  switch(rule.kind){
    case "price-cross":{
      const cond = rule.op === ">" ? close(p)>rule.value : close(p)<rule.value;
      const prevCond = rule.op === ">" ? close(prev)>rule.value : close(prev)<rule.value;
      return cond && !prevCond;
    }
    case "pct-change-24h":{
      const b = base24h(d, n), bp = base24h(d, n-1);
      const pct  = b ? ((close(p)-b)/b)*100 : 0;
      const pctp = bp? ((close(prev)-bp)/bp)*100 : 0;
      const cond = rule.op === ">" ? pct>rule.value : pct<rule.value;
      const prevCond = rule.op === ">" ? pctp>rule.value : pctp<rule.value;
      return cond && !prevCond;
    }
    case "breakout-atrx":{
      const { atr, hi, lo } = atrHiLo(d, rule.period ?? 14);
      if (rule.dir==="up")  return close(p)>(hi+atr*rule.mult) && close(prev)<= (hi+atr*rule.mult);
      else                  return close(p)<(lo-atr*rule.mult) && close(prev)>= (lo-atr*rule.mult);
    }
    case "vwap-cross":{
      const { vwap, prevVwap } = vwap2(d);
      const cond = rule.dir==="above" ? close(p)>vwap : close(p)<vwap;
      const prevCond = rule.dir==="above" ? close(prev)>prevVwap : close(prev)<prevVwap;
      return cond && !prevCond;
    }
    case "sma50-200-cross":{
      const s50 = sma(d.map(close), 50), s200 = sma(d.map(close), 200);
      const now = s50[n]-s200[n]; const before = s50[n-1]-s200[n-1];
      return rule.typ==="golden" ? (now>0 && before<=0) : (now<0 && before>=0);
    }
  }
  return false;
}
function base24h(d:any[], i:number){ const cutoff = d[i].t - 86_400_000; let j=i; while(j>0 && d[j].t>=cutoff) j--; return Number(d[Math.max(0,j)]?.c||0); }
function atrHiLo(d:any[], period:number){ const n=d.length; const m=Math.max(1,Math.min(period,n-1)); let tr=0,hi=-Infinity,lo=Infinity; for(let i=n-m;i<n;i++){ const x=d[i], prev=d[i-1]??x; tr+=Math.max(x.h-x.l,Math.abs(x.h-prev.c),Math.abs(x.l-prev.c)); hi=Math.max(hi,x.h); lo=Math.min(lo,x.l);} return { atr:tr/m, hi, lo }; }
function vwap2(d:any[]){ let pv=0,vv=0,pvP=0,vvP=0; const n=d.length-1; for(let i=0;i<=n;i++){ const x=d[i],tp=(x.h+x.l+x.c)/3,v=Number(x.v||1); if(i<n){ pvP+=tp*v; vvP+=v; } pv+=tp*v; vv+=v; } return { vwap: pv/Math.max(1,vv), prevVwap: pvP/Math.max(1,vvP) }; }
function sma(arr:number[], len:number){ const out=Array(arr.length).fill(NaN); let sum=0; for(let i=0;i<arr.length;i++){ sum+=(arr[i] ?? 0); if(i>=len) sum-=(arr[i-len] ?? 0); if(i>=len-1) out[i]=sum/len; } return out; }

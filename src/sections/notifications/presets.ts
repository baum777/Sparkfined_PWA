export type PresetId = "price-cross" | "pct-change-24h" | "breakout-atrx" | "vwap-cross" | "sma50-200-cross";

export type PresetDef = {
  id: PresetId;
  label: string;
  description: string;
  fields: Array<
    | { key:"op"; label:string; type:"select"; options:Array<{value:string;label:string}>; default:string }
    | { key:"value"; label:string; type:"number"; min?:number; max?:number; step?:number; placeholder?:string }
    | { key:"mult"; label:string; type:"number"; min?:number; max?:number; step?:number; placeholder?:string }
  >;
  // transformiert Wizard-Params in eine konkrete Rule
  toRule: (p: Record<string, any>) => any;
  hint?: (p: Record<string, any>) => string | undefined;
};

export const PRESETS: PresetDef[] = [
  {
    id:"price-cross",
    label:"Price Cross",
    description:"Trigger, wenn Close einen fixen Preis überschreitet/unterläuft.",
    fields:[
      { key:"op", label:"Operator", type:"select", options:[{value:">",label:"> höher als"},{value:"<",label:"< niedriger als"}], default:">" },
      { key:"value", label:"Preis", type:"number", min:0, step:0.0001, placeholder:"z.B. 0.0123" }
    ],
    toRule: (p)=>({ id: crypto.randomUUID(), kind:"price-cross", op:(p.op||">") as ">"|"<", value: Number(p.value||0) }),
    hint: (p)=> p?.value ? `Alert bei Close ${p.op||">"} ${p.value}` : undefined
  },
  {
    id:"pct-change-24h",
    label:"% Change (24h)",
    description:"Trigger bei relativer Veränderung über die letzten 24h.",
    fields:[
      { key:"op", label:"Operator", type:"select", options:[{value:">",label:"> größer als"},{value:"<",label:"< kleiner als"}], default:">" },
      { key:"value", label:"% Veränderung", type:"number", step:0.1, placeholder:"z.B. 10" }
    ],
    toRule: (p)=>({ id: crypto.randomUUID(), kind:"pct-change-24h", op:(p.op||">") as ">"|"<", value: Number(p.value||0) }),
    hint: (p)=> p?.value ? `Alert bei 24h-Change ${p.op||">"} ${p.value}%` : undefined
  },
  {
    id:"breakout-atrx",
    label:"Breakout · ATR × Mult",
    description:"Trigger, wenn Close über (Highₙ + ATRₙ·x) bricht (oder darunter).",
    fields:[
      { key:"op", label:"Richtung", type:"select", options:[{value:"up",label:"Über Highₙ + ATR·x"},{value:"down",label:"Unter Lowₙ − ATR·x"}], default:"up" },
      { key:"mult", label:"ATR-Multiplikator x", type:"number", min:0.1, step:0.1, placeholder:"z.B. 1.5" }
    ],
    toRule: (p)=>({ id: crypto.randomUUID(), kind:"breakout-atrx", dir:(p.op||"up"), mult: Number(p.mult||1.5), period: 14 }),
    hint: (p)=> p?.mult ? `Breakout ${p.op==="down"?"unter":"über"} ATR·${p.mult}` : undefined
  },
  {
    id:"vwap-cross",
    label:"VWAP Cross",
    description:"Trigger, wenn Close den VWAP kreuzt.",
    fields:[
      { key:"op", label:"Richtung", type:"select", options:[{value:"above",label:"Kreuzt nach oben"},{value:"below",label:"Kreuzt nach unten"}], default:"above" }
    ],
    toRule: (p)=>({ id: crypto.randomUUID(), kind:"vwap-cross", dir:(p.op||"above") }),
    hint: (p)=> `Close kreuzt VWAP ${p?.op==="below"?"nach unten":"nach oben"}`
  },
  {
    id:"sma50-200-cross",
    label:"SMA 50/200 Cross",
    description:"Trigger beim Golden/Death Cross (SMA50 vs. SMA200).",
    fields:[
      { key:"op", label:"Typ", type:"select", options:[{value:"golden",label:"Golden Cross (50>200)"},{value:"death",label:"Death Cross (50<200)"}], default:"golden" }
    ],
    toRule: (p)=>({ id: crypto.randomUUID(), kind:"sma50-200-cross", typ:(p.op||"golden") }),
    hint: (p)=> p?.op==="death" ? "SMA50 fällt unter SMA200" : "SMA50 steigt über SMA200"
  }
];

export type UiAlertRule =
  | { id:string; kind:"price-cross"; op:">"|"<"; value:number; address?:string; tf?:string; enabled:boolean; createdAt:number; updatedAt:number; lastTriggerAt?:number }
  | { id:string; kind:"pct-change-24h"; op:">"|"<"; value:number; address?:string; tf?:string; enabled:boolean; createdAt:number; updatedAt:number; lastTriggerAt?:number };

export type AlertTrigger = {
  id:string; ruleId?:string; kind:string; t:number; c?:number; note?:string;
};

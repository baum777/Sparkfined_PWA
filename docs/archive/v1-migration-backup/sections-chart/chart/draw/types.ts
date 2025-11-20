export type ToolKind = "cursor" | "hline" | "trend" | "fib";

export type BaseShape = {
  id: string;
  kind: ToolKind;
  createdAt: number;
  updatedAt: number;
  color?: string;
};

// price/index coordinates are chart-space values (data index + price)
export type HLine = BaseShape & {
  kind: "hline";
  price: number;
};

export type Trend = BaseShape & {
  kind: "trend";
  a: { idx: number; price: number };
  b: { idx: number; price: number };
};

export type Fib = BaseShape & {
  kind: "fib";
  a: { idx: number; price: number }; // anchor 1
  b: { idx: number; price: number }; // anchor 2
};

export type Shape = HLine | Trend | Fib;

export type DrawState = {
  tool: ToolKind;
  shapes: Shape[];
  // in-progress pointer (for tools that need two clicks)
  draft?: Partial<Trend | Fib>;
};

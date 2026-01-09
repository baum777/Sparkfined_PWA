export interface JsonRpcRequest<TParams = unknown> {
  jsonrpc: "2.0";
  id: string;
  method: string;
  params: TParams;
}

export interface JsonRpcResponse<TResult = unknown> {
  jsonrpc: "2.0";
  id: string;
  result?: TResult;
  error?: { code: number; message: string; data?: unknown };
}

export interface HeliusDasAsset {
  id?: string;
  token_info?: {
    supply?: string | number;
    decimals?: number;
    mint_authority?: string | null;
    freeze_authority?: string | null;
  };
}

export interface TokenSupplyResult {
  value: {
    amount: string;
    decimals: number;
    uiAmount: number | null;
    uiAmountString: string;
  };
}

export interface TokenLargestAccountsResult {
  value: Array<{
    address: string;
    amount: string;
    decimals: number;
    uiAmount: number | null;
    uiAmountString: string;
  }>;
}

export interface TransactionsForAddressResult {
  transactions: Array<{
    blockTime: number | null;
  }>;
  paginationToken?: string;
}


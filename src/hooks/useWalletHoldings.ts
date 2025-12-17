import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWalletHoldings } from "@/lib/wallet/holdingsClient";
import { isValidSolanaAddress } from "@/lib/wallet/address";
import type { WalletHoldingsResponse } from "@/types/walletAssets";

type WalletHoldingsStatus = "idle" | "loading" | "success" | "error";

interface WalletHoldingsState {
  status: WalletHoldingsStatus;
  data: WalletHoldingsResponse | null;
  error: string | null;
  refetch: () => void;
}

export function useWalletHoldings(owner: string | null): WalletHoldingsState {
  const [state, setState] = useState<Omit<WalletHoldingsState, "refetch">>({
    status: owner ? "loading" : "idle",
    data: null,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const fetchHoldings = useCallback(async (ownerAddress: string, force = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({
      status: "loading",
      data: prev.status === "success" ? prev.data : null,
      error: null,
    }));

    try {
      const data = await fetchWalletHoldings(ownerAddress, { signal: controller.signal, force });
      if (controller.signal.aborted) return;
      setState({ status: "success", data, error: null });
    } catch (error) {
      if (controller.signal.aborted) return;
      setState({
        status: "error",
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!owner) {
      abortRef.current?.abort();
      setState({ status: "idle", data: null, error: null });
      return;
    }

    if (!isValidSolanaAddress(owner)) {
      abortRef.current?.abort();
      setState({ status: "error", data: null, error: "Invalid wallet address" });
      return;
    }

    void fetchHoldings(owner);
  }, [fetchHoldings, owner]);

  const refetch = useCallback(() => {
    if (!owner || !isValidSolanaAddress(owner)) return;
    void fetchHoldings(owner, true);
  }, [fetchHoldings, owner]);

  return { ...state, refetch };
}

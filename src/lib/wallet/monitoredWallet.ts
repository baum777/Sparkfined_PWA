import { getItem, setItem } from "@/lib/safeStorage";
import { isValidSolanaAddress } from "./address";

export const MONITORED_WALLET_STORAGE_KEY = "sparkfined.wallet.monitored";
const MONITORING_FLAG_STORAGE_KEY = "sparkfined.wallet.monitoring";

export function getMonitoredWallet(): string | null {
  const stored = getItem(MONITORED_WALLET_STORAGE_KEY);
  const trimmed = stored?.trim() ?? "";
  if (!trimmed) return null;
  if (!isValidSolanaAddress(trimmed)) return null;
  return trimmed;
}

export function setMonitoredWallet(address: string): void {
  const next = address.trim();
  setItem(MONITORED_WALLET_STORAGE_KEY, next);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("sparkfined:monitored-wallet-changed", { detail: { walletAddress: next } })
    );
  }
}

export function getWalletMonitoringEnabled(): boolean {
  return getItem(MONITORING_FLAG_STORAGE_KEY) === "true";
}

export function setWalletMonitoringEnabled(enabled: boolean): void {
  setItem(MONITORING_FLAG_STORAGE_KEY, enabled ? "true" : "false");
}

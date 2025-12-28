// In-memory secret storage for MVP
// In production, this should be a DB or encrypted KV
const WALLET_SECRETS = new Map<string, string>();

export const auth = {
  /**
   * Validate that the provided secret matches the wallet.
   * For MVP: We accept ANY secret if it's the *first* time we see the wallet (auto-register),
   * OR if it matches the stored secret.
   */
  validateSecret(wallet: string, secret: string): boolean {
    if (!wallet || !secret) return false;

    const stored = WALLET_SECRETS.get(wallet);
    if (!stored) {
      // MVP: Auto-register the first secret seen for this wallet
      // In real app: Registration flow required
      console.log(`[Auth] Auto-registering secret for ${wallet}`);
      WALLET_SECRETS.set(wallet, secret);
      return true;
    }

    return stored === secret;
  }
};

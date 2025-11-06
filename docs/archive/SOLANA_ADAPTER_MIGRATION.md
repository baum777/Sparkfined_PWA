# Solana Adapter Migration Guide 🔐

## Aktuelle Situation (Security Analysis)

### ⚠️ Problematische Dependencies

```json
{
  "@solana/web3.js": "^1.95.0",          // OK, aber nicht neueste
  "@solana/spl-token": "^0.4.0",         // OK, aber nicht neueste
  "@streamflow/stream": "^6.3.0"         // ⚠️ Bringt veraltete deps mit
}
```

### 🔍 Dependency Tree Issues

```
@streamflow/stream@6.5.1
├── @solana/web3.js@1.90.2              ❌ VERALTET (Sicherheitslücke)
├── @manahippo/aptos-wallet-adapter     ❌ DEPRECATED
├── @blocto/sdk@0.3.6                   ❌ DEPRECATED
└── @solana/spl-token@0.3.6             ❌ VERALTET
```

**Vulnerabilities:**
- `@solana/web3.js` (1.41.4-1.43.0): High Severity - Buffer overflow via untrusted input
- Veraltete Wallet-Adapter: Keine Sicherheitsupdates mehr

---

## ✅ Empfohlene Lösung

### Option 1: **Moderne Solana Wallet Adapter** (EMPFOHLEN)

Das offizielle Solana Wallet Adapter Ecosystem ist die sicherste und aktuellste Lösung:

```json
{
  "@solana/web3.js": "^1.98.4",                    // Neueste stabile Version
  "@solana/spl-token": "^0.4.14",                  // Neueste Version
  "@solana/wallet-adapter-base": "^0.9.23",        // Core Adapter
  "@solana/wallet-adapter-react": "^0.15.39",      // React Integration
  "@solana/wallet-adapter-react-ui": "^0.9.35",    // UI Components
  "@solana/wallet-adapter-wallets": "^0.19.33"     // Wallet Implementierungen
}
```

**Vorteile:**
- ✅ **Offiziell von Solana Foundation gepflegt**
- ✅ **Aktive Entwicklung & Security Updates**
- ✅ **Unterstützt 20+ Wallets** (Phantom, Solflare, Ledger, etc.)
- ✅ **TypeScript First-Class Support**
- ✅ **Minimale Bundle Size** (Tree-shakeable)
- ✅ **Auto-reconnect & Session Management**

**Unterstützte Wallets:**
- Phantom
- Solflare
- Backpack
- Glow
- Ledger
- Trezor
- Trust Wallet
- Coinbase Wallet
- Und 12+ weitere

---

### Option 2: **Solana Web3.js v2** (Zukunftssicher)

Für neue Projekte oder wenn du modernste Features brauchst:

```json
{
  "@solana/web3.js": "^2.0.0-preview.4",  // Neue modulare Architektur
  "@solana/spl-token": "^0.4.14"
}
```

**Hinweis:** v2 ist noch in Preview, aber deutlich moderner und sicherer.

---

## 🔄 Migration Plan

### Phase 1: Wallet Adapter hinzufügen (ohne Breaking Changes)

```bash
npm install @solana/wallet-adapter-react \
            @solana/wallet-adapter-react-ui \
            @solana/wallet-adapter-wallets \
            @solana/wallet-adapter-base
```

### Phase 2: Dependencies aktualisieren

```bash
# Update auf neueste stabile Versionen
npm update @solana/web3.js @solana/spl-token
```

### Phase 3: @streamflow/stream entfernen (falls nicht benötigt)

```bash
npm uninstall @streamflow/stream
```

**Falls du Streamflow brauchst:** Warte auf Update oder kontaktiere Maintainer für Security-Update.

---

## 💻 Implementierungs-Beispiel

### 1. Wallet Context Provider

```tsx
// src/providers/WalletProvider.tsx
import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    BackpackWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Styles importieren
import '@solana/wallet-adapter-react-ui/styles.css';

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
    // Endpoint konfigurieren
    const endpoint = useMemo(() => 
        process.env.VITE_RPC_ENDPOINT || clusterApiUrl('mainnet-beta'), 
        []
    );

    // Wallets konfigurieren
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new BackpackWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
```

### 2. Wallet Connect Button

```tsx
// src/components/WalletButton.tsx
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletButton() {
    return (
        <WalletMultiButton className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800" />
    );
}
```

### 3. Wallet Hooks verwenden

```tsx
// src/hooks/useWallet.ts
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export function useSolanaBalance() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const getBalance = async () => {
        if (!publicKey) return 0;
        const balance = await connection.getBalance(publicKey);
        return balance / LAMPORTS_PER_SOL;
    };

    return { getBalance, publicKey };
}
```

### 4. SPL Token Transfers

```tsx
// src/lib/token.ts
import { 
    getAssociatedTokenAddress, 
    createTransferInstruction,
    TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import { Transaction, PublicKey } from '@solana/web3.js';

export async function transferToken(
    connection: Connection,
    wallet: WalletContextState,
    mint: PublicKey,
    to: PublicKey,
    amount: number
) {
    if (!wallet.publicKey) throw new Error('Wallet not connected');

    // Associated Token Accounts
    const fromAta = await getAssociatedTokenAddress(mint, wallet.publicKey);
    const toAta = await getAssociatedTokenAddress(mint, to);

    // Transaction erstellen
    const transaction = new Transaction().add(
        createTransferInstruction(
            fromAta,
            toAta,
            wallet.publicKey,
            amount,
            [],
            TOKEN_PROGRAM_ID
        )
    );

    // Transaktion signieren & senden
    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');
    
    return signature;
}
```

---

## 🔐 Sicherheits-Best Practices

### 1. RPC Endpoint Sicherheit

```typescript
// .env
VITE_RPC_ENDPOINT=https://your-private-rpc.solana.com
VITE_RPC_WEBSOCKET=wss://your-private-rpc.solana.com

// Vermeide öffentliche RPCs in Production:
// ❌ https://api.mainnet-beta.solana.com (Rate Limits)
// ✅ Verwende: QuickNode, Alchemy, Helius, oder eigene RPC-Node
```

### 2. Transaction Simulation vor Submit

```typescript
import { Connection } from '@solana/web3.js';

async function safeTransaction(connection: Connection, transaction: Transaction) {
    // Simulation zuerst
    const simulation = await connection.simulateTransaction(transaction);
    
    if (simulation.value.err) {
        throw new Error(`Simulation failed: ${simulation.value.err}`);
    }
    
    // Nur bei erfolgreicher Simulation senden
    return await wallet.sendTransaction(transaction, connection);
}
```

### 3. Wallet Disconnection Handler

```typescript
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';

export function useWalletSecurity() {
    const { disconnect, publicKey } = useWallet();

    useEffect(() => {
        // Auto-disconnect bei Inaktivität (30 min)
        let timeout: NodeJS.Timeout;
        
        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                disconnect();
            }, 30 * 60 * 1000);
        };

        if (publicKey) {
            window.addEventListener('mousemove', resetTimer);
            resetTimer();
        }

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('mousemove', resetTimer);
        };
    }, [publicKey, disconnect]);
}
```

### 4. Input Validation

```typescript
import { PublicKey } from '@solana/web3.js';

export function validateAddress(address: string): boolean {
    try {
        new PublicKey(address);
        return true;
    } catch {
        return false;
    }
}

export function validateAmount(amount: number, decimals: number): boolean {
    if (amount <= 0) return false;
    if (amount > Number.MAX_SAFE_INTEGER) return false;
    
    const maxDecimals = Math.pow(10, decimals);
    return (amount * maxDecimals) % 1 === 0;
}
```

---

## 📊 Vergleich: Alt vs. Neu

| Feature | @streamflow/stream | @solana/wallet-adapter | Winner |
|---------|-------------------|------------------------|--------|
| Security Updates | ❌ Veraltete Deps | ✅ Aktiv gepflegt | ✅ Adapter |
| Bundle Size | 🟡 ~150KB | ✅ ~45KB (tree-shaked) | ✅ Adapter |
| TypeScript Support | 🟡 Partial | ✅ Full | ✅ Adapter |
| Wallet Support | 🟡 5-8 Wallets | ✅ 20+ Wallets | ✅ Adapter |
| Maintenance | ❌ Deprecated Deps | ✅ Solana Foundation | ✅ Adapter |
| Learning Curve | 🟡 Medium | ✅ Easy (Docs++) | ✅ Adapter |
| Community | 🟡 Klein | ✅ Groß & aktiv | ✅ Adapter |

---

## 🚀 Recommended Package.json

```json
{
  "dependencies": {
    "@heroicons/react": "^2.1.0",
    "@solana/spl-token": "^0.4.14",
    "@solana/wallet-adapter-base": "^0.9.23",
    "@solana/wallet-adapter-react": "^0.15.39",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/wallet-adapter-wallets": "^0.19.33",
    "@solana/web3.js": "^1.98.4",
    "@vercel/node": "^3.0.0",
    "dexie": "^3.2.0",
    "openai": "^4.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "vite-plugin-pwa": "^0.20.0",
    "zustand": "^5.0.8"
  }
}
```

**Entfernt:**
- ❌ `@streamflow/stream` (oder separates Paket, falls wirklich benötigt)
- ❌ `tesseract.js` (falls nicht verwendet)

---

## 📚 Weitere Ressourcen

### Offizielle Dokumentation
- [Solana Wallet Adapter Docs](https://github.com/anza-xyz/wallet-adapter)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [SPL Token Docs](https://spl.solana.com/token)

### Security
- [Solana Security Best Practices](https://solana.com/developers/guides/advanced/security-best-practices)
- [Common Vulnerabilities](https://www.sec3.dev/blog/how-to-audit-solana-smart-contracts-part-1-a-systematic-approach)

### RPC Provider
- [QuickNode](https://www.quicknode.com/chains/sol) - Enterprise RPC
- [Helius](https://www.helius.dev/) - Premium RPC + Enhanced APIs
- [Alchemy](https://www.alchemy.com/solana) - Developer Platform

---

## ⚡ Quick Start Commands

```bash
# 1. Neue Dependencies installieren
npm install @solana/wallet-adapter-react \
            @solana/wallet-adapter-react-ui \
            @solana/wallet-adapter-wallets \
            @solana/wallet-adapter-base

# 2. Alte Dependencies updaten
npm update @solana/web3.js @solana/spl-token

# 3. Vulnerabilities checken
npm audit

# 4. Build testen
npm run build

# 5. TypeScript checken
npm run typecheck
```

---

## 🎯 Fazit

**Empfehlung:** Migriere auf `@solana/wallet-adapter-react` für:
- ✅ Bessere Sicherheit (keine veralteten Dependencies)
- ✅ Mehr Wallet-Support
- ✅ Aktive Wartung & Updates
- ✅ Kleinere Bundle-Size
- ✅ Bessere Developer Experience

**Timeline:**
- **Phase 1 (2h):** Wallet Adapter Integration
- **Phase 2 (1h):** Dependencies Update
- **Phase 3 (1h):** Testing & Cleanup
- **Total:** ~4 Stunden für vollständige Migration

**Priorität:** 🔴 HIGH - Wegen Security Vulnerabilities

---

**Erstellt am:** 2025-11-03
**Wartung:** Dieses Dokument sollte bei Major-Updates von Solana Packages aktualisiert werden.

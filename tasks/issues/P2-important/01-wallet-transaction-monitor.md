# Wallet Transaction Monitor Integration

**Priorität**: 🟡 P2 IMPORTANT
**Aufwand**: 2-3 Tage
**Abhängigkeiten**: Market Data

---

## Problem

Wallet Transaction Monitoring ist **scaffolded** aber nicht integriert:
- 3× TODOs in `src/lib/wallet/transaction-monitor.ts`
- Helius/QuickNode Integration fehlt
- Keine Tests

---

## Tasks

- [ ] Helius API Integration (Solana Transactions)
- [ ] QuickNode Fallback Provider
- [ ] Transaction Parsing & Normalization
- [ ] IndexedDB Storage (walletDb)
- [ ] UI: Wallet Transactions Page
- [ ] Tests: Unit + Integration

**Owner**: Backend Team
**Deadline**: Woche 5-6 (Backlog)

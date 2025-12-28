import { db, JournalEntry, TxEventRecord } from './journal-db-schema';
import { NormalizedTxEvent } from '../../lib/journal/txTypes';

const WINDOW_24H_MS = 24 * 60 * 60 * 1000;

/**
 * Main pipeline to handle new transaction events from the sync loop.
 * Updates local Dexie DB.
 */
export async function handleNewTransaction(event: NormalizedTxEvent): Promise<void> {
  // 1. Deduplication check
  const existingTx = await db.txEvents.get(event.signature);
  if (existingTx) {
    console.log(`[Journal] Tx ${event.signature} already processed.`);
    return;
  }

  // 2. Persist the raw event locally
  const txRecord: TxEventRecord = {
    signature: event.signature,
    wallet: event.wallet,
    blockTime: event.blockTime,
    tokenMint: event.tokenMint,
    type: event.type,
    amountToken: event.amountToken,
    amountUsd: event.amountUsd,
    priceUsd: event.priceUsd,
  };
  await db.txEvents.add(txRecord);

  // 3. Find applicable active journal entry
  // We look for an active entry for this wallet+token
  const activeEntry = await db.entries
    .where('[wallet+tokenMint]')
    .equals([event.wallet, event.tokenMint])
    .filter(e => e.status === 'active')
    .first();

  const eventTimeMs = event.blockTime * 1000;

  if (activeEntry) {
    await updateExistingEntry(activeEntry, event, eventTimeMs);
  } else {
    await createNewEntry(event, eventTimeMs);
  }
}

async function createNewEntry(event: NormalizedTxEvent, eventTimeMs: number) {
  const isLong = event.type === 'BUY'; // Simple assumption for opening
  
  const newEntry: JournalEntry = {
    id: crypto.randomUUID(),
    status: 'active',
    wallet: event.wallet,
    tokenMint: event.tokenMint,
    firstTxTime: event.blockTime,
    lastTxTime: event.blockTime,
    expiryTime: (eventTimeMs + WINDOW_24H_MS) / 1000,
    direction: isLong ? 'long' : 'short',
    totalBuyAmount: event.type === 'BUY' ? event.amountToken : 0,
    totalSellAmount: event.type === 'SELL' ? event.amountToken : 0,
    totalBuyUsd: event.type === 'BUY' && event.amountUsd ? event.amountUsd : 0,
    totalSellUsd: event.type === 'SELL' && event.amountUsd ? event.amountUsd : 0,
    realizedPnl: null,
    txSignatures: [event.signature],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.entries.add(newEntry);
  console.log(`[Journal] Created new entry ${newEntry.id} for ${event.tokenMint}`);
}

async function updateExistingEntry(entry: JournalEntry, event: NormalizedTxEvent, eventTimeMs: number) {
  // Check Expiry logic: If this event is way past the window, maybe force archive old one and start new?
  // Prompt says "pending entries, 24h window".
  // Let's assume strict 24h window from firstTx.
  
  if (event.blockTime > entry.expiryTime) {
    console.log(`[Journal] Entry ${entry.id} expired. Archiving and creating new.`);
    await archiveEntry(entry);
    await createNewEntry(event, eventTimeMs);
    return;
  }

  // Update totals
  const updates: Partial<JournalEntry> = {
    lastTxTime: event.blockTime,
    updatedAt: new Date().toISOString(),
    txSignatures: [...entry.txSignatures, event.signature]
  };

  if (event.type === 'BUY') {
    updates.totalBuyAmount = entry.totalBuyAmount + event.amountToken;
    if (event.amountUsd) updates.totalBuyUsd = entry.totalBuyUsd + event.amountUsd;
  } else {
    updates.totalSellAmount = entry.totalSellAmount + event.amountToken;
    if (event.amountUsd) updates.totalSellUsd = entry.totalSellUsd + event.amountUsd;
  }

  // Check for Full Exit
  // Use a small epsilon for float comparison if needed, but 0 check is basic requirement
  const currentHoldings = (updates.totalBuyAmount || entry.totalBuyAmount) - (updates.totalSellAmount || entry.totalSellAmount);
  
  // If holdings are effectively zero (and we have traded both sides?)
  // Usually full exit means we sold everything we bought (Long) or bought back everything we sold (Short).
  // Assuming Long bias for simplicity or checking direction.
  const isFullExit = Math.abs(currentHoldings) < 0.000001 && (updates.totalSellAmount || entry.totalSellAmount) > 0;

  if (isFullExit) {
    updates.status = 'archived';
    
    // Simple PnL Calc: Sell USD - Buy USD
    // Note: this is rough.
    const finalSell = updates.totalSellUsd || entry.totalSellUsd;
    const finalBuy = updates.totalBuyUsd || entry.totalBuyUsd;
    updates.realizedPnl = finalSell - finalBuy;
    
    console.log(`[Journal] Entry ${entry.id} full exit. PnL: ${updates.realizedPnl}`);
  }

  await db.entries.update(entry.id, updates);
}

async function archiveEntry(entry: JournalEntry) {
  // Calculate PnL snapshot at archive time
  const realizedPnl = entry.totalSellUsd - entry.totalBuyUsd; 
  // Note: if expired with holdings, this realized PnL is only partial.
  // Full logic might mark remaining holdings as 'carry over' or 'unrealized'.
  // For MVP we just mark status.
  
  await db.entries.update(entry.id, {
    status: 'archived', // or 'expired' if we want to differentiate
    realizedPnl: realizedPnl
  });
}

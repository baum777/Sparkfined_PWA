/**
 * Playbook Heuristics
 * Generate tactical "if-then" trading playbook entries
 * 
 * Beta v0.9: Core heuristics for Advanced Insight L3 (Tactical)
 */

import type {
  KeyLevel,
  PriceZone,
  BiasReading,
  RangeStructure,
} from '@/types/ai';

/**
 * Generate tactical playbook entries from market structure
 * 
 * Produces concrete "if X then Y" instructions based on:
 * - Key levels (support/resistance)
 * - Price zones (entry/target/stop)
 * - Bias (bullish/bearish/neutral)
 * - Range position
 * 
 * @param params - Market structure parameters
 * @returns Array of playbook entries (3-5 entries)
 */
export function generatePlaybookEntries(params: {
  keyLevels: KeyLevel[];
  zones: PriceZone[];
  bias: BiasReading;
  range: RangeStructure;
  currentPrice: number;
}): string[] {
  const { keyLevels, zones, bias, range, currentPrice } = params;
  const entries: string[] = [];

  // Find key zones
  const supportZone = zones.find(z => z.label === 'support');
  const tp1Zone = zones.find(z => z.label === 'target_tp1');
  const stopZone = zones.find(z => z.label === 'stop_loss');
  
  // Find key levels
  const resistances = keyLevels.filter(l => l.type.includes('resistance'));
  const supports = keyLevels.filter(l => l.type.includes('support'));
  const topResistance = resistances[0];
  const topSupport = supports[0];

  // Generate entries based on bias
  if (bias.bias === 'bullish') {
    // Bullish playbook
    if (tp1Zone) {
      entries.push(
        `If price breaks above $${tp1Zone.to.toFixed(2)} with volume → target $${(tp1Zone.to * 1.05).toFixed(2)}`
      );
    }
    
    if (supportZone) {
      entries.push(
        `On pullback to $${supportZone.from.toFixed(2)}-$${supportZone.to.toFixed(2)} → look for long entry with tight stop`
      );
    }
    
    if (topResistance) {
      entries.push(
        `If price rejects $${topResistance.price.toFixed(2)} → watch for retrace to $${(currentPrice * 0.98).toFixed(2)}`
      );
    }
    
    if (stopZone) {
      entries.push(
        `Stop loss trigger: clean break below $${stopZone.to.toFixed(2)} → bias shifts bearish`
      );
    }
  } else if (bias.bias === 'bearish') {
    // Bearish playbook
    if (topSupport) {
      entries.push(
        `If price breaks below $${topSupport.price.toFixed(2)} → target $${(topSupport.price * 0.95).toFixed(2)}`
      );
    }
    
    if (tp1Zone) {
      entries.push(
        `On bounce to $${tp1Zone.from.toFixed(2)}-$${tp1Zone.to.toFixed(2)} → look for short entry or exit longs`
      );
    }
    
    entries.push(
      `Below $${range.low.toFixed(2)} → new low, bias remains bearish, wait for structure`
    );
    
    if (topResistance) {
      entries.push(
        `Stop loss for shorts: clean break above $${topResistance.price.toFixed(2)} → bias shifts bullish`
      );
    }
  } else {
    // Neutral playbook (range trading)
    entries.push(
      `Range-bound between $${range.low.toFixed(2)}-$${range.high.toFixed(2)} → fade extremes, take quick profits`
    );
    
    if (topResistance && topSupport) {
      entries.push(
        `Sell near $${topResistance.price.toFixed(2)} resistance, buy near $${topSupport.price.toFixed(2)} support`
      );
    }
    
    entries.push(
      `Break above $${range.high.toFixed(2)} → bullish breakout, target $${(range.high * 1.05).toFixed(2)}`
    );
    
    entries.push(
      `Break below $${range.low.toFixed(2)} → bearish breakdown, target $${(range.low * 0.95).toFixed(2)}`
    );
  }

  // Add risk management entry
  if (entries.length < 5) {
    entries.push(
      `Risk management: Position size 1-2% of capital, stop loss ${((Math.abs(currentPrice - (stopZone?.from || range.low)) / currentPrice) * 100).toFixed(1)}% from entry`
    );
  }

  return entries.slice(0, 5); // Max 5 entries
}

/**
 * Generate simple playbook from price and ATR
 * Fallback when full structure data is unavailable
 * 
 * @param currentPrice - Current price
 * @param atr - Average True Range
 * @param bias - Directional bias
 * @returns Array of basic playbook entries
 */
export function generateSimplePlaybook(
  currentPrice: number,
  atr: number,
  bias: 'bullish' | 'bearish' | 'neutral'
): string[] {
  const entries: string[] = [];
  
  const stop = currentPrice - (atr * 1.5);
  const target1 = currentPrice + (atr * 2);
  const target2 = currentPrice + (atr * 3);
  
  if (bias === 'bullish') {
    entries.push(
      `Entry: Current price $${currentPrice.toFixed(2)} on bullish bias`
    );
    entries.push(
      `Target 1: $${target1.toFixed(2)} (2R), Target 2: $${target2.toFixed(2)} (3R)`
    );
    entries.push(
      `Stop loss: $${stop.toFixed(2)} (1.5 ATR below entry)`
    );
  } else if (bias === 'bearish') {
    const shortTarget1 = currentPrice - (atr * 2);
    const shortTarget2 = currentPrice - (atr * 3);
    const shortStop = currentPrice + (atr * 1.5);
    
    entries.push(
      `Entry: Current price $${currentPrice.toFixed(2)} on bearish bias (short)`
    );
    entries.push(
      `Target 1: $${shortTarget1.toFixed(2)} (2R), Target 2: $${shortTarget2.toFixed(2)} (3R)`
    );
    entries.push(
      `Stop loss: $${shortStop.toFixed(2)} (1.5 ATR above entry)`
    );
  } else {
    entries.push(
      `Neutral bias: Wait for clear break above $${(currentPrice + atr).toFixed(2)} (bullish) or below $${(currentPrice - atr).toFixed(2)} (bearish)`
    );
    entries.push(
      `Range trading: Buy support, sell resistance, tight stops at ${(atr * 0.5).toFixed(2)}`
    );
  }
  
  return entries;
}

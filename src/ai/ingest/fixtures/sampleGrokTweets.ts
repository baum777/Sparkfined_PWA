import type { GrokTweetPayload } from '@/types/events';

export const sampleGrokTweets: GrokTweetPayload[] = [
  {
    id: 'tweet-1',
    url: 'https://twitter.com/example/status/1',
    text: 'SOL heat picking up, whales rotating back in. Watching for 5m momentum.',
    full_text:
      'SOL heat picking up, whales rotating back in. Watching for 5m momentum and looking for continuation above $SOL.',
    language: 'en',
    created_at: new Date().toISOString(),
    platform: 'x',
    author: {
      handle: 'onchainwizard',
      display_name: 'Onchain Wizard',
      followers: 180000,
      verified: true,
      type: 'influencer',
      influence_score: 0.84,
    },
    tokens: [
      {
        token_symbol: 'SOL',
        cashtag: '$SOL',
        chain: 'solana',
        market: {
          price_usd: 152.4,
          price_change_24h_pct: 4.2,
          volume_24h_usd: 120000000,
        },
      },
    ],
    attachments: {
      has_media: true,
      has_links: false,
    },
    sentiment: {
      score: 0.71,
      label: 'bullish',
      confidence: 0.78,
      keywords: ['momentum', 'whales', 'continuation'],
      emotion_tags: ['excitement'],
      journal_context_tags: ['rotation', 'momentum'],
    },
    analytics: {
      trending_score: 0.82,
      alert_relevance: 0.76,
      hype_level: 'acceleration',
      journal_context_tags: ['flow'],
      replay_flag: false,
      narrative: 'Momentum rotating back into SOL with renewed whale interest.',
    },
    tags: ['#sol', '$SOL'],
  },
  {
    id: 'tweet-2',
    url: 'https://twitter.com/example/status/2',
    text: 'Caution on $BONK here. Froth everywhere and quick pullbacks.',
    full_text:
      'Caution on $BONK here. Froth everywhere and quick pullbacks. Could see mean reversion unless volume steps up.',
    language: 'en',
    created_at: new Date().toISOString(),
    platform: 'x',
    author: {
      handle: 'riskobserver',
      display_name: 'Risk Observer',
      followers: 54000,
      verified: false,
      type: 'news',
      influence_score: 0.55,
    },
    tokens: [
      {
        token_symbol: 'BONK',
        cashtag: '$BONK',
        chain: 'sol',
        market: {
          price_usd: 0.000025,
          price_change_24h_pct: -3.1,
          volume_24h_usd: 3800000,
        },
      },
    ],
    attachments: {
      has_media: false,
      has_links: true,
    },
    sentiment: {
      score: -0.35,
      label: 'warning',
      confidence: 0.66,
      keywords: ['froth', 'pullback'],
      journal_context_tags: ['risk'],
    },
    analytics: {
      trending_score: 0.64,
      alert_relevance: 0.82,
      hype_level: 'cooldown',
      replay_flag: true,
      narrative: 'Froth signals cooling, watch for unwind.',
    },
    tags: ['#bonk', '$BONK'],
  },
];

import type {
  GrokTweetAnalytics,
  GrokTweetMetrics,
  GrokTweetPayload,
  GrokTweetSentiment,
  GrokTweetTokenRef,
  SolanaMemeTrendEvent,
  SolanaMemeTrendMarketSnapshot,
  SolanaMemeTrendSentiment,
  SolanaMemeTrendSparkfined,
  SolanaMemeTrendTrading,
  TrendCallToAction,
  TrendSentimentLabel,
} from '@/types/events';

const SOLANA_CHAIN_ALIASES = new Set(['sol', 'solana']);
const DEFAULT_PLATFORM = 'twitter';

const CTA_BY_SENTIMENT: Record<TrendSentimentLabel, TrendCallToAction> = {
  bullish: 'swing',
  bearish: 'take-profit',
  neutral: 'watch',
  mixed: 'watch',
  warning: 'avoid',
  opportunity: 'scalp',
};

const SENTIMENT_BASE_ALERT: Record<TrendSentimentLabel, number> = {
  bullish: 0.55,
  bearish: 0.65,
  neutral: 0.45,
  mixed: 0.5,
  warning: 0.85,
  opportunity: 0.6,
};

export function normalizeGrokTweet(tweet: GrokTweetPayload): SolanaMemeTrendEvent[] {
  if (!tweet || !tweet.id) {
    console.warn('[normalizeGrokTweet] received invalid tweet payload, skipping');
    return [];
  }

  const tokenRefs = (tweet.tokens ?? []).filter(isSupportedToken);
  if (!tokenRefs.length) {
    return [];
  }

  const importedAt = tweet.imported_at ?? new Date().toISOString();
  const platform = tweet.platform ?? DEFAULT_PLATFORM;

  return tokenRefs.map((token) =>
    buildEvent({
      tweet,
      token,
      importedAt,
      platform,
    }),
  );
}

export function normalizeGrokTweets(tweets: GrokTweetPayload[]): SolanaMemeTrendEvent[] {
  if (!Array.isArray(tweets) || !tweets.length) {
    return [];
  }

  return tweets.flatMap((tweet) => normalizeGrokTweet(tweet));
}

type BuildEventParams = {
  tweet: GrokTweetPayload;
  token: GrokTweetTokenRef;
  importedAt: string;
  platform: string;
};

function buildEvent({ tweet, token, importedAt, platform }: BuildEventParams): SolanaMemeTrendEvent {
  const normalizedSymbol = normalizeSymbol(token);
  const cashtag = ensureCashtag(token, normalizedSymbol);
  const metrics = normalizeMetrics(tweet.metrics);

  const tweetCashtags = uniqueStringArray([...extractCashtags(tweet.tags), cashtag]);
  const tweetHashtags = extractHashtags(tweet.tags);

  return {
    id: `${tweet.id}::${normalizedSymbol}`,
    source: {
      platform,
      tweetId: tweet.id,
      tweetUrl: tweet.url,
      importedAt,
    },
    author: {
      handle: tweet.author?.handle ?? 'unknown',
      displayName: tweet.author?.display_name,
      followers: sanitizeNumber(tweet.author?.followers),
      verified: Boolean(tweet.author?.verified),
      authorType: tweet.author?.type ?? 'unknown',
      influenceScore: sanitizeNumber(tweet.author?.influence_score),
    },
    tweet: {
      createdAt: tweet.created_at,
      fullText: tweet.full_text ?? tweet.text ?? '',
      language: tweet.language ?? null,
      cashtags: tweetCashtags,
      hashtags: tweetHashtags,
      hasMedia: Boolean(tweet.attachments?.has_media),
      hasLinks: Boolean(tweet.attachments?.has_links),
      metrics,
    },
    token: {
      symbol: normalizedSymbol,
      cashtag,
      chain: 'solana',
      contractAddress: token.contract_address,
      slug: token.slug,
      dexPair: token.dex_pair,
    },
    market: normalizeMarketSnapshot(token.market),
    sentiment: normalizeSentiment(tweet.sentiment),
    trading: normalizeTrading(tweet.analytics, tweet.sentiment),
    sparkfined: normalizeSparkfined(tweet, metrics),
    derived: {
      normalizedSymbol,
    },
    receivedAt: importedAt,
  };
}

function isSupportedToken(token: GrokTweetTokenRef | undefined | null): token is GrokTweetTokenRef {
  if (!token) {
    return false;
  }

  if (!(token.symbol || token.cashtag)) {
    return false;
  }

  if (!token.chain) {
    return true;
  }

  return SOLANA_CHAIN_ALIASES.has(token.chain.toLowerCase());
}

function normalizeSymbol(token: GrokTweetTokenRef): string {
  const raw = token.symbol ?? token.cashtag ?? '';
  const clean = raw.replace(/^\$/, '').trim();
  return clean ? clean.toUpperCase() : 'UNKNOWN';
}

function ensureCashtag(token: GrokTweetTokenRef, fallbackSymbol: string): string {
  if (token.cashtag) {
    return formatCashtag(token.cashtag);
  }
  return `$${fallbackSymbol}`;
}

function formatCashtag(rawTag: string): string {
  const clean = rawTag.replace(/^\$/, '').trim().toUpperCase();
  return clean ? `$${clean}` : '';
}

function extractCashtags(tags?: string[]): string[] {
  if (!tags?.length) {
    return [];
  }

  return uniqueStringArray(
    tags
      .filter((tag) => typeof tag === 'string' && tag.trim().startsWith('$'))
      .map((tag) => formatCashtag(tag)),
  );
}

function extractHashtags(tags?: string[]): string[] {
  if (!tags?.length) {
    return [];
  }

  return uniqueStringArray(
    tags
      .filter((tag) => typeof tag === 'string' && tag.trim().startsWith('#'))
      .map((tag) => tag.trim().toLowerCase()),
  );
}

function uniqueStringArray(values: (string | undefined | null)[]): string[] {
  const filtered = values
    .map((value) => (value ?? '').trim())
    .filter((value) => Boolean(value));
  return Array.from(new Set(filtered));
}

function normalizeMetrics(metrics?: GrokTweetMetrics): GrokTweetMetrics {
  if (!metrics) {
    return {};
  }

  return {
    likes: sanitizeNumber(metrics.likes),
    reposts: sanitizeNumber(metrics.reposts),
    replies: sanitizeNumber(metrics.replies),
    quotes: sanitizeNumber(metrics.quotes),
    bookmarks: sanitizeNumber(metrics.bookmarks),
    views: sanitizeNumber(metrics.views),
    engagement_rate: sanitizeNumber(metrics.engagement_rate),
  };
}

function normalizeMarketSnapshot(
  market?: GrokTweetTokenRef['market'],
): SolanaMemeTrendMarketSnapshot | undefined {
  if (!market) {
    return undefined;
  }

  const snapshot: SolanaMemeTrendMarketSnapshot = {
    priceUsd: sanitizeNumber(market.price_usd),
    priceChange24hPct: sanitizeNumber(market.price_change_24h_pct),
    volume24hUsd: sanitizeNumber(market.volume_24h_usd),
    liquidityUsd: sanitizeNumber(market.liquidity_usd),
    marketCapUsd: sanitizeNumber(market.market_cap_usd),
    fdvUsd: sanitizeNumber(market.fdv_usd),
  };

  if (Object.values(snapshot).every((value) => value === undefined)) {
    return undefined;
  }

  return snapshot;
}

function normalizeSentiment(
  sentiment?: GrokTweetSentiment,
): SolanaMemeTrendSentiment | undefined {
  if (!sentiment) {
    return undefined;
  }

  const normalized: SolanaMemeTrendSentiment = {
    score: sanitizeNumber(sentiment.score),
    label: sentiment.label,
    confidence: sanitizeNumber(sentiment.confidence),
    keywords: sentiment.keywords ?? [],
  };

  if (
    normalized.score === undefined &&
    !normalized.label &&
    normalized.confidence === undefined &&
    !normalized.keywords?.length
  ) {
    return undefined;
  }

  return normalized;
}

function normalizeTrading(
  analytics?: GrokTweetAnalytics,
  sentiment?: GrokTweetSentiment,
): SolanaMemeTrendTrading | undefined {
  const hypeLevel = analytics?.hype_level;
  const callToAction = deriveCallToAction(sentiment?.label);

  const volatilityRisk =
    typeof analytics?.trending_score === 'number'
      ? clamp(analytics.trending_score / 150, 0, 1)
      : undefined;

  if (!hypeLevel && !callToAction && volatilityRisk === undefined) {
    return undefined;
  }

  return {
    hypeLevel,
    callToAction,
    volatilityRisk,
  };
}

function normalizeSparkfined(
  tweet: GrokTweetPayload,
  metrics: GrokTweetMetrics,
): SolanaMemeTrendSparkfined {
  const trendingScore = computeTrendingScore(tweet.analytics?.trending_score, metrics);
  const alertRelevance = computeAlertRelevance(
    tweet.analytics?.alert_relevance,
    trendingScore,
    tweet.sentiment?.label,
  );
  const journalContextTags = uniqueStringArray([
    ...(tweet.analytics?.journal_context_tags ?? []),
    ...(tweet.sentiment?.journal_context_tags ?? []),
  ]);
  const emotionTags = uniqueStringArray(tweet.sentiment?.emotion_tags ?? []);

  return {
    trendingScore,
    alertRelevance,
    journalContextTags,
    emotionTags,
    replayFlag: Boolean(tweet.analytics?.replay_flag),
    narrative: tweet.analytics?.narrative,
  };
}

function computeTrendingScore(
  explicitScore: number | undefined,
  metrics: GrokTweetMetrics,
): number | undefined {
  if (typeof explicitScore === 'number' && Number.isFinite(explicitScore)) {
    return explicitScore;
  }

  const derived = scoreFromMetrics(metrics);
  return derived ?? undefined;
}

function computeAlertRelevance(
  explicit: number | undefined,
  trendingScore: number | undefined,
  label: TrendSentimentLabel | undefined,
): number | undefined {
  if (typeof explicit === 'number' && Number.isFinite(explicit)) {
    return clamp(explicit, 0, 1);
  }

  if (trendingScore === undefined && !label) {
    return undefined;
  }

  const base = label ? SENTIMENT_BASE_ALERT[label] ?? 0.5 : 0.45;
  const bonus = trendingScore ? Math.min(trendingScore / 1000, 0.35) : 0;

  return clamp(base + bonus, 0, 1);
}

function deriveCallToAction(label?: TrendSentimentLabel): TrendCallToAction | undefined {
  if (!label) {
    return undefined;
  }
  return CTA_BY_SENTIMENT[label];
}

function scoreFromMetrics(metrics: GrokTweetMetrics): number | undefined {
  const likes = metrics.likes ?? 0;
  const reposts = metrics.reposts ?? 0;
  const replies = metrics.replies ?? 0;
  const quotes = metrics.quotes ?? 0;
  const views = metrics.views ?? 0;

  const engagementScore =
    likes * 1 +
    reposts * 2 +
    replies * 1.5 +
    quotes * 1.25 +
    (views ? views * 0.001 : 0);

  return engagementScore > 0 ? engagementScore : undefined;
}

function sanitizeNumber(value: number | undefined | null): number | undefined {
  if (typeof value !== 'number') {
    return undefined;
  }

  return Number.isFinite(value) ? value : undefined;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

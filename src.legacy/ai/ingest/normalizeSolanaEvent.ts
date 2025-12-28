import type {
  GrokAuthorType,
  GrokTweetAnalytics,
  GrokTweetMetrics,
  GrokTweetPayload,
  GrokTweetSentiment,
  GrokTweetTokenRef,
  SolanaMemeTrendDerived,
  SolanaMemeTrendEvent,
  SolanaMemeTrendMarketSnapshot,
  SolanaMemeTrendSearchDocument,
  SolanaMemeTrendSentiment,
  SolanaMemeTrendSparkfined,
  SolanaMemeTrendTrading,
  TrendCallToAction,
  TrendSearchTopic,
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
  unknown: 'watch',
};

const SENTIMENT_BASE_ALERT: Record<TrendSentimentLabel, number> = {
  bullish: 0.55,
  bearish: 0.65,
  neutral: 0.45,
  mixed: 0.5,
  warning: 0.85,
  opportunity: 0.6,
  unknown: 0.4,
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

  const sentiment = normalizeSentiment(tweet.sentiment, tweet.analytics);
  const trading = normalizeTrading(tweet.analytics, tweet.sentiment);
  const sparkfined = normalizeSparkfined(tweet, metrics, trading);
  const snippet = buildSnippet(tweet.full_text ?? tweet.text ?? '');

  const event: SolanaMemeTrendEvent = {
    type: 'SolanaMemeTrendEvent',
    id: `${tweet.id}::${normalizedSymbol}`,
    source: {
      platform,
      tweetId: tweet.id,
      tweetUrl: tweet.url,
      importedAt,
    },
    author: {
      handle: tweet.author?.handle ?? 'unknown',
      name: tweet.author?.display_name ?? tweet.author?.handle,
      displayName: tweet.author?.display_name,
      followers: sanitizeNumber(tweet.author?.followers),
      verified: Boolean(tweet.author?.verified),
      authorType: tweet.author?.type ?? 'unknown',
      influenceScore: sanitizeNumber(tweet.author?.influence_score),
    },
    tweet: {
      createdAt: tweet.created_at,
      fullText: tweet.full_text ?? tweet.text ?? '',
      language: tweet.language ?? 'unknown',
      cashtags: tweetCashtags,
      hashtags: tweetHashtags,
      hasMedia: Boolean(tweet.attachments?.has_media),
      hasLinks: Boolean(tweet.attachments?.has_links),
      mediaPresent: Boolean(tweet.attachments?.has_media),
      linksPresent: Boolean(tweet.attachments?.has_links),
      snippet,
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
    sentiment,
    trading,
    sparkfined,
    derived: normalizeDerived({
      normalizedSymbol,
      cashtag,
      importedAt,
      authorType: tweet.author?.type ?? 'unknown',
      sparkfined,
      trading,
      metrics,
      tweetUrl: tweet.url,
      snippet,
    }),
    receivedAt: importedAt,
  };

  const searchDocument = buildSearchDocument(event, tweet);
  event.derived.searchDocument = searchDocument;
  event.derived.searchTopic = searchDocument.searchTopic;

  return event;
}

function isSupportedToken(token: GrokTweetTokenRef | undefined | null): token is GrokTweetTokenRef {
  if (!token) {
    return false;
  }

  if (!getTokenSymbolCandidate(token) && !token.cashtag) {
    return false;
  }

  const chain = token.chain?.toLowerCase();
  if (!chain) {
    return true;
  }

  return SOLANA_CHAIN_ALIASES.has(chain);
}

function normalizeSymbol(token: GrokTweetTokenRef): string {
  const raw = getTokenSymbolCandidate(token) ?? token.cashtag ?? '';
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

function getTokenSymbolCandidate(token: GrokTweetTokenRef): string | undefined {
  return token.token_symbol ?? token.symbol ?? token.slug;
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
  analytics?: GrokTweetAnalytics,
): SolanaMemeTrendSentiment | undefined {
  if (!sentiment) {
    return undefined;
  }

  const normalized: SolanaMemeTrendSentiment = {
    score: sanitizeNumber(sentiment.score),
    label: sentiment.label,
    confidence: sanitizeNumber(sentiment.confidence),
    keywords: sentiment.keywords ?? [],
    hypeLevel: analytics?.hype_level,
    emotionTags: sentiment.emotion_tags ?? analytics?.journal_context_tags,
  };

  if (
    normalized.score === undefined &&
    !normalized.label &&
    normalized.confidence === undefined &&
    !normalized.keywords?.length &&
    !normalized.hypeLevel
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
  const timeframe = hypeLevel === 'mania' ? 'intraday' : hypeLevel === 'cooldown' ? 'swing' : 'scalp';

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
    timeframe,
    strengthHint: hypeLevel === 'mania' ? 'high' : hypeLevel ? 'medium' : undefined,
  };
}

function normalizeSparkfined(
  tweet: GrokTweetPayload,
  metrics: GrokTweetMetrics,
  trading?: SolanaMemeTrendTrading,
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
    trendingScore: trendingScore ?? 0,
    alertRelevance: alertRelevance ?? 0,
    journalContextTags: journalContextTags.length ? journalContextTags : undefined,
    emotionTags: emotionTags.length ? emotionTags : undefined,
    replayFlag: Boolean(tweet.analytics?.replay_flag),
    narrative: tweet.analytics?.narrative,
    callToAction: trading?.callToAction,
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

type NormalizeDerivedArgs = {
  normalizedSymbol: string;
  cashtag: string;
  importedAt: string;
  authorType: GrokAuthorType;
  sparkfined: SolanaMemeTrendSparkfined;
  trading?: SolanaMemeTrendTrading;
  metrics: GrokTweetMetrics;
  tweetUrl?: string;
  snippet?: string;
};

function normalizeDerived({
  normalizedSymbol,
  cashtag,
  importedAt,
  authorType,
  sparkfined,
  trading,
  metrics,
  tweetUrl,
  snippet,
}: NormalizeDerivedArgs): SolanaMemeTrendDerived {
  const twitterScore = scoreFromMetrics(metrics) ?? sparkfined.trendingScore;
  return {
    normalizedSymbol,
    primaryCashtag: cashtag,
    lastUpdated: importedAt,
    authorCategory: authorType,
    twitterScore: twitterScore ?? undefined,
    volatilityHint: deriveVolatilityHint(trading?.volatilityRisk, sparkfined.trendingScore),
    latestTweetUrl: tweetUrl,
    snippet,
  };
}

function buildSearchDocument(
  event: SolanaMemeTrendEvent,
  tweet: GrokTweetPayload,
): SolanaMemeTrendSearchDocument {
  const sentimentLabel = event.sentiment?.label ?? 'unknown';
  const hypeLevel = event.trading?.hypeLevel ?? event.sentiment?.hypeLevel ?? 'unknown';
  const callToAction = event.trading?.callToAction ?? event.sparkfined.callToAction ?? 'unknown';

  const tokensJoined = (tweet.tokens ?? [])
    .map((token) => getTokenSymbolCandidate(token))
    .filter((value): value is string => Boolean(value))
    .map((token) => token.toUpperCase())
    .join(' ');

  const searchTopic = inferSearchTopic(callToAction, event.tweet.fullText);

  return {
    id: event.id,
    symbol: event.token.symbol,
    cashtag: event.token.cashtag ?? '',
    tweetId: event.source.tweetId,
    authorHandle: event.author.handle,
    authorType: event.author.authorType,
    language: event.tweet.language ?? 'unknown',
    createdAt: event.tweet.createdAt,
    receivedAt: event.receivedAt,
    fullText: event.tweet.fullText,
    tokensJoined,
    sentimentLabel,
    hypeLevel,
    callToAction,
    searchTopic,
    trendingScore: event.sparkfined.trendingScore ?? 0,
    alertRelevance: event.sparkfined.alertRelevance ?? 0,
    mediaPresent: event.tweet.hasMedia,
    linksPresent: event.tweet.hasLinks,
  };
}

function inferSearchTopic(callToAction: string, fullText: string): TrendSearchTopic {
  const needle = `${callToAction} ${fullText}`.toLowerCase();

  if (containsAny(needle, ['entry', 'ape in', 'buy the dip', 'long now'])) {
    return 'entry';
  }
  if (containsAny(needle, ['exit', 'take profit', 'tp', 'trim'])) {
    return 'exit';
  }
  if (containsAny(needle, ['risk', 'hedge', 'stop', 'drawdown'])) {
    return 'risk';
  }
  if (containsAny(needle, ['meme', 'shitcoin', 'degen', 'pump'])) {
    return 'meme';
  }
  if (containsAny(needle, ['rotation', 'rotate', 'sector'])) {
    return 'rotation';
  }

  return 'unknown';
}

function containsAny(haystack: string, candidates: string[]): boolean {
  return candidates.some((candidate) => haystack.includes(candidate));
}

function deriveVolatilityHint(
  volatilityRisk: number | undefined,
  trendingScore: number | undefined,
): 'calm' | 'building' | 'spiky' | undefined {
  if (volatilityRisk === undefined && trendingScore === undefined) {
    return undefined;
  }

  const combined = (volatilityRisk ?? 0) + (trendingScore ? trendingScore / 1000 : 0);

  if (combined < 0.4) {
    return 'calm';
  }

  if (combined < 0.8) {
    return 'building';
  }

  return 'spiky';
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

function buildSnippet(fullText: string): string {
  if (!fullText) {
    return '';
  }

  return fullText.length > 200 ? `${fullText.slice(0, 197)}…` : fullText;
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

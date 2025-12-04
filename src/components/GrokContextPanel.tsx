/**
 * BLOCK 3: Grok Context Display Panel
 * 
 * Displays X-Timeline lore/hype fetched from Grok API
 * Collapsible panel with tweets and sentiment
 */

import React from 'react'
import type { GrokContext } from '@/types/journal'

interface GrokContextPanelProps {
  context: GrokContext
  onRefresh?: () => void
}

export default function GrokContextPanel({ context, onRefresh }: GrokContextPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  // Sentiment colors
  const sentimentColors = {
    bullish: 'text-spark bg-spark/40 border-spark/40',
    bearish: 'text-blood bg-blood/40 border-blood/40',
    neutral: 'text-fog bg-smoke/40 border-smoke-light/40',
  }

  const sentimentEmoji = {
    bullish: '🚀',
    bearish: '📉',
    neutral: '😐',
  }

  return (
    <div className="rounded-xl border border-spark/40 bg-spark/20 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">𝕏</span>
          <h3 className="font-semibold text-spark">Timeline Context (Grok)</h3>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="rounded border border-spark px-2 py-1 text-xs text-spark hover:bg-spark/40"
          >
            🔄 Refresh
          </button>
        )}
      </div>

      {/* Sentiment Badge */}
      <div className="mb-3 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${sentimentColors[context.sentiment]}`}>
          <span>{sentimentEmoji[context.sentiment]}</span>
          <span className="capitalize">{context.sentiment}</span>
        </span>
        <span className="text-xs text-spark/60">
          {new Date(context.fetchedAt).toLocaleString()}
        </span>
      </div>

      {/* Lore/Summary */}
      <div className="mb-3 rounded-lg border border-spark/30 bg-black/20 p-3">
        <div className="text-sm font-medium text-spark mb-1">Summary</div>
        <p className="text-sm text-spark/90 leading-relaxed">{context.lore}</p>
      </div>

      {/* Key Tweets (Collapsible) */}
      {context.keyTweets && context.keyTweets.length > 0 && (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mb-2 flex w-full items-center justify-between rounded-lg border border-spark/30 bg-spark/20 px-3 py-2 text-left text-sm font-medium text-spark hover:bg-spark/40"
          >
            <span>Key Tweets ({context.keyTweets.length})</span>
            <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
          </button>

          {isExpanded && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {context.keyTweets.map((tweet, idx) => (
                <div
                  key={tweet.url || idx}
                  className="rounded-lg border border-spark/20 bg-black/30 p-3 text-sm"
                >
                  {/* Author & Timestamp */}
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-spark">{tweet.author}</span>
                    <span className="text-xs text-spark/60">
                      {new Date(tweet.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Tweet Text */}
                  <p className="mb-2 text-spark/80 leading-relaxed">{tweet.text}</p>

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 text-xs text-spark/70">
                    {tweet.likes !== undefined && (
                      <span>❤️ {tweet.likes.toLocaleString()}</span>
                    )}
                    {tweet.retweets !== undefined && (
                      <span>🔁 {tweet.retweets.toLocaleString()}</span>
                    )}
                    <a
                      href={tweet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-spark hover:underline"
                    >
                      View →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Tweets Message */}
      {(!context.keyTweets || context.keyTweets.length === 0) && (
        <div className="rounded-lg border border-spark/20 bg-black/30 p-3 text-center text-sm text-spark/60">
          No tweets found for this token
        </div>
      )}
    </div>
  )
}

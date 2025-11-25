# A/B Test Plan — Sampling & Confidence Thresholds

**Objective:** Find the optimal sampling rate and confidence threshold for running Grok social analysis that balances cost and utility.

## Variables
- Sampling rate (S): 1%, 5%, 10% (A/B groups)
- Confidence threshold (C): 0.5, 0.6, 0.7
- Cost cap per user per month: configurable via AI_MAX_COST_USD

## Metrics
- Precision of flagged social insights (manual label sample)
- % of journal entries with `social_analysis`
- Avg AI cost per user
- Human review load (items flagged `social_review_required`)
- Conversion: % of suggested trade ideas saved to journal after social analysis

## Experiment design
- Randomly assign users into S groups for 4 weeks.
- Within each S group, evaluate multiple C thresholds via offline simulation on collected samples (labelled).
- Evaluate tradeoff: utility (precision + downstream conversions) vs cost.

## Success Criteria
- Achieve >0.65 precision on flagged insights with Avg AI cost per user < $2/month.
- Keep human review load manageable (<5% of journal entries).

## Notes
- Start with conservative defaults S=10%, C=0.6.
- Use historical data and synthetic fixtures to pre-tune heuristics.

# Journal Redesign — Fast Check-in + Actionable Results

## Objective
Make Journal a fast pre-trade check-in with a clean results screen:
- reduce scroll
- sticky actions
- readable insight cards

## Input Screen (Capture)
### Structure (3 sections)
1) State (required): emotion select + 3 sliders (compact grid)
2) Context (optional by default): market context + reasoning (collapsed)
3) Thesis (required): thesis+invalidation + expectation + self reflection (optional)

### Sticky Action Bar
- Bottom bar always visible:
  - Save draft / Reset
  - Run Journal (primary)

## Results Screen
- Top summary: Archetype + Score + 1-line insight
- Metrics: 2x2 MetricCards (Decision quality, Volatility, Risk alignment, Pattern strength)
- Insights: 2–4 cards with bullets + suggested next action
- Recent entries: compact list rows

## Acceptance Criteria
- Input screen scroll reduced significantly.
- Required vs optional fields are obvious.
- Run action available without scrolling to bottom.
- Results are scannable and not rendered as long debug rows.

## Tests
- Unit tests:
  - sticky action bar present
  - results render metric cards from sample output

# INFRA-01: Vercel Function Limits

**Context**
- Current plan: Vercel Hobby (Edge/Serverless)
- Hard limit: **12 functions** (edge + serverless combined)
- Risk: Upcoming feature work (AI endpoints, alerts, replay lab) may exceed quota and block deploys

**Estimated function count**
- Existing endpoints: auth/access, alerts, market-data proxies, AI orchestrator, health (~8-9 observed)
- In-flight/planned: replay lab, additional alert handlers, AI batching could push us past 12

**Options**
- **A) Upgrade to Pro**: removes the 12-function cap, +cost; fastest unblock, no refactor now
- **B) Consolidate functions**: merge related routes (e.g., alerts, AI proxy fan-in); keeps Hobby but requires refactor/testing
- **C) Hybrid (recommended)**: upgrade now to unblock shipping, then schedule consolidation to reduce cold-starts and cost

**Recommendation**
- Choose **Hybrid**: upgrade immediately (ETA <1h), then plan consolidation sprint (1-2 days) to group alert handlers and AI routes, add tracing to monitor cold starts.

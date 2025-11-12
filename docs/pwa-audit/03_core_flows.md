---
title: "Core Interaction Flows"
summary: "Sequence diagrams for primary Sparkfined user journeys."
sources:
  - src/pages/JournalPage.tsx
  - src/sections/journal/useJournal.ts
  - src/pages/ChartPage.tsx
  - src/pages/AnalyzePage.tsx
  - src/store/AccessProvider.tsx
  - src/sections/ai/useAssist.ts
  - src/state/aiContext.ts
  - src/lib/aiClient.ts
  - src/lib/db-board.ts
---

## Journal Save w/ AI Attachment
```
User
  |
  | type note + click "Speichern"
  v
JournalPage onSave()
  |
  |-> useJournal.create/update (Dexie draft persist)
  |-> saveServer()
        |
        | POST /api/journal (body includes draft + ruleId)
        v
      API response
        |
        | ok?
        |   yes -> refresh list via loadServer(); reset draft
        |   no  -> keep draft, surface toast (TODO)
```

## Chart → Journal Draft Bridge
```
User interacts with ChartPage
  |
  | capture snapshot / quick note
  v
ChartPage dispatch CustomEvent("journal:draft", detail)
  |
  | window event bus
  v
JournalPage useEffect listener
  |
  | merge detail into draft state
  v
Editor scrolls to top + focuses user
```

## Access Token Gate
```
User opens protected route
  |
AccessProvider (context)
  |
  | walletConnected?
  |   no  -> render connect CTA
  |   yes -> check localStorage cache
  |               |
  |               | stale?
  |               |   no  -> hydrate status immediately
  |               |   yes -> fetch
  |                           |
  |                           | GET ${ACCESS_CONFIG.API_BASE}/access/status
  |                           v
  |                         HTTP response
  |                           |
  |                           | status 200 -> setStatus + cache + render children
  |                           | status 404 -> downgrade to `none`
  |                           | error/timeout -> keep cached details, set error banner
```

## Analyze AI Orchestration
```
User clicks "AI-Analyse"
  |
AnalyzePage runTemplate()
  |
  | call useAssist.runTemplate()
  v
useAssist
  |
  | fetch("/api/ai/assist", body={provider, model, templateId, vars})
  v
API proxy
  |
  | responses with { text, usage }
  v
useAssist
  |
  | update result state
  | aiContext.addTokens(usage)
  | dispatch CustomEvent("token:observe", detail)
  v
AnalyzePage
  |
  | enable "Insert" button
  v
User optionally broadcasts to journal via CustomEvent("journal:insert")
```

## Token Usage Overlay
```
AI responses -> CustomEvent("token:observe")
  |
Telemetry provider (src/state/aiContext.ts)
  |
  | accumulate counts in context + localStorage
  | notify UI overlays
  v
UI components show running token tally (Settings + overlays)
```


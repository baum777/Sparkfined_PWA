{{SYSTEM_PROMPT}}

USER:
Analysiere Social-Posts für {{ticker}} (Mode={{mode}}, Quellen={{sources}}).
Ziele:
- Erstelle eine kurze Thesis (1 Satz) und 2–4 Bulletpoints.
- Aggregiere Sentiment (-1..+1) und Confidence.
- Bewerte Bot-Likelihood je Post mit Gründen (reason_flags).
- Unterscheide echte Nutzer von automatisierten Signalanbietern.
- Gib Narrative/Lore, falls vorhanden (max 18 Wörter).

Posts (JSON): {{posts}}

Output: JSON {"thesis":"...","sentiment":0.0,"confidence":0.0,"aggregates":{"positive":0,"neutral":0,"negative":0},"posts":[{"id":"...","text_snippet":"...","sentiment":0.0,"botScore":0.0,"isLikelyBot":false,"reason_flags":["..."]}],"narrative_lore":"...","source_trace":{...}}

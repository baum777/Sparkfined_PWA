# WP-035 Checklist — Journal Workflow (Templates + Auto-Save + Validation)

## Snapshot
- Date: 2025-12-19
- WP: WP-035 (Cluster C)
- Scope: Journal workflow reliability (autosave, validation, templates, autocomplete)

## File targets
- CREATE  src/features/journal/useAutoSave.ts
- CREATE  src/features/journal/NewTradeModal.tsx
- CREATE  src/features/journal/TextfieldWithAutocomplete.tsx
- MODIFY  src/features/journal/JournalForm.tsx (journal-v2 wrapper)

## Steps
1. Draft model + localStorage persistence — DONE (localStorage draft state restored + reset clears storage) — Files: src/features/journal-v2/components/JournalInputForm.tsx
2. useAutoSave hook — DONE (added shared hook with debounce + interval, integrated into JournalInputForm) — Files: src/features/journal/useAutoSave.ts, src/features/journal-v2/components/JournalInputForm.tsx
3. “Saved at …” feedback — DONE (inline autosave status near actions) — Files: src/features/journal-v2/components/JournalInputForm.tsx
4. Inline validation — DONE (required reasoning/expectation with inline errors + submit gating) — Files: src/features/journal-v2/components/JournalInputForm.tsx, src/features/journal/TradeThesisCard.tsx
5. Templates + autosave compatibility — DONE (template apply flags drafts for immediate autosave) — Files: src/features/journal-v2/components/JournalInputForm.tsx, src/features/journal-v2/components/JournalTemplatesSection.tsx
6. TextfieldWithAutocomplete integration — DONE (new autocomplete input for expectation field) — Files: src/features/journal/TextfieldWithAutocomplete.tsx, src/features/journal/TradeThesisCard.tsx
7. NewTradeModal — DONE (stub modal noted as unused entry point) — Files: src/features/journal/NewTradeModal.tsx
8. Docs update — DONE (CHANGELOG + docs/index entry for WP-035) — Files: docs/CHANGELOG.md, docs/index.md
9. Finalize checklist — DONE (verification + AC mapping captured) — Files: WP-Polish/WP-035/checklist.md

## Acceptance criteria mapping
- Auto-save every ~30s with “Saved at …” feedback — DONE (useAutoSave hook + inline status in `JournalInputForm`)
- Required fields show inline errors — DONE (reasoning/expectation validation with inline messages in `JournalInputForm`/`TradeThesisCard`)
- Template prefill works — DONE (template applications flag autosave in `JournalInputForm` and `JournalTemplatesSection`)
- Draft persists on refresh (localStorage) — DONE (draft load/save via `JOURNAL_DRAFT_STORAGE_KEY` in `JournalInputForm`)

## Verification
- pnpm typecheck — DONE
- pnpm lint — DONE (pre-existing warnings)
- pnpm vitest run — DONE
- pnpm test:e2e — BLOCKED (Playwright browsers not installed locally)

## Notes
- Active journal flow: JournalPage -> JournalForm -> JournalInputForm (journal-v2).
- Draft shape should align with JournalRawInput-friendly fields.

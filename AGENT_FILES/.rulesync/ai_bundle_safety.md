# 🛡️ Sparkfined – AI & SDK Bundle Safety Rules

**Verhindert Bundle-Regressions, CI-Breaks & Node-SDK-Leaks im Browser-Build**
*Status: enforced in CI · gültig für alle neuen AI-, OCR- und Analyse-Module*

---

## 1. ❌ Verbotene Imports (Hard Ban)

Diese Abhängigkeiten **dürfen nicht** im Browserbundle landen:

* `openai` (Node SDK)
* `@openai/node`
* `anthropic` (Node SDK)
* `cohere`
* `tesseract.js` *(nur via dynamic import)*
* `pdfjs-dist`
* `xlsx`
* `driver.js` *(nur via dynamic import)*
* Libraries, die `fs`, `crypto`, `stream`, `http`, `https` referenzieren

**Regel:**

> Wenn ein Modul Node-APIs benötigt → es wird **niemals** direkt importiert.
> Falls Nutzung nötig → **lazy load** + separater async chunk.

---

## 2. ✅ Pflicht: AI Adapter Pattern (Edge-Safe, Minimal)

AI-Adapter werden immer als **leichte HTTP-Wrapper** implementiert — nie per SDK.

**Pattern (always allowed):**

```ts
async function callAI(request, { apiKey, baseUrl }) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });

  return await response.json();
}
```

**Vorteile:**

* kein Vendor-Bloat
* kein Node-Polyfill
* 100% Edge-kompatibel

---

## 3. ⚡ Dynamic-Import Pflicht für schwere Module

Diese Module **dürfen nur via lazy import** geladen werden:

* `tesseract.js`
* `driver.js`
* OCR-Engines
* große AI-Analyse-Module
* PDF/XLSX-Parser
* data-heavy utils

**Pattern:**

```ts
const { default: Tesseract } = await import('tesseract.js');
```

---

## 4. 🧩 Icons: Keine Barrel-Imports

❌ Verboten:

```ts
import { Shield } from "lucide-react";
```

✔ Erlaubt (tree-shaken):

```ts
import Shield from "lucide-react/dist/esm/icons/shield";
```

---

## 5. 📦 Vite Chunking Rules

Vor Merge prüfen:

* Zieht ein neues Module > 80 KB?
* Gehört es in ein eigenes async chunk?
* Gehört es in ein manuelles vendor-Chunk?

**Beispiel:**

```ts
manualChunks: {
  ai: ['@/lib/ai/heavy'],
  onboarding: ['driver.js'],
}
```

---

## 6. 🔍 CI Bundle-Size Checks (Pflicht)

Vor jedem Push:

```
pnpm build
pnpm analyze
pnpm run check:size
```

CI bricht, wenn:

* Total > **950 KB**
* irgendein vendor chunk > **Limit**
* neue große Chunks ohne Limits
* pattern errors (fehlende vendor patterns)

---

## 7. 🧪 Developer Pre-Merge Checklist

**Vor jedem PR bestätigen:**

* [ ] keine Node-SDKs importiert
* [ ] alle AI-Calls via `fetch`
* [ ] keine Barrel-Imports bei Icons
* [ ] schwere Module lazy loaded
* [ ] build & analyze grün
* [ ] bundle-size check grün
* [ ] Total Bundle < 950 KB
* [ ] vendor fallback < 120 KB

---

## 8. 📈 Wöchentliche Hardening-Routine

```
pnpm analyze
```

Prüfen:

* größte Chunks (raw + gzip)
* neue async chunks
* Tree-Shaking-Effizienz
* vendor-fallback-Auslastung

---

## 9. 📚 Hintergrund

Diese Regeln verhindern:

* ungewollte Node-SDK-Leaks → +500 KB
* polyfill injection (crypto, stream, buffer)
* vendor fallback Explosion
* CI-Breaks durch neue AI-Features
* Total-Bundle Überschreitungen

---

## 10. 🏁 Definition of Done

Ein Feature ist "bundle-safe", wenn:

* Total Bundle < **950 KB**
* alle Vendor Chunks < ihren Limits
* keine forbidden imports
* kein node-SDK im dist
* alle Checks (build / analyze / size) grün
* keine Regressionswarnungen

---

Wenn du willst, kann ich jetzt:

✅ `.rulesync/index.json` für automatische Regeln ergänzen
✅ diese Datei in PR-Template einbauen
✅ Dangerfile für Pull-Requests generieren
✅ GitHub Action für "Forbidden Imports Scan" erstellen



# API-Key Management Guide

## 🔐 Übersicht

Diese Anleitung erklärt, wie du API-Keys sicher verwaltest, damit sie:
- ✅ **NICHT** ins Git-Repository gelangen
- ✅ Lokal in der Entwicklung funktionieren
- ✅ Auf Vercel in Production verfügbar sind

---

## 📋 Schritt-für-Schritt Anleitung

### 1. Lokale Entwicklung: `.env.local` erstellen

**WICHTIG:** Die Datei `.env.local` wird NICHT ins Git committed (siehe `.gitignore`)

```bash
# Im Projekt-Root-Verzeichnis
cp .env.example .env.local
```

Öffne `.env.local` und fülle deine echten API-Keys ein:

```bash
# API Keys
MORALIS_API_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
MORALIS_BASE=https://deep-index.moralis.io/api/v2.2
DEXPAPRIKA_API_KEY=dpk_live_yyyyyyyyyyyyyyyy
DEXPAPRIKA_BASE=https://api.dexpaprika.com
OPENAI_API_KEY=sk-proj-zzzzzzzzzzzzzzzzz

# Push Notifications (Web Push VAPID)
VITE_VAPID_PUBLIC_KEY=BxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxE
VAPID_PRIVATE_KEY=zzzzzzzzzzzzzzzzzzzzzzzzzz
VAPID_CONTACT=mailto:deine-email@example.com

# Optional - KV Store (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxE

# Optional
NODE_ENV=development
```

---

### 2. Vercel Deployment: Environment Variables setzen

#### Option A: Vercel Dashboard (empfohlen)

1. Gehe zu: https://vercel.com/dein-projekt/settings/environment-variables
2. Füge jede Variable einzeln hinzu:
   - **Key:** `MORALIS_API_KEY`
   - **Value:** `sk_live_xxxxxxxxxxxxxxxxxxxx`
   - **Environments:** Wähle aus, wo die Variable verfügbar sein soll:
     - ✅ **Production** (für deine Live-App)
     - ✅ **Preview** (für PR-Previews)
     - ⚠️ **Development** (nur wenn nötig)

3. Wiederhole dies für alle Keys aus `.env.local`

#### Option B: Vercel CLI

```bash
# Einmalig installieren
npm i -g vercel

# Für jede Variable:
vercel env add MORALIS_API_KEY production
# Paste deinen Key wenn prompted
```

#### Nach dem Hinzufügen von Environment Variables

⚠️ **Wichtig:** Du musst einen neuen Deployment triggern, damit die Variablen aktiv werden:

```bash
git commit --allow-empty -m "chore: trigger redeploy for env vars"
git push
```

Oder im Vercel Dashboard: **Deployments** → **Redeploy**

---

## 🔍 Key-Typen: Öffentlich vs. Privat

### Öffentliche Keys (können im Browser sichtbar sein)

Prefix: `VITE_` - werden in den Client-Code gebundelt

```bash
VITE_VAPID_PUBLIC_KEY=BxxxxxxxxxxxxE  # ✅ OK für Browser
```

**Verwendung im Code:**
```typescript
const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
```

⚠️ **ACHTUNG:** Diese Keys sind für jeden sichtbar, der den JavaScript-Code im Browser inspiziert!

### Private Keys (nur Server-seitig)

**KEIN** `VITE_` Prefix - nur in API-Routen verfügbar

```bash
MORALIS_API_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx  # ❌ NIEMALS im Browser!
VAPID_PRIVATE_KEY=zzzzzzzzzzzzzzzzzz         # ❌ NIEMALS im Browser!
OPENAI_API_KEY=sk-proj-zzzzzzzzzzzzzzzzz     # ❌ NIEMALS im Browser!
```

**Verwendung im Code (nur in `/api/*` Dateien):**
```typescript
// In api/data/ohlc.ts oder anderen API-Routes
const apiKey = process.env.MORALIS_API_KEY || "";
```

---

## ✅ Sicherheits-Checkliste

Dein Projekt hat bereits diese Sicherheitsmaßnahmen:

- ✅ `.gitignore` enthält `.env` und `.env.*`
- ✅ Nur `.env.example` (ohne echte Keys) wird committed
- ✅ Private Keys verwenden `process.env` (nur Server-seitig)
- ✅ Public Keys haben `VITE_` Prefix (transparent)
- ✅ API-Routes sind unter `/api/*` isoliert

### Zusätzliche Best Practices

1. **Nie echte Keys in Code schreiben**
   ```typescript
   // ❌ FALSCH
   const apiKey = "sk_live_xxxxxxxxxxxxxxxxxxxx";
   
   // ✅ RICHTIG
   const apiKey = process.env.MORALIS_API_KEY || "";
   ```

2. **Keys rotieren bei Leak**
   - Wenn ein Key versehentlich committed wurde, SOFORT widerrufen
   - Neuen Key generieren und in Vercel/`.env.local` aktualisieren
   - Git-History neu schreiben ist NICHT ausreichend (bleibt in Remotes)

3. **Minimal Privileges**
   - Verwende API-Keys mit minimalen Rechten
   - Erstelle separate Keys für Dev/Staging/Production wenn möglich

4. **Monitoring**
   - Überprüfe regelmäßig die API-Nutzung auf ungewöhnliche Aktivitäten
   - Setze Rate Limits bei den API-Anbietern

---

## 🧪 API-Key Validierung

Um zu überprüfen, ob deine Keys korrekt gesetzt sind:

### Lokal (Development)

```bash
npm run dev
```

Dann öffne: http://localhost:5173/api/health

Expected Response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "keys": {
    "dexpaprika": true,
    "openai": true,
    "vapid": true,
    "vapidPrivate": true
  }
}
```

### Auf Vercel (Production)

```bash
curl https://deine-app.vercel.app/api/health
```

Oder nutze den bestehenden Health-Check-Script:
```bash
./scripts/vercel-health-check.sh
```

---

## 🔧 Troubleshooting

### Problem: "API Key not found" in Production

**Lösung:**
1. Überprüfe, ob die Variable in Vercel gesetzt ist (Dashboard → Settings → Environment Variables)
2. Stelle sicher, dass "Production" Environment ausgewählt ist
3. Triggere einen neuen Deploy (Environment Variables sind nicht sofort aktiv)

### Problem: Keys funktionieren lokal nicht

**Lösung:**
1. Überprüfe, dass `.env.local` existiert (nicht `.env`)
2. Starte den Dev-Server neu (`npm run dev`)
3. Überprüfe, dass keine Tippfehler in den Key-Namen sind

### Problem: Public Key (VITE_*) ist undefined im Browser

**Lösung:**
1. Public Keys MÜSSEN mit `VITE_` beginnen
2. Nach Änderungen Dev-Server neu starten
3. Im Code: `import.meta.env.VITE_XXX` verwenden (nicht `process.env`)

### Problem: Versehentlich Key ins Git committed

**⚠️ KRITISCH - SOFORT handeln:**

1. **Key SOFORT widerrufen** beim Provider
2. Neuen Key generieren
3. Aktualisiere `.env.local` und Vercel Environment Variables
4. Git-History neu schreiben:
   ```bash
   # Backup erstellen
   git branch backup-before-cleanup
   
   # Sensible Datei aus History entfernen
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (⚠️ koordiniere mit Team)
   git push --force --all
   ```

---

## 📚 Weitere Ressourcen

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

## 📊 Aktuelle API-Keys in diesem Projekt

| Key Name | Typ | Verwendung | Location |
|----------|-----|------------|----------|
| `MORALIS_API_KEY` | Private | Blockchain data API | `/api/data/ohlc.ts`, `/api/moralis/*` |
| `DEXPAPRIKA_API_KEY` | Private | DEX aggregator API | `/api/data/ohlc.ts`, `/api/dexpaprika/*` |
| `OPENAI_API_KEY` | Private | AI assistance | `/api/ai/assist.ts` |
| `VITE_VAPID_PUBLIC_KEY` | Public | Push notifications (client) | Frontend components |
| `VAPID_PRIVATE_KEY` | Private | Push notifications (server) | `/api/push/*` |
| `VAPID_CONTACT` | Config | Contact email for VAPID | `/api/push/*` |
| `UPSTASH_REDIS_REST_URL` | Private | KV store endpoint | `/src/lib/kv.ts` |
| `UPSTASH_REDIS_REST_TOKEN` | Private | KV store auth | `/src/lib/kv.ts` |

---

**💡 Tipp:** Wenn du neue API-Keys hinzufügst, aktualisiere immer `.env.example` (ohne echte Werte) als Dokumentation für andere Entwickler!

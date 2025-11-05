#!/bin/bash

echo "🔍 Vercel Deployment Diagnose"
echo "=============================="
echo ""

# 1. Node Version Check
echo "1. Node Version:"
node --version
echo "   ✅ Erfordert: >=20.10.0"
echo ""

# 2. Build Test
echo "2. Build Test:"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Build erfolgreich"
else
    echo "   ❌ Build fehlgeschlagen"
    npm run build
    exit 1
fi
echo ""

# 3. Dist Folder Check
echo "3. Output Directory:"
if [ -d "dist" ]; then
    echo "   ✅ dist/ existiert"
    echo "   📦 Größe: $(du -sh dist | cut -f1)"
    echo "   📄 Dateien: $(find dist -type f | wc -l)"
else
    echo "   ❌ dist/ nicht gefunden"
    exit 1
fi
echo ""

# 4. Critical Files Check
echo "4. Kritische Dateien:"
files=("dist/index.html" "dist/sw.js" "dist/manifest.webmanifest")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file fehlt"
    fi
done
echo ""

# 5. Environment Variables (Template)
echo "5. Benötigte Environment Variables:"
echo "   ⚠️  MORALIS_API_KEY (nicht gesetzt)"
echo "   ⚠️  DEXPAPRIKA_API_KEY (nicht gesetzt)"
echo "   ⚠️  OPENAI_API_KEY (nicht gesetzt)"
echo "   ⚠️  VITE_VAPID_PUBLIC_KEY (nicht gesetzt)"
echo "   ⚠️  VAPID_PRIVATE_KEY (nicht gesetzt)"
echo ""
echo "   👉 Setze diese in Vercel Dashboard → Environment Variables"
echo ""

# 6. Package.json Check
echo "6. Package.json:"
if grep -q '"build": "tsc -b tsconfig.build.json && vite build"' package.json; then
    echo "   ✅ Build-Script korrekt"
else
    echo "   ⚠️  Build-Script prüfen"
fi
echo ""

# 7. Vercel Config Check
echo "7. Vercel Config:"
if [ -f "vercel.json" ]; then
    echo "   ✅ vercel.json vorhanden"
    echo "   📋 Build Command: $(jq -r '.buildCommand // "npm run build"' vercel.json 2>/dev/null || echo 'npm run build (default)')"
    echo "   📂 Output Dir: $(jq -r '.outputDirectory // "dist"' vercel.json 2>/dev/null || echo 'dist (default)')"
else
    echo "   ⚠️  vercel.json nicht gefunden (verwendet Defaults)"
fi
echo ""

echo "=============================="
echo "✅ Lokaler Build ist bereit!"
echo ""
echo "Nächste Schritte:"
echo "1. Setze Environment Variables in Vercel Dashboard"
echo "2. Prüfe Node.js Version in Vercel (sollte 20.x sein)"
echo "3. Deploye erneut: git push oder vercel --prod"
echo ""

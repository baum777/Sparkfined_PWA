## Merge proposal for vercel.json
Source: C:\workspace\Sparkfined_PWA\patches\002_vercel_rewrites.patch

+{
+  "version": 2,
+  "rewrites": [
+    // Ensure static assets are served directly and not rewritten to auth handlers
+    { "source": "/manifest.webmanifest", "destination": "/manifest.webmanifest" },
+    { "source": "/favicon.ico", "destination": "/favicon.ico" },
+    { "source": "/robots.txt", "destination": "/robots.txt" },
+    { "source": "/sitemap.xml", "destination": "/sitemap.xml" },
+    { "source": "/_next/static/:path*", "destination": "/_next/static/:path*" }
+  ]
+}
*** End Patch


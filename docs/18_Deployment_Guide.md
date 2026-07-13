# Credit Book — Deployment Guide
**Version:** 1.0.0 | **Date:** 2026-07-13

---

## 1. Infrastructure Overview

| Service | Platform | URL | Tier |
|---------|---------|-----|------|
| Frontend (Web) | Vercel | creditbook.vercel.app | Free |
| Backend API | Render | creditbook-api.onrender.com | Free |
| Database | Render PostgreSQL | (internal) | Free |
| Cache | Render Redis | (internal) | Free (90 days) |
| Backup Storage | Backblaze B2 | (cloud storage) | Free |
| Push Notifications | Firebase FCM | (cloud service) | Free |
| Uptime Monitor | UptimeRobot | (monitoring) | Free |

---

## 2. Backend Deployment (Render)

### 2.1 Initial Setup

1. Go to render.com → Sign up with GitHub
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Name:** creditbook-api
   - **Root Directory:** apps/api
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/server.js`
   - **Instance Type:** Free

### 2.2 Environment Variables on Render

Add these in Render Dashboard → Environment:
```
DATABASE_URL          = <from Render PostgreSQL>
REDIS_URL             = <from Render Redis>
JWT_ACCESS_SECRET     = <64-char random>
JWT_REFRESH_SECRET    = <64-char random>
FIREBASE_PROJECT_ID   = <from Firebase>
FIREBASE_PRIVATE_KEY  = <from Firebase service account JSON>
FIREBASE_CLIENT_EMAIL = <from Firebase service account JSON>
B2_KEY_ID             = <from Backblaze>
B2_APPLICATION_KEY    = <from Backblaze>
B2_BUCKET_ID          = <from Backblaze>
NODE_ENV              = production
PORT                  = 10000
ADMIN_PHONE           = +91XXXXXXXXXX
```

### 2.3 Database Setup on Render

1. Render Dashboard → New → PostgreSQL
2. Note the connection string
3. Add to `DATABASE_URL` in API environment
4. After API deploys, run migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### 2.4 render.yaml (Infrastructure as Code)

```yaml
services:
  - type: web
    name: creditbook-api
    env: node
    rootDir: apps/api
    buildCommand: npm install && npm run build
    startCommand: node dist/server.js
    plan: free
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: creditbook-db
          property: connectionString

databases:
  - name: creditbook-db
    plan: free
```

---

## 3. Frontend Deployment (Vercel)

### 3.1 Initial Setup

1. Go to vercel.com → Sign up with GitHub
2. New Project → Import from GitHub
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** apps/web
   - **Build Command:** `npm run build`
   - **Output Directory:** dist

### 3.2 Environment Variables on Vercel

```
VITE_API_URL=https://creditbook-api.onrender.com/api/v1
VITE_WS_URL=wss://creditbook-api.onrender.com
VITE_APP_NAME=Credit Book
VITE_FIREBASE_API_KEY=<from Firebase>
VITE_FIREBASE_MESSAGING_SENDER_ID=<from Firebase>
VITE_FIREBASE_APP_ID=<from Firebase>
```

### 3.3 vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/fonts/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

---

## 4. Android APK Build

### 4.1 Prerequisites

- Flutter SDK installed
- Java 17+ installed
- Keystore file created (for release signing)

### 4.2 Create Keystore

```bash
keytool -genkey -v -keystore creditbook-release.jks \
  -alias creditbook \
  -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANT:** Store `creditbook-release.jks` and the passwords securely offline. Do NOT commit to git.

### 4.3 Configure Signing (android/key.properties)

```properties
storePassword=<your_store_password>
keyPassword=<your_key_password>
keyAlias=creditbook
storeFile=../creditbook-release.jks
```

### 4.4 Build Release APK

```bash
cd apps/mobile
flutter build apk --release --split-per-abi
```

Output: `build/app/outputs/flutter-apk/app-arm64-v8a-release.apk`

### 4.5 Upload APK for Distribution

Upload to GitHub Releases or Backblaze B2:
```bash
# GitHub CLI
gh release create v1.0.0 \
  build/app/outputs/flutter-apk/app-arm64-v8a-release.apk \
  --title "Credit Book v1.0.0" \
  --notes "Initial release"
```

---

## 5. iOS Build (TestFlight)

### 5.1 Prerequisites

- macOS with Xcode installed
- Apple Developer account (99$/year) OR use AltStore (free)
- iOS device registered (for personal testing)

### 5.2 Build IPA

```bash
cd apps/mobile
flutter build ipa --release
```

### 5.3 Upload to TestFlight

```bash
# Using Fastlane (free)
fastlane pilot upload --ipa build/ios/ipa/creditbook.ipa
```

### 5.4 Alternative: AltStore (Free, No Dev Account)

1. Install AltServer on Windows/Mac
2. Connect iOS device via USB
3. Install AltStore on device
4. Sideload IPA via AltStore (refreshes every 7 days automatically)

---

## 6. UptimeRobot Setup (Keep-Alive)

1. Go to uptimerobot.com → Sign up (free)
2. New Monitor → HTTP(s)
3. URL: `https://creditbook-api.onrender.com/health`
4. Check interval: 5 minutes
5. Alert contacts: admin email

This keeps the Render free tier from sleeping and alerts you on downtime.

---

## 7. Post-Deployment Checklist

- [ ] Frontend accessible at Vercel URL
- [ ] API returns 200 at /health endpoint
- [ ] Admin user can log in
- [ ] Family member can register (test with temp account)
- [ ] Admin can activate family member
- [ ] Family member can log in after activation
- [ ] Create a test person and transaction
- [ ] Real-time update works (open 2 browser tabs)
- [ ] Push notification received on mobile
- [ ] PDF report generates successfully
- [ ] Backup job runs (check next morning)
- [ ] UptimeRobot shows "Up" status

---

*Credit Book Deployment Guide — v1.0.0*

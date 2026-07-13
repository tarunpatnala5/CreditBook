# Credit Book — Update System
**Version:** 1.0.0  
**Date:** 2026-07-13

---

## 1. Overview

Credit Book has a built-in update system that allows the admin to push new app versions to all family members without requiring any app store. Updates are distributed via:

- **Android:** Direct APK download from a hosted URL (GitHub Releases, Cloudinary, or Backblaze)
- **iOS:** TestFlight link or AltStore update
- **Web:** Automatic deployment via Vercel (web updates are instant)

---

## 2. Update Flow

```
Admin pushes code to GitHub main branch
         ↓
GitHub Actions CI/CD pipeline runs
         ↓
   ┌─────────────────┐
   │  Flutter build   │
   │  android APK    │ → Upload APK to Backblaze/GitHub Releases
   │  iOS IPA        │ → Upload to TestFlight (via Fastlane)
   │  Web build      │ → Deploy to Vercel (auto)
   └─────────────────┘
         ↓
Admin creates version entry in Admin Panel
  (version number, release notes, APK URL, size)
         ↓
Admin publishes version
         ↓
All users receive push notification + in-app notification
         ↓
User taps Update in Settings
         ↓
   ┌─────────┬──────────────┐
   ▼         ▼              ▼
Android     iOS            Web
Download   Open            Prompt to
APK →      TestFlight      refresh
Install    link            page
```

---

## 3. Admin: Publishing Updates

### 3.1 Creating a New Version

**In Admin Panel → Updates:**

1. Tap **"+"** to create new version
2. Fill in:
   - **Platform:** Android / iOS / Web
   - **Version Number:** e.g., `1.2.0`
   - **Release Notes:** Bullet points of changes
   - **Download URL:** APK URL (Android) / TestFlight URL (iOS)
   - **File Size:** In bytes (auto-calculated if file uploaded)
   - **Force Update:** Yes/No — if Yes, user cannot dismiss the update dialog
3. Tap **"Save as Draft"**
4. Review the entry
5. Tap **"Publish"** → All users notified

### 3.2 API Endpoints

```
POST /updates/versions        — Create version
GET  /updates/versions        — List all versions
PATCH /updates/versions/:id   — Update version details
POST /updates/versions/:id/publish  — Publish (notify users)
DELETE /updates/versions/:id  — Delete unpublished version
```

---

## 4. User Experience

### 4.1 Settings → Updates Screen

```
┌─────────────────────────────────────────┐
│ ← Updates                               │
├─────────────────────────────────────────┤
│                                          │
│  Current Version                         │
│  ┌────────────────────────────────────┐  │
│  │  Credit Book  v1.0.0              │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Available Update                        │
│  ┌────────────────────────────────────┐  │
│  │  Credit Book  v1.2.0          ↓   │  │
│  │                                    │  │
│  │  What's New:                       │  │
│  │  • Interest calculation improved   │  │
│  │  • New analytics dashboard         │  │
│  │  • Bug fixes                       │  │
│  │                                    │  │
│  │  Size: 23.4 MB                     │  │
│  │  Released: 10 Jul 2026            │  │
│  │                                    │  │
│  │      [Download & Install]          │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 4.2 Settings Gear Badge

The gear icon in the pill navigation shows a badge (red number) when:
- An update is available

### 4.3 Update Notification

When admin publishes a new version:
```
Title: "Credit Book v1.2 Available"
Body:  "New features and improvements. 23.4MB. Tap to update."
```

---

## 5. Android APK Auto-Install

### 5.1 Download and Install Flow

```dart
// Flutter: download APK and trigger install
import 'package:http/http.dart' as http;
import 'package:open_filex/open_filex.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:path_provider/path_provider.dart';

class UpdateService {
  static Future<void> downloadAndInstall(String downloadUrl, String version) async {
    // 1. Request install packages permission (Android)
    if (!await Permission.requestInstallPackages.isGranted) {
      await Permission.requestInstallPackages.request();
    }
    
    // 2. Show download progress
    final response = await http.get(Uri.parse(downloadUrl));
    
    // 3. Save APK to downloads directory
    final dir = await getExternalStorageDirectory();
    final file = File('${dir!.path}/creditbook-$version.apk');
    await file.writeAsBytes(response.bodyBytes);
    
    // 4. Trigger installation
    await OpenFilex.open(file.path);
  }
}
```

### 5.2 Required Permissions (AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

<!-- For Android 7.0+ FileProvider -->
<provider
    android:name="androidx.core.content.FileProvider"
    android:authorities="${applicationId}.fileprovider"
    android:exported="false"
    android:grantUriPermissions="true">
  <meta-data
      android:name="android.support.FILE_PROVIDER_PATHS"
      android:resource="@xml/file_paths" />
</provider>
```

---

## 6. iOS Update Flow

iOS does not allow APK-style sideloading without a developer account. Options:

### Option A: TestFlight (Recommended)
1. Admin submits new build to TestFlight via Fastlane
2. Update button in app opens TestFlight link
3. User updates through TestFlight

### Option B: AltStore / Sideloadly
1. APK equivalent (IPA) distributed via link
2. User installs via AltStore
3. Update button opens install page

### 6.1 Update Check (iOS)

```dart
// Check if iOS update available
Future<void> checkForUpdate() async {
  final response = await ApiClient.get(
    '/updates/check',
    queryParams: {
      'platform': Platform.isAndroid ? 'android' : 'ios',
      'currentVersion': PackageInfo.fromPlatform().version,
    }
  );
  
  if (response.data['hasUpdate']) {
    // Show update UI
    updateState.setAvailableUpdate(response.data);
  }
}
```

---

## 7. Web Auto-Update

The web app updates automatically via Vercel deployment. When admin pushes to `main`:

1. Vercel detects push → builds automatically
2. New version deployed to production URL
3. Service Worker detects new content → prompts user to refresh

```javascript
// Service Worker update detection
self.addEventListener('controllerchange', () => {
  // Show "Update available - Refresh to get new version" banner
  window.dispatchEvent(new CustomEvent('sw-update-available'));
});
```

---

## 8. Version Format

```
MAJOR.MINOR.PATCH

Examples:
1.0.0  — Initial release
1.0.1  — Bug fix
1.1.0  — New feature
2.0.0  — Major redesign / breaking change
```

**Build Numbers:**
- Android: versionCode = MAJOR*10000 + MINOR*100 + PATCH (e.g., 10000)
- iOS: CFBundleShortVersionString = "1.0.0", CFBundleVersion = build number

---

## 9. Rollback Strategy

If a published update causes issues:

1. Admin logs into Admin Panel → Updates
2. Finds previous version entry
3. Republishes previous version (or creates identical new entry)
4. Users receive notification to roll back
5. Manual: user taps update, downloads previous APK

---

## 10. Hosting the APK

Free options for hosting the APK file:

| Option | Free Storage | Free Bandwidth | Notes |
|--------|-------------|----------------|-------|
| GitHub Releases | 2GB/file | Generous | Best option for private repos |
| Backblaze B2 | 10GB | 1GB/day | Used for backups too |
| Cloudinary | 25GB | 25GB/month | Easy to integrate |
| Google Drive | 15GB | Limited | Less developer-friendly |

**Recommended:** GitHub Releases (private repo, direct download link)

---

*Credit Book Update System — v1.0.0*

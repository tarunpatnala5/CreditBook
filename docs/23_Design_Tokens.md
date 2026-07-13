# Credit Book — Design Tokens
**Version:** 1.0.0 | **Date:** 2026-07-13  
**Source:** Apple Human Interface Guidelines + iOS 26 design language

---

## 1. Complete Token Reference

All tokens are defined as CSS custom properties in `src/styles/tokens.css`.  
Dart equivalents are in `lib/core/constants/`.

---

## Colors

*(See full color definitions in 03_Apple_Design_System.md — Section 3)*

**Quick Reference (Light Mode):**

| Token | Value | Use |
|-------|-------|-----|
| `--color-blue` | `hsl(214, 100%, 50%)` | Primary actions, links |
| `--color-green` | `hsl(141, 71%, 38%)` | Positive, money you'll receive |
| `--color-red` | `hsl(0, 100%, 42%)` | Destructive, money you owe |
| `--color-orange` | `hsl(28, 100%, 50%)` | Warnings |
| `--bg-primary` | `hsl(0, 0%, 97%)` | Screen backgrounds |
| `--bg-secondary` | `hsl(0, 0%, 100%)` | Card surfaces |
| `--label-primary` | `hsl(0, 0%, 0%)` | Primary text |
| `--label-secondary` | `hsla(0, 0%, 24%, 0.60)` | Secondary text |
| `--separator` | `hsla(0, 0%, 24%, 0.29)` | Divider lines |
| `--app-positive` | `hsl(141, 71%, 38%)` | "You Give" (green) |
| `--app-negative` | `hsl(0, 100%, 42%)` | "You Get" (red) |
| `--app-accent` | `hsl(214, 100%, 50%)` | Primary app tint |

---

## Typography

| Token | Size | Weight | Line Height |
|-------|------|--------|-------------|
| `--text-large-title` | 34px | 700 | 41px |
| `--text-title-1` | 28px | 400 | 34px |
| `--text-title-2` | 22px | 400 | 28px |
| `--text-title-3` | 20px | 400 | 25px |
| `--text-headline` | 17px | 600 | 22px |
| `--text-body` | 17px | 400 | 22px |
| `--text-callout` | 16px | 400 | 21px |
| `--text-subheadline` | 15px | 400 | 20px |
| `--text-footnote` | 13px | 400 | 18px |
| `--text-caption-1` | 12px | 400 | 16px |
| `--text-caption-2` | 11px | 400 | 13px |
| `--text-amount-lg` | 40px | 700 | 48px |
| `--text-amount-md` | 28px | 600 | 34px |

---

## Spacing (8pt Grid)

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 4px | Micro gaps |
| `--space-2` | 8px | Small gaps |
| `--space-3` | 12px | Medium-small |
| `--space-4` | 16px | Standard (content padding) |
| `--space-5` | 20px | Section spacing |
| `--space-6` | 24px | Card padding |
| `--space-8` | 32px | Large section break |
| `--space-10` | 40px | Extra large |
| `--space-12` | 48px | Huge |
| `--space-16` | 64px | Hero spacing |

---

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-xs` | 4px | Tiny inline tags |
| `--radius-sm` | 8px | Small elements |
| `--radius-md` | 12px | Standard cards |
| `--radius-lg` | 16px | Large cards |
| `--radius-xl` | 20px | Extra large cards |
| `--radius-2xl` | 24px | Modals |
| `--radius-pill` | 9999px | Pill buttons, badges |
| `--radius-full` | 50% | Avatars |
| `--radius-card` | 13px | iOS-style card |
| `--radius-sheet` | 20px | Bottom sheet top corners |
| `--radius-dialog` | 14px | Alert dialog |

---

## Shadows

| Token | Value | Use |
|-------|-------|-----|
| `--shadow-xs` | `0 1px 3px hsla(0,0%,0%,0.10)` | Subtle lift |
| `--shadow-sm` | `0 2px 8px hsla(0,0%,0%,0.12)` | Cards |
| `--shadow-md` | `0 4px 16px hsla(0,0%,0%,0.15)` | Modals |
| `--shadow-lg` | `0 8px 32px hsla(0,0%,0%,0.18)` | Sheets |
| `--shadow-xl` | `0 16px 48px hsla(0,0%,0%,0.20)` | Large modals |
| `--shadow-pill` | `0 8px 40px hsla(0,0%,0%,0.25), 0 2px 8px hsla(0,0%,0%,0.15)` | Pill nav |

---

## Animation Durations

| Token | Value | Use |
|-------|-------|-----|
| `--duration-instant` | 120ms | Button press |
| `--duration-fast` | 200ms | Toggle, badge |
| `--duration-normal` | 300ms | Alert, navigation |
| `--duration-slow` | 450ms | Sheet present |
| `--duration-search` | 400ms | Search expand |

## Animation Curves

| Token | Value | Use |
|-------|-------|-----|
| `--ease-standard` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | General |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Spring effects |
| `--ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering |
| `--ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving |

---

## Flutter Dart Token Reference

```dart
// lib/core/constants/app_colors.dart
class AppColors {
  // Light mode
  static const Color blue = Color(0xFF007AFF);
  static const Color green = Color(0xFF34C759);
  static const Color red = Color(0xFFFF3B30);
  static const Color orange = Color(0xFFFF9500);
  static const Color backgroundPrimary = Color(0xFFF5F5F7);
  static const Color backgroundSecondary = Color(0xFFFFFFFF);
  static const Color labelPrimary = Color(0xFF000000);
  static const Color labelSecondary = Color(0x99000000);
  static const Color separator = Color(0x4A3C3C43);
  static const Color appPositive = Color(0xFF34C759);
  static const Color appNegative = Color(0xFFFF3B30);
  static const Color appAccent = Color(0xFF007AFF);
  
  // Dark mode
  static const Color backgroundPrimaryDark = Color(0xFF000000);
  static const Color backgroundSecondaryDark = Color(0xFF1C1C1E);
  static const Color labelPrimaryDark = Color(0xFFFFFFFF);
  static const Color blueDark = Color(0xFF0A84FF);
  static const Color greenDark = Color(0xFF30D158);
  static const Color redDark = Color(0xFFFF453A);
}

// lib/core/constants/app_spacing.dart
class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double base = 16;
  static const double lg = 20;
  static const double xl = 24;
  static const double xxl = 32;
  static const double xxxl = 40;
}

// lib/core/constants/app_radius.dart
class AppRadius {
  static const double card = 13;
  static const double sheet = 20;
  static const double dialog = 14;
  static const double pill = 9999;
  static const double avatar = 9999;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
}
```

---

*Credit Book Design Tokens — v1.0.0*

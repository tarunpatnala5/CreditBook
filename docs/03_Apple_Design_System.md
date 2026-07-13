# Credit Book — Apple Design System
**Version:** 1.0.0  
**Date:** 2026-07-13  
**Reference:** Apple Human Interface Guidelines (HIG) + iOS 26 design language

---

## 1. Design Philosophy

Credit Book's design is built entirely on Apple's Human Interface Guidelines. Every decision — from spacing to animation timing to typography — mirrors the quality and intentionality of Apple's own applications.

**Core Principles:**
1. **Clarity** — Text is legible, icons are precise, actions are understood at a glance
2. **Deference** — UI defers to content; chrome is minimal
3. **Depth** — Layers, blur, and shadow communicate hierarchy
4. **Consistency** — Every screen follows the same rules

---

## 2. Typography — SF Pro

Credit Book uses **SF Pro** exclusively.

### Font Families Available

| Family | Use Case |
|--------|----------|
| SF Pro Display | Headings, Large Title, Title 1, Title 2 |
| SF Pro Text | Body, Callout, Footnote, Caption |
| SF Pro Rounded | Pill labels, badges, avatars, count indicators |

### Type Scale

| Style | Font | Weight | Size | Line Height | Letter Spacing |
|-------|------|--------|------|-------------|----------------|
| Large Title | SF Pro Display | Bold | 34px | 41px | +0.37px |
| Title 1 | SF Pro Display | Regular | 28px | 34px | +0.36px |
| Title 2 | SF Pro Display | Regular | 22px | 28px | +0.35px |
| Title 3 | SF Pro Display | Regular | 20px | 25px | +0.38px |
| Headline | SF Pro Text | Semibold | 17px | 22px | -0.41px |
| Body | SF Pro Text | Regular | 17px | 22px | -0.41px |
| Callout | SF Pro Text | Regular | 16px | 21px | -0.32px |
| Subheadline | SF Pro Text | Regular | 15px | 20px | -0.24px |
| Footnote | SF Pro Text | Regular | 13px | 18px | -0.08px |
| Caption 1 | SF Pro Text | Regular | 12px | 16px | 0 |
| Caption 2 | SF Pro Text | Regular | 11px | 13px | +0.07px |
| Large Amount | SF Pro Display | Bold | 40px | 48px | -0.5px |
| Medium Amount | SF Pro Display | Semibold | 28px | 34px | -0.3px |

### CSS Implementation

```css
@font-face {
  font-family: 'SF Pro Display';
  src: url('/fonts/SF-Pro-Display-Regular.otf') format('opentype');
  font-weight: 400;
}
@font-face {
  font-family: 'SF Pro Display';
  src: url('/fonts/SF-Pro-Display-Medium.otf') format('opentype');
  font-weight: 500;
}
@font-face {
  font-family: 'SF Pro Display';
  src: url('/fonts/SF-Pro-Display-Semibold.otf') format('opentype');
  font-weight: 600;
}
@font-face {
  font-family: 'SF Pro Display';
  src: url('/fonts/SF-Pro-Display-Bold.otf') format('opentype');
  font-weight: 700;
}
@font-face {
  font-family: 'SF Pro Text';
  src: url('/fonts/SF-Pro-Text-Regular.otf') format('opentype');
  font-weight: 400;
}
@font-face {
  font-family: 'SF Pro Text';
  src: url('/fonts/SF-Pro-Text-Medium.otf') format('opentype');
  font-weight: 500;
}
@font-face {
  font-family: 'SF Pro Text';
  src: url('/fonts/SF-Pro-Text-Semibold.otf') format('opentype');
  font-weight: 600;
}
@font-face {
  font-family: 'SF Pro Rounded';
  src: url('/fonts/SF-Pro-Rounded-Regular.otf') format('opentype');
  font-weight: 400;
}
@font-face {
  font-family: 'SF Pro Rounded';
  src: url('/fonts/SF-Pro-Rounded-Semibold.otf') format('opentype');
  font-weight: 600;
}
```

---

## 3. Color System

### Semantic Color Tokens

All colors are defined as CSS custom properties. Never use hardcoded hex values.

#### Light Mode

```css
:root {
  /* System Colors */
  --color-blue: hsl(214, 100%, 50%);           /* #007AFF */
  --color-green: hsl(141, 71%, 38%);           /* #34C759 */
  --color-red: hsl(0, 100%, 42%);              /* #FF3B30 */
  --color-orange: hsl(28, 100%, 50%);          /* #FF9500 */
  --color-yellow: hsl(48, 100%, 50%);          /* #FFCC00 */
  --color-teal: hsl(186, 100%, 38%);           /* #5AC8FA */
  --color-indigo: hsl(239, 100%, 40%);         /* #5856D6 */
  --color-purple: hsl(280, 60%, 50%);          /* #AF52DE */
  --color-pink: hsl(349, 100%, 58%);           /* #FF2D55 */

  /* Background Colors */
  --bg-primary: hsl(0, 0%, 97%);              /* #F5F5F7 — Apple's off-white */
  --bg-secondary: hsl(0, 0%, 100%);           /* #FFFFFF — Card surfaces */
  --bg-tertiary: hsl(240, 6%, 94%);           /* #EFEFF4 — Grouped lists */
  --bg-grouped: hsl(240, 6%, 94%);            /* Inset grouped table background */
  --bg-elevated: hsl(0, 0%, 100%);            /* Elevated cards */

  /* Fill Colors */
  --fill-primary: hsla(0, 0%, 47%, 0.20);     /* Thick fills */
  --fill-secondary: hsla(0, 0%, 47%, 0.16);
  --fill-tertiary: hsla(0, 0%, 47%, 0.12);
  --fill-quaternary: hsla(0, 0%, 47%, 0.08);

  /* Label Colors */
  --label-primary: hsl(0, 0%, 0%);            /* #000000 */
  --label-secondary: hsla(0, 0%, 24%, 0.60);  /* 60% black */
  --label-tertiary: hsla(0, 0%, 24%, 0.30);   /* 30% black */
  --label-quaternary: hsla(0, 0%, 24%, 0.18); /* 18% black */

  /* Separator */
  --separator: hsla(0, 0%, 24%, 0.29);
  --separator-opaque: hsl(240, 6%, 83%);

  /* Credit Book App Colors */
  --app-positive: hsl(141, 71%, 38%);         /* Money you'll receive — green */
  --app-negative: hsl(0, 100%, 42%);          /* Money you owe — red */
  --app-accent: hsl(214, 100%, 50%);          /* Primary actions — blue */
  --app-tint: hsl(214, 100%, 50%);            /* Tint color = blue */
  
  /* Navigation */
  --nav-background: hsla(0, 0%, 97%, 0.85);   /* Translucent nav background */
  --nav-blur: blur(20px) saturate(180%);
  --tab-bar-background: hsla(0, 0%, 100%, 0.75);
  --pill-background: hsla(0, 0%, 97%, 0.72);
  --pill-blur: blur(40px) saturate(180%);
  
  /* Shadows */
  --shadow-xs: 0 1px 3px hsla(0, 0%, 0%, 0.10);
  --shadow-sm: 0 2px 8px hsla(0, 0%, 0%, 0.12);
  --shadow-md: 0 4px 16px hsla(0, 0%, 0%, 0.15);
  --shadow-lg: 0 8px 32px hsla(0, 0%, 0%, 0.18);
  --shadow-xl: 0 16px 48px hsla(0, 0%, 0%, 0.20);
  --shadow-pill: 0 8px 40px hsla(0, 0%, 0%, 0.25), 0 2px 8px hsla(0, 0%, 0%, 0.15);
}
```

#### Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Background Colors */
    --bg-primary: hsl(0, 0%, 0%);             /* #000000 — Pure black (OLED) */
    --bg-secondary: hsl(240, 5%, 11%);        /* #1C1C1E — Cards */
    --bg-tertiary: hsl(240, 4%, 16%);         /* #2C2C2E — Grouped */
    --bg-grouped: hsl(0, 0%, 0%);             /* Grouped background */
    --bg-elevated: hsl(240, 4%, 20%);         /* #3A3A3C */

    /* Fill Colors */
    --fill-primary: hsla(0, 0%, 92%, 0.20);
    --fill-secondary: hsla(0, 0%, 92%, 0.16);
    --fill-tertiary: hsla(0, 0%, 92%, 0.12);
    --fill-quaternary: hsla(0, 0%, 92%, 0.08);

    /* Label Colors */
    --label-primary: hsl(0, 0%, 100%);        /* #FFFFFF */
    --label-secondary: hsla(0, 0%, 100%, 0.60);
    --label-tertiary: hsla(0, 0%, 100%, 0.30);
    --label-quaternary: hsla(0, 0%, 100%, 0.18);

    /* Separator */
    --separator: hsla(0, 0%, 100%, 0.15);
    --separator-opaque: hsl(240, 4%, 24%);

    /* Navigation */
    --nav-background: hsla(0, 0%, 0%, 0.85);
    --tab-bar-background: hsla(0, 0%, 10%, 0.75);
    --pill-background: hsla(240, 5%, 11%, 0.78);

    /* Shadows (stronger in dark mode) */
    --shadow-xs: 0 1px 3px hsla(0, 0%, 0%, 0.30);
    --shadow-sm: 0 2px 8px hsla(0, 0%, 0%, 0.40);
    --shadow-md: 0 4px 16px hsla(0, 0%, 0%, 0.50);
    --shadow-lg: 0 8px 32px hsla(0, 0%, 0%, 0.55);
    --shadow-xl: 0 16px 48px hsla(0, 0%, 0%, 0.60);
    --shadow-pill: 0 8px 40px hsla(0, 0%, 0%, 0.60), 0 2px 8px hsla(0, 0%, 0%, 0.40);

    /* System colors adjust slightly in dark mode */
    --color-blue: hsl(214, 100%, 60%);        /* #0A84FF */
    --color-green: hsl(141, 66%, 51%);        /* #30D158 */
    --color-red: hsl(0, 100%, 57%);           /* #FF453A */
  }
}
```

---

## 4. Spacing System

All spacing follows an 8-point grid, with 4pt used for micro-spacing.

```css
:root {
  --space-1: 4px;    /* Micro: icon padding, tight gaps */
  --space-2: 8px;    /* Small: between related elements */
  --space-3: 12px;   /* Medium-small */
  --space-4: 16px;   /* Standard: content padding, row padding */
  --space-5: 20px;   /* Medium: section spacing */
  --space-6: 24px;   /* Large: card padding */
  --space-7: 28px;   /* Extra: section gaps */
  --space-8: 32px;   /* 2× standard */
  --space-10: 40px;  /* Large section breaks */
  --space-12: 48px;  /* Extra large */
  --space-16: 64px;  /* Huge: hero sections */
  --space-20: 80px;  /* XXL: major section separators */

  /* Screen margins */
  --margin-horizontal: 16px;        /* Standard screen edge margin */
  --margin-horizontal-lg: 20px;     /* Large screen edge margin */
  --content-max-width: 428px;       /* Max width for mobile-width content */
  --section-header-top: 28px;       /* Space above section headers */
}
```

---

## 5. Corner Radius

```css
:root {
  --radius-xs: 4px;    /* Tiny (inline tags) */
  --radius-sm: 8px;    /* Small cards, buttons */
  --radius-md: 12px;   /* Standard cards, cells */
  --radius-lg: 16px;   /* Large cards, sheets */
  --radius-xl: 20px;   /* Extra large cards */
  --radius-2xl: 24px;  /* Modal sheets, popovers */
  --radius-3xl: 32px;  /* Large modals */
  --radius-pill: 9999px; /* Pill-shaped buttons */
  --radius-full: 50%;  /* Perfect circles (avatars) */

  /* iOS-specific */
  --radius-icon: 13.5px;  /* App icon corner radius */
  --radius-card: 13px;    /* Typical iOS card */
  --radius-sheet: 20px;   /* Bottom sheet top corners */
  --radius-dialog: 14px;  /* Alert dialog */
}
```

---

## 6. Component Patterns

### 6.1 Navigation Bar (Top)

```
┌─────────────────────────────────────────┐
│ ◉ Credit Book              🔍  ➕        │  ← Navigation bar
│─────────────────────────────────────────│
│                                          │
│  Large Title (34px, Bold, SF Pro Display) │
│  "My Entries"                            │
└─────────────────────────────────────────┘
```

- Background: translucent (`--nav-background`) + blur
- Height: 44pt (navigation bar) + 52pt (large title area)
- Buttons: 44×44pt minimum touch target

### 6.2 Apple Pill Bottom Navigation

```
     ╭──────────────────────────────────────╮
     │  ⬆   ⬇   🔔₂   ⚙₁                   │
     ╰──────────────────────────────────────╯
              ▲ Floating pill
```

- Width: fits content, minimum 280px, maximum screen width - 40px
- Height: 56px
- Corner radius: `--radius-pill`
- Background: `--pill-background` + `--pill-blur`
- Border: 0.5px solid `var(--separator)`
- Shadow: `--shadow-pill`
- Position: fixed, bottom 24px, centered horizontally
- Active icon: filled, tinted with `--app-accent`
- Inactive icon: stroked, `--label-secondary`
- Badge: 8px red circle (count ≤ 9), or "9+" for larger counts

### 6.3 Cards

#### Summary Card (You Give / You Get)

```css
.summary-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 0.5px solid var(--separator);
}
```

#### Transaction Row Card

```css
.transaction-row {
  background: var(--bg-secondary);
  border-radius: var(--radius-card);
  padding: var(--space-4) var(--space-4) var(--space-4) var(--space-5);
  margin-bottom: 1px; /* Hairline separator effect */
}
```

### 6.4 Lists (Apple Inset Grouped Style)

```
  Section Header (uppercase, small, secondary color)
  ┌─────────────────────────────────────────────┐
  │  Label                          Value   ›   │
  │─────────────────────────────────────────── │
  │  Label                          Value   ›   │
  │─────────────────────────────────────────── │
  │  Label                       [Toggle]       │
  └─────────────────────────────────────────────┘
  Section Footer (small, secondary)
```

```css
.settings-group {
  background: var(--bg-secondary);
  border-radius: var(--radius-card);
  margin: 0 var(--margin-horizontal);
  overflow: hidden;
}

.settings-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  min-height: 44px;
  border-bottom: 0.5px solid var(--separator);
}

.settings-row:last-child {
  border-bottom: none;
}

.settings-row-chevron::after {
  content: '›';
  color: var(--label-tertiary);
  font-size: 18px;
  margin-left: auto;
}
```

### 6.5 Buttons

#### Primary Action Button (Full Width)

```css
.btn-primary {
  background: var(--app-accent);
  color: white;
  font-family: 'SF Pro Text', sans-serif;
  font-weight: 600;
  font-size: 17px;
  padding: 14px 20px;
  border-radius: var(--radius-pill);
  min-height: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.btn-primary:active {
  transform: scale(0.96);
  filter: brightness(0.9);
}
```

#### Destructive Button

```css
.btn-destructive {
  background: var(--color-red);
  color: white;
  /* Same other properties as primary */
}
```

#### Positive / Negative Transaction Buttons

```css
.btn-gave {
  background: var(--app-negative); /* Red */
  color: white;
  font-family: 'SF Pro Text';
  font-weight: 700;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: var(--radius-pill);
  padding: 14px 24px;
  flex: 1;
}

.btn-got {
  background: var(--app-positive); /* Green */
  color: white;
  /* Same properties */
}
```

#### iOS 26-style Toggle

```css
.toggle {
  --toggle-width: 51px;
  --toggle-height: 31px;
  --knob-size: 27px;
  width: var(--toggle-width);
  height: var(--toggle-height);
  background: var(--fill-tertiary);
  border-radius: var(--radius-pill);
  position: relative;
  cursor: pointer;
  transition: background 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.toggle.active {
  background: var(--color-green);
}

.toggle-knob {
  width: var(--knob-size);
  height: var(--knob-size);
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  box-shadow: 0 2px 6px hsla(0,0%,0%,0.25), 0 0 0 0.5px hsla(0,0%,0%,0.04);
  transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.toggle.active .toggle-knob {
  transform: translateX(20px);
}
```

### 6.6 Dialogs and Alerts

#### iOS Alert (Yes/No Confirmation)

```
┌─────────────────────────┐
│                         │
│   Delete Person?        │  ← Title (Headline/Semibold)
│                         │
│   This will remove the  │  ← Message (Body/Regular)
│   contact and all their │
│   transactions.         │
│                         │
├────────────┬────────────┤
│   Cancel   │   Delete   │  ← Horizontal layout for 2 actions
└────────────┴────────────┘
```

- Width: device width - 60px (min 270px, max 310px)
- Corner radius: `--radius-dialog` (14px)
- Background: `--bg-secondary` with backdrop blur
- Title: 17px Semibold, centered
- Message: 13px Regular, centered, `--label-secondary`
- Dividers: 0.5px `--separator`
- Cancel button: 17px Regular, `--app-accent`
- Destructive button: 17px **Bold**, `--color-red`
- Backdrop: `rgba(0,0,0,0.4)` blur

#### iOS Message Alert (Single Action)

```
┌──────────────────────────┐
│  ✓                       │
│  Account Activated!      │
│  You can now use Credit  │
│  Book.                   │
│                          │
│        OK                │
└──────────────────────────┘
```

### 6.7 Bottom Sheets

```css
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border-radius: var(--radius-sheet) var(--radius-sheet) 0 0;
  padding: 12px var(--space-4) calc(var(--space-4) + env(safe-area-inset-bottom));
  box-shadow: var(--shadow-xl);
  
  /* Entry animation */
  transform: translateY(100%);
  animation: slideUp 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.bottom-sheet-handle {
  width: 36px;
  height: 5px;
  background: var(--fill-tertiary);
  border-radius: 2.5px;
  margin: 0 auto 16px;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
```

### 6.8 Avatar / Initials

```css
.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'SF Pro Rounded', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: white;
  
  /* Deterministic color based on name hash */
  /* Colors: red, orange, yellow, green, teal, blue, indigo, purple, pink */
}
```

Avatar colors are assigned deterministically by hashing the contact's name, cycling through 9 Apple system colors.

---

## 7. Iconography

Use **SF Symbols** equivalents for web/Flutter:

| Feature | SF Symbol | Flutter Icon |
|---------|-----------|-------------|
| Search | magnifyingglass | Icons.search_rounded |
| Add/Plus | plus | Icons.add_rounded |
| Upload/My Entries | square.and.arrow.up | Icons.upload_rounded |
| Download/Shared | square.and.arrow.down | Icons.download_rounded |
| Notifications | bell.fill | Icons.notifications_rounded |
| Settings | gearshape.fill | Icons.settings_rounded |
| Back | chevron.left | Icons.arrow_back_ios_new_rounded |
| Chevron right | chevron.right | Icons.chevron_right_rounded |
| Edit | pencil | Icons.edit_rounded |
| Delete | trash | Icons.delete_rounded |
| Check/Approve | checkmark | Icons.check_rounded |
| Reject/Close | xmark | Icons.close_rounded |
| PDF | doc.text | Icons.picture_as_pdf_rounded |
| Chat | message.fill | Icons.chat_bubble_rounded |
| User | person.fill | Icons.person_rounded |

---

## 8. Motion and Animation

*(See full specification in 24_Animation_Specification.md)*

| Interaction | Duration | Curve |
|------------|----------|-------|
| Sheet present | 450ms | Spring (damping 0.85, velocity 0.5) |
| Sheet dismiss | 350ms | Spring (damping 0.9) |
| Navigation push | 350ms | Ease-in-out |
| Search expand | 400ms | Spring (damping 0.8) |
| Tab switch | 250ms | Ease-in-out |
| Toggle | 200ms | Ease-in-out |
| Button press | 120ms | Ease-in |
| Alert present | 300ms | Spring |
| Badge appear | 250ms | Spring (bounce) |
| List row appear | 300ms + 50ms stagger | Ease-out |

---

## 9. Safe Areas

All content must respect safe areas:

```css
.screen-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

The pill navigation sits above the home indicator:
```css
.pill-nav {
  bottom: calc(24px + env(safe-area-inset-bottom));
}
```

---

## 10. Haptics

Haptic feedback is required on native apps (Flutter):

| Action | Haptic Type |
|--------|------------|
| Button tap (primary) | Light impact |
| Button tap (destructive) | Medium impact |
| Delete confirmed | Heavy impact |
| Toggle switch | Selection changed |
| Transaction saved | Success notification |
| Error occurred | Error notification |
| Sheet present | Light impact |
| Badge count change | Selection changed |

---

## 11. Dark Mode Rules

1. **Never use pure black (#000) for text** — use `--label-primary` (which is #000 in light, #FFF in dark)
2. **Never use pure white (#FFF) for backgrounds in dark mode** — use the defined dark surfaces
3. **Shadows in dark mode** should be stronger as they're more visible
4. **Colors should shift to their dark mode variants** (e.g., blue #007AFF → #0A84FF)
5. **Images** should not have additional dark treatment unless explicitly designed
6. **Blur effects** should remain consistent but may need opacity adjustment

---

*Credit Book Apple Design System — v1.0.0*

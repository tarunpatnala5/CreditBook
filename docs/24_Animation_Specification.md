# Credit Book — Animation Specification
**Version:** 1.0.0 | **Date:** 2026-07-13  
**Reference:** Apple HIG Motion Principles

---

## 1. Animation Philosophy

Credit Book uses **spring-based animations** — the same physical simulation Apple uses throughout iOS. Springs feel natural because they mimic real-world physics: they overshoot slightly and settle.

**Core Principle:** Animations should never feel like they're happening *to* the user — they should feel like the user is *causing* them.

---

## 2. Animation Catalog

### 2.1 Search Bar Expand/Collapse

**Trigger:** Tap Search icon in navigation bar

**Expand Animation (400ms):**
```css
/* Step 1: Navigation bar content fades out (150ms) */
.nav-logo, .nav-plus { 
  animation: fadeOut 150ms ease-out forwards;
}

/* Step 2: Search field slides in from right (400ms spring) */
.search-field {
  animation: searchExpand 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes searchExpand {
  from {
    width: 44px;
    opacity: 0;
    transform: translateX(20px) scale(0.8);
  }
  to {
    width: 100%;
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}
```

**Collapse Animation (300ms):**
- Reverse of expand
- Search field shrinks back to icon
- Nav elements fade in after field collapse starts

---

### 2.2 Bottom Sheet Present / Dismiss

**Present (450ms spring):**
```css
.bottom-sheet-entering {
  animation: sheetPresent 450ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes sheetPresent {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

/* Backdrop */
.backdrop-entering {
  animation: fadeIn 300ms ease-out forwards;
}
```

**Dismiss (350ms):**
```css
.bottom-sheet-leaving {
  animation: sheetDismiss 350ms cubic-bezier(0.40, 0, 0.60, 1) forwards;
}

@keyframes sheetDismiss {
  from { transform: translateY(0); }
  to   { transform: translateY(100%); }
}
```

**Drag to dismiss:**
- Follow finger position (translateY)
- On release at > 30% height: trigger dismiss
- Velocity-based: fast flick dismisses regardless of position

---

### 2.3 Alert Dialog Present

**Present (300ms):**
```css
@keyframes alertPresent {
  0%   { transform: scale(1.15); opacity: 0; }
  100% { transform: scale(1);    opacity: 1; }
}
```

**Dismiss (200ms):**
```css
@keyframes alertDismiss {
  0%   { transform: scale(1);    opacity: 1; }
  100% { transform: scale(0.9);  opacity: 0; }
}
```

---

### 2.4 Toggle Switch

**Knob Movement (200ms):**
```css
.toggle-knob {
  transition: transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  /* transform: translateX(0)  →  translateX(20px) */
}

.toggle {
  transition: background-color 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

---

### 2.5 Badge Appear

**New Badge (250ms spring):**
```css
@keyframes badgeAppear {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); }
}

.badge { animation: badgeAppear 250ms cubic-bezier(0.34, 1.56, 0.64, 1); }
```

**Badge count change:** Flip animation (150ms) on the number.

---

### 2.6 Button Press

```css
.button:active {
  transform: scale(0.96);
  filter: brightness(0.9);
  transition: transform 120ms ease-in, filter 120ms ease-in;
}

.button:not(:active) {
  transform: scale(1);
  filter: brightness(1);
  transition: transform 200ms ease-out, filter 200ms ease-out;
}
```

---

### 2.7 Person Row Delete (Swipe Left)

**Swipe to reveal delete button:**
- Follow finger horizontally
- Rubber-band effect at extremes
- Delete button fades in at 30% swipe
- Red background fills in from right

**Row removal on delete:**
```css
@keyframes rowDelete {
  0%   { height: 60px; opacity: 1; transform: translateX(0); }
  40%  { height: 60px; opacity: 0; transform: translateX(-100%); }
  100% { height: 0;    opacity: 0; padding: 0; margin: 0; }
}
```

---

### 2.8 Tab Switch (Pill Navigation)

**Active tab indicator:**
- Background fills around active icon (200ms ease-in-out)
- Icon changes from stroked to filled (150ms)
- Spring scale pulse on tap (scale: 1 → 0.92 → 1)

---

### 2.9 Page Navigation

**Push (350ms):**
- New page slides in from right
- Previous page slides slightly to the left (parallax, 40% speed)
- Fade-in overlay at start

**Pop (300ms):**
- Current page slides to right
- Previous page slides back from left

---

### 2.10 Screen Appear (Initial Load)

```css
/* Staggered list appearance */
.person-row:nth-child(1) { animation-delay: 0ms; }
.person-row:nth-child(2) { animation-delay: 50ms; }
.person-row:nth-child(3) { animation-delay: 100ms; }
/* ... */

@keyframes rowAppear {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.person-row {
  animation: rowAppear 300ms ease-out both;
}
```

---

### 2.11 Loading States

**Skeleton shimmer:**
```css
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--fill-secondary) 25%,
    var(--fill-primary) 50%,
    var(--fill-secondary) 75%
  );
  background-size: 400px 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

---

## 3. Flutter Animation Implementation

```dart
// Spring physics for sheet presentation
showModalBottomSheet(
  context: context,
  isScrollControlled: true,
  barrierColor: Colors.black54,
  builder: (ctx) => SlideTransition(
    position: Tween<Offset>(
      begin: const Offset(0, 1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: controller,
      curve: Curves.fastLinearToSlowEaseIn, // Approximates spring
    )),
    child: sheet,
  ),
);

// Button press animation
ScaleTransition(
  scale: Tween(begin: 1.0, end: 0.96).animate(
    CurvedAnimation(parent: tapController, curve: Curves.easeIn)
  ),
  child: button,
)

// Custom spring simulation for search bar
final springDescription = SpringDescription(
  mass: 1,
  stiffness: 100,
  damping: 10,
);
final simulation = SpringSimulation(springDescription, 0, 1, 0.5);
```

---

## 4. Reduced Motion Support

Respect the user's "Reduce Motion" system preference:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

```dart
// Flutter: check accessibility settings
if (!MediaQuery.of(context).disableAnimations) {
  // Use animations
} else {
  // Skip animations, use instant transitions
}
```

---

*Credit Book Animation Specification — v1.0.0*

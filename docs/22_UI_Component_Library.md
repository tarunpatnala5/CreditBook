# Credit Book — UI Component Library
**Version:** 1.0.0 | **Date:** 2026-07-13

---

## 1. Component Inventory

All components follow Apple's Human Interface Guidelines.

---

## 2. Base Components

### Button

```jsx
// Props: variant, size, fullWidth, loading, disabled, icon, onClick
<Button variant="primary">Save</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="primary" loading>Saving...</Button>
```

**Variants:** `primary` (blue), `secondary` (fill), `destructive` (red), `ghost` (no background), `positive` (green), `negative` (red outlined)

### TextField

```jsx
// Props: label, placeholder, value, onChange, error, type, prefix, suffix
<TextField label="Amount" placeholder="0.00" prefix="₹" type="number" />
<TextField label="Phone" placeholder="+91 XXXXX XXXXX" type="tel" />
<TextField label="Description" placeholder="What was this for?" multiline />
```

### Toggle (iOS Switch Style)

```jsx
// Props: value, onChange, label
<Toggle value={darkMode} onChange={setDarkMode} label="Dark Mode" />
```

### Avatar

```jsx
// Props: name, size, imageUrl, color
// Deterministic color from name hash
<Avatar name="Ravi Kumar" size={44} />        // Shows "RK"
<Avatar name="Priya" size={36} />              // Shows "P"
```

### Badge

```jsx
// Props: count, variant, position
// Used for notification count, update count
<Badge count={5} />          // Red pill with "5"
<Badge count={10} />         // Red pill with "9+"
```

### Card

```jsx
// Props: padding, shadow, radius, onClick
<Card>
  <SummaryContent />
</Card>
```

### Alert (iOS Dialog)

```jsx
// Props: title, message, actions, visible, onDismiss
<Alert
  title="Delete Person?"
  message="This will remove Ravi and all their transactions."
  visible={showAlert}
  actions={[
    { label: 'Cancel', style: 'cancel', onPress: () => setShowAlert(false) },
    { label: 'Delete', style: 'destructive', onPress: handleDelete }
  ]}
/>
```

### BottomSheet

```jsx
// Props: visible, onDismiss, title, children, snapPoints
<BottomSheet visible={visible} onDismiss={onDismiss} title="Add Person">
  <AddPersonForm />
</BottomSheet>
```

### Toast

```jsx
// Shows briefly at top (Apple notification style)
toast.success("Transaction saved");
toast.error("Failed to save. Please try again.");
toast.info("Synced 3 items");
```

### Spinner / LoadingIndicator

```jsx
<Spinner size="sm" />   // Small inline spinner
<Spinner size="md" />   // Medium for buttons
<Spinner size="lg" />   // Full screen loading
```

### Skeleton

```jsx
// Placeholder while loading
<Skeleton width="100%" height={60} radius={13} />
<Skeleton width={120} height={14} />
```

---

## 3. Layout Components

### Screen

```jsx
// Applies safe areas, scroll behavior, background color
<Screen>
  <Content />
</Screen>
```

### NavigationBar

```jsx
// Apple-style translucent top bar with large title
<NavigationBar
  title="Credit Book"
  logo={<CreditBookLogo />}
  rightButtons={[<SearchButton />, <PlusButton />]}
  onSearchExpand={handleSearchExpand}
/>
```

### PillTabBar

```jsx
// Floating Apple pill navigation
<PillTabBar
  items={[
    { icon: <UploadIcon />, label: 'My Entries', badge: 0 },
    { icon: <DownloadIcon />, label: 'Shared', badge: 0 },
    { icon: <BellIcon />, label: 'Notifications', badge: notifCount },
    { icon: <GearIcon />, label: 'Settings', badge: settingsBadge },
  ]}
  activeIndex={activeTab}
  onChange={setActiveTab}
/>
```

---

## 4. Feature Components

### SummaryCards

```jsx
// You Give + You Get cards
<SummaryCards totalGive={15000} totalGet={8500} />
```

### PersonRow

```jsx
// Person list item
<PersonRow
  person={person}
  onPress={navigateToPerson}
/>
```

### TransactionCard

```jsx
// Single transaction display
<TransactionCard
  transaction={txn}
  onPress={openTransactionDetail}
/>
```

### ChatMessage

```jsx
// Support chat message bubble
<ChatMessage
  message={msg}
  isOwn={msg.senderId === currentUserId}
/>
```

### NotificationItem

```jsx
// Notification list item with swipe
<NotificationItem
  notification={notif}
  onRead={markAsRead}
  onDelete={deleteNotif}
/>
```

### ListSection (Apple Settings Style)

```jsx
// Grouped settings list with header and footer
<ListSection header="PROFILE" footer="Your name is shown to admin.">
  <ListRow label="Name" value="Tarun Kumar" onPress={editName} />
  <ListRow label="Phone" value="+91 98765" onPress={editPhone} />
</ListSection>
```

### ListRow

```jsx
// Single row in a settings list
<ListRow
  label="Dark Mode"
  trailing={<Toggle value={dark} onChange={setDark} />}
/>
<ListRow
  label="User Manual"
  showChevron
  onPress={openManual}
/>
<ListRow
  label="Support Requests"
  badge={3}
  showChevron
  onPress={openSupport}
/>
```

---

## 5. Design Decisions

### Avatar Color Algorithm

```javascript
function getAvatarColor(name) {
  const colors = [
    '#FF3B30', '#FF9500', '#FFCC00', '#34C759',
    '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}
```

### Initials Extraction

```javascript
function getInitials(name) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
```

---

*Credit Book UI Component Library — v1.0.0*

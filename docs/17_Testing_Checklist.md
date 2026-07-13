# Credit Book — Testing Checklist
**Version:** 1.0.0 | **Date:** 2026-07-13

---

## 1. Authentication Testing

- [ ] User can register with valid name, phone, and password
- [ ] Registration fails if phone already exists
- [ ] Registration fails if passwords don't match
- [ ] Registration shows "Pending activation" popup
- [ ] Pending user cannot log in (shows "Account not activated")
- [ ] Admin can see pending user in Pending Activations list
- [ ] Admin can approve a user (tick button)
- [ ] Approved user receives push notification
- [ ] Approved user can now log in
- [ ] Admin can reject a user (cross button)
- [ ] Login fails with wrong password
- [ ] Login succeeds with correct credentials
- [ ] JWT access token expires after 15 minutes (refresh happens silently)
- [ ] Refresh token rotation works (old token rejected after refresh)
- [ ] Logout clears session and redirects to login
- [ ] Force logout from admin works

## 2. PIN Lock Testing

- [ ] User can enable PIN lock in Settings
- [ ] PIN prompt appears on next app open
- [ ] Correct PIN unlocks app
- [ ] Wrong PIN shows error + increments attempt count
- [ ] 5 wrong PINs locks for 10 minutes
- [ ] Biometric can be used instead of PIN
- [ ] PIN can be changed
- [ ] PIN can be disabled

## 3. Persons Testing

- [ ] Add person with name only (no phone)
- [ ] Add person with name + phone
- [ ] Person appears in list sorted by most recent activity
- [ ] Balance shows ₹0 for new person
- [ ] Person with phone linked to existing user shows linked indicator
- [ ] Edit person name via ⚙ icon
- [ ] Edit person phone via ⚙ icon
- [ ] Delete person shows countdown timer
- [ ] Undo delete works within 24 hours
- [ ] After 24 hours, person is removed
- [ ] Linked user sees countdown in Shared Entries tab
- [ ] After deletion confirmed, person gone from Shared Entries

## 4. Transaction Testing

- [ ] Create "You Gave" transaction with amount only
- [ ] Create "You Got" transaction with description
- [ ] Create transaction with future date → appears in Upcoming tab
- [ ] Create transaction with interest rate
- [ ] Balance updates after each transaction
- [ ] Running balance shown correctly in transaction list
- [ ] Transaction shows large amount at top, date below, balance below
- [ ] Tap transaction → detail sheet appears
- [ ] Edit button in detail sheet opens edit mode
- [ ] Edit transaction amount → balance recalculates
- [ ] Delete transaction → balance recalculates
- [ ] Upcoming transaction auto-moves to Current on its date
- [ ] Notification sent when upcoming becomes current
- [ ] Interest calculated daily at midnight
- [ ] Interest history shows in transaction detail

## 5. Shared Entries Testing

- [ ] Person A adds Person B with B's phone number
- [ ] Person B (logged in) sees Person A's entry in Shared Entries tab
- [ ] Balance shown from Person A's perspective (what A says B owes)
- [ ] Person B cannot edit the transactions
- [ ] When Person A adds new transaction, Person B sees update in real-time
- [ ] When Person A deletes B's entry, B sees "removing in 24h" message

## 6. Search Testing

- [ ] Search icon tap → animation plays (nav fades, search expands)
- [ ] Typing filters persons list in real-time
- [ ] Search works with partial names
- [ ] Search works with phone numbers
- [ ] × button closes search, animation reverses

## 7. Notifications Testing

- [ ] Notification badge appears on bell icon
- [ ] Badge count is correct
- [ ] Notifications categorized correctly
- [ ] Tap notification → navigates to correct page
- [ ] Mark single notification as read
- [ ] Mark all as read
- [ ] Delete notification
- [ ] Push notification received when app is in background
- [ ] Push notification received when app is closed
- [ ] Tapping push notification opens app to correct page

## 8. Settings Testing

- [ ] Name edit modal opens on tap
- [ ] Name save works
- [ ] Dark mode toggle switches theme immediately
- [ ] Dark mode persists after app restart
- [ ] User Manual page loads with content
- [ ] Support Chat opens correctly
- [ ] Updates section shows correct version info
- [ ] Delete Account requires typing "DELETE" to confirm
- [ ] Admin-only sections hidden from normal users
- [ ] Admin sections visible for admin

## 9. Reports Testing

- [ ] PDF report generates without error
- [ ] PDF includes Credit Book logo, person name, date range
- [ ] PDF shows all transactions in date range
- [ ] PDF shows interest summary
- [ ] PDF shows opening and closing balance
- [ ] CSV export downloads with correct data
- [ ] Excel export downloads with correct data
- [ ] Date range presets work (Current Month, Last Month, etc.)
- [ ] Custom date range works

## 10. Offline Mode Testing

- [ ] App works when airplane mode is on
- [ ] Offline banner shows "You are offline"
- [ ] Can view all existing data offline
- [ ] Can create new transaction offline (queued)
- [ ] When internet returns, queued transactions sync
- [ ] "Synced X items" message appears after sync

## 11. Admin Panel Testing

- [ ] Admin can see all active users list
- [ ] Admin can delete a user (with confirmation)
- [ ] Deleted user cannot log in
- [ ] Admin sees pending activations with correct count
- [ ] Admin approval/rejection works with loading animation
- [ ] Admin can view all support conversations
- [ ] Admin can reply to user in support chat
- [ ] User receives notification of admin reply
- [ ] Analytics dashboard shows correct numbers
- [ ] Admin can send announcement to all users

## 12. Dark Mode Testing

- [ ] All screens look correct in dark mode
- [ ] No hardcoded white backgrounds visible
- [ ] Text readable in all dark mode screens
- [ ] Cards and separators visible with correct contrast
- [ ] Toggle correctly in Settings
- [ ] Auto-follows system theme preference

## 13. Cross-Platform Testing (Web)

- [ ] Chrome (latest): all features work
- [ ] Safari (latest): all features work
- [ ] Firefox (latest): all features work
- [ ] Edge (latest): all features work
- [ ] Mobile Chrome (Android): responsive layout correct
- [ ] Mobile Safari (iOS): responsive layout correct
- [ ] Tablet layout (iPad): layout looks good

## 14. Performance Testing

- [ ] Home page loads in < 2 seconds on 4G
- [ ] Transactions list loads in < 1 second
- [ ] No layout shift (CLS = 0)
- [ ] Search results appear within 300ms of typing
- [ ] Animations run at 60fps (no jank)

---

*Credit Book Testing Checklist — v1.0.0*

# Credit Book — User Manual
**Version:** 1.0.0  
**Date:** 2026-07-13  
**For:** All Users (Normal + Admin)  
**Language:** English

---

## Welcome to Credit Book

Credit Book is your private family financial ledger. It helps you track money you've given and received — simply, securely, and beautifully. Think of it as your personal ledger book, always in your pocket, always in sync across all your devices.

---

## Table of Contents

1. Getting Started
2. Understanding the Home Screen
3. Adding People (Contacts)
4. Recording Transactions
5. Understanding "You Give" and "You Get"
6. Upcoming Transactions
7. Interest Calculation
8. Shared Entries (Viewing What Others Recorded for You)
9. Search
10. Notifications
11. Settings
12. Reports (PDF, CSV, Excel)
13. Dark Mode
14. Offline Mode
15. PIN Lock and Biometric Security
16. Support Chat
17. Updates
18. For Admin: Managing Users
19. For Admin: Support Requests
20. For Admin: Analytics Dashboard
21. Recycle Bin and Deleted Records
22. Tips and Best Practices
23. Frequently Asked Questions

---

## 1. Getting Started

### Creating Your Account

1. Open Credit Book on your device or visit the website
2. Tap **"Get Started"** or **"Register"**
3. Fill in:
   - **Full Name** — your real name
   - **Phone Number** — this is your unique identity in Credit Book (required)
   - **Password** — choose a strong password
   - **Confirm Password** — repeat your password
4. Tap **"Create Account"**
5. A message appears: **"Account created! Please contact Tarun Kumar to activate your account."**
6. Once the admin activates your account, you receive a notification and can log in

### Logging In

1. Open Credit Book
2. Enter your **Phone Number** and **Password**
3. Tap **"Sign In"**
4. If you have a PIN set, you'll be asked for your PIN or fingerprint/face

### Forgot Password

Contact the admin directly. The admin can reset your password from the Admin Panel.

---

## 2. Understanding the Home Screen

When you open Credit Book after logging in, you'll see the **Home Screen**. Here's what each part means:

### Top Bar
- **Left side:** Credit Book logo and name
- **Right side:** 
  - 🔍 **Search button** — tap to search for any person
  - ➕ **Plus button** — tap to add a new person

### Search Animation
When you tap the 🔍 Search button:
- The logo and Plus button smoothly slide away
- A search field slides in from the right
- Type any name or phone number to filter your list
- Tap **✕** to close search and return to normal view

### Summary Cards (You Give / You Get)
Below the top bar, you'll see two cards:
- **You Give** (green): Total money others owe you (you gave it to them)
- **You Get** (red): Total money you owe others (they gave it to you)

These update automatically in real-time whenever a transaction is recorded.

### Accounts List
Below the cards is a list of all people you've added. Each entry shows:
- **Initials avatar** (colorful circle with first letters of their name)
- **Name** of the person
- **Last activity time** (e.g., "3 hours ago", "Yesterday")
- **Balance amount** — green if they owe you, red if you owe them

The most recently active contacts appear at the top.

---

## 3. Adding People (Contacts)

### How to Add a New Person

1. Tap the ➕ **Plus button** at the top right
2. A sheet slides up from the bottom with two fields:
   - **Name** (required) — the person's name
   - **Phone Number** (optional but recommended) — their mobile number
3. Tap **"Add"** to save

> **Tip:** Entering a phone number is important! If that person registers on Credit Book, they'll automatically see your entries in their **Shared Entries** tab. This creates a transparent, two-way record of your financial dealings.

### What Happens After You Add a Person?

- The person appears in your accounts list
- A record is created in the database linked to their phone number
- If they are already a Credit Book user, the link is made immediately
- If they register later with the same number, the link activates automatically

---

## 4. Recording Transactions

### Opening a Person's Page

Tap any person in your accounts list to open their transaction page.

### The Person's Page Layout

- **Top bar:** Back (←) button, their avatar and name, Settings (⚙) icon
- **Balance card:** Shows "You will give ₹X" or "You will get ₹X" — the current net balance
- **Filter pills:** Two buttons — **Current** and **Upcoming**
- **Transaction list:** All recorded transactions

### Recording a New Transaction

At the bottom of the person's page, there are two buttons:
- 🔴 **YOU GAVE ₹** — tap this when you gave money to this person (they now owe you)
- 🟢 **YOU GOT ₹** — tap this when you received money from this person (you now owe them)

A sheet slides up with:
- **Amount** — enter the amount (required)
- **Description** — what was this for? (optional but helpful)
- **Date and Time** — defaults to right now; change if needed
- **Interest %** — optional; if you enter a percentage, interest will be calculated daily

Tap **"Save"** to record the transaction.

> **Upcoming Transactions:** If you select a future date, the transaction goes into the **Upcoming** tab automatically. It moves to **Current** on that date at midnight.

---

## 5. Understanding "You Give" and "You Get"

This is the most important concept in Credit Book. It is always from **your perspective**:

| Situation | What to tap | Label on transaction |
|-----------|------------|---------------------|
| You lent money to someone | YOU GAVE ₹ | Shows in green — they owe you |
| You borrowed money | YOU GOT ₹ | Shows in red — you owe them |
| Someone returned money to you | YOU GOT ₹ | Reduces what they owe you |
| You returned money to someone | YOU GAVE ₹ | Reduces what you owe |

The **running balance** on each transaction updates automatically to show the net position after every entry.

---

## 6. Upcoming Transactions

Upcoming transactions are entries you schedule for a future date — for example, a loan repayment due next month.

### How to Create an Upcoming Transaction

1. Go to any person's page
2. Tap **YOU GAVE ₹** or **YOU GOT ₹**
3. Change the **Date** to a future date
4. Fill in the amount and description
5. Tap Save

The transaction appears in the **Upcoming** tab (not in Current).

### What Happens When the Date Arrives?

At midnight on the scheduled date, Credit Book automatically:
- Moves the transaction from **Upcoming** to **Current**
- Recalculates the balance
- Sends you a notification: "A scheduled transaction for [Name] is now active"

---

## 7. Interest Calculation

If a transaction has an interest rate attached, Credit Book automatically updates the amount every day at midnight.

### How to Add Interest to a Transaction

When creating or editing a transaction:
- Fill in the **Interest %** field (e.g., enter "2" for 2%)

### What Does Credit Book Calculate?

Credit Book uses **Simple Interest** by default:
- Daily amount added = (Principal × Rate%) ÷ 365
- This is added to the running balance every midnight

### Viewing Interest History

When you tap a transaction that has interest:
- The detail sheet shows the **Original Amount** you entered
- The **Current Amount** (after accumulated interest)
- The **Description**
- An **Edit** button (top right) to modify the transaction

---

## 8. Shared Entries (Tab 2 — Download Icon)

The second tab (Download ↓ icon) in the bottom navigation shows **Shared Entries**.

### What Are Shared Entries?

These are entries that other people have created where they entered **your phone number** as the contact. For example, if your brother adds you in his Credit Book with your number, you'll see that ledger here.

### What Can You Do in Shared Entries?

- **View only** — you cannot edit these entries
- See the You Give / You Get balance from their perspective
- See all their transactions involving you
- See upcoming transactions they've scheduled

### What Happens If They Delete You?

If someone deletes your entry from their account:
- You'll see a message on their shared entry: "This account will be deleted in X hours"
- After 24 hours, the entry disappears from your Shared Entries tab
- You'll receive a notification

---

## 9. Search

### Global Search (Home Screen)

1. Tap 🔍 at the top of the home screen
2. Start typing a name or phone number
3. The list filters instantly to matching contacts
4. Tap any result to open their page
5. Tap ✕ to close search

---

## 10. Notifications (Tab 3 — Bell Icon)

Tap the Bell 🔔 icon in the bottom navigation to open Notifications.

A red badge on the bell icon shows the number of unread notifications.

### Notification Types

| Category | What You'll See |
|----------|----------------|
| **Transactions** | "Ravi added a new entry of ₹500" |
| **Activation** | "Your Credit Book account has been activated!" |
| **Updates** | "Credit Book v1.2 is available" |
| **Support** | "Admin replied to your support message" |
| **Announcements** | Messages from admin to all users |

### Managing Notifications

- Tap a notification to open the relevant page
- Swipe left to delete a notification
- Tap **"Mark All Read"** at the top

---

## 11. Settings (Tab 4 — Gear Icon)

Tap the Gear ⚙ icon in the bottom navigation to open Settings.

### Your Profile

- **Name** — tap to open an edit popup; change your name and tap Save
- **Phone Number** — tap to open an edit popup; contact admin to confirm changes

### App Preferences

- **Dark Mode** — toggle to switch between light and dark appearance
- **PIN Lock** — enable a 6-digit PIN to protect your account
- **Biometric** — use fingerprint or Face ID instead of PIN

### User Manual

Tap **User Manual** to open this guide within the app.

### Support Chat

Tap **Support Chat** to open a chat with the admin. You can:
- Ask questions about your account
- Report bugs or issues
- Request help with transactions

### Updates

Tap **Updates** to see:
- Your current app version
- Any available updates (version number, size in MB, what's new)
- A button to download and install the update

### Delete Account

Tap **Delete Account** if you wish to remove your account. A confirmation dialog appears:
1. First warning: "Are you sure you want to delete your account?"
2. Second confirmation: Type "DELETE" to confirm
3. Your account is soft-deleted (the admin can restore it within 30 days)

---

## 12. Reports (PDF, CSV, Excel)

### Generating a Report for a Person

1. Open that person's page
2. Tap the ⚙ icon at the top right
3. Select **"Download Report"**
4. Choose date range:
   - Current Month
   - Last Month
   - Last 6 Months
   - Last 1 Year
   - Custom (select from/to dates)
5. Choose format: **PDF**, **CSV**, or **Excel**
6. Tap **Generate** — the file downloads to your device

### What's in the Report?

- Credit Book logo and header
- Your name and the contact's name
- Date range of the report
- Opening Balance
- All transactions (date, description, amount, balance)
- Interest summary
- Closing Balance
- Generation date and time

---

## 13. Dark Mode

Credit Book automatically respects your device's dark mode setting. You can also manually toggle it in **Settings → Dark Mode**.

In dark mode:
- Background turns to deep charcoal (not pure black)
- Cards use slightly elevated dark surfaces
- All text remains readable with proper contrast
- Colors shift to their dark-mode variants

---

## 14. Offline Mode

Credit Book works without internet! When you're offline:

- A banner appears: **"You are offline — changes will sync when connected"**
- You can still view all your transactions and contacts
- You can create new transactions — they're saved locally
- When your internet reconnects, everything syncs automatically
- A confirmation message appears: **"Synced X items"**

---

## 15. PIN Lock and Biometric Security

### Setting Up PIN

1. Go to **Settings → PIN Lock**
2. Toggle it on
3. Enter a 6-digit PIN
4. Confirm the PIN

The next time you open Credit Book, you'll be asked for your PIN.

### Setting Up Fingerprint / Face Unlock

1. Ensure your device has biometric authentication set up
2. Go to **Settings → Biometric**
3. Toggle it on
4. Authenticate once to confirm

From then on, Credit Book opens with just a touch or glance.

---

## 16. Support Chat

1. Go to **Settings → Support Chat**
2. A chat interface opens (similar to iMessage)
3. Type your message in the text box
4. Tap Send
5. The admin will reply — you'll get a notification when they do
6. The conversation continues like a regular chat

---

## 17. Updates

Credit Book checks for updates automatically.

When an update is available:
- A badge appears on the Settings gear icon
- A notification is sent
- In **Settings → Updates**, you'll see:
  - New version number
  - File size in MB
  - What's new (release notes)
  - **Download & Install** button

### On Android
Tapping Download & Install downloads the new APK and installs it automatically.

### On iOS
You'll be directed to update via TestFlight or the provided update link.

### On Web
The web app updates automatically — just refresh if prompted.

---

## 18. For Admin: Managing Users

### Activating New Users

1. Go to **Settings → Pending Activations**
2. Each pending user shows: Name + Phone Number
3. Tap ✓ (tick) to **Approve** or ✗ (cross) to **Reject**
4. A loading animation shows while processing
5. Approved users get notified immediately

### Managing Active Users

1. Go to **Settings → Users**
2. See all active users sorted by activation date (newest first)
3. Each row: Name | Phone Number | Delete button
4. Tap **Delete** on a user → confirmation dialog appears
5. Confirmed: User account is deactivated

---

## 19. For Admin: Support Requests

1. Go to **Settings → Support Requests**
2. A list of all users who have sent support messages appears (WhatsApp-style chat list)
3. Shows unread count next to each user
4. Tap any user to open their chat
5. Type a reply and tap Send
6. The user receives a notification and sees your reply in their Support Chat

---

## 20. For Admin: Analytics Dashboard

1. Go to **Settings → Analytics Dashboard**
2. See charts and statistics:
   - Total transactions (this month / all time)
   - Total users
   - Active vs inactive users
   - Most recent activity
   - Total money flowing in the system
   - Interest generated

---

## 21. Recycle Bin and Deleted Records

### What Happens When You Delete?

Deleted contacts and transactions are **not permanently removed** immediately. They go through these stages:

1. **Soft Delete:** Hidden from the UI, stored in database
2. **24-hour grace period (Contacts):** Countdown shown, undo available
3. **30-day recycle bin (Admin):** Admin can restore any soft-deleted record
4. **Permanent delete:** Admin manually triggers, or 30 days pass

### Accessing the Recycle Bin (Admin Only)

Go to **Settings → Recycle Bin** (admin section) to see and restore deleted records.

---

## 22. Tips and Best Practices

- **Always add phone numbers** when creating contacts — it enables automatic linking
- **Use descriptions** in transactions — "Grocery money", "School fees", "Movie" makes history easier to understand
- **Review Upcoming tab** regularly to track scheduled payments
- **Generate monthly PDF reports** to keep a paper trail
- **Enable biometric lock** for security
- **Check Shared Entries** to verify what others have recorded involving you

---

## 23. Frequently Asked Questions

**Q: I registered but can't log in?**  
A: Your account needs admin activation. Contact Tarun Kumar.

**Q: Can I use Credit Book on multiple devices?**  
A: Yes! Your data syncs in real-time across all devices.

**Q: What if I enter a wrong amount?**  
A: Tap the transaction → tap Edit → correct the amount → Save.

**Q: Will I lose my data if I reinstall the app?**  
A: No. Your data is stored on the server. Log in again and everything is there.

**Q: Can others see my private transactions?**  
A: Only people you add as contacts (with their phone number) can see entries you've created about them — and only their own entries, not all your contacts.

**Q: What happens if my internet is down?**  
A: Credit Book works offline. Your changes sync automatically when you reconnect.

**Q: How is my data secured?**  
A: All data is encrypted, transmitted over HTTPS, and stored securely. Only you and the admin can access your data.

**Q: Can I export my data?**  
A: Yes — PDF, CSV, and Excel export are available per person or for all contacts.

---

*Credit Book User Manual — v1.0.0*  
*For support, use the in-app Support Chat feature*

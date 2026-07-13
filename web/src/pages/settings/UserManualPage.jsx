// Credit Book — User Manual Page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageNavigationBar } from '../../components/layout/AppLayout';

const SECTIONS = [
  {
    title: '1. Getting Started',
    content: `Credit Book is your private family ledger app. It helps you track money you've given or received from friends and family.\n\nAfter registration, an admin must activate your account before you can sign in.`,
  },
  {
    title: '2. Home Screen — My Entries (↑)',
    content: `The home screen shows all people you've added and the money you'll get or give.\n\n• "You Will Get" (green) = total money owed to you\n• "You Will Give" (red) = total money you owe\n\nTap any person to view their transaction details.`,
  },
  {
    title: '3. Adding a Person',
    content: `Tap the + button (top right) to add a person.\n\n• Enter their name (required)\n• Add their phone number (optional, but important — if they're also a Credit Book user, their entries will link automatically)\n\nTap "Add Person" to save.`,
  },
  {
    title: '4. Recording Transactions',
    content: `On a person's page:\n\n• "YOU GAVE ₹" — tap when you gave money to them\n• "YOU GOT ₹" — tap when you received money from them\n\nFor each entry:\n• Amount (required)\n• Note — what's it for (optional)\n• Date/time (leave blank for now)\n• Interest rate % per year (optional)`,
  },
  {
    title: '5. Upcoming Transactions',
    content: `If you set a future date when creating a transaction, it goes to the "Upcoming" tab.\n\nAt midnight on that date, it automatically moves to "Current" and you'll receive a notification.`,
  },
  {
    title: '6. Interest',
    content: `When you add an interest rate to a transaction:\n\n• Interest is calculated daily at midnight\n• The amount shown is the original + all interest accumulated\n• Tap any transaction to see the full breakdown`,
  },
  {
    title: '7. Shared Entries (↓ tab)',
    content: `The Shared Entries tab shows entries that OTHER people created with YOUR phone number.\n\n• These are view-only — you cannot edit them\n• They update in real-time when the other person makes changes`,
  },
  {
    title: '8. Deleting a Person',
    content: `Tap ⚙ on a person's page → Delete.\n\n• The person is NOT immediately deleted\n• A 24-hour timer starts\n• You can undo this within 24 hours from the home screen\n• After 24 hours, the person and all their transactions are permanently removed`,
  },
  {
    title: '9. Notifications',
    content: `The bell tab shows all your notifications:\n\n• Transaction updates\n• Support replies\n• App updates\n• Account activation\n• Announcements\n\nTap any notification to go to the relevant page.`,
  },
  {
    title: '10. Support Chat',
    content: `Settings → Support Chat\n\nSend a message to the admin at any time. You'll receive a notification when they reply.`,
  },
  {
    title: '11. App Updates',
    content: `Settings → Updates\n\nWhen a new version is available, you'll see a notification badge. Download and install directly from within the app.`,
  },
  {
    title: '12. Dark Mode',
    content: `Settings → Preferences → Dark Mode\n\nToggle between light and dark mode. By default, the app follows your system preference.`,
  },
  {
    title: '13. Privacy & Security',
    content: `Your data is completely private:\n\n• All connections are encrypted (HTTPS)\n• Passwords are never stored in plain text\n• Only your family members can access the app\n• You can delete your account any time from Settings`,
  },
  {
    title: '14. Active Devices',
    content: `Settings → Active Devices\n\nSee all devices where your account is signed in. You can remove any device at any time — this signs it out immediately.\n\nYou stay signed in until you manually sign out or remove the device. There is no automatic timeout.`,
  },
];

export default function UserManualPage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--bg-primary)' }}>
      <PageNavigationBar title="User Manual" onBack={() => navigate(-1)} />

      <div style={{ padding: '16px', flex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--color-blue), hsl(260,80%,60%))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: 32, color: 'white', fontWeight: 700,
            fontFamily: 'var(--font-rounded)',
          }}>₹</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--label-primary)' }}>
            Credit Book
          </h1>
          <p style={{ fontSize: 14, color: 'var(--label-secondary)', marginTop: 4 }}>
            User Manual · v1.0.0
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map((section, i) => (
          <div key={i} style={{
            background: 'var(--bg-secondary)', borderRadius: 13,
            padding: '16px', marginBottom: 12,
            boxShadow: 'var(--shadow-xs)',
            animation: `rowAppear 300ms ease both`,
            animationDelay: `${i * 30}ms`,
          }}>
            <h2 style={{
              fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)',
              color: 'var(--label-primary)', marginBottom: 10,
            }}>
              {section.title}
            </h2>
            <p style={{
              fontSize: 14, color: 'var(--label-secondary)',
              lineHeight: 1.6, whiteSpace: 'pre-line',
            }}>
              {section.content}
            </p>
          </div>
        ))}

        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--label-tertiary)', fontSize: 12 }}>
          Credit Book · Private Family Ledger
        </div>
      </div>
    </div>
  );
}

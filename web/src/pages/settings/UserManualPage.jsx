// Credit Book — User Manual Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageNavigationBar } from '../../components/layout/AppLayout';

const SECTIONS = [
  {
    title: '1. Getting Started',
    icon: '🚀',
    content: `Credit Book is your private app to track money you've given or received from friends and family.\n\nAfter registration, an admin must activate your account before you can sign in.`,
  },
  {
    title: '2. Home Screen',
    icon: '🏠',
    content: `The home screen shows all people you've added and the total money summary.\n\n• "You Will Get" (green) = total money owed to you\n• "You Will Give" (red) = total money you owe\n\nThe amounts shown include both regular transactions AND live interest from interest entries.\n\nTap any person to view their full transaction details.`,
  },
  {
    title: '3. Adding a Person',
    icon: '👤',
    content: `Tap the + button (top right) to add a person.\n\n• Enter their name (required)\n• Add their phone number (optional, but important — if they're also a Credit Book user, their entries will link automatically)\n\nTap "Add Person" to save.`,
  },
  {
    title: '4. Recording Transactions',
    icon: '📝',
    content: `On a person's page:\n\n• "YOU GAVE ₹" — tap when you gave money to them\n• "YOU GOT ₹" — tap when you received money from them\n\nFor each entry:\n• Amount (required)\n• Note — what's it for (optional)\n• Date/time (leave blank for now)\n• Interest (optional) — see Section 6`,
  },
  {
    title: '5. Three Tabs — Current / Upcoming / Interest',
    icon: '📑',
    content: `Every person's page has three tabs:\n\n📋 Current\nAll regular gave/got entries. These affect the main balance.\n\n⏰ Upcoming\nEntries with a future date. Auto-moves to Current at midnight on that date.\n\n💰 Interest\nEntries where you set an interest rate. These are tracked separately and show a live growing amount every day.`,
  },
  {
    title: '6. Interest — How It Works',
    icon: '💰',
    content: `When you add an entry with interest:\n\n1. Tap "Interest (optional) ›" in the add form\n2. Choose compounding frequency:\n   • Annually, Semi-Annually, Quarterly, Monthly, Daily\n3. Enter the interest rate % per year\n4. Save\n\nThe entry goes to the Interest tab — not the Current tab.\n\nThe Interest tab shows the live "close today" amount — how much you'd pay if you settled right now. This updates every time you open the app.`,
  },
  {
    title: '7. Interest Formula — The Calculation',
    icon: '🔢',
    content: `The app uses the universal standard compound interest formula:\n\n    A = P × (1 + R/n)^(n × T)\n\nWhere:\n  P = Principal (original amount)\n  R = Annual interest rate (e.g. 0.12 for 12%)\n  n = Compounding frequency per year\n  T = Exact time elapsed in years (days ÷ 365)\n\nFrequency values of n:\n  Annually      → n = 1\n  Semi-Annually → n = 2\n  Quarterly     → n = 4\n  Monthly       → n = 12\n  Daily         → n = 365\n\nThis is the same formula used by CAGR, mutual funds, Nifty 50 returns, Excel FV(), and all financial calculators worldwide.`,
  },
  {
    title: '8. Interest Examples',
    icon: '📊',
    content: `Example: ₹23,000 at 12% per year\n\n─── Annually (n=1) ───────────────────\n  After 1 year    → ₹25,760.00\n  After 1.5 years → ₹26,992.xx\n  After 2 years   → ₹28,860.16\n\n─── Monthly (n=12) ───────────────────\n  After 1 year    → ₹25,916.98\n  After 1.5 years → ₹27,186.xx\n  After 2 years   → ₹29,213.45\n\nMonthly always earns more than Annually at the same rate — because interest compounds more frequently, each month's interest starts earning more interest sooner.\n\nKey fact: the amount shown is the "close today" amount — if you settle on any given day, that's exactly what you owe. The calculation updates every single day.`,
  },
  {
    title: '9. Top Bar — Balance Card',
    icon: '📊',
    content: `On each person's page, the top card always shows three amounts:\n\n  Current  +  Interest  =  Total\n\n• Current = sum of all gave/got entries (Current tab)\n• Interest = live total of all interest entries as of today\n• Total = Current + Interest\n\nThe home screen person row also shows the Total (current + interest).`,
  },
  {
    title: '10. Interest vs Regular Transactions',
    icon: '⚖️',
    content: `Important differences:\n\n Regular transaction (no interest):\n  • Appears in Current tab\n  • Affects person's main balance immediately\n  • Fixed amount — doesn't change\n\n Interest transaction:\n  • Appears in Interest tab only\n  • Does NOT affect Current tab balance\n  • Amount grows every day (live calculation)\n  • Shows principal + accrued interest in amber\n  • Shows "live · as of today" label`,
  },
  {
    title: '11. Why More Frequent = More Interest',
    icon: '📈',
    content: `At the same 12% annual rate:\n\n  Daily      earns the most\n  Monthly    earns more than Quarterly\n  Quarterly  earns more than Semi-Annually\n  Semi-Ann.  earns more than Annually\n  Annually   earns the least\n\nReason: More frequent compounding means each period's interest starts earning more interest sooner — the snowball effect is faster.\n\nExample (₹10,000 at 12% after 1 year):\n  Annually  → ₹11,200.00\n  Monthly   → ₹11,268.25\n  Daily     → ₹11,274.75`,
  },
  {
    title: '12. Upcoming Transactions',
    icon: '⏰',
    content: `If you set a future date when creating a transaction, it goes to the "Upcoming" tab.\n\nAt midnight on that date, it automatically moves to "Current" (or "Interest" if it has a rate set) and you'll receive a notification.`,
  },
  {
    title: '13. Shared Entries (↓ tab)',
    icon: '🔗',
    content: `The Shared Entries tab shows entries that OTHER people created with YOUR phone number.\n\n• These are view-only — you cannot edit them\n• They update in real-time when the other person makes changes`,
  },
  {
    title: '14. Deleting a Person',
    icon: '🗑️',
    content: `Tap ⚙ on a person's page → Delete.\n\n• The person is NOT immediately deleted\n• A 24-hour timer starts\n• You can undo this within 24 hours from the home screen\n• After 24 hours, the person and all their transactions are permanently removed`,
  },
  {
    title: '15. Notifications',
    icon: '🔔',
    content: `The bell tab shows all your notifications:\n\n• Transaction updates\n• Support replies\n• App updates\n• Account activation\n• Announcements\n\nTap any notification to go to the relevant page.`,
  },
  {
    title: '16. Support Chat',
    icon: '💬',
    content: `Settings → Support Chat\n\nSend a message to the admin at any time. You'll receive a notification when they reply.`,
  },
  {
    title: '17. Dark Mode',
    icon: '🌙',
    content: `Settings → Preferences → Dark Mode\n\nToggle between light and dark mode. By default, the app follows your system preference.`,
  },
  {
    title: '18. Privacy & Security',
    icon: '🔒',
    content: `Your data is completely private:\n\n• All connections are encrypted (HTTPS)\n• Passwords are never stored in plain text\n• Only your family members can access the app\n• You can delete your account any time from Settings`,
  },
  {
    title: '19. Active Devices',
    icon: '📱',
    content: `Settings → Active Devices\n\nSee all devices where your account is signed in. You can remove any device at any time — this signs it out immediately.\n\nYou stay signed in until you manually sign out or remove the device. There is no automatic timeout.`,
  },
];

export default function UserManualPage() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--bg-primary)' }}>
      <PageNavigationBar title="User Manual" onBack={() => navigate(-1)} />

      <div style={{ padding: '16px', flex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
          <img
            src="/logo.png"
            alt="Credit Book"
            style={{ width: 64, height: 64, objectFit: 'contain', margin: '0 auto 12px', display: 'block' }}
          />
          <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--label-primary)' }}>
            Credit Book
          </h1>
          <p style={{ fontSize: 14, color: 'var(--label-secondary)', marginTop: 4 }}>
            User Manual · v2.0.0
          </p>
        </div>

        {/* Interest Formula Highlight Card */}
        <div style={{
          background: 'linear-gradient(135deg, hsl(38,90%,48%), hsl(32,85%,40%))',
          borderRadius: 16, padding: '18px 20px', marginBottom: 16,
          boxShadow: '0 4px 16px hsla(38,90%,48%,0.28)',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600, letterSpacing: 0.5, marginBottom: 6 }}>
            INTEREST FORMULA USED IN THIS APP
          </div>
          <div style={{ color: 'white', fontFamily: 'var(--font-mono, monospace)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            A = P × (1 + R/n)^(n × T)
          </div>
          <div style={{ color: 'rgba(255,255,255,0.80)', fontSize: 13, lineHeight: 1.5 }}>
            Universal standard compound interest formula — same as CAGR, Nifty 50, MFs, and Excel FV().
            Uses exact calendar days ÷ 365 for T. No rounding of intermediate values.
          </div>
        </div>

        {/* Sections — collapsible */}
        {SECTIONS.map((section, i) => {
          const isOpen = expanded === i;
          const isInterestSection = i >= 5 && i <= 10; // sections 6-11

          return (
            <div
              key={i}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 13,
                marginBottom: 10,
                boxShadow: 'var(--shadow-xs)',
                animation: `rowAppear 300ms ease both`,
                animationDelay: `${i * 20}ms`,
                overflow: 'hidden',
                border: isInterestSection ? '1.5px solid hsla(38,80%,55%,0.25)' : '1.5px solid transparent',
              }}
            >
              {/* Title row — always visible */}
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{section.icon}</span>
                <span style={{
                  flex: 1, fontSize: 15, fontWeight: 600,
                  fontFamily: 'var(--font-display)', color: 'var(--label-primary)',
                }}>
                  {section.title}
                </span>
                <span style={{
                  color: 'var(--label-tertiary)', fontSize: 18, fontWeight: 300,
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  flexShrink: 0,
                }}>›</span>
              </button>

              {/* Content — visible when expanded */}
              {isOpen && (
                <div style={{
                  padding: '0 16px 16px 52px',
                  fontSize: 14, color: 'var(--label-secondary)',
                  lineHeight: 1.7, whiteSpace: 'pre-line',
                  borderTop: '1px solid var(--separator)',
                  paddingTop: 12,
                }}>
                  {/* Special: formula sections get monospace code block */}
                  {section.title.includes('Formula') ? (
                    <div>
                      {section.content.split('\n').map((line, li) => {
                        const isFormula = line.trim().startsWith('A =') || line.trim().startsWith('P =') || line.trim().startsWith('R =') || line.trim().startsWith('n =') || line.trim().startsWith('T =');
                        return (
                          <div key={li} style={{
                            fontFamily: isFormula ? 'var(--font-mono, monospace)' : 'inherit',
                            background: isFormula ? 'var(--fill-tertiary)' : 'transparent',
                            borderRadius: isFormula ? 6 : 0,
                            padding: isFormula ? '2px 8px' : '0',
                            marginBottom: isFormula ? 4 : 0,
                            color: isFormula ? 'var(--label-primary)' : 'var(--label-secondary)',
                            fontWeight: isFormula ? 600 : 400,
                            fontSize: isFormula ? 13 : 14,
                          }}>
                            {line}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    section.content
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--label-tertiary)', fontSize: 12 }}>
          Credit Book
        </div>
      </div>
    </div>
  );
}

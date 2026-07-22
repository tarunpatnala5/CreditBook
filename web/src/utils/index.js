// Credit Book — Utility Functions
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// ─── Currency formatting ───────────────────────────────────────────────────
export function formatCurrency(amount, showSign = false) {
  const num = Math.abs(parseFloat(amount) || 0);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);

  if (showSign && amount < 0) return `-₹${formatted}`;
  return `₹${formatted}`;
}

// ─── Date formatting ───────────────────────────────────────────────────────
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  if (isToday(d)) return `Today • ${format(d, 'hh:mm a')}`;
  if (isYesterday(d)) return `Yesterday • ${format(d, 'hh:mm a')}`;
  return format(d, 'dd MMM yy • hh:mm a');
}

export function formatDateShort(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  if (isToday(d)) return `Today`;
  if (isYesterday(d)) return `Yesterday`;
  return format(d, 'dd MMM yyyy');
}

export function formatRelative(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatTime(date) {
  if (!date) return '';
  return format(new Date(date), 'hh:mm a');
}

// ─── Avatar color from name ────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759',
  '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'
];

export function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name = '') {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// ─── Device icon ───────────────────────────────────────────────────────────
export function getDeviceIcon(deviceType) {
  switch (deviceType) {
    case 'android': return '📱';
    case 'ios': return '';
    case 'web': return '🌐';
    default: return '💻';
  }
}

// ─── Phone number formatting ───────────────────────────────────────────────
export function formatPhone(phone = '') {
  if (!phone) return '';
  // Strip any country code prefix (+91 or 91) in case old data has it
  let clean = phone.replace(/\D/g, '');
  if (clean.length === 12 && clean.startsWith('91')) clean = clean.slice(2);
  if (clean.length === 11 && clean.startsWith('0')) clean = clean.slice(1);
  // Format as "XXXXX XXXXX" for 10-digit numbers
  if (clean.length === 10) return `${clean.slice(0, 5)} ${clean.slice(5)}`;
  return clean || phone;
}

// ─── Class names helper ────────────────────────────────────────────────────
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

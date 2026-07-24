// Credit Book — Shared UI Components
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils';
import './Components.css';


/* ══════════════════════════════════════════════════════════
   BUTTON
══════════════════════════════════════════════════════════ */
export function Button({ children, variant = 'primary', size = 'md', loading, disabled, onClick, id, fullWidth, style, className, type = 'submit' }) {
  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('btn', `btn-${variant}`, `btn-${size}`, fullWidth && 'btn-full', className)}
      style={style}
    >
      {loading ? <Spinner size={16} color="currentColor" /> : children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   SPINNER
══════════════════════════════════════════════════════════ */
export function Spinner({ size = 20, color }) {
  return (
    <svg
      className="spinner"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'var(--app-accent)'}
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" opacity="0.4" />
      <path d="M12 2v4" stroke={color || 'var(--app-accent)'} strokeWidth="2.5" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════
   AVATAR
══════════════════════════════════════════════════════════ */
export function Avatar({ name = '', color, size = 44, style }) {
  const initials = (() => {
    const words = name.trim().split(/\s+/);
    if (!words[0]) return '?';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  })();

  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color || '#007AFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: size * 0.38,
        fontWeight: 600,
        fontFamily: 'var(--font-rounded)',
        flexShrink: 0,
        letterSpacing: -0.5,
        ...style,
      }}
    >
      {initials}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TOGGLE (iOS-style)
══════════════════════════════════════════════════════════ */
export function Toggle({ checked, onChange, id }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      className={cn('toggle', checked && 'toggle-on')}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-knob" />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   TEXT FIELD
══════════════════════════════════════════════════════════ */
export function TextField({ label, value, onChange, placeholder, type = 'text', error, id, autoFocus, inputMode, maxLength, prefix, onEnter, autoComplete = 'off', autoCapitalize }) {
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={cn('text-field', error && 'text-field-error')}>
      {label && <label className="text-field-label" htmlFor={id}>{label}</label>}
      <div className="text-field-input-wrap">
        {prefix && <span className="text-field-prefix">{prefix}</span>}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onEnter ? (e) => { if (e.key === 'Enter') { e.preventDefault(); onEnter(); } } : undefined}
          placeholder={placeholder}
          autoFocus={autoFocus}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoCorrect="off"
          autoCapitalize={autoCapitalize ?? 'off'}
          spellCheck="false"
          data-form-type="other"
          style={isPassword ? { paddingRight: 40 } : undefined}
        />
        {isPassword && (
          <button
            type="button"
            className="text-field-eye"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <span className="text-field-error-msg">{error}</span>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   BOTTOM SHEET
   Navigation flicker fix: module-level registry lets the
   tab nav call _forceCloseAllSheets() BEFORE navigate(),
   bypassing React's async effect scheduling entirely.
══════════════════════════════════════════════════════════ */
const _sheets = new Set();

export function _forceCloseAllSheets() {
  _sheets.forEach(fn => fn());
}

export function BottomSheet({ isOpen, onClose, title, children, height }) {
  const [visible, setVisible] = useState(isOpen);
  const [anim, setAnim]       = useState(isOpen ? 'entering' : '');
  const timerRef = useRef(null);

  // Register forceClose — called by tab nav BEFORE navigate()
  useEffect(() => {
    const forceClose = () => {
      clearTimeout(timerRef.current);
      setVisible(false);
      setAnim('');
      document.body.style.overflow = '';
    };
    _sheets.add(forceClose);
    return () => _sheets.delete(forceClose);
  }, []);

  // Respond to isOpen prop changes
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => setAnim('entering'));
      document.body.style.overflow = 'hidden';
    } else if (visible) {
      // Animate out only if we're currently showing
      setAnim('leaving');
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setAnim('');
      }, 360);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!visible) return null;

  return createPortal(
    <div
      className={cn(
        'sheet-overlay backdrop',
        anim === 'entering' && 'backdrop-in',
        anim === 'leaving'  && 'backdrop-out',
      )}
      onClick={onClose}
      style={{ zIndex: 200 }}
    >
      <div
        className={cn('bottom-sheet', anim === 'entering' && 'sheet-enter', anim === 'leaving' && 'sheet-exit')}
        style={{ maxHeight: height || '90dvh', zIndex: 201 }}
        onClick={(e) => e.stopPropagation()}
      >

        {title && (
          <div className="sheet-header">
            <span className="sheet-title">{title}</span>
            <button className="sheet-close" onClick={onClose} id="sheet-close-btn">✕</button>
          </div>
        )}
        <div className="sheet-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/* ══════════════════════════════════════════════════════════
   DIALOG / ALERT (reference-matched pill-button style)
══════════════════════════════════════════════════════ */
export function Dialog({ isOpen, title, message, actions, onClose }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Enter = confirm primary action, Escape = close
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Fire the last action (the confirm/primary action)
        const primary = actions?.[actions.length - 1];
        if (primary?.onClick) primary.onClick();
      } else if (e.key === 'Escape') {
        onClose?.();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, actions, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="dialog-overlay backdrop"
      style={{ zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        className="dialog alert-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title + message */}
        <div className="dialog-content">
          {title && <h3 className="dialog-title">{title}</h3>}
          {message && <p className="dialog-message">{message}</p>}
        </div>
        {/* Pill buttons row */}
        <div className="dialog-actions">
          {actions.map((action, i) => (
            <button
              key={i}
              id={action.id || `dialog-action-${i}`}
              className={cn(
                'dialog-action',
                action.destructive && 'dialog-action-destructive',
                !action.destructive && i === 0 && 'dialog-action-primary',
              )}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ══════════════════════════════════════════════════════════
   BADGE
══════════════════════════════════════════════════════════ */
export function Badge({ count }) {
  if (!count || count <= 0) return null;
  return (
    <span className="badge">
      {count > 99 ? '99+' : count}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════
   SKELETON / LOADING
══════════════════════════════════════════════════════════ */
export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 12 }}>
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '60%', height: 16, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '40%', height: 12 }} />
      </div>
      <div className="skeleton" style={{ width: 70, height: 20 }} />
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
      <Spinner size={32} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════════════════ */
export function EmptyState({ icon, title, body, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {body && <p className="empty-state-body">{body}</p>}
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick} style={{ marginTop: 12 }}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION (Apple grouped list section)
══════════════════════════════════════════════════════════ */
export function Section({ title, footer, children }) {
  return (
    <div className="section">
      {title && <div className="section-header">{title}</div>}
      <div className="list-card">
        {children}
      </div>
      {footer && <div className="section-footer">{footer}</div>}
    </div>
  );
}

export function Row({ icon, label, value, onClick, chevron = true, destructive, id, children }) {
  return (
    <div className={cn('list-row', destructive && 'list-row-destructive')} onClick={onClick} id={id}>
      <span className="list-row-icon">{icon}</span>
      <span className="list-row-label" style={destructive ? { color: 'var(--color-red)' } : {}}>{label}</span>
      {children}
      {value !== undefined && <span className="list-row-value">{value}</span>}
      {chevron && onClick && (
        <span className="list-row-chevron">
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1l5 5-5 5" />
          </svg>
        </span>
      )}
    </div>
  );
}

// Credit Book — App Layout with NavigationBar and PillTabBar
import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi, usersApi } from '../../api';
import useAuthStore from '../../store/authStore';
import { _forceCloseAllSheets } from '../ui/Components';
import './Layout.css';

/// ─── Clean SVG Tab Icons ──────────────────────────────────────────────
const TabIcons = {
  // Same shape in both states — filled house when active (blue), filled house when inactive (gray)
  // Color comes from CSS via currentColor
  home: ({ active }) => (
    <svg className="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H15v-5h-6v5H4a1 1 0 0 1-1-1V9.5z"
        fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} />
    </svg>
  ),

  // Apple iOS share icon: box with upward arrow
  shared: ({ active }) => (
    <svg className="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.25 15H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3.25" />
      <path d="M12 9v11" />
      <path d="M9 17l3 3 3-3" />
    </svg>
  ),

  notifications: ({ active }) => (
    <svg className="tab-icon-svg" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"
      fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth="1.75">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.75} />
    </svg>
  ),

  settings: ({ active }) => (
    <svg className="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" fill={active ? 'currentColor' : 'none'} />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

// ─── Tab Config ────────────────────────────────────────────────────────────
function useTabs() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const { data: notifData } = useQuery({
    queryKey: ['notification-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 15000,
    staleTime: 0,
    select: (d) => d?.data,
  });

  const { data: adminCounts } = useQuery({
    queryKey: ['admin-counts'],
    queryFn: () => usersApi.getAdminCounts(),
    select: (d) => d?.data,
    refetchInterval: 15000,
    staleTime: 0,
    enabled: isAdmin,
  });

  const unreadTotal    = notifData?.total || 0;
  const supportUnread  = notifData?.byCategory?.support || 0;
  const alertsBadge    = unreadTotal - supportUnread;   // alerts tab: exclude support notifications
  const settingsBadge  = isAdmin
    ? (adminCounts?.pendingUsers || 0) + (adminCounts?.pendingReset || 0) + (adminCounts?.supportUnread || 0)
    : supportUnread;                                    // regular users: support chat unread on Settings

  return [
    { path: '/',             id: 'home',          label: 'My Book' },
    { path: '/shared',       id: 'shared',        label: 'Shared' },
    { path: '/notifications',id: 'notifications', label: 'Alerts', badge: alertsBadge },
    { path: '/settings',     id: 'settings',      label: 'Settings', badge: settingsBadge },
  ];
}

function isActive(tabPath, currentPath) {
  if (tabPath === '/') return currentPath === '/';
  return currentPath.startsWith(tabPath);
}

// ─── Mobile Bottom Pill Nav ────────────────────────────────────────────────
function PillTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = useTabs();
  const activeIndex = tabs.findIndex((tab) => isActive(tab.path, location.pathname));

  const navRef = useRef(null);
  const tabRefs = useRef([]);
  const [indicator, setIndicator] = useState({ x: 0, w: 0, ready: false, slide: false });
  const mounted = useRef(false);

  function measure(slide) {
    const tabEl = tabRefs.current[activeIndex];
    const navEl = navRef.current;
    if (!tabEl || !navEl) return;
    const tabRect = tabEl.getBoundingClientRect();
    const navRect = navEl.getBoundingClientRect();
    // The indicator is position:absolute inside the nav, so left:0 is the
    // nav's *padding* edge.  But getBoundingClientRect() returns the
    // *border* edge.  Subtract the border so the indicator lands exactly
    // on the tab — giving equal gaps on every side (left, right, top, bottom).
    // Don't Math.round — translateX handles sub-pixels perfectly and
    // independent rounding of x & w caused the last tab's right gap to
    // shrink by up to 1px vs the first tab's left gap.
    const borderLeft = navEl.clientLeft || 0;
    setIndicator({
      x: tabRect.left - navRect.left - borderLeft,
      w: tabRect.width,
      ready: true,
      slide: !!slide,
    });
  }

  useLayoutEffect(() => {
    const isFirstPaint = !mounted.current;
    if (!mounted.current) mounted.current = true;

    // Single rAF is enough now that the pill uses opacity-only fadeIn (no scale transform).
    // On first paint → place indicator instantly (no slide). On tab switch → slide.
    const id = requestAnimationFrame(() => measure(!isFirstPaint));
    return () => cancelAnimationFrame(id);
  }, [activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-measure on resize — instant snap
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(() => {
      if (mounted.current) measure(false);
    });
    ro.observe(nav);
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleNavigate(path) {
    _forceCloseAllSheets();
    navigate(path);
  }

  return (
    <div className="pill-nav-wrapper">
      <nav className="pill-nav" role="navigation" aria-label="Main navigation" ref={navRef}>
        {/* Grey indicator pill — slides to active tab */}
        <div
          className="pill-nav-indicator"
          style={{
            transform: `translateX(${indicator.x}px)`,
            width: indicator.w,
            opacity: indicator.ready ? 1 : 0,
            transition: indicator.slide
              ? 'transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94), width 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 150ms ease'
              : 'opacity 150ms ease',
          }}
        />
        {tabs.map((tab, i) => {
          const active = i === activeIndex;
          const Icon = TabIcons[tab.id];
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              className={`pill-tab${active ? ' active' : ''}`}
              onClick={() => handleNavigate(tab.path)}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              ref={(el) => (tabRefs.current[i] = el)}
            >
              <span className="pill-tab-icon">
                <Icon active={active} />
                {tab.badge > 0 && (
                  <span className="pill-tab-badge">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </span>
              <span className="pill-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}


// ─── Desktop Sidebar Nav (macOS System Preferences style) ─────────────────
function DesktopSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = useTabs();

  function handleNavigate(path) {
    _forceCloseAllSheets();
    navigate(path);
  }

  return (
    <aside className="desktop-sidebar" role="navigation" aria-label="Main navigation">
      {/* Sidebar header — logo + app name */}
      <div className="desktop-sidebar-header">
        <img src="/logo.png" alt="Credit Book" className="sidebar-logo-img" aria-hidden="true" />
        <span className="sidebar-app-name">Credit Book</span>
      </div>

      {/* Nav items */}
      <nav className="sidebar-nav">
        {tabs.map((tab) => {
          const active = isActive(tab.path, location.pathname);
          const Icon = TabIcons[tab.id];
          return (
            <button
              key={tab.id}
              id={`sidebar-tab-${tab.id}`}
              className={`sidebar-nav-item${active ? ' active' : ''}`}
              onClick={() => handleNavigate(tab.path)}
              aria-current={active ? 'page' : undefined}
            >
              <span className="sidebar-item-icon">
                <Icon active={active} />
                {tab.badge > 0 && (
                  <span className="sidebar-item-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>
                )}
              </span>
              <span className="sidebar-item-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// ─── App Layout ────────────────────────────────────────────────────────────
export default function AppLayout() {
  const location = useLocation();

  // Sub-pages that have their own back button and don't need the bottom pill:
  const NO_PILL_PATHS = ['/settings/support', '/settings/manual'];
  const isSubPage = NO_PILL_PATHS.some((p) => location.pathname.startsWith(p));

  const showNav = !isSubPage && ['/', '/shared', '/notifications', '/settings'].some(
    (p) => p === location.pathname || (p !== '/' && location.pathname.startsWith(p))
  );

  return (
    <div className="app-layout">
      {/* Desktop sidebar — hidden on mobile */}
      <DesktopSidebar />

      {/* Main content column */}
      <div className="app-main-column">
        {/* Sub-pages manage their own full-screen layout; don't add pill padding */}
        <div className={`page-content${isSubPage ? ' page-content-subpage' : ' page-content-padded'}`}>
          <Outlet />
        </div>
        {showNav && <PillTabBar />}
      </div>
    </div>
  );
}

// ─── NavigationBar (Home page — no desktop tab nav, sidebar handles it) ─────
export function NavigationBar({ title, logo, onSearch, onAdd, onAction, actionLabel, searchActive, onSearchChange, searchValue, onSearchClose, titleBadge }) {
  return (
    <div className="nav-bar">
      {!searchActive ? (
        <>
          {/* Left: logo + title */}
          <div className="nav-left">
            {logo && (
              <img
                src="/logo.png"
                alt="Credit Book"
                className="nav-logo-img"
                aria-hidden="true"
              />
            )}
            <span className="nav-title">{title}</span>
            {titleBadge && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'hsla(214, 100%, 54%, 0.12)',
                color: 'hsl(214, 80%, 48%)',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                borderRadius: 20,
                padding: '3px 8px',
                marginLeft: 6,
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}>
                {titleBadge}
              </span>
            )}
          </div>

          {/* Right: action buttons */}
          <div className="nav-right">
            {onSearch && (
              <button className="nav-icon-btn" onClick={onSearch} aria-label="Search" id="nav-search-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            )}
            {onAdd && (
              <button className="nav-icon-btn" onClick={onAdd} aria-label="Add" id="nav-add-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            )}
            {onAction && (
              <button
                className="nav-cancel-btn"
                onClick={onAction}
                id="nav-action-btn"
              >
                {actionLabel || 'Done'}
              </button>
            )}
          </div>
        </>
      ) : (
        /* Search active state */
        <div className="nav-search-container">
          <div className="nav-search-field">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--label-tertiary)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search people..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              id="home-search-input"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              inputMode="search"
              data-form-type="other"
            />
            {searchValue && (
              <button onClick={() => onSearchChange('')} style={{ color: 'var(--label-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          <button className="nav-cancel-btn" onClick={onSearchClose} id="search-cancel-btn">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PageNavigationBar (sub-pages with back button) ────────────────────────
export function PageNavigationBar({ title, onBack, action, actionLabel }) {
  const navigate = useNavigate();
  return (
    <div className="nav-bar-page">
      <button className="nav-back-btn" onClick={onBack || (() => navigate(-1))} id="nav-back-btn" aria-label="Back">
        <svg width="9" height="15" viewBox="0 0 9 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 1L1 8l7 7" />
        </svg>
      </button>
      <span className="nav-page-title">{title}</span>
      {action ? (
        <button className="nav-page-action" onClick={action} id="nav-action-btn">
          {actionLabel}
        </button>
      ) : (
        <div style={{ width: 60 }} />
      )}
    </div>
  );
}

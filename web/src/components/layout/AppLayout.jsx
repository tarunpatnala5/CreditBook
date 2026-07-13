// Credit Book — App Layout with NavigationBar and PillTabBar
import React, { useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../api';
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
  const { data: notifData } = useQuery({
    queryKey: ['notification-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30000,
    select: (d) => d?.data,
  });
  const unreadCount = notifData?.total || 0;

  return [
    { path: '/',             id: 'home',          label: 'My Book' },
    { path: '/shared',       id: 'shared',        label: 'Shared' },
    { path: '/notifications',id: 'notifications', label: 'Alerts', badge: unreadCount },
    { path: '/settings',     id: 'settings',      label: 'Settings' },
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

  function handleNavigate(path) {
    _forceCloseAllSheets(); // directly force-close any open sheet before route change
    navigate(path);
  }

  return (
    <div className="pill-nav-wrapper">
      <nav className="pill-nav" role="navigation" aria-label="Main navigation">
        {tabs.map((tab) => {
          const active = isActive(tab.path, location.pathname);
          const Icon = TabIcons[tab.id];
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              className={`pill-tab${active ? ' active' : ''}`}
              onClick={() => handleNavigate(tab.path)}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <span className="pill-tab-icon">
                <Icon active={active} />
              </span>
              <span className="pill-tab-label">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="pill-tab-badge">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ─── Desktop Tab Nav (inside top bar, center) ──────────────────────────────
function DesktopTabNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = useTabs();

  function handleNavigate(path) {
    _forceCloseAllSheets(); // directly force-close any open sheet before route change
    navigate(path);
  }

  return (
    <nav className="desktop-tab-nav" role="navigation" aria-label="Main navigation">
      {tabs.map((tab) => {
        const active = isActive(tab.path, location.pathname);
        const Icon = TabIcons[tab.id];
        return (
          <button
            key={tab.id}
            id={`desktop-tab-${tab.id}`}
            className={`desktop-tab-btn${active ? ' active' : ''}`}
            onClick={() => handleNavigate(tab.path)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon active={active} />
            {tab.label}
            {tab.badge > 0 && (
              <span className="desktop-tab-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ─── App Layout ────────────────────────────────────────────────────────────
export default function AppLayout() {
  const location = useLocation();

  const showNav = ['/', '/shared', '/notifications', '/settings'].some(
    (p) => p === location.pathname || (p !== '/' && location.pathname.startsWith(p))
  );

  return (
    <div className="app-layout">
      <div className="page-content page-content-padded">
        <Outlet />
      </div>
      {showNav && <PillTabBar />}
    </div>
  );
}

// ─── NavigationBar (Home page — with Desktop Tab Nav embedded) ─────────────
export function NavigationBar({ title, logo, onSearch, onAdd, onAction, actionLabel, searchActive, onSearchChange, searchValue, onSearchClose }) {
  const location = useLocation();

  // Only show desktop tabs on main app pages
  const showDesktopTabs = ['/', '/shared', '/notifications', '/settings'].some(
    (p) => p === location.pathname || (p !== '/' && location.pathname.startsWith(p))
  );

  return (
    <div className="nav-bar">
      {!searchActive ? (
        <>
          {/* Left: logo + title */}
          <div className="nav-left">
            {logo && (
              <img
                src="/logo.jpg"
                alt="Credit Book"
                className="nav-logo-img"
                aria-hidden="true"
              />
            )}
            <span className="nav-title">{title}</span>
          </div>

          {/* Center: desktop tab nav — absolutely centered, hidden on mobile */}
          {showDesktopTabs && (
            <div style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
            }}>
              <DesktopTabNav />
            </div>
          )}

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
              type="text"
              placeholder="Search people..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              id="home-search-input"
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
      <button className="nav-back-btn" onClick={onBack || (() => navigate(-1))} id="nav-back-btn">
        <svg width="9" height="15" viewBox="0 0 9 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 1L1 8l7 7" />
        </svg>
        Back
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

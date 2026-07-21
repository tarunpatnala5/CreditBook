// Credit Book — Settings Page (Tab 4)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi, usersApi, notificationsApi } from '../../api';
import { NavigationBar } from '../../components/layout/AppLayout';
import useAuthStore from '../../store/authStore';
import useSettingsStore from '../../store/settingsStore';
import { formatRelative, getDeviceIcon, formatPhone } from '../../utils';
import { registerModalCloser } from '../../utils/navigationCallbacks';
import {
  Avatar, Toggle, BottomSheet, TextField, Button,
  Dialog, Section, Row, Badge, Spinner, LoadingScreen,
} from '../../components/ui/Components';
import './Settings.css';

// ─── Edit Field Sheet ──────────────────────────────────────────────────────
function EditFieldSheet({ isOpen, onClose, title, initialValue, onSave, loading, label, placeholder, type = 'text', inputMode }) {
  const [value, setValue] = useState(initialValue || '');
  React.useEffect(() => { setValue(initialValue || ''); }, [initialValue]);

  function handleSubmit(e) {
    e.preventDefault();
    onSave(value);
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} autoComplete="off">
        <TextField id="edit-field-input" label={label} value={value} onChange={setValue} placeholder={placeholder} type={type} inputMode={inputMode} autoFocus />
        <Button id="edit-field-save" variant="primary" size="md" fullWidth loading={loading}>
          Save
        </Button>
      </form>
    </BottomSheet>
  );
}

// ─── Devices Section ───────────────────────────────────────────────────────
function DevicesSection() {
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => authApi.getSessions(),
    select: (d) => d?.data,
  });
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [logoutAllDialog, setLogoutAllDialog] = useState(false);

  const { mutate: revokeSession } = useMutation({
    mutationFn: (sessionId) => authApi.revokeSession(sessionId),
    onMutate: (sessionId) => setRemovingId(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Device removed');
      setRemovingId(null);
    },
    onError: (err) => { toast.error(err.message); setRemovingId(null); },
  });

  const { mutate: logoutAll } = useMutation({
    mutationFn: () => authApi.logoutAll(),
    onSuccess: () => {
      toast.success('All devices signed out');
      setLogoutAllDialog(false);
      useAuthStore.getState().logout();
      window.location.href = '/login';
    },
  });

  const sessions = sessionsData || [];

  return (
    <>
      <Section title="SECURITY">
        {/* Devices — opens a BottomSheet popup */}
        <Row
          id="devices-row"
          icon="📱"
          label="Devices"
          value={isLoading ? '' : String(sessions.length)}
          onClick={() => setSheetOpen(true)}
        />
      </Section>

      {/* Devices popup sheet */}
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="Devices">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><Spinner size={24} /></div>
        ) : sessions.length === 0 ? (
          <div style={{ fontSize: 14, color: 'var(--label-secondary)', textAlign: 'center', padding: '12px 0' }}>No active sessions</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {sessions.map((session, i) => (
              <div key={session.id} className="device-row" style={{ paddingLeft: 0 }}>
                {i > 0 && <div style={{ position: 'absolute', top: 0, left: 40, right: 0, height: '0.5px', background: 'var(--separator)' }} />}
                <span className="device-icon">{getDeviceIcon(session.deviceType)}</span>
                <div className="device-info">
                  <div className="device-name">
                    {session.deviceName}
                    {session.isCurrent && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--app-accent)', fontWeight: 600 }}>This Device</span>}
                  </div>
                  <div className="device-meta">
                    Active {formatRelative(session.lastActiveAt)}
                  </div>
                </div>
                <button
                  className="device-remove-btn"
                  onClick={() => revokeSession(session.id)}
                  id={`remove-device-${session.id}`}
                  disabled={removingId === session.id}
                >
                  {removingId === session.id ? <Spinner size={14} /> : 'Remove'}
                </button>
              </div>
            ))}
            {sessions.length > 1 && (
              <div style={{ paddingTop: 16, borderTop: '0.5px solid var(--separator)', marginTop: 8 }}>
                <button
                  onClick={() => setLogoutAllDialog(true)}
                  style={{ color: 'var(--color-red)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-text)' }}
                  id="logout-all-devices-btn"
                >
                  Sign out all devices
                </button>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      <Dialog
        isOpen={logoutAllDialog}
        title="Sign Out All Devices?"
        message="This will sign you out of all devices including this one."
        onClose={() => setLogoutAllDialog(false)}
        actions={[
          { label: 'Cancel', onClick: () => setLogoutAllDialog(false) },
          { label: 'Sign Out All', destructive: true, bold: true, onClick: () => logoutAll() },
        ]}
      />
    </>
  );
}


// ─── Settings Page ─────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout: storeLogout } = useAuthStore();
  const { darkMode, setDarkMode } = useSettingsStore();

  const [editNameOpen, setEditNameOpen] = useState(false);
  const [editPhoneOpen, setEditPhoneOpen] = useState(false);
  const [editEmailOpen, setEditEmailOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Register synchronous modal closer — called BEFORE navigate() fires in tab nav
  useEffect(() => {
    return registerModalCloser(() => {
      setEditNameOpen(false);
      setEditPhoneOpen(false);
      setEditEmailOpen(false);
    });
  }, []);

  // Fetch unread support count
  const { data: notifData } = useQuery({
    queryKey: ['notification-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    select: (d) => d?.data,
    refetchInterval: 30000,
  });

  const unreadTotal = notifData?.total || 0;
  const updateCount = notifData?.byCategory?.update || 0;
  const supportCount = notifData?.byCategory?.support || 0;

  const { mutate: updateUser, isPending: isUpdatingUser } = useMutation({
    mutationFn: (data) => usersApi.updateMe(data),
    onSuccess: (res) => {
      useAuthStore.getState().updateUser(res.data);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated');
      setEditNameOpen(false);
      setEditPhoneOpen(false);
      setEditEmailOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: logoutMutation, isPending: isLoggingOut } = useMutation({
    mutationFn: () => {
      const refreshToken = localStorage.getItem('cb_refresh_token');
      return authApi.logout(refreshToken);
    },
    onSuccess: () => {
      storeLogout();
      navigate('/login', { replace: true });
    },
    onError: () => {
      storeLogout(); // Force logout even if API fails
      navigate('/login', { replace: true });
    },
  });

  const { mutate: deleteAccount, isPending: isDeletingAccount } = useMutation({
    mutationFn: () => usersApi.deleteMe(),
    onSuccess: () => {
      storeLogout();
      navigate('/login', { replace: true });
    },
    onError: (err) => toast.error(err.message),
  });

  const isAdmin = user?.role === 'admin';

  // Determine current dark mode state
  const isDark = darkMode === true ? true : darkMode === false ? false : window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div className="settings-page">
      {/* Nav Bar — NavigationBar injects desktop tab nav on ≥768px */}
      <NavigationBar title="Settings" />

      <div className="settings-sections">
        {/* ── Profile Card (Apple Settings style) ── */}
        <div style={{ padding: '16px 0 4px' }}>
          <div className="settings-profile-row" onClick={() => setEditNameOpen(true)}>
            <Avatar name={user?.name || ''} color={user?.avatarColor} size={62} />
            <div className="settings-profile-info">
              <div className="settings-profile-name">{user?.name}</div>
              <div className="settings-profile-phone">{formatPhone(user?.phone)}</div>
              {isAdmin && <span className="settings-profile-role">ADMIN</span>}
            </div>
            <svg className="settings-profile-chevron" width="7" height="12" viewBox="0 0 7 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1l5 5.5L1 12" />
            </svg>
          </div>
        </div>


        {/* ── Profile Section ── */}
        <Section title="PROFILE">
          <Row id="edit-name-row" icon="👤" label="Name" value={user?.name} onClick={() => setEditNameOpen(true)} />
          <Row id="edit-phone-row" icon="📱" label="Phone" value={formatPhone(user?.phone)} onClick={() => setEditPhoneOpen(true)} />
          <Row id="edit-email-row" icon="✉️" label="Email" value={user?.email || '—'} onClick={() => setEditEmailOpen(true)} />
        </Section>

        {/* ── Preferences ── */}
        <Section title="PREFERENCES">
          <Row icon="🌙" label="Dark Mode" chevron={false}>
            <Toggle
              id="dark-mode-toggle"
              checked={isDark}
              onChange={(val) => setDarkMode(val ? true : false)}
            />
          </Row>
        </Section>

        {/* ── App ── */}
        <Section title="APP">
          <Row id="manual-row" icon="📖" label="User Manual" onClick={() => navigate('/settings/manual')} />
          <Row id="support-row" icon="💬" label="Support Chat" onClick={() => navigate('/settings/support')}>
            {supportCount > 0 && <Badge count={supportCount} />}
          </Row>
          <Row id="updates-row" icon="📦" label="Updates" onClick={() => toast('Updates coming soon!')}>
            {updateCount > 0 && <Badge count={updateCount} />}
          </Row>
        </Section>

        {/* ── Admin ── */}
        {isAdmin && (
          <Section title="ADMIN">
            <Row id="admin-users-row" icon="👥" label="Users" onClick={() => navigate('/admin/users')} />
            <Row id="admin-pending-row" icon="⏳" label="Pending Activations" onClick={() => navigate('/admin/pending')}>
              {notifData?.byCategory?.activation > 0 && <Badge count={notifData.byCategory.activation} />}
            </Row>
            <Row id="admin-support-row" icon="🎧" label="Support Requests" onClick={() => navigate('/admin/support')} />
            <Row id="admin-analytics-row" icon="📊" label="Analytics Dashboard" onClick={() => navigate('/admin/analytics')} />
          </Section>
        )}

        {/* ── Devices ── */}
        <DevicesSection />

        {/* ── Sign Out ── */}
        <div style={{ marginTop: 8 }}>
          <Section title="">
            <Row
              id="logout-row"
              label="Sign Out"
              onClick={() => setLogoutDialogOpen(true)}
              chevron={false}
            />
          </Section>
        </div>

        {/* ── Danger Zone ── */}
        <Section title="DANGER ZONE">
          <Row
            id="delete-account-row"
            label="Delete Account"
            onClick={() => setDeleteDialogOpen(true)}
            chevron={false}
            destructive
          />
        </Section>

        {/* Version */}
        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--label-tertiary)', fontSize: 12 }}>
          Credit Book v1.0.0
        </div>
      </div>

      {/* Edit Name Sheet */}
      <EditFieldSheet
        isOpen={editNameOpen}
        onClose={() => setEditNameOpen(false)}
        title="Edit Name"
        label="Full Name"
        initialValue={user?.name}
        placeholder="Your full name"
        onSave={(val) => updateUser({ name: val })}
        loading={isUpdatingUser}
      />

      {/* Edit Phone Sheet */}
      <EditFieldSheet
        isOpen={editPhoneOpen}
        onClose={() => setEditPhoneOpen(false)}
        title="Edit Phone Number"
        label="Phone Number"
        initialValue={user?.phone}
        placeholder="98765 43210"
        type="tel"
        inputMode="tel"
        onSave={(val) => updateUser({ phone: val })}
        loading={isUpdatingUser}
      />

      {/* Edit Email Sheet */}
      <EditFieldSheet
        isOpen={editEmailOpen}
        onClose={() => setEditEmailOpen(false)}
        title="Edit Email"
        label="Email Address"
        initialValue={user?.email}
        placeholder="you@example.com"
        type="email"
        inputMode="email"
        onSave={(val) => updateUser({ email: val })}
        loading={isUpdatingUser}
      />

      {/* Logout Dialog */}
      <Dialog
        isOpen={logoutDialogOpen}
        title="Sign Out?"
        message="You'll need to sign in again on this device."
        onClose={() => setLogoutDialogOpen(false)}
        actions={[
          { label: 'Cancel', onClick: () => setLogoutDialogOpen(false), id: 'logout-cancel' },
          { label: 'Sign Out', destructive: true, bold: true, onClick: () => logoutMutation(), id: 'logout-confirm' },
        ]}
      />

      {/* Delete Account Dialog */}
      <Dialog
        isOpen={deleteDialogOpen}
        title="Delete Account?"
        message="This permanently deletes your account and all your data. This cannot be undone."
        onClose={() => { setDeleteDialogOpen(false); setDeleteConfirmText(''); }}
        actions={[
          { label: 'Cancel', onClick: () => { setDeleteDialogOpen(false); setDeleteConfirmText(''); }, id: 'delete-cancel' },
          { label: 'Delete', destructive: true, bold: true, onClick: () => deleteAccount(), id: 'delete-confirm' },
        ]}
      />
    </div>
  );
}

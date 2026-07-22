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
function EditFieldSheet({ isOpen, onClose, title, initialValue, onSave, loading, label, placeholder, type = 'text', inputMode, maxLength }) {
  const [value, setValue] = useState(initialValue || '');
  React.useEffect(() => { setValue(initialValue || ''); }, [initialValue]);

  function handleSubmit(e) {
    e.preventDefault();
    onSave(value);
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} autoComplete="off">
        <TextField id="edit-field-input" label={label} value={value} onChange={setValue} placeholder={placeholder} type={type} inputMode={inputMode} maxLength={maxLength} autoFocus />
        <Button id="edit-field-save" variant="primary" size="md" fullWidth loading={loading}>
          Save
        </Button>
      </form>
    </BottomSheet>
  );
}

// ─── Change Password Sheet ─────────────────────────────────────────────────
function ChangePasswordSheet({ isOpen, onClose, userPhone }) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  // Forgot-password sub-state
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  React.useEffect(() => {
    if (!isOpen) { setCurrentPw(''); setNewPw(''); setConfirmPw(''); setError(''); }
  }, [isOpen]);

  function closeForgot() {
    setForgotOpen(false);
    setForgotError('');
    setForgotSent(false);
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => usersApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed! Signing you out of all devices...');
      onClose();
      // Sign out all devices (server already revoked all sessions)
      setTimeout(() => {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }, 1200);
    },
    onError: (err) => setError(err.message || 'Failed to change password'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!currentPw) { setError('Enter your current password'); return; }
    if (newPw.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (newPw !== confirmPw) { setError('Passwords do not match'); return; }
    mutate({ currentPassword: currentPw, newPassword: newPw });
  }

  async function handleForgotSubmit() {
    if (!userPhone) { setForgotError('Phone number not found on your account.'); return; }
    setForgotLoading(true);
    setForgotError('');
    try {
      await usersApi.forgotPassword(userPhone);
      setForgotSent(true);
    } catch (err) {
      setForgotError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Change Password">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} autoComplete="off">
          <TextField
            id="change-pw-current"
            label="Current Password"
            value={currentPw}
            onChange={setCurrentPw}
            placeholder="Enter current password"
            type="password"
            autoFocus
          />
          <TextField
            id="change-pw-new"
            label="New Password"
            value={newPw}
            onChange={setNewPw}
            placeholder="At least 6 characters"
            type="password"
          />
          <TextField
            id="change-pw-confirm"
            label="Confirm New Password"
            value={confirmPw}
            onChange={setConfirmPw}
            placeholder="Re-enter new password"
            type="password"
          />

          {error && (
            <div style={{ color: 'var(--color-red)', fontSize: 13, marginTop: -4 }}>{error}</div>
          )}

          <Button id="change-pw-save" variant="primary" size="md" fullWidth loading={isPending}>
            Update Password
          </Button>

          <button
            type="button"
            id="forgot-pw-btn"
            onClick={() => setForgotOpen(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--app-accent)', fontSize: 14,
              fontFamily: 'var(--font-text)', textAlign: 'center',
              padding: '4px 0',
            }}
          >
            Forgot Password?
          </button>
        </form>
      </BottomSheet>

      {/* Forgot Password Sheet — phone pre-filled since user is logged in */}
      <BottomSheet isOpen={forgotOpen} onClose={closeForgot} title="Reset Password">
        {forgotSent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 52 }}>✅</div>
            <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--label-primary)', margin: 0 }}>
              Request Submitted!
            </p>
            <p style={{ fontSize: 14, color: 'var(--label-secondary)', margin: 0, lineHeight: 1.7 }}>
              Your password reset link will be sent to your WhatsApp number shortly. The link is valid for <strong>48 hours</strong> and can only be used <strong>once</strong>.
            </p>
            <Button id="forgot-pw-ok-btn" variant="primary" size="md" fullWidth onClick={closeForgot}>
              Got It
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Phone display */}
            <div style={{
              background: 'var(--fill-secondary)',
              borderRadius: 16,
              padding: '20px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, color: 'var(--label-tertiary)', marginBottom: 6, fontWeight: 500 }}>
                Reset link will be sent to
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--label-primary)', letterSpacing: '0.5px' }}>
                {userPhone || '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--label-secondary)', marginTop: 4 }}>
                via WhatsApp
              </div>
            </div>

            <p style={{ fontSize: 14, color: 'var(--label-secondary)', margin: 0, lineHeight: 1.6, textAlign: 'center' }}>
              We'll notify the admin to send you a one-time password reset link. It will be valid for <strong>48 hours</strong>.
            </p>

            {forgotError && (
              <div style={{ color: 'var(--color-red)', fontSize: 13, textAlign: 'center' }}>{forgotError}</div>
            )}

            <Button
              id="forgot-pw-submit-settings"
              variant="primary"
              size="md"
              fullWidth
              loading={forgotLoading}
              onClick={handleForgotSubmit}
            >
              Send Reset Request
            </Button>
          </div>
        )}
      </BottomSheet>
    </>
  );
}


// ─── Devices Section ───────────────────────────────────────────────────────
function DevicesSection({ onDeleteAccount, onSignOut }) {
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => authApi.getSessions(),
    select: (d) => d?.data,
    staleTime: 0,
    refetchInterval: 30000,
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
        {/* Sign Out — between Devices and Delete Account */}
        <Row
          id="logout-row"
          label="Sign Out"
          onClick={onSignOut}
          chevron={false}
        />
        {/* Delete Account */}
        <Row
          id="delete-account-row"
          label="Delete Account"
          onClick={onDeleteAccount}
          chevron={false}
          destructive
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
  const isAdmin = user?.role === 'admin';

  const [editNameOpen, setEditNameOpen] = useState(false);
  const [editPhoneOpen, setEditPhoneOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Register synchronous modal closer — called BEFORE navigate() fires in tab nav
  useEffect(() => {
    return registerModalCloser(() => {
      setEditNameOpen(false);
      setEditPhoneOpen(false);
      setChangePasswordOpen(false);
    });
  }, []);

  // Fetch unread support count
  const { data: notifData } = useQuery({
    queryKey: ['notification-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    select: (d) => d?.data,
    refetchInterval: 15000,
    staleTime: 0,
  });

  // Fetch admin counts (pending users, pending pw-reset, total users)
  const { data: adminCounts } = useQuery({
    queryKey: ['admin-counts'],
    queryFn: () => usersApi.getAdminCounts(),
    select: (d) => d?.data,
    refetchInterval: 15000,
    staleTime: 0,
    enabled: isAdmin,
  });

  const unreadTotal = notifData?.total || 0;
  const supportCount = notifData?.byCategory?.support || 0;

  const { mutate: updateUser, isPending: isUpdatingUser } = useMutation({
    mutationFn: (data) => usersApi.updateMe(data),
    onSuccess: (res) => {
      useAuthStore.getState().updateUser(res.data);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated');
      setEditNameOpen(false);
      setEditPhoneOpen(false);
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
          <Row id="edit-pw-row" icon="🔑" label="Password" value="••••••" onClick={() => setChangePasswordOpen(true)} />
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

        <Section title="APP">
          {!isAdmin && (
            <Row id="support-row" icon="💬" label="Support Chat" onClick={() => navigate('/settings/support')}>
              {supportCount > 0 && <Badge count={supportCount} />}
            </Row>
          )}
          <Row id="manual-row" icon="📖" label="User Manual" onClick={() => navigate('/settings/manual')} />
        </Section>

        {/* ── Admin ── */}
        {isAdmin && (
          <Section title="ADMIN">
            <Row id="admin-users-row" icon="👥" label="Users" value={adminCounts?.totalUsers != null ? String(adminCounts.totalUsers) : ''} onClick={() => navigate('/admin/users')} />
            <Row id="admin-pending-row" icon="⏳" label="Pending Activations" onClick={() => navigate('/admin/pending')}>
              {(adminCounts?.pendingUsers || 0) > 0 && <Badge count={adminCounts.pendingUsers} />}
            </Row>
            <Row id="admin-support-row" icon="🎧" label="Support Requests" onClick={() => navigate('/admin/support')}>
              {(adminCounts?.supportUnread || 0) > 0 && <Badge count={adminCounts.supportUnread} />}
            </Row>
            <Row id="admin-reset-pw-row" icon="🔐" label="Password Reset Requests" onClick={() => navigate('/admin/password-reset')}>
              {(adminCounts?.pendingReset || 0) > 0 && <Badge count={adminCounts.pendingReset} />}
            </Row>
            <Row id="admin-analytics-row" icon="📊" label="Analytics Dashboard" onClick={() => navigate('/admin/analytics')} />
          </Section>
        )}

        {/* ── Devices + Security ── */}
        <DevicesSection
          onDeleteAccount={() => setDeleteDialogOpen(true)}
          onSignOut={() => setLogoutDialogOpen(true)}
        />
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

      <EditFieldSheet
        isOpen={editPhoneOpen}
        onClose={() => setEditPhoneOpen(false)}
        title="Edit Phone Number"
        label="Phone Number"
        initialValue={user?.phone}
        placeholder="98765 43210"
        type="tel"
        inputMode="tel"
        maxLength={10}
        onSave={(val) => updateUser({ phone: val })}
        loading={isUpdatingUser}
      />

      {/* Change Password Sheet */}
      <ChangePasswordSheet
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        userPhone={user?.phone}
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
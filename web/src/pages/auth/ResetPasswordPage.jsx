// Credit Book — Reset Password Page (landing page from WhatsApp link)
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { usersApi } from '../../api';
import { Button, TextField } from '../../components/ui/Components';
import './Auth.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState(false);

  useEffect(() => {
    if (!token) setError('Invalid reset link. Please request a new one.');
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await usersApi.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired or already been used.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <img src="/logo.png" alt="Credit Book" className="auth-logo" />
        <h1 className="auth-title">Credit Book</h1>
      </div>

      {success ? (
        <div className="auth-form" style={{ textAlign: 'center', gap: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 4 }}>🎉</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--label-primary)', margin: 0 }}>
            Password Reset!
          </h2>
          <p style={{ fontSize: 14, color: 'var(--label-secondary)', margin: 0, lineHeight: 1.6 }}>
            Your password has been changed successfully. You have been signed out of all devices for your security.
          </p>
          <Button
            id="reset-pw-login-btn"
            variant="primary"
            size="md"
            fullWidth
            onClick={() => navigate('/login', { replace: true })}
          >
            Sign In Now
          </Button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          <p style={{ fontSize: 14, color: 'var(--label-secondary)', margin: '0 0 4px', lineHeight: 1.6, textAlign: 'center' }}>
            Choose a new password for your account.
          </p>
          <div className="auth-card">
            <TextField
              id="reset-pw-new"
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="At least 6 characters"
              type="password"
              autoFocus
            />
            <TextField
              id="reset-pw-confirm"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter new password"
              type="password"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <Button
            id="reset-pw-submit-btn"
            variant="primary"
            size="md"
            fullWidth
            loading={loading}
            disabled={!token}
          >
            Reset Password
          </Button>

          <p className="auth-footer">
            Remember your password? <Link to="/login">Sign In</Link>
          </p>
        </form>
      )}
    </div>
  );
}

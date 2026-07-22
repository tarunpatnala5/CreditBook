// Credit Book — Login Page
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, usersApi } from '../../api';
import useAuthStore from '../../store/authStore';
import { Button, TextField, BottomSheet } from '../../components/ui/Components';
import './Auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // Forgot password state
  const [forgotOpen, setForgotOpen]       = useState(false);
  const [forgotPhone, setForgotPhone]     = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError]     = useState('');
  const [forgotSent, setForgotSent]       = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter your phone number and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login({ phone: identifier.trim(), password });
      const { user, accessToken, refreshToken } = res.data;
      login(user, { accessToken, refreshToken });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotSubmit(e) {
    e.preventDefault();
    if (!forgotPhone.trim()) { setForgotError('Please enter your phone number'); return; }
    setForgotLoading(true);
    setForgotError('');
    try {
      await usersApi.forgotPassword(forgotPhone.trim());
      setForgotSent(true);
    } catch (err) {
      setForgotError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  }

  function closeForgot() {
    setForgotOpen(false);
    setForgotPhone('');
    setForgotError('');
    setForgotSent(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <img src="/logo.png" alt="Credit Book" className="auth-logo" />
        <h1 className="auth-title">Credit Book</h1>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
        <div className="auth-card">
          <TextField
            id="login-phone"
            label="Phone Number"
            value={identifier}
            onChange={setIdentifier}
            placeholder="Enter your phone number"
            maxLength={10}
            type="tel"
            inputMode="tel"
          />
          <TextField
            id="login-password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            type="password"
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <Button
          id="login-submit-btn"
          variant="primary"
          size="md"
          fullWidth
          loading={loading}
        >
          Sign In
        </Button>

        <button
          type="button"
          id="login-forgot-pw-btn"
          onClick={() => setForgotOpen(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--app-accent)', fontSize: 14,
            fontFamily: 'var(--font-text)', textAlign: 'center',
            width: '100%', padding: '4px 0', marginTop: 2,
          }}
        >
          Forgot Password?
        </button>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Register</Link>
        </p>
      </form>

      {/* Forgot Password Sheet */}
      <BottomSheet isOpen={forgotOpen} onClose={closeForgot} title="Forgot Password?">
        {forgotSent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>✅</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--label-primary)', margin: 0 }}>
              Request Submitted!
            </p>
            <p style={{ fontSize: 14, color: 'var(--label-secondary)', margin: 0, lineHeight: 1.7 }}>
              Your password reset link will be sent to your WhatsApp number shortly. Please note that the link is valid for <strong>24 hours</strong> and can only be used <strong>once</strong>.
            </p>
            <Button id="forgot-pw-ok-btn" variant="primary" size="md" fullWidth onClick={closeForgot}>
              Got It
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} autoComplete="off">
            <p style={{ fontSize: 14, color: 'var(--label-secondary)', margin: 0, lineHeight: 1.6 }}>
              Enter the phone number linked to your account. We will send a password reset link to that number on WhatsApp.
            </p>
            <TextField
              id="forgot-pw-phone"
              label="Phone Number"
              value={forgotPhone}
              onChange={setForgotPhone}
              placeholder="Enter phone number"
              maxLength={10}
              type="tel"
              inputMode="tel"
              autoFocus
            />
            {forgotError && (
              <div style={{ color: 'var(--color-red)', fontSize: 13 }}>{forgotError}</div>
            )}
            <Button id="forgot-pw-submit-btn" variant="primary" size="md" fullWidth loading={forgotLoading}>
              Send Reset Link
            </Button>
          </form>
        )}
      </BottomSheet>
    </div>
  );
}

// Credit Book — Login Page
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api';
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
  const [forgotOpen, setForgotOpen] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter your phone or email and password');
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
            label="Phone or Email"
            value={identifier}
            onChange={setIdentifier}
            placeholder="Phone number or you@example.com"
            type="text"
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
      <BottomSheet isOpen={forgotOpen} onClose={() => setForgotOpen(false)} title="Forgot Password?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--label-secondary)', margin: 0, lineHeight: 1.6 }}>
            Password reset via email is not yet available. Please contact our support team and we'll help you reset your password.
          </p>
          <p style={{ fontSize: 14, color: 'var(--label-secondary)', margin: 0, lineHeight: 1.6 }}>
            After logging in, go to <strong>Settings → Support Chat</strong> to reach us.
          </p>
          <Button
            id="forgot-pw-ok-btn"
            variant="primary"
            size="md"
            fullWidth
            onClick={() => setForgotOpen(false)}
          >
            Got It
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}

// Credit Book — Login Page
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api';
import useAuthStore from '../../store/authStore';
import { Button, TextField } from '../../components/ui/Components';
import './Auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        <img src="/logo.jpg" alt="Credit Book" className="auth-logo" />
        <h1 className="auth-title">Credit Book</h1>
        <p className="auth-subtitle">Family Ledger</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-card">
          <TextField
            id="login-phone"
            label="Phone or Email"
            value={identifier}
            onChange={setIdentifier}
            placeholder="98765 43210 or you@example.com"
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

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

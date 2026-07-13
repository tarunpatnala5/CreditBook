// Credit Book — Register Page
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api';
import { Button, TextField } from '../../components/ui/Components';
import './Auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);

  function setField(field) {
    return (val) => setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.register({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setRegistered(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <div className="auth-page">
        <div className="auth-header">
          <div className="auth-logo">₹</div>
          <h1 className="auth-title">Account Created</h1>
        </div>
        <div className="auth-pending-notice">
          <div className="auth-pending-icon">⏳</div>
          <h2 className="auth-pending-title">Awaiting Activation</h2>
          <p className="auth-pending-body">
            Your account has been created successfully. Please contact the admin to activate your account before you can sign in.
          </p>
        </div>
        <div style={{ marginTop: 24 }}>
          <Button variant="secondary" onClick={() => navigate('/login')} id="go-login-btn">
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="auth-logo">₹</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join Credit Book</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-card">
          <TextField id="reg-name" label="Full Name" value={form.name} onChange={setField('name')} placeholder="Your full name" autoFocus />
          <TextField id="reg-phone" label="Phone Number" value={form.phone} onChange={setField('phone')} placeholder="98765 43210" type="tel" inputMode="tel" />
          <TextField id="reg-email" label="Email Address" value={form.email} onChange={setField('email')} placeholder="you@example.com" type="email" inputMode="email" />
          <TextField id="reg-password" label="Password" value={form.password} onChange={setField('password')} placeholder="Min. 6 characters" type="password" />
          <TextField id="reg-confirm" label="Confirm Password" value={form.confirmPassword} onChange={setField('confirmPassword')} placeholder="Repeat your password" type="password" />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <Button id="reg-submit-btn" variant="primary" size="md" fullWidth loading={loading}>
          Create Account
        </Button>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign In</Link>
        </p>
      </form>
    </div>
  );
}

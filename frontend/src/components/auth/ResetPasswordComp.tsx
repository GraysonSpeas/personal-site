import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config.tsx'; // adjust path as needed

export default function ResetPasswordComp() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const t = urlParams.get('token');
    if (!t) {
      setStatus('error');
      setMessage('No token provided.');
    } else {
      setToken(t);
    }
  }, []);

  function validatePassword(password: string): string | null {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must include at least one special character.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validatePassword(newPassword);
    if (error) {
      setStatus('error');
      setMessage(error);
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage("Passwords don't match.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Password reset successfully!');
      } else {
        throw new Error(data.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Unknown error occurred.');
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '100px auto', padding: 20, background: '#f9f9f9', borderRadius: 8 }}>
      {status === 'success' ? (
        <h2 style={{ color: 'green' }}>✅ {message}</h2>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>Reset Your Password</h2>
          {status === 'error' && <p style={{ color: 'red' }}>{message}</p>}
          <div style={{ marginBottom: 10 }}>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', marginBottom: '8px' }}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px 20px' }}>Reset Password</button>
        </form>
      )}
    </div>
  );
}
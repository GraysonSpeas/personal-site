import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config'; // Adjust the import path as needed

export default function VerifyEmailComp() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    async function verifyEmail() {
      try {
        const res = await fetch(`${API_BASE}/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please try again.');
        console.error('Verification error:', error);
      }
    }

    verifyEmail();
  }, []);

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: 600,
        margin: '100px auto',
        padding: 20,
        textAlign: 'center',
        border: '1px solid #ddd',
        borderRadius: 8,
        background: '#f9f9f9',
      }}
    >
      {status === 'verifying' && <h1 style={{ color: '#555' }}>Verifying...</h1>}
      {status === 'success' && <h1 style={{ color: 'green' }}>✅ {message}</h1>}
      {status === 'error' && <h1 style={{ color: 'red' }}>❌ {message}</h1>}
    </div>
  );
}
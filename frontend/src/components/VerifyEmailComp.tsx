import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config'; // Ensure this path is correct

export default function VerifyEmailComp() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    console.log('API_BASE:', API_BASE);

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    async function verifyEmail(token: string) {
      try {
        console.log('Verifying token:', token);

        const res = await fetch(`${API_BASE}/auth/verify?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        console.log('Response status:', res.status);

        let data;
        try {
          data = await res.json();
          console.log('Response data:', data);
        } catch (jsonError) {
          throw new Error('Invalid JSON response from server.');
        }

        // Treat as success if res.ok and either data.success === true OR message contains "verified"
        if (
          res.ok &&
          (data?.success === true || data?.message?.toLowerCase().includes('verified'))
        ) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          throw new Error(data?.message || 'Verification failed.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Network error. Please try again.');
        console.error('Verification error:', error);
      }
    }

    verifyEmail(token);
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
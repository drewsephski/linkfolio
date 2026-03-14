'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, newPassword);
      
      if (result.success) {
        setSuccess('Password reset successfully! Redirecting to sign in...');
        setTimeout(() => router.push('/auth/sign-in'), 2000);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTopColor: '#ededed',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#a1a1a1', fontSize: '14px' }}>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .auth-page {
          --bg: #000;
          --surface: #0a0a0a;
          --s2: #111;
          --b: rgba(255,255,255,0.08);
          --bh: rgba(255,255,255,0.16);
          --bf: rgba(255,255,255,0.22);
          --t1: #ededed;
          --t2: #a1a1a1;
          --t3: #555;
          --error: #f87171;
          --success: #34d399;
          --font: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          background: var(--bg);
          color: var(--t1);
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
          moz-osx-font-smoothing: grayscale;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .auth-page *, .auth-page *::before, .auth-page *::after { 
          box-sizing: border-box; 
          margin: 0; 
          padding: 0; 
        }

        /* Dot grid background */
        .auth-grid {
          position: fixed;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.065) 1px, transparent 1px);
          background-size: 24px 24px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }

        /* Glow */
        .auth-glow {
          position: fixed;
          top: 30%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 400px;
          background: radial-gradient(ellipse, rgba(255,255,255,0.028) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        .auth-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-logo {
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--t1);
          text-decoration: none;
          margin-bottom: 24px;
          display: inline-block;
        }

        .auth-title {
          font-size: 28px;
          font-weight: 600;
          letter-spacing: -0.055em;
          line-height: 1.1;
          color: var(--t1);
          margin-bottom: 8px;
        }

        .auth-subtitle {
          font-size: 14px;
          color: var(--t3);
          line-height: 1.5;
          letter-spacing: -0.01em;
        }

        .auth-link {
          color: var(--t2);
          text-decoration: none;
          transition: color 0.15s;
        }

        .auth-link:hover {
          color: var(--t1);
        }

        .auth-form {
          background: var(--surface);
          border: 1px solid var(--b);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--t2);
          letter-spacing: -0.01em;
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          background: var(--s2);
          border: 1px solid var(--b);
          border-radius: 8px;
          padding: 10px 12px;
          font-family: var(--font);
          font-size: 14px;
          color: var(--t1);
          letter-spacing: -0.01em;
          transition: border-color 0.15s, background 0.15s;
        }

        .form-input::placeholder {
          color: var(--t3);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--bf);
          background: var(--s2);
        }

        .form-input.error {
          border-color: rgba(248, 113, 113, 0.4);
        }

        .form-hint {
          font-size: 11px;
          color: var(--t3);
          letter-spacing: -0.01em;
          margin-top: 4px;
        }

        .auth-button {
          width: 100%;
          background: var(--t1);
          color: #000;
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          font-family: var(--font);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.02em;
          cursor: pointer;
          transition: background 0.15s, opacity 0.15s, transform 0.15s;
          margin-top: 8px;
        }

        .auth-button:hover:not(:disabled) {
          background: #fff;
        }

        .auth-button:active:not(:disabled) {
          transform: scale(0.98);
        }

        .auth-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .auth-spinner {
          width: 12px; 
          height: 12px;
          border: 1.5px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
          margin-right: 6px;
          vertical-align: middle;
        }

        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }

        .auth-message {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px;
          border-radius: 8px;
          font-size: 12px;
          letter-spacing: -0.01em;
          margin-bottom: 16px;
        }

        .auth-message.error {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.2);
          color: var(--error);
        }

        .auth-message.success {
          background: rgba(52, 211, 153, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.2);
          color: var(--success);
        }

        .back-link {
          text-align: center;
          margin-top: 16px;
        }

        .password-strength {
          display: flex;
          gap: 4px;
          margin-top: 8px;
        }

        .strength-bar {
          flex: 1;
          height: 2px;
          background: var(--b);
          border-radius: 1px;
          transition: background 0.2s;
        }

        .strength-bar.active {
          background: var(--success);
        }

        @media (max-width: 480px) {
          .auth-page {
            padding: 16px;
          }

          .auth-container {
            max-width: 100%;
          }
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-grid" />
        <div className="auth-glow" />
        
        <div className="auth-container">
          <div className="auth-header">
            <Link href="/" className="auth-logo">Linkfolio</Link>
            <h1 className="auth-title">Set new password</h1>
            <p className="auth-subtitle">
              Enter your new password below
            </p>
          </div>

          {!error ? (
            <form className="auth-form" onSubmit={handleSubmit}>
              {error && (
                <div className="auth-message error">
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--error)' }} />
                  {error}
                </div>
              )}

              {success && (
                <div className="auth-message success">
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--success)' }} />
                  {success}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  disabled={loading || !!success}
                />
                <p className="form-hint">Minimum 6 characters</p>
                <div className="password-strength">
                  <div className={`strength-bar ${newPassword.length >= 6 ? 'active' : ''}`} />
                  <div className={`strength-bar ${newPassword.length >= 10 ? 'active' : ''}`} />
                  <div className={`strength-bar ${newPassword.length >= 12 ? 'active' : ''}`} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  disabled={loading || !!success}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !!success}
                className="auth-button"
              >
                {loading && <span className="auth-spinner" />}
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div className="auth-form">
              <div className="auth-message error">
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--error)' }} />
                {error}
              </div>
              
              <div className="back-link">
                <Link href="/auth/forgot-password" className="auth-link">
                  Request a new reset link
                </Link>
                <br />
                <Link href="/auth/sign-in" className="auth-link">
                  ← Back to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

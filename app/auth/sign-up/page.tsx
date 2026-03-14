'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, verifyEmail, resendVerification, signInWithOAuth } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signUp(formData.email, formData.password, formData.name);
      
      if (result.success) {
        if (result.requiresVerification) {
          setRequiresVerification(true);
          setSuccess('Account created! Please check your email for a verification code.');
        } else {
          setSuccess('Account created successfully!');
          setTimeout(() => router.push('/dashboard'), 1500);
        }
      } else {
        setError(result.error || 'Sign up failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await verifyEmail(formData.email, verificationCode);
      
      if (result.success) {
        setSuccess('Email verified! Redirecting to dashboard...');
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        setError(result.error || 'Verification failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    try {
      setLoading(true);
      setError('');
      
      // Use the auth context's OAuth function
      await signInWithOAuth(provider);
    } catch (error) {
      console.error('OAuth sign in failed:', error);
      setError('OAuth sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError('');

    try {
      const result = await resendVerification(formData.email);
      
      if (result.success) {
        setSuccess('Verification code resent! Please check your email.');
      } else {
        setError(result.error || 'Failed to resend code');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setResending(false);
    }
  };

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

        .auth-button.secondary {
          background: transparent;
          color: var(--t2);
          border: 1px solid var(--b);
        }

        .auth-button.secondary:hover:not(:disabled) {
          border-color: var(--bh);
          color: var(--t1);
          background: rgba(255,255,255,0.03);
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

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }

        .auth-divider-line {
          flex: 1;
          height: 1px;
          background: var(--b);
        }

        .auth-divider-text {
          font-size: 11px;
          color: var(--t3);
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }

        .oauth-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .oauth-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--surface);
          border: 1px solid var(--b);
          border-radius: 8px;
          font-size: 12px;
          color: var(--t2);
          text-decoration: none;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }

        .oauth-button:hover {
          border-color: var(--bh);
          color: var(--t1);
          background: rgba(255,255,255,0.03);
        }

        .verification-input {
          text-align: center;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.2em;
          font-family: 'Courier New', monospace;
        }

        @media (max-width: 480px) {
          .auth-page {
            padding: 16px;
          }

          .auth-container {
            max-width: 100%;
          }

          .oauth-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-grid" />
        <div className="auth-glow" />
        
        <div className="auth-container">
          <div className="auth-header">
            <Link href="/" className="auth-logo">Linkfolio</Link>
            <h1 className="auth-title">
              {requiresVerification ? 'Verify your email' : 'Create account'}
            </h1>
            <p className="auth-subtitle">
              {requiresVerification ? (
                <>We sent a code to {formData.email}</>
              ) : (
                <>Or <Link href="/auth/sign-in" className="auth-link">sign in to existing account</Link></>
              )}
            </p>
          </div>

          {!requiresVerification ? (
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
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-input"
                  placeholder="••••••••"
                />
                <p className="form-hint">Minimum 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-button"
              >
                {loading && <span className="auth-spinner" />}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleVerification}>
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
                <label htmlFor="otp" className="form-label">Verification Code</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="form-input verification-input"
                  placeholder="123456"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-button"
              >
                {loading && <span className="auth-spinner" />}
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="auth-button secondary"
              >
                {resending ? 'Resending...' : 'Resend Code'}
              </button>
            </form>
          )}

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">Or continue with</span>
            <div className="auth-divider-line" />
          </div>

          <div className="oauth-buttons">
            <button
              onClick={() => handleOAuthSignIn('github')}
              className="oauth-button"
            >
              GitHub
            </button>

            <button
              onClick={() => handleOAuthSignIn('google')}
              className="oauth-button"
            >
              Google
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

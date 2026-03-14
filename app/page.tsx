/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { normalizeLinkedInInput } from '@/lib/data-normalization';
import { useAuth } from '@/contexts/auth-context';

export default function HomePage() {
  const { user } = useAuth();
  const [linkedinInput, setLinkedinInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  const validateLinkedInInput = (input: string) => {
    try {
      normalizeLinkedInInput(input);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateLinkedInInput(linkedinInput)) {
      setError('Enter a valid LinkedIn username or URL — e.g., johndoe or https://linkedin.com/in/johndoe');
      return;
    }

    // Normalize the input to a full URL
    const normalizedUrl = normalizeLinkedInInput(linkedinInput);

    setIsLoading(true);
    try {
      // Add timeout to prevent infinite waiting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout

      const response = await fetch('/api/generate-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          linkedinUrl: normalizedUrl,
          userId: user?.id // Pass authenticated user ID
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate portfolio');
      }
      
      const data = await response.json();
      window.location.href = `/portfolio/${data.portfolioId}`;
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out. LinkedIn scraping is taking longer than expected. Please try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .hp {
          --bg:      #000;
          --surface: #0a0a0a;
          --s2:      #111;
          --b:       rgba(255,255,255,0.08);
          --bh:      rgba(255,255,255,0.16);
          --bf:      rgba(255,255,255,0.22);
          --t1:      #ededed;
          --t2:      #a1a1a1;
          --t3:      #555;
          --font:    'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          background: var(--bg);
          color: var(--t1);
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
          moz-osx-font-smoothing: grayscale;
        }
        .hp *, .hp *::before, .hp *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Nav ── */
        .hp-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid var(--b);
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .hp-nav-inner {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 40px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hp-logo {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--t1);
          text-decoration: none;
        }
        .hp-nav-links {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .hp-nav-link {
          font-size: 13px;
          color: var(--t3);
          text-decoration: none;
          padding: 5px 10px;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
          letter-spacing: -0.01em;
        }
        .hp-nav-link:hover {
          color: var(--t2);
          background: rgba(255,255,255,0.04);
        }
        .hp-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--t2);
          text-decoration: none;
          padding: 6px 12px;
          border: 1px solid var(--b);
          border-radius: 6px;
          letter-spacing: -0.02em;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .hp-nav-btn:hover {
          border-color: var(--bh);
          color: var(--t1);
          background: rgba(255,255,255,0.03);
        }

        /* ── Hero ── */
        .hp-hero {
          position: relative;
          padding: 120px 40px 96px;
          max-width: 1000px;
          margin: 0 auto;
          overflow: hidden;
        }

        /* Dot grid background */
        .hp-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.065) 1px, transparent 1px);
          background-size: 24px 24px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%);
          pointer-events: none;
        }

        /* Glow */
        .hp-glow {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 400px;
          background: radial-gradient(ellipse, rgba(255,255,255,0.028) 0%, transparent 65%);
          pointer-events: none;
        }

        .hp-hero-content {
          position: relative;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Eyebrow badge */
        .hp-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px 4px 4px;
          border: 1px solid var(--b);
          border-radius: 999px;
          background: rgba(255,255,255,0.03);
          font-size: 11.5px;
          color: var(--t3);
          letter-spacing: -0.01em;
          margin-bottom: 32px;
          animation: fadeUp 0.5s ease both;
        }
        .hp-badge-pill {
          background: rgba(255,255,255,0.08);
          border-radius: 999px;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 500;
          color: var(--t2);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .hp-h1 {
          font-size: clamp(48px, 7vw, 80px);
          font-weight: 600;
          letter-spacing: -0.055em;
          line-height: 1.0;
          color: var(--t1);
          margin-bottom: 20px;
          animation: fadeUp 0.5s ease 0.06s both;
        }
        /* Subtle text gradient on heading */
        .hp-h1 span {
          background: linear-gradient(180deg, #ededed 0%, #888 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hp-sub {
          font-size: 16px;
          font-weight: 400;
          color: var(--t3);
          line-height: 1.65;
          max-width: 420px;
          letter-spacing: -0.01em;
          margin-bottom: 48px;
          animation: fadeUp 0.5s ease 0.1s both;
        }

        /* ── Input form ── */
        .hp-form {
          width: 100%;
          max-width: 520px;
          animation: fadeUp 0.5s ease 0.15s both;
        }

        .hp-input-row {
          display: flex;
          border: 1px solid var(--b);
          border-radius: 10px;
          background: var(--surface);
          overflow: hidden;
          transition: border-color 0.15s ease;
        }
        .hp-input-row.focused {
          border-color: var(--bf);
        }
        .hp-input-row.error-state {
          border-color: rgba(239,68,68,0.4);
        }

        .hp-input-icon {
          display: flex;
          align-items: center;
          padding: 0 14px 0 16px;
          color: var(--t3);
          flex-shrink: 0;
        }

        .hp-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--font);
          font-size: 13.5px;
          font-weight: 400;
          color: var(--t1);
          letter-spacing: -0.01em;
          padding: 13px 0;
          min-width: 0;
        }
        .hp-input::placeholder { color: var(--t3); }

        .hp-submit {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 18px;
          margin: 5px 5px 5px 0;
          background: var(--t1);
          color: #000;
          border: none;
          border-radius: 7px;
          font-family: var(--font);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.02em;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, opacity 0.15s, transform 0.15s;
          height: 34px;
        }
        .hp-submit:hover:not(:disabled) { background: #fff; }
        .hp-submit:active:not(:disabled) { transform: scale(0.98); }
        .hp-submit:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Loading spinner */
        .hp-spinner {
          width: 12px; height: 12px;
          border: 1.5px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .hp-error {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 10px;
          font-size: 12px;
          color: #f87171;
          letter-spacing: -0.01em;
          text-align: left;
        }
        .hp-error-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #f87171;
          flex-shrink: 0;
        }

        .hp-hint {
          margin-top: 10px;
          font-size: 11.5px;
          color: var(--t3);
          letter-spacing: -0.01em;
          text-align: center;
        }

        /* ── Social proof strip ── */
        .hp-social {
          margin-top: 56px;
          display: flex;
          align-items: center;
          gap: 20px;
          animation: fadeUp 0.5s ease 0.22s both;
        }
        .hp-social-num {
          font-size: 13px;
          font-weight: 600;
          color: var(--t2);
          letter-spacing: -0.02em;
        }
        .hp-social-label {
          font-size: 12px;
          color: var(--t3);
          letter-spacing: -0.01em;
        }
        .hp-social-div {
          width: 1px; height: 14px;
          background: var(--b);
        }

        /* ── Features ── */
        .hp-features-wrap {
          border-top: 1px solid var(--b);
        }
        .hp-features {
          max-width: 1000px;
          margin: 0 auto;
          padding: 64px 40px 72px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
        }
        .hp-feature {
          padding: 0 40px 0 0;
          border-right: 1px solid var(--b);
        }
        .hp-feature:last-child {
          border-right: none;
          padding-right: 0;
          padding-left: 40px;
        }
        .hp-feature:nth-child(2) {
          padding: 0 40px;
        }

        .hp-feat-icon {
          width: 32px; height: 32px;
          border: 1px solid var(--b);
          border-radius: 8px;
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--t3);
          margin-bottom: 16px;
        }

        .hp-feat-title {
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--t1);
          margin-bottom: 6px;
        }
        .hp-feat-desc {
          font-size: 12.5px;
          color: var(--t3);
          line-height: 1.65;
          letter-spacing: -0.01em;
        }

        /* ── Example CTA ── */
        .hp-example-wrap {
          border-top: 1px solid var(--b);
        }
        .hp-example {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .hp-example-text {
          font-size: 13px;
          color: var(--t3);
          letter-spacing: -0.01em;
        }
        .hp-example-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--t2);
          text-decoration: none;
          padding: 7px 12px;
          border: 1px solid var(--b);
          border-radius: 7px;
          white-space: nowrap;
          flex-shrink: 0;
          letter-spacing: -0.01em;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .hp-example-link:hover {
          border-color: var(--bh);
          color: var(--t1);
          background: rgba(255,255,255,0.03);
        }
        .hp-example-link svg {
          transition: transform 0.15s cubic-bezier(0.16,1,0.3,1);
        }
        .hp-example-link:hover svg {
          transform: translate(2px,-2px);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: none; }
        }

        @media (max-width: 700px) {
          .hp-hero { padding: 80px 24px 72px; }
          .hp-h1 { font-size: 44px; }
          .hp-features { grid-template-columns: 1fr; gap: 32px; padding: 48px 24px 56px; }
          .hp-feature,
          .hp-feature:nth-child(2),
          .hp-feature:last-child {
            border-right: none;
            padding: 0 0 32px;
            border-bottom: 1px solid var(--b);
          }
          .hp-feature:last-child { border-bottom: none; padding-bottom: 0; }
          .hp-nav-inner { padding: 0 24px; }
          .hp-example { flex-direction: column; align-items: flex-start; padding: 32px 24px; }
          .hp-social { flex-wrap: wrap; justify-content: center; }
        }
      `}</style>

      <div className="hp">
        {/* Nav */}
        <nav className="hp-nav">
          <div className="hp-nav-inner">
            <a href="/" className="hp-logo">Linkfolio</a>
            <div className="hp-nav-links">
              {user ? (
                <>
                  <Link href="/dashboard" className="hp-nav-btn">
                    Dashboard
                  </Link>
                  <Link href="/portfolio/example" className="hp-nav-btn">
                    View demo
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M7 7h10v10"/>
                    </svg>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/sign-in" className="hp-nav-link">
                    Sign In
                  </Link>
                  <Link href="/auth/sign-up" className="hp-nav-btn">
                    Sign Up
                  </Link>
                  <Link href="/portfolio/example" className="hp-nav-btn">
                    View demo
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M7 7h10v10"/>
                    </svg>
                  </Link>
                </>
              )}
              <Link href="/privacy" className="hp-nav-link">
                Privacy
              </Link>
              <Link href="/terms" className="hp-nav-link">
                Terms
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="hp-hero">
          <div className="hp-grid" />
          <div className="hp-glow" />

          <div className="hp-hero-content">
            <div className="hp-badge">
              <span className="hp-badge-pill">New</span>
              Now with AI-powered summaries
            </div>

            <h1 className="hp-h1">
              <span>Your LinkedIn,<br />as a portfolio.</span>
            </h1>

            <p className="hp-sub">
              {user ? (
                <>Welcome back, {user.profile?.name || user.email}! Transform your LinkedIn profile into a stunning portfolio.</>
              ) : (
                <>Paste your LinkedIn username or profile URL. Get a clean, shareable portfolio in seconds. No signup required.</>
              )}
            </p>

            {/* Form */}
            <form className="hp-form" onSubmit={handleSubmit}>
              <div className={`hp-input-row${focused ? " focused" : ""}${error ? " error-state" : ""}`}>
                <div className="hp-input-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  className="hp-input"
                  value={linkedinInput}
                  onChange={(e) => { setLinkedinInput(e.target.value); setError(''); }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="johndoe or linkedin.com/in/johndoe"
                  autoComplete="off"
                  spellCheck={false}
                  required
                />
                <button
                  type="submit"
                  className="hp-submit"
                  disabled={isLoading || !linkedinInput}
                >
                  {isLoading ? (
                    <>
                      <span className="hp-spinner" />
                      Generating
                    </>
                  ) : (
                    <>
                      Generate
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="hp-error">
                  <div className="hp-error-dot" />
                  {error}
                </div>
              )}
              {!error && (
                <div className="hp-hint">Free · No signup · Instant</div>
              )}
            </form>

            {/* Social proof */}
            <div className="hp-social">
              <div>
                <span className="hp-social-num">2,400+</span>
                {" "}
                <span className="hp-social-label">portfolios generated</span>
              </div>
              <div className="hp-social-div" />
              <div>
                <span className="hp-social-num">4.9</span>
                {" "}
                <span className="hp-social-label">avg. rating</span>
              </div>
              <div className="hp-social-div" />
              <div>
                <span className="hp-social-label">takes </span>
                <span className="hp-social-num">~8s</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <div className="hp-features-wrap">
          <div className="hp-features">
            {[
              {
                title: "Instant generation",
                desc: "Parses your LinkedIn data and renders a full portfolio in under 10 seconds.",
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                ),
              },
              {
                title: "Clean by default",
                desc: "No themes to choose, no settings to tweak. Designed to impress.",
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12l2.5 2.5L16 9"/>
                  </svg>
                ),
              },
              {
                title: "Shareable URL",
                desc: "Every portfolio gets a permanent link. Share it anywhere, any time.",
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                  </svg>
                ),
              },
            ].map((f, i) => (
              <div className="hp-feature" key={i}>
                <div className="hp-feat-icon">{f.icon}</div>
                <div className="hp-feat-title">{f.title}</div>
                <div className="hp-feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
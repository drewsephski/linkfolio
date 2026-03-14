import Link from "next/link";

interface PortfolioFooterProps {
  linkedinUrl: string;
  generatedAt: string;
}

export function PortfolioFooter({ linkedinUrl, generatedAt }: PortfolioFooterProps) {
  const formattedDate = new Date(generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .pf {
          --bg:      #000;
          --surface: #0a0a0a;
          --s2:      #111;
          --b:       rgba(255,255,255,0.08);
          --bh:      rgba(255,255,255,0.15);
          --t1:      #ededed;
          --t2:      #a1a1a1;
          --t3:      #555;
          --green:   #22c55e;
          --font:    'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--t1);
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
          border-top: 1px solid var(--b);
        }
        .pf *, .pf *::before, .pf *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pf-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* ── Top zone: source info + generation date ── */
        .pf-top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          border-bottom: 1px solid var(--b);
          padding: 40px 0;
        }

        .pf-source {
          padding-right: 40px;
          border-right: 1px solid var(--b);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pf-source-label {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--t3);
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .pf-source-label::before {
          content: '';
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--t3);
        }

        .pf-li-link {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 9px 14px;
          border: 1px solid var(--b);
          border-radius: 8px;
          background: transparent;
          color: var(--t2);
          text-decoration: none;
          font-size: 13px;
          letter-spacing: -0.02em;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          width: fit-content;
        }
        .pf-li-link:hover {
          border-color: var(--bh);
          color: var(--t1);
          background: rgba(255,255,255,0.03);
        }
        .pf-li-link svg { flex-shrink: 0; }
        .pf-li-arrow {
          margin-left: 2px;
          color: var(--t3);
          transition: transform 0.15s ease, color 0.15s;
        }
        .pf-li-link:hover .pf-li-arrow {
          transform: translate(2px,-2px);
          color: var(--t1);
        }

        /* Right: generated date */
        .pf-meta {
          padding-left: 40px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          justify-content: center;
        }
        .pf-meta-label {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--t3);
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .pf-meta-label::before {
          content: '';
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--t3);
        }
        .pf-meta-date {
          font-size: 14px;
          font-weight: 400;
          letter-spacing: -0.02em;
          color: var(--t2);
        }
        .pf-meta-live {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: var(--t3);
        }
        .pf-live-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--green);
          animation: pulse 2s ease infinite;
          flex-shrink: 0;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        /* ── CTA zone ── */
        .pf-cta {
          padding: 56px 0 64px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 40px;
          align-items: center;
        }

        .pf-cta-copy {}
        .pf-cta-heading {
          font-size: clamp(22px, 3vw, 30px);
          font-weight: 600;
          letter-spacing: -0.04em;
          line-height: 1.1;
          color: var(--t1);
          margin-bottom: 10px;
        }
        .pf-cta-sub {
          font-size: 13.5px;
          color: var(--t3);
          line-height: 1.6;
          letter-spacing: -0.01em;
          max-width: 400px;
        }

        /* Primary CTA button */
        .pf-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 20px;
          background: var(--t1);
          color: #000;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: -0.02em;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .pf-cta-btn:hover {
          background: #fff;
          transform: translateY(-1px);
        }
        .pf-cta-btn svg {
          transition: transform 0.15s cubic-bezier(0.16,1,0.3,1);
        }
        .pf-cta-btn:hover svg {
          transform: translateX(2px);
        }

        /* ── Bottom bar ── */
        .pf-bottom {
          border-top: 1px solid var(--b);
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pf-bottom-brand {
          font-size: 11.5px;
          color: var(--t3);
          letter-spacing: -0.01em;
        }
        .pf-bottom-brand strong {
          color: var(--t2);
          font-weight: 500;
        }
        .pf-bottom-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .pf-bottom-link {
          font-size: 11.5px;
          color: var(--t3);
          text-decoration: none;
          letter-spacing: -0.01em;
          transition: color 0.15s;
        }
        .pf-bottom-link:hover { color: var(--t2); }

        @media (max-width: 640px) {
          .pf-inner { padding: 0 24px; }
          .pf-top { grid-template-columns: 1fr; gap: 32px; }
          .pf-source { border-right: none; padding-right: 0; border-bottom: 1px solid var(--b); padding-bottom: 32px; }
          .pf-meta { padding-left: 0; }
          .pf-cta { grid-template-columns: 1fr; gap: 24px; }
          .pf-cta-btn { width: fit-content; }
          .pf-bottom { height: auto; flex-direction: column; gap: 10px; padding: 16px 0; }
        }
      `}</style>

      <footer className="pf">
        <div className="pf-inner">

          {/* Top: source + meta */}
          <div className="pf-top">
            <div className="pf-source">
              <div className="pf-source-label">Source profile</div>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pf-li-link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn Profile
                <svg className="pf-li-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M7 7h10v10"/>
                </svg>
              </a>
            </div>

            <div className="pf-meta">
              <div className="pf-meta-label">Generated</div>
              <div className="pf-meta-date">{formattedDate}</div>
              <div className="pf-meta-live">
                <div className="pf-live-dot" />
                Powered by Linkfolio
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pf-cta">
            <div className="pf-cta-copy">
              <div className="pf-cta-heading">Build your own portfolio</div>
              <div className="pf-cta-sub">
                Paste your LinkedIn URL and get a clean, shareable portfolio in seconds.
              </div>
            </div>
            <Link href="/" className="pf-cta-btn">
              Get started
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* Bottom bar */}
          <div className="pf-bottom">
            <div className="pf-bottom-brand">
              <strong>Linkfolio</strong> — LinkedIn portfolio generator
            </div>
            <div className="pf-bottom-links">
              <Link href="/privacy" className="pf-bottom-link">Privacy</Link>
              <Link href="/terms" className="pf-bottom-link">Terms</Link>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
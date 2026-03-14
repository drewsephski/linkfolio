
"use client";

import { useEffect, useRef, useState } from "react";

interface PortfolioSummaryProps {
  summary: string;
}

export function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .ps {
          --bg:        #000000;
          --surface:   #0a0a0a;
          --surface-2: #111111;
          --border:    rgba(255,255,255,0.08);
          --border-hi: rgba(255,255,255,0.12);
          --text-1:    #ededed;
          --text-2:    #a1a1a1;
          --text-3:    #555555;
          --font:      'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--text-1);
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
          border-top: 1px solid var(--border);
        }
        .ps *, .ps *::before, .ps *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ps-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 64px 40px 72px;
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 0 56px;
        }

        /* ── Left col ── */
        .ps-left {
          opacity: 0; transform: translateY(12px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .ps-left.in { opacity: 1; transform: none; }

        .ps-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-3);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ps-label::before {
          content: '';
          display: inline-block;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--text-3);
          flex-shrink: 0;
        }

        /* Meta list */
        .ps-meta-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }
        .ps-meta-row {
          padding: 11px 14px;
          border-bottom: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ps-meta-row:last-child { border-bottom: none; }
        .ps-meta-key {
          font-size: 10.5px;
          color: var(--text-3);
          letter-spacing: -0.005em;
        }
        .ps-meta-val {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-2);
          letter-spacing: -0.02em;
        }

        /* ── Right col ── */
        .ps-right {
          opacity: 0; transform: translateY(12px);
          transition: opacity 0.5s ease 0.08s, transform 0.5s ease 0.08s;
        }
        .ps-right.in { opacity: 1; transform: none; }

        .ps-heading {
          font-size: clamp(24px, 3vw, 32px);
          font-weight: 600;
          letter-spacing: -0.04em;
          line-height: 1.1;
          color: var(--text-1);
          margin-bottom: 24px;
        }

        .ps-text {
          font-size: 15px;
          font-weight: 400;
          line-height: 1.75;
          color: var(--text-2);
          letter-spacing: -0.01em;
        }

        /* Word-by-word fade-in */
        .ps-word {
          display: inline;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .ps-word.in { opacity: 1; }

        /* Inline highlight for first sentence */
        .ps-first-sentence {
          color: var(--text-1);
          font-weight: 400;
        }

        @media (max-width: 640px) {
          .ps-inner {
            grid-template-columns: 1fr;
            gap: 40px 0;
            padding: 48px 24px 56px;
          }
        }
      `}</style>

      <section className="ps" ref={ref}>
        <div className="ps-inner">
          {/* Left */}
          <div className={`ps-left${visible ? " in" : ""}`}>
            <div className="ps-label">About</div>
            <div className="ps-meta-list">
              <div className="ps-meta-row">
                <span className="ps-meta-key">Words</span>
                <span className="ps-meta-val">{summary.split(/\s+/).filter(Boolean).length}</span>
              </div>
              <div className="ps-meta-row">
                <span className="ps-meta-key">Reading time</span>
                <span className="ps-meta-val">
                  {Math.max(1, Math.round(summary.split(/\s+/).length / 200))} min
                </span>
              </div>
              <div className="ps-meta-row">
                <span className="ps-meta-key">Section</span>
                <span className="ps-meta-val">02 / Summary</span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className={`ps-right${visible ? " in" : ""}`}>
            <h2 className="ps-heading">Summary</h2>
            <p className="ps-text">
              {summary.split(" ").map((word, i) => (
                <span
                  key={i}
                  className={`ps-word${visible ? " in" : ""}`}
                  style={{
                    transitionDelay: visible ? `${80 + i * 18}ms` : "0ms",
                  }}
                >
                  {word}{" "}
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
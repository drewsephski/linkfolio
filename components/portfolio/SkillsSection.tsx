"use client";

import { useEffect, useRef, useState } from "react";

interface SkillsSectionProps {
  skills: string[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  if (!skills || skills.length === 0) return null;

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

        .sk {
          --bg:      #000;
          --surface: #0a0a0a;
          --s2:      #111;
          --b:       rgba(255,255,255,0.08);
          --bh:      rgba(255,255,255,0.15);
          --t1:      #ededed;
          --t2:      #a1a1a1;
          --t3:      #555;
          --font:    'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--t1);
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
          border-top: 1px solid var(--b);
          padding: 72px 0 80px;
        }
        .sk *, .sk *::before, .sk *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sk-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* Header */
        .sk-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .sk-title {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--t3);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sk-title::before {
          content: '';
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--t3);
          display: inline-block;
        }
        .sk-count {
          font-size: 11px;
          color: var(--t3);
        }

        /* Tag cloud */
        .sk-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .sk-tag {
          display: inline-flex;
          align-items: center;
          height: 30px;
          padding: 0 12px;
          border: 1px solid var(--b);
          border-radius: 6px;
          background: transparent;
          font-size: 12.5px;
          font-weight: 400;
          color: var(--t2);
          letter-spacing: -0.01em;
          cursor: default;
          opacity: 0;
          transform: translateY(6px);
          transition:
            opacity 0.35s ease,
            transform 0.35s ease,
            background 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease;
          user-select: none;
        }
        .sk-tag.in {
          opacity: 1;
          transform: none;
        }
        .sk-tag:hover {
          background: rgba(255,255,255,0.04);
          border-color: var(--bh);
          color: var(--t1);
        }

        /* Featured tags — first 3 are slightly emphasized */
        .sk-tag.featured {
          border-color: rgba(255,255,255,0.12);
          color: var(--t1);
          background: rgba(255,255,255,0.03);
        }
        .sk-tag.featured:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.2);
        }

        /* Footer row */
        .sk-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--b);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .sk-footer-note {
          font-size: 12px;
          color: var(--t3);
          letter-spacing: -0.01em;
        }
        .sk-footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border: 1px solid var(--b);
          border-radius: 999px;
          font-size: 11px;
          color: var(--t3);
        }
        .sk-footer-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #22c55e;
          flex-shrink: 0;
        }

        @media (max-width: 600px) {
          .sk-inner { padding: 0 24px; }
        }
      `}</style>

      <section className="sk" ref={ref}>
        <div className="sk-inner">
          <div className="sk-header">
            <div className="sk-title">Skills</div>
            <div className="sk-count">{skills.length} total</div>
          </div>

          <div className="sk-tags">
            {skills.map((skill, i) => (
              <span
                key={i}
                className={`sk-tag${i < 3 ? " featured" : ""}${visible ? " in" : ""}`}
                style={{
                  transitionDelay: visible ? `${i * 30}ms` : "0ms",
                }}
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="sk-footer">
            <span className="sk-footer-note">
              Ranked by experience &amp; recency
            </span>
            <div className="sk-footer-badge">
              <div className="sk-footer-badge-dot" />
              Actively developing
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
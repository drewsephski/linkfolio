

"use client";

import { useEffect, useRef, useState } from "react";
import type { CertificationItem } from "@/lib/data-normalization";

interface CertificationsSectionProps {
  certifications: CertificationItem[];
}

export function CertificationsSection({ certifications }: CertificationsSectionProps) {
  if (!certifications || certifications.length === 0) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .cs {
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
          padding: 72px 0 80px;
        }
        .cs *, .cs *::before, .cs *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cs-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .cs-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 36px;
        }
        .cs-title {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--t3);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cs-title::before {
          content: '';
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--t3);
          display: inline-block;
        }
        .cs-count {
          font-size: 11px;
          color: var(--t3);
        }

        /* List container */
        .cs-list {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--b);
          border-radius: 12px;
          overflow: hidden;
        }

        /* Card row */
        .cs-card {
          position: relative;
          padding: 24px 24px 24px 28px;
          border-bottom: 1px solid var(--b);
          background: var(--bg);
          display: grid;
          grid-template-columns: 36px 1fr auto;
          gap: 16px;
          align-items: start;
          transition: background 0.15s ease;
        }
        .cs-card:last-child { border-bottom: none; }
        .cs-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          background: var(--green);
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 0 1px 1px 0;
        }
        .cs-card:hover { background: rgba(255,255,255,0.02); }
        .cs-card:hover::before { transform: scaleY(1); }

        /* Verified icon */
        .cs-icon {
          width: 36px; height: 36px;
          border: 1px solid var(--b);
          border-radius: 8px;
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
          transition: border-color 0.15s ease;
          color: var(--t3);
        }
        .cs-card:hover .cs-icon {
          border-color: rgba(34, 197, 94, 0.3);
          color: var(--green);
        }

        /* Content */
        .cs-body { min-width: 0; }

        .cs-name {
          font-size: 14.5px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--t1);
          line-height: 1.3;
          margin-bottom: 5px;
        }

        .cs-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cs-issuer {
          font-size: 12px;
          color: var(--t2);
          letter-spacing: -0.01em;
        }
        .cs-dot {
          width: 2px; height: 2px;
          border-radius: 50%;
          background: var(--t3);
          flex-shrink: 0;
        }
        .cs-date {
          font-size: 11.5px;
          color: var(--t3);
          letter-spacing: -0.01em;
        }

        /* CTA side */
        .cs-action {
          flex-shrink: 0;
          display: flex;
          align-items: flex-start;
          padding-top: 2px;
        }
        .cs-link {
          display: flex;
          align-items: center;
          gap: 0;
          width: 26px; height: 26px;
          border: 1px solid var(--b);
          border-radius: 6px;
          color: var(--t3);
          text-decoration: none;
          justify-content: center;
          transition: border-color 0.15s, color 0.15s,
                      transform 0.18s cubic-bezier(0.16,1,0.3,1);
        }
        .cs-link:hover {
          border-color: var(--bh);
          color: var(--t1);
          transform: translate(2px,-2px);
        }
        .cs-no-link {
          width: 26px; height: 26px;
        }

        @media (max-width: 600px) {
          .cs-inner { padding: 0 24px; }
          .cs-card { grid-template-columns: 32px 1fr; gap: 12px; padding: 20px 20px 20px 24px; }
          .cs-action { display: none; }
        }
      `}</style>

      <section className="cs">
        <div className="cs-inner">
          <div className="cs-header">
            <div className="cs-title">Certifications</div>
            <div className="cs-count">{certifications.length} total</div>
          </div>

          <div className="cs-list">
            {certifications.map((cert, index) => (
              <CertificationCard key={cert.id} certification={cert} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

interface CertificationCardProps {
  certification: CertificationItem;
  index: number;
}

function CertificationCard({ certification, index }: CertificationCardProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    <div
      ref={ref}
      className="cs-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(8px)",
        transition: `opacity 0.4s ease ${index * 55}ms, transform 0.4s ease ${index * 55}ms, background 0.15s ease`,
      }}
    >
      {/* Verified icon */}
      <div className="cs-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      </div>

      {/* Content */}
      <div className="cs-body">
        <div className="cs-name">{certification.title}</div>
        <div className="cs-meta">
          {certification.issuer && (
            <span className="cs-issuer">{certification.issuer}</span>
          )}
          {certification.issuer && certification.issueDate && (
            <span className="cs-dot" />
          )}
          {certification.issueDate && (
            <span className="cs-date">{certification.issueDate}</span>
          )}
        </div>
      </div>

      {/* Link */}
      <div className="cs-action">
        {certification.credentialUrl ? (
          <a
            href={certification.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cs-link"
            aria-label={`View credential for ${certification.title}`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </a>
        ) : (
          <div className="cs-no-link" />
        )}
      </div>
    </div>
  );
}
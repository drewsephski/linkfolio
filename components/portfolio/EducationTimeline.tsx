"use client";

import { useEffect, useRef, useState } from "react";
import type { EducationItem } from "@/lib/data-normalization";

interface EducationTimelineProps {
  education: EducationItem[];
}

export function EducationTimeline({ education }: EducationTimelineProps) {
  if (!education || education.length === 0) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .edu {
          --bg:      #000;
          --surface: #0a0a0a;
          --s2:      #111;
          --b:       rgba(255,255,255,0.08);
          --bh:      rgba(255,255,255,0.14);
          --t1:      #ededed;
          --t2:      #a1a1a1;
          --t3:      #555;
          --thread:  rgba(255,255,255,0.08);
          --node:    rgba(255,255,255,0.2);
          --font:    'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--t1);
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
          border-top: 1px solid var(--b);
          padding: 72px 0 80px;
        }
        .edu *, .edu *::before, .edu *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .edu-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .edu-hdr {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 48px;
        }
        .edu-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--t3);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .edu-label::before {
          content: '';
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--t3);
        }
        .edu-count { font-size: 11px; color: var(--t3); }

        /* Timeline */
        .edu-timeline {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .edu-timeline::before {
          content: '';
          position: absolute;
          left: 5px;
          top: 6px;
          bottom: 6px;
          width: 1px;
          background: var(--thread);
        }

        .edu-entry {
          position: relative;
          padding: 0 0 32px 36px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .edu-entry.in { opacity: 1; transform: none; }
        .edu-entry:last-child { padding-bottom: 0; }

        .edu-node {
          position: absolute;
          left: 0; top: 6px;
          width: 11px; height: 11px;
          border-radius: 50%;
          border: 1.5px solid var(--node);
          background: var(--bg);
          transition: border-color 0.2s ease;
          z-index: 1;
        }
        .edu-entry:hover .edu-node { border-color: var(--t2); }

        /* Card — slightly lighter weight than experience */
        .edu-card {
          border: 1px solid var(--b);
          border-radius: 10px;
          background: var(--bg);
          padding: 18px 20px;
          transition: border-color 0.18s ease, background 0.18s ease;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .edu-card:hover {
          border-color: var(--bh);
          background: rgba(255,255,255,0.015);
        }

        .edu-card-left { min-width: 0; flex: 1; }

        .edu-school {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--t1);
          line-height: 1.3;
          margin-bottom: 4px;
        }
        .edu-degree {
          font-size: 12.5px;
          font-weight: 400;
          color: var(--t2);
          letter-spacing: -0.01em;
          line-height: 1.4;
        }

        .edu-card-right {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }
        .edu-duration {
          font-size: 11px;
          color: var(--t3);
          letter-spacing: -0.01em;
          white-space: nowrap;
          padding: 3px 9px;
          border: 1px solid var(--b);
          border-radius: 5px;
        }
        .edu-icon {
          width: 22px; height: 22px;
          border: 1px solid var(--b);
          border-radius: 5px;
          display: flex; align-items: center; justify-content: center;
          color: var(--t3);
          flex-shrink: 0;
        }

        @media (max-width: 600px) {
          .edu-inner { padding: 0 24px; }
          .edu-card { flex-direction: column; gap: 10px; }
          .edu-card-right { flex-direction: row; align-items: center; }
        }
      `}</style>

      <section className="edu">
        <div className="edu-inner">
          <div className="edu-hdr">
            <div className="edu-label">Education</div>
            <div className="edu-count">{education.length} {education.length === 1 ? "institution" : "institutions"}</div>
          </div>

          <div className="edu-timeline">
            {education.map((edu, index) => (
              <EducationEntry key={edu.id} education={edu} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function EducationEntry({ education, index }: { education: EducationItem; index: number }) {
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
      className={`edu-entry${visible ? " in" : ""}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="edu-node" />
      <div className="edu-card">
        <div className="edu-card-left">
          <div className="edu-school">{education.school}</div>
          {education.degree && (
            <div className="edu-degree">{education.degree}</div>
          )}
        </div>
        <div className="edu-card-right">
          {education.duration && (
            <div className="edu-duration">{education.duration}</div>
          )}
          <div className="edu-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
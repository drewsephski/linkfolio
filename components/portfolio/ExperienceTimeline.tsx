

"use client";

import { useEffect, useRef, useState } from "react";
import type { ExperienceItem } from "@/lib/data-normalization";

interface ExperienceTimelineProps {
  experience: ExperienceItem[];
  experienceUnavailable?: boolean;
}

function CurrentExperienceSection({ job }: { job: ExperienceItem }) {
  // Split description into bullet points if it contains newlines or bullet chars
  const desc = job.description?.trim() ?? "";
  const lines = desc.split(/\n+/).map(l => l.replace(/^[-•·]\s*/, "").trim()).filter(Boolean);
  const isBulleted = lines.length > 1;

  return (
    <div className="exp-current">
      <div className="exp-current-label">Current Role</div>
      <div className="exp-current-title">{job.title}</div>
      {job.company && (
        <div className="exp-current-company">{job.company}</div>
      )}
      {job.duration && (
        <div className="exp-current-duration">{job.duration}</div>
      )}
      
      {desc && (
        <>
          {isBulleted ? (
            <div className="exp-current-desc-bullet">
              {lines.map((line, i) => (
                <div key={i} className="exp-current-desc-bullet-item">{line}</div>
              ))}
            </div>
          ) : (
            <div className="exp-current-desc">{desc}</div>
          )}
        </>
      )}
    </div>
  );
}

export function ExperienceTimeline({ experience, experienceUnavailable }: ExperienceTimelineProps) {
  // Show helpful message when experience data is unavailable
  if (experienceUnavailable) {
    return (
      <div className="experience-unavailable">
        <h3>Professional Experience</h3>
        <p className="text-muted">
          We weren&apos;t able to retrieve the complete work history for this profile from LinkedIn. 
          This can happen when LinkedIn&apos;s data access is limited or the profile has privacy restrictions.
        </p>
        <p className="text-small">
          The professional summary above contains information about their experience and expertise.
        </p>
      </div>
    );
  }

  if (!experience || experience.length === 0) return null;

  // Find current experience (first one marked as current, or first item if none marked)
  const currentExperience = experience.find(exp => exp.current) || experience[0];
  // Filter out current experience from the timeline to avoid duplication
  const pastExperience = experience.filter(exp => exp.id !== currentExperience?.id);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .exp {
          --bg:      #000;
          --surface: #0a0a0a;
          --s2:      #111;
          --b:       rgba(255,255,255,0.08);
          --bh:      rgba(255,255,255,0.14);
          --t1:      #ededed;
          --t2:      #a1a1a1;
          --t3:      #555;
          --thread:  rgba(255,255,255,0.1);
          --node:    rgba(255,255,255,0.25);
          --node-a:  #ededed;
          --accent:  #059669;
          --accent-surface: rgba(5, 150, 105, 0.1);
          --accent-border: rgba(5, 150, 105, 0.3);
          --font:    'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--t1);
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
          border-top: 1px solid var(--b);
          padding: 72px 0 80px;
        }
        .exp *, .exp *::before, .exp *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .exp-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* Section header */
        .exp-hdr {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 48px;
        }
        .exp-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--t3);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .exp-label::before {
          content: '';
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--t3);
        }
        .exp-count { font-size: 11px; color: var(--t3); }

        /* Timeline wrapper */
        .exp-timeline {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Continuous vertical thread */
        .exp-timeline::before {
          content: '';
          position: absolute;
          left: 5px;
          top: 6px;
          bottom: 6px;
          width: 1px;
          background: var(--thread);
        }

        /* Individual entry */
        .exp-entry {
          position: relative;
          padding: 0 0 40px 36px;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.45s ease, transform 0.45s ease;
        }
        .exp-entry.in {
          opacity: 1;
          transform: none;
        }
        .exp-entry:last-child {
          padding-bottom: 0;
        }

        /* Node dot */
        .exp-node {
          position: absolute;
          left: 0;
          top: 6px;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          border: 1.5px solid var(--node);
          background: var(--bg);
          transition: border-color 0.2s ease, background 0.2s ease;
          z-index: 1;
        }
        .exp-entry:hover .exp-node {
          border-color: var(--node-a);
          background: rgba(255,255,255,0.08);
        }
        /* First node is active/brighter */
        .exp-entry:first-child .exp-node {
          border-color: var(--t2);
        }

        /* Card */
        .exp-card {
          border: 1px solid var(--b);
          border-radius: 10px;
          background: var(--bg);
          padding: 20px 22px;
          transition: border-color 0.18s ease, background 0.18s ease;
          cursor: default;
        }
        .exp-card:hover {
          border-color: var(--bh);
          background: rgba(255,255,255,0.015);
        }

        /* Card header row */
        .exp-card-hdr {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 12px;
        }

        .exp-title-block { min-width: 0; flex: 1; }

        .exp-title {
          font-size: 14.5px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--t1);
          line-height: 1.3;
          margin-bottom: 3px;
        }
        .exp-company {
          font-size: 12.5px;
          font-weight: 400;
          color: var(--t3);
          letter-spacing: -0.01em;
        }

        .exp-duration {
          flex-shrink: 0;
          font-size: 11px;
          color: var(--t3);
          letter-spacing: -0.01em;
          white-space: nowrap;
          padding: 3px 9px;
          border: 1px solid var(--b);
          border-radius: 5px;
          font-variant-numeric: tabular-nums;
        }

        /* Separator */
        .exp-sep {
          width: 100%;
          height: 1px;
          background: var(--b);
          margin: 14px 0;
        }

        /* Description */
        .exp-desc {
          font-size: 13px;
          font-weight: 400;
          color: var(--t2);
          line-height: 1.7;
          letter-spacing: -0.01em;
          white-space: pre-wrap;
        }

        /* Bullet list auto-formatting */
        .exp-desc-bullet {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .exp-desc-bullet-item {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: 13px;
          color: var(--t2);
          line-height: 1.65;
          letter-spacing: -0.01em;
        }
        .exp-desc-bullet-item::before {
          content: '—';
          color: var(--t3);
          flex-shrink: 0;
          font-size: 11px;
        }

        @media (max-width: 600px) {
          .exp-inner { padding: 0 24px; }
          .exp-card-hdr { flex-direction: column; gap: 8px; }
          .exp-duration { align-self: flex-start; }
        }

        /* Current experience section */
        .exp-current {
          background: var(--accent-surface);
          border: 1px solid var(--accent-border);
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 48px;
          position: relative;
          overflow: hidden;
        }
        .exp-current::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--accent);
        }
        .exp-current-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .exp-current-label::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          animation: pulse 2s infinite;
        }
        .exp-current-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--t1);
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .exp-current-company {
          font-size: 14px;
          color: var(--t2);
          margin-bottom: 16px;
        }
        .exp-current-duration {
          display: inline-block;
          font-size: 11px;
          color: var(--accent);
          font-weight: 500;
          padding: 4px 10px;
          border: 1px solid var(--accent-border);
          border-radius: 6px;
          background: rgba(5, 150, 105, 0.05);
          margin-bottom: 16px;
        }
        .exp-current-desc {
          font-size: 14px;
          color: var(--t2);
          line-height: 1.7;
        }
        .exp-current-desc-bullet {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .exp-current-desc-bullet-item {
          display: flex;
          align-items: baseline;
          gap: 10px;
          font-size: 14px;
          color: var(--t2);
          line-height: 1.65;
        }
        .exp-current-desc-bullet-item::before {
          content: '—';
          color: var(--accent);
          flex-shrink: 0;
          font-size: 12px;
          font-weight: 600;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <section className="exp">
        <div className="exp-inner">
          <div className="exp-hdr">
            <div className="exp-label">Experience</div>
            <div className="exp-count">{experience.length} roles</div>
          </div>

          {/* Current Experience - Prominent Display */}
          {currentExperience && (
            <CurrentExperienceSection job={currentExperience} />
          )}

          {/* Past Experience Timeline */}
          {pastExperience.length > 0 && (
            <div className="exp-timeline">
              {pastExperience.map((job, index) => (
                <ExperienceEntry key={job.id} job={job} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function ExperienceEntry({ job, index }: { job: ExperienceItem; index: number }) {
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

  // Split description into bullet points if it contains newlines or bullet chars
  const desc = job.description?.trim() ?? "";
  const lines = desc.split(/\n+/).map(l => l.replace(/^[-•·]\s*/, "").trim()).filter(Boolean);
  const isBulleted = lines.length > 1;

  return (
    <div
      ref={ref}
      className={`exp-entry${visible ? " in" : ""}`}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <div className="exp-node" />
      <div className="exp-card">
        <div className="exp-card-hdr">
          <div className="exp-title-block">
            <div className="exp-title">{job.title}</div>
            {job.company && (
              <div className="exp-company">{job.company}</div>
            )}
          </div>
          {job.duration && (
            <div className="exp-duration">{job.duration}</div>
          )}
        </div>

        {desc && (
          <>
            <div className="exp-sep" />
            {isBulleted ? (
              <div className="exp-desc-bullet">
                {lines.map((line, i) => (
                  <div key={i} className="exp-desc-bullet-item">{line}</div>
                ))}
              </div>
            ) : (
              <div className="exp-desc">{desc}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
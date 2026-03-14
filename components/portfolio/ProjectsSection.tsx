"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectItem } from "@/lib/data-normalization";

interface ProjectsSectionProps {
  projects: ProjectItem[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .prj {
          --bg:       #000;
          --surface:  #0a0a0a;
          --s2:       #111;
          --b:        rgba(255,255,255,0.08);
          --bh:       rgba(255,255,255,0.14);
          --t1:       #ededed;
          --t2:       #a1a1a1;
          --t3:       #555;
          --accent:   #2563eb;
          --font:     'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--t1);
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
          border-top: 1px solid var(--b);
          padding: 72px 0 80px;
        }
        .prj *, .prj *::before, .prj *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .prj-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* Section header */
        .prj-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .prj-title {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--t3);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .prj-title::before {
          content: '';
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--t3);
          display: inline-block;
        }
        .prj-count {
          font-size: 11px;
          color: var(--t3);
          letter-spacing: -0.01em;
        }

        /* Project list */
        .prj-list {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--b);
          border-radius: 12px;
          overflow: hidden;
        }

        .prj-card {
          position: relative;
          padding: 32px 32px 32px 36px;
          border-bottom: 1px solid var(--b);
          background: var(--bg);
          cursor: pointer;
          transition: all 0.2s ease;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: start;
          text-decoration: none;
          color: inherit;
        }
        .prj-card:last-child { border-bottom: none; }
        .prj-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: var(--accent);
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 0 2px 2px 0;
        }
        .prj-card:hover { 
          background: rgba(37, 99, 235, 0.05); 
          transform: translateX(2px);
        }
        .prj-card:hover::before { transform: scaleY(1); }

        .prj-card-left { min-width: 0; }

        .prj-card-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .prj-index {
          font-size: 10.5px;
          font-weight: 500;
          color: var(--t3);
          letter-spacing: 0.04em;
          font-variant-numeric: tabular-nums;
          width: 20px;
        }
        .prj-date {
          font-size: 11px;
          color: var(--t3);
          letter-spacing: -0.01em;
        }
        .prj-date-dot {
          width: 2px; height: 2px;
          border-radius: 50%;
          background: var(--t3);
          flex-shrink: 0;
        }

        .prj-name {
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--t1);
          margin-bottom: 10px;
          line-height: 1.3;
        }

        .prj-desc {
          font-size: 14px;
          font-weight: 400;
          color: var(--t2);
          line-height: 1.6;
          letter-spacing: -0.01em;
          max-width: 580px;
        }

        .prj-card-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-shrink: 0;
          padding-top: 2px;
        }
        .prj-arrow {
          width: 32px; height: 32px;
          border: 1px solid var(--b);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: var(--t3);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .prj-card:hover .prj-arrow {
          border-color: var(--accent);
          color: #fff;
          background: var(--accent);
          transform: translate(4px, -4px);
        }

        @media (max-width: 600px) {
          .prj-inner { padding: 0 24px; }
          .prj-card { grid-template-columns: 1fr; gap: 12px; padding: 22px 20px 22px 24px; }
          .prj-card-right { justify-content: flex-start; }
        }
      `}</style>

      <section className="prj">
        <div className="prj-inner">
          <div className="prj-header">
            <div className="prj-title">Projects</div>
            <div className="prj-count">{projects.length} total</div>
          </div>

          <div className="prj-list">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

interface ProjectCardProps {
  project: ProjectItem;
  index: number;
}

function ProjectCard({ project, index }: ProjectCardProps) {
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

  const Tag = project.url ? "a" : "div";
  const linkProps = project.url
    ? { href: project.url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(10px)",
        transition: `opacity 0.4s ease ${index * 60}ms, transform 0.4s ease ${index * 60}ms`,
      }}
    >
      <Tag className="prj-card" {...linkProps}>
        <div className="prj-card-left">
          <div className="prj-card-meta">
            <span className="prj-index">{String(index + 1).padStart(2, "0")}</span>
            {project.startDate && (
              <>
                <span className="prj-date-dot" />
                <span className="prj-date">{project.startDate}</span>
              </>
            )}
          </div>
          <div className="prj-name">{project.title}</div>
          {project.description && (
            <div className="prj-desc">{project.description}</div>
          )}
        </div>

        <div className="prj-card-right">
          <div className="prj-arrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </div>
        </div>
      </Tag>
    </div>
  );
}
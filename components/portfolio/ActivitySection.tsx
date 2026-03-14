"use client";

import { useEffect, useRef, useState } from "react";

interface ActivityItem {
  title: string;
  link?: string;
  img?: string;
  id?: string;
  interaction?: string;
}

interface ActivitySectionProps {
  activity: ActivityItem[];
  followers?: number;
  connections?: number;
}

export function ActivitySection({ activity, followers, connections }: ActivitySectionProps) {
  if (!activity || activity.length === 0) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .act {
          --bg:       #000;
          --surface:  #0a0a0a;
          --s2:       #111;
          --b:        rgba(255,255,255,0.08);
          --bh:       rgba(255,255,255,0.14);
          --t1:       #ededed;
          --t2:       #a1a1a1;
          --t3:       #555;
          --accent:   #7c3aed;
          --font:     'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--t1);
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
          border-top: 1px solid var(--b);
          padding: 72px 0 80px;
        }
        .act *, .act *::before, .act *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .act-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* Section header */
        .act-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .act-title {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--t3);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .act-title::before {
          content: '';
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--t3);
          display: inline-block;
        }
        .act-count {
          font-size: 11px;
          color: var(--t3);
          letter-spacing: -0.01em;
        }

        /* Stats bar */
        .act-stats {
          display: flex;
          gap: 24px;
          margin-bottom: 36px;
          padding: 20px 24px;
          background: var(--surface);
          border: 1px solid var(--b);
          border-radius: 12px;
        }
        .act-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .act-stat-value {
          font-size: 18px;
          font-weight: 600;
          color: var(--t1);
          letter-spacing: -0.02em;
        }
        .act-stat-label {
          font-size: 11px;
          color: var(--t3);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        /* Activity list */
        .act-list {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--b);
          border-radius: 12px;
          overflow: hidden;
        }

        .act-card {
          position: relative;
          padding: 20px 24px 20px 28px;
          border-bottom: 1px solid var(--b);
          background: var(--bg);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s ease;
          text-decoration: none;
          color: inherit;
        }
        .act-card:last-child { border-bottom: none; }
        .act-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          background: var(--accent);
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 0 1px 1px 0;
        }
        .act-card:hover { 
          background: rgba(124, 58, 237, 0.05); 
          transform: translateX(2px);
        }
        .act-card:hover::before { transform: scaleY(1); }

        .act-icon {
          width: 36px; height: 36px;
          border: 1px solid var(--b);
          border-radius: 8px;
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--t3);
          transition: all 0.2s ease;
        }
        .act-card:hover .act-icon {
          border-color: rgba(124, 58, 237, 0.3);
          color: var(--accent);
        }

        .act-content {
          flex: 1;
          min-width: 0;
        }

        .act-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--t1);
          letter-spacing: -0.01em;
          margin-bottom: 2px;
        }

        .act-interaction {
          font-size: 12px;
          color: var(--t3);
          letter-spacing: -0.01em;
        }

        .act-arrow {
          width: 24px; height: 24px;
          border: 1px solid var(--b);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--t3);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .act-card:hover .act-arrow {
          border-color: var(--accent);
          color: var(--accent);
          transform: translate(2px, -2px);
        }

        @media (max-width: 600px) {
          .act-inner { padding: 0 24px; }
          .act-stats { flex-direction: column; gap: 16px; }
          .act-card { padding: 16px 20px 16px 24px; }
          .act-arrow { display: none; }
        }
      `}</style>

      <section className="act">
        <div className="act-inner">
          <div className="act-header">
            <div className="act-title">Recent Activity</div>
            <div className="act-count">{activity.length} recent</div>
          </div>

          {/* Stats bar */}
          {(followers || connections) && (
            <div className="act-stats">
              {followers && (
                <div className="act-stat">
                  <div className="act-stat-value">{followers.toLocaleString()}</div>
                  <div className="act-stat-label">Followers</div>
                </div>
              )}
              {connections && (
                <div className="act-stat">
                  <div className="act-stat-value">{connections >= 500 ? "500+" : connections}</div>
                  <div className="act-stat-label">Connections</div>
                </div>
              )}
            </div>
          )}

          <div className="act-list">
            {activity.slice(0, 10).map((item, index) => (
              <ActivityCard key={item.id || index} activity={item} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

interface ActivityCardProps {
  activity: ActivityItem;
  index: number;
}

function ActivityCard({ activity, index }: ActivityCardProps) {
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

  const Tag = activity.link ? "a" : "div";
  const linkProps = activity.link
    ? { href: activity.link, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(8px)",
        transition: `opacity 0.4s ease ${index * 50}ms, transform 0.4s ease ${index * 50}ms`,
      }}
    >
      <Tag className="act-card" {...linkProps}>
        <div className="act-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="m22 21-3-3 3-3"/>
            <path d="M19 18v-6"/>
          </svg>
        </div>

        <div className="act-content">
          <div className="act-name">{activity.title}</div>
          {activity.interaction && (
            <div className="act-interaction">{activity.interaction}</div>
          )}
        </div>

        {activity.link && (
          <div className="act-arrow">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </div>
        )}
      </Tag>
    </div>
  );
}

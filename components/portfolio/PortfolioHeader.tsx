"use client";

import { useEffect, useState } from "react";  
import Image from "next/image";

interface PortfolioHeaderProps {
  name: string;
  headline: string;
  location: string;
  avatar?: string;
  bannerImage?: string;
  followers?: number;
  connections?: number;
  currentCompany?: string;
}

/**
 * Check if an image URL is likely to be an SVG
 */
function isSvgImage(url: string): boolean {
  return url.includes('.svg') || 
         url.includes('image/svg+xml') ||
         url.includes('licdn.com/aero-v1');
}

/**
 * Check if an image URL is from LinkedIn CDN that might have issues
 */
function isProblematicLinkedInImage(url: string): boolean {
  return url.includes('static.licdn.com/aero-v1') ||
         url.includes('media.licdn.com/aero-v1') ||
         url.includes('licdn.com/sc/h/');
}

export function PortfolioHeader({
  name,
  headline,
  location,
  avatar,
  bannerImage,
  followers,
  connections,
  currentCompany,
}: PortfolioHeaderProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const formatStat = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : n.toLocaleString();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .ph {
          --bg:           #000000;
          --surface:      #0a0a0a;
          --surface-2:    #111111;
          --border:       rgba(255,255,255,0.08);
          --border-hi:    rgba(255,255,255,0.15);
          --text-1:       #ededed;
          --text-2:       #a1a1a1;
          --text-3:       #555555;
          --green:        #22c55e;
          --font:         'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--text-1);
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
          moz-osx-font-smoothing: grayscale;
        }
        .ph *, .ph *::before, .ph *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Hero ── */
        .ph-hero {
          position: relative;
          min-height: 320px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding-bottom: 48px;
          overflow: hidden;
        }

        .ph-hero-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.18;
        }
        .ph-hero-img-fade {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000 75%);
        }

        /* Dot grid — no-image mode */
        .ph-dot-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 24px 24px;
          mask-image: linear-gradient(to bottom,
            transparent 0%, rgba(0,0,0,0.5) 25%,
            rgba(0,0,0,0.5) 65%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom,
            transparent 0%, rgba(0,0,0,0.5) 25%,
            rgba(0,0,0,0.5) 65%, transparent 100%);
        }

        /* Ambient glow */
        .ph-glow {
          position: absolute;
          top: -20px; left: 50%;
          transform: translateX(-50%);
          width: 700px; height: 320px;
          background: radial-gradient(ellipse,
            rgba(255,255,255,0.032) 0%, transparent 65%);
          pointer-events: none;
        }

        .ph-hero-inner {
          position: relative;
          max-width: 860px;
          margin: 0 auto;
          padding: 0 40px;
          width: 100%;
          display: flex;
          align-items: flex-end;
          gap: 24px;
        }

        /* Avatar */
        .ph-avatar {
          flex-shrink: 0;
          width: 88px; height: 88px;
          border-radius: 50%;
          border: 1px solid var(--border-hi);
          background: var(--surface-2);
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          position: relative;
          opacity: 0; transform: scale(0.9) translateY(6px);
          transition: opacity 0.5s cubic-bezier(0.16,1,0.3,1),
                      transform 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .ph-avatar.in { opacity: 1; transform: scale(1) translateY(0); }
        .ph-avatar .ph-avatar-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ph-avatar-initials {
          font-size: 19px; font-weight: 500;
          color: var(--text-2); letter-spacing: -0.02em;
        }
        .ph-avatar::after {
          content: '';
          position: absolute; bottom: 3px; right: 3px;
          width: 9px; height: 9px;
          background: var(--green);
          border-radius: 50%;
          border: 1.5px solid #000;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.2);
        }

        .ph-info {
          flex: 1;
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.55s cubic-bezier(0.16,1,0.3,1) 0.07s,
                      transform 0.55s cubic-bezier(0.16,1,0.3,1) 0.07s;
        }
        .ph-info.in { opacity: 1; transform: none; }

        /* Company badge */
        .ph-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 3px 9px 3px 3px;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: rgba(255,255,255,0.04);
          margin-bottom: 14px;
          font-size: 11px; font-weight: 500;
          color: var(--text-3);
          letter-spacing: 0em;
          backdrop-filter: blur(4px);
        }
        .ph-badge-icon {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--surface-2);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; color: var(--text-3);
          flex-shrink: 0;
        }

        .ph-name {
          font-size: clamp(34px, 5vw, 54px);
          font-weight: 600;
          letter-spacing: -0.045em;
          line-height: 1.05;
          color: var(--text-1);
          margin-bottom: 12px;
        }

        .ph-headline {
          font-size: 14.5px; font-weight: 400;
          color: var(--text-2);
          line-height: 1.65;
          max-width: 500px;
          letter-spacing: -0.01em;
        }

        /* ── Meta bar ── */
        .ph-bar {
          border-top: 1px solid var(--border);
          opacity: 0; transform: translateY(6px);
          transition: opacity 0.45s ease 0.18s, transform 0.45s ease 0.18s;
        }
        .ph-bar.in { opacity: 1; transform: none; }

        .ph-bar-inner {
          max-width: 860px; margin: 0 auto;
          padding: 0 40px;
          height: 44px;
          display: flex; align-items: center;
          gap: 0;
        }

        .ph-bar-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: var(--text-3);
          letter-spacing: -0.01em;
          padding-right: 16px; margin-right: 16px;
          border-right: 1px solid var(--border);
          white-space: nowrap;
        }
        .ph-bar-item:last-of-type { border-right: none; }
        .ph-bar-item svg { color: var(--text-3); flex-shrink: 0; }

        .ph-bar-sep { flex: 1; }

        .ph-stats {
          display: flex; align-items: center; gap: 0;
          min-width: 140px;
          justify-content: space-between;
        }
        .ph-stat {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: 0 12px;
          text-align: center;
          min-width: 60px;
        }
        .ph-stat:first-child {
          border-right: 1px solid var(--border);
        }
        .ph-stat-n {
          font-size: 13px; font-weight: 600;
          color: var(--text-1); letter-spacing: -0.02em;
          line-height: 1;
        }
        .ph-stat-l {
          font-size: 10px; color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }
      `}</style>

      <div className="ph">
        <div className="ph-hero">
          {bannerImage && !isProblematicLinkedInImage(bannerImage) && (
            <div className="ph-hero-img-container">
              <Image
                src={bannerImage}
                alt={`${name}'s professional background`}
                className="ph-hero-img"
                width={1200}
                height={400}
                unoptimized={isSvgImage(bannerImage)}
                onError={() => {
                  console.error('Banner image failed to load:', bannerImage);
                }}
                onLoad={() => {
                  console.log('Banner image loaded successfully:', bannerImage);
                }}
              />
            </div>
          )}
          <div className="ph-hero-img-fade" />
          {bannerImage ? (
            <></>
          ) : (
            <>
              <div className="ph-dot-grid" />
              <div className="ph-glow" />
            </>
          )}

          <div className="ph-hero-inner">
            <div className={`ph-avatar${mounted ? " in" : ""}`}>
              {avatar && !isProblematicLinkedInImage(avatar) ? (
                <Image
                  src={avatar} 
                  alt={name}
                  className="ph-avatar-img"
                  width={120}
                  height={120}
                  unoptimized={isSvgImage(avatar)}
                  onError={(_e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    console.error('Avatar image failed to load:', avatar);
                    // Fallback to initials
                    const target = _e.target;
                    if (target instanceof HTMLImageElement) {
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('span');
                        fallback.className = 'ph-avatar-initials';
                        fallback.textContent = initials;
                        parent.appendChild(fallback);
                      }
                    }
                  }}
                  onLoad={() => {
                    console.log('Avatar image loaded successfully:', avatar);
                  }}
                />
              ) : (
                <span className="ph-avatar-initials">{initials}</span>
              )}
            </div>

            <div className={`ph-info${mounted ? " in" : ""}`}>
              {currentCompany && (
                <div className="ph-badge">
                  <span className="ph-badge-icon">@</span>
                  {currentCompany}
                </div>
              )}
              <h1 className="ph-name">{name}</h1>
              <p className="ph-headline">{headline}</p>
              {currentCompany && (
                <div style={{
                  fontSize: '13px',
                  color: '#22c55e',
                  fontWeight: '500',
                  marginTop: '8px',
                  letterSpacing: '-0.01em'
                }}>
                  Currently at {currentCompany}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`ph-bar${mounted ? " in" : ""}`}>
          <div className="ph-bar-inner">
            {location && (
              <div className="ph-bar-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                {location}
              </div>
            )}
            <div className="ph-bar-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              Open to opportunities
            </div>

            <div className="ph-bar-sep" />

            {(followers || connections) && (
              <div className="ph-stats">
                {followers && (
                  <div className="ph-stat">
                    <span className="ph-stat-n">{formatStat(followers)}</span>
                    <span className="ph-stat-l">followers</span>
                  </div>
                )}
                {connections && (
                  <div className="ph-stat">
                    <span className="ph-stat-n">{connections >= 500 ? "500+" : connections}</span>
                    <span className="ph-stat-l">connections</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
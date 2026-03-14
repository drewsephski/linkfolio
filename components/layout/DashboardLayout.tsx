'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'analytics' | 'settings';
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, currentPage, title, subtitle }: DashboardLayoutProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [portfolios, setPortfolios] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  useEffect(() => {
    // Load portfolios for sidebar stats
    const loadPortfolios = async () => {
      try {
        const { getUserPortfolios, getPortfolioMetadata } = await import('@/lib/portfolio-storage');
        const ids = await getUserPortfolios(user?.id || '');
        const meta = await Promise.all(ids.map((id: string) => getPortfolioMetadata(id)));
        setPortfolios(meta.filter(Boolean));
      } catch (error) {
        console.error('Failed to load portfolios for sidebar:', error);
      }
    };

    if (user) {
      loadPortfolios();
    }
  }, [user]);

  const formattedDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .db-layout {
          --bg:      #000;
          --surface: #0a0a0a;
          --s2:      #111;
          --s3:      #161616;
          --b:       rgba(255,255,255,0.08);
          --bh:      rgba(255,255,255,0.14);
          --bf:      rgba(255,255,255,0.22);
          --t1:      #ededed;
          --t2:      #a1a1a1;
          --t3:      #555;
          --green:   #22c55e;
          --font:    'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          background: var(--bg);
          color: var(--t1);
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
          display: flex;
          flex-direction: column;
        }
        .db-layout *, .db-layout *::before, .db-layout *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Top nav ── */
        .db-nav {
          position: sticky; top: 0; z-index: 50;
          border-bottom: 1px solid var(--b);
          background: rgba(0,0,0,0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          flex-shrink: 0;
        }
        .db-nav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 32px;
          height: 52px; display: flex; align-items: center; justify-content: space-between;
        }
        .db-logo {
          font-size: 14px; font-weight: 600; letter-spacing: -.03em;
          color: var(--t1); text-decoration: none;
        }
        .db-nav-right { display: flex; align-items: center; gap: 8px; }
        .db-user-label {
          font-size: 12px; color: var(--t3); letter-spacing: -.01em;
          padding: 0 10px; border-right: 1px solid var(--b);
          margin-right: 2px;
        }
        .db-nav-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 11px; border: 1px solid var(--b); border-radius: 6px;
          font-size: 12px; color: var(--t3); letter-spacing: -.01em;
          text-decoration: none; background: transparent; cursor: pointer;
          font-family: var(--font);
          transition: border-color .15s, color .15s, background .15s;
        }
        .db-nav-pill:hover { border-color: var(--bh); color: var(--t2); background: rgba(255,255,255,0.03); }
        .db-nav-pill.danger:hover { border-color: rgba(248,113,113,0.3); color: #f87171; }

        /* ── Layout ── */
        .db-layout-content {
          flex: 1;
          display: grid;
          grid-template-columns: 220px 1fr;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── Sidebar ── */
        .db-sidebar {
          border-right: 1px solid var(--b);
          padding: 32px 0;
          position: sticky;
          top: 52px;
          height: calc(100vh - 52px);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .db-sidebar-section { padding: 0 16px; }
        .db-sidebar-label {
          font-size: 10px; font-weight: 500; letter-spacing: .08em;
          text-transform: uppercase; color: var(--t3);
          margin-bottom: 6px; padding: 0 8px;
        }
        .db-sidebar-nav { display: flex; flex-direction: column; gap: 1px; }
        .db-sidebar-link {
          display: flex; align-items: center; gap: 9px;
          padding: 7px 8px; border-radius: 6px;
          font-size: 13px; color: var(--t3); letter-spacing: -.01em;
          text-decoration: none;
          transition: background .15s, color .15s;
        }
        .db-sidebar-link:hover { background: rgba(255,255,255,0.04); color: var(--t2); }
        .db-sidebar-link.active { background: rgba(255,255,255,0.06); color: var(--t1); }
        .db-sidebar-link svg { flex-shrink: 0; color: var(--t3); }
        .db-sidebar-link.active svg,
        .db-sidebar-link:hover svg { color: var(--t2); }

        /* Sidebar stat */
        .db-sidebar-stat {
          padding: 0 8px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .db-sidebar-stat-label { font-size: 12px; color: var(--t3); }
        .db-sidebar-stat-val {
          font-size: 12px; font-weight: 600; color: var(--t1);
          letter-spacing: -.02em;
        }

        /* ── Main ── */
        .db-main { padding: 36px 40px 64px; min-width: 0; }

        /* ── Page header ── */
        .db-page-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 36px;
          opacity: 0; transform: translateY(10px);
          transition: opacity .45s ease, transform .45s ease;
        }
        .db-page-header.in { opacity: 1; transform: none; }

        .db-page-title {
          font-size: 22px; font-weight: 600;
          letter-spacing: -.04em; color: var(--t1);
          line-height: 1.1;
        }
        .db-page-sub {
          font-size: 13px; color: var(--t3);
          letter-spacing: -.01em; margin-top: 4px;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .db-layout-content { grid-template-columns: 1fr; }
          .db-sidebar { display: none; }
          .db-main { padding: 24px 20px 48px; }
          .db-nav-inner { padding: 0 20px; }
        }
      `}</style>

      <div className="db-layout">
        {/* Top nav */}
        <header className="db-nav">
          <div className="db-nav-inner">
            <Link href="/dashboard" className="db-logo">Linkfolio</Link>
            <div className="db-nav-right">
              <span className="db-user-label">{user?.email}</span>
              <Link href="/settings/profile" className="db-nav-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                Settings
              </Link>
              <button className="db-nav-pill danger" onClick={() => router.push('/auth/sign-out')}>
                Sign out
              </button>
            </div>
          </div>
        </header>

        <div className="db-layout-content">
          {/* Sidebar */}
          <aside className="db-sidebar">
            <div className="db-sidebar-section">
              <div className="db-sidebar-label">Workspace</div>
              <nav className="db-sidebar-nav">
                {[
                  { href: '/dashboard', label: 'Dashboard', active: currentPage === 'dashboard', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
                  { href: '/', label: 'New portfolio', active: false, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg> },
                  { href: '/analytics', label: 'Analytics', active: currentPage === 'analytics', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-3 3"/></svg> },
                  { href: '/settings/profile', label: 'Settings', active: currentPage === 'settings', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className={`db-sidebar-link${item.active ? ' active' : ''}`}>
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="db-sidebar-section">
              <div className="db-sidebar-label">Overview</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="db-sidebar-stat">
                  <span className="db-sidebar-stat-label">Portfolios</span>
                  <span className="db-sidebar-stat-val">{portfolios.length}</span>
                </div>
                <div className="db-sidebar-stat">
                  <span className="db-sidebar-stat-label">Account</span>
                  <span className="db-sidebar-stat-val" style={{ color: 'var(--t2)', fontSize: '11px', fontWeight: 400 }}>
                    {user?.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="db-main">
            {/* Page header */}
            <div className={`db-page-header${mounted ? ' in' : ''}`}>
              <div>
                <h1 className="db-page-title">{title || 'Dashboard'}</h1>
                {subtitle && <p className="db-page-sub">{subtitle}</p>}
              </div>
            </div>

            {/* Page content */}
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { getUserPortfolios, getPortfolioMetadata, deletePortfolio } from '@/lib/portfolio-storage';
import FullPageLoading from '@/components/ui/FullPageLoading';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface PortfolioMetadata {
  id: string;
  name: string;
  headline: string;
  generatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [portfolios, setPortfolios] = useState<PortfolioMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/sign-in'); return; }

    const load = async () => {
      try {
        const ids = await getUserPortfolios(user.id);
        const meta = await Promise.all(ids.map((id) => getPortfolioMetadata(id)));
        setPortfolios(meta.filter(Boolean) as PortfolioMetadata[]);
      } catch (e) {
        console.error('Failed to load portfolios:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <FullPageLoading message="Loading your workspace..." />;
  }

  const formattedDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleDeletePortfolio = async (portfolioId: string) => {
    setDeletingId(portfolioId);
    try {
      const success = await deletePortfolio(portfolioId);
      if (success) {
        // Remove the portfolio from the local state
        setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
        setShowDeleteConfirm(null);
      } else {
        alert('Failed to delete portfolio. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      alert('An error occurred while deleting the portfolio.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout currentPage="dashboard" title="Dashboard" subtitle="Manage your portfolios and account">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .db-content {
          --bg: #000;
          --surface: #0a0a0a;
          --s2: #111;
          --s3: #161616;
          --b: rgba(255,255,255,0.08);
          --bh: rgba(255,255,255,0.14);
          --bf: rgba(255,255,255,0.22);
          --t1: #ededed;
          --t2: #a1a1a1;
          --t3: #555;
          --green: #22c55e;
          --font: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          font-family: var(--font);
        }
        .db-content *, .db-content *::before, .db-content *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Create button ── */
        .db-create-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; background: var(--t1); color: #000;
          border-radius: 7px; font-size: 12.5px; font-weight: 600;
          letter-spacing: -.02em; text-decoration: none;
          transition: background .15s, transform .15s;
        }
        .db-create-btn:hover { background: #fff; transform: translateY(-1px); }
        .db-create-btn svg { transition: transform .15s cubic-bezier(.16,1,.3,1); }
        .db-create-btn:hover svg { transform: translateX(1px); }

        /* ── Stat row ── */
        .db-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border: 1px solid var(--b); border-radius: 12px; overflow: hidden;
          margin-bottom: 32px;
          opacity: 0; transform: translateY(10px);
          transition: opacity .45s ease .06s, transform .45s ease .06s;
        }
        .db-stats.in { opacity: 1; transform: none; }
        .db-stat {
          padding: 20px 24px;
          border-right: 1px solid var(--b);
        }
        .db-stat:last-child { border-right: none; }
        .db-stat-label {
          font-size: 10.5px; font-weight: 500; letter-spacing: .07em;
          text-transform: uppercase; color: var(--t3); margin-bottom: 8px;
        }
        .db-stat-val {
          font-size: 28px; font-weight: 600;
          letter-spacing: -.04em; color: var(--t1); line-height: 1;
          margin-bottom: 4px;
        }
        .db-stat-sub { font-size: 11.5px; color: var(--t3); letter-spacing: -.01em; }

        /* ── Section header ── */
        .db-section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px;
        }
        .db-section-title {
          font-size: 11px; font-weight: 500; letter-spacing: .07em;
          text-transform: uppercase; color: var(--t3);
          display: flex; align-items: center; gap: 7px;
        }
        .db-section-title::before {
          content: ''; width: 3px; height: 3px; border-radius: 50%;
          background: var(--t3); display: inline-block;
        }
        .db-section-link {
          font-size: 12px; color: var(--t3); letter-spacing: -.01em;
          text-decoration: none; transition: color .15s;
        }
        .db-section-link:hover { color: var(--t2); }

        /* ── Portfolio list ── */
        .db-portfolio-list {
          border: 1px solid var(--b); border-radius: 12px; overflow: hidden;
          margin-bottom: 32px;
          opacity: 0; transform: translateY(10px);
          transition: opacity .45s ease .12s, transform .45s ease .12s;
        }
        .db-portfolio-list.in { opacity: 1; transform: none; }

        .db-portfolio-row {
          position: relative;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--b);
          background: var(--bg);
          transition: background .15s;
        }
        .db-portfolio-row:last-child { border-bottom: none; }
        .db-portfolio-row::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
          background: var(--t1); transform: scaleY(0); transform-origin: bottom;
          transition: transform .2s cubic-bezier(.16,1,.3,1);
        }
        .db-portfolio-row:hover { background: rgba(255,255,255,0.02); }
        .db-portfolio-row:hover::before { transform: scaleY(1); }

        .db-port-left { min-width: 0; }
        .db-port-name {
          font-size: 13.5px; font-weight: 600;
          letter-spacing: -.025em; color: var(--t1);
          margin-bottom: 4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .db-port-meta {
          display: flex; align-items: center; gap: 8px;
          font-size: 11.5px; color: var(--t3);
        }
        .db-port-dot { width: 2px; height: 2px; border-radius: 50%; background: var(--t3); }
        .db-port-headline {
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          max-width: 380px; letter-spacing: -.01em;
        }

        .db-port-actions { display: flex; align-items: center; gap: 6px; }
        .db-port-action {
          display: flex; align-items: center;
          padding: 5px 10px; border: 1px solid var(--b); border-radius: 6px;
          font-size: 11.5px; color: var(--t3); text-decoration: none;
          letter-spacing: -.01em;
          transition: border-color .15s, color .15s, background .15s;
        }
        .db-port-action:hover { border-color: var(--bh); color: var(--t2); background: rgba(255,255,255,0.03); }
        .db-port-action.primary {
          background: var(--s2); border-color: var(--bh); color: var(--t2);
        }
        .db-port-action.primary:hover { color: var(--t1); border-color: var(--bf); }

        /* ── Delete button ── */
        .db-port-action.delete {
          color: #ef4444; border-color: rgba(239, 68, 68, 0.2);
        }
        .db-port-action.delete:hover { 
          color: #f87171; border-color: rgba(239, 68, 68, 0.3); 
          background: rgba(239, 68, 68, 0.1);
        }
        .db-port-action.delete:disabled {
          color: var(--t3); border-color: var(--b); background: transparent;
          cursor: not-allowed;
        }

        /* ── Delete confirmation dialog ── */
        .db-delete-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; opacity: 0; transition: opacity .2s;
        }
        .db-delete-overlay.show { opacity: 1; }
        .db-delete-dialog {
          background: var(--surface); border: 1px solid var(--b); border-radius: 12px;
          padding: 24px; max-width: 400px; width: 90%;
          transform: scale(0.95); transition: transform .2s;
        }
        .db-delete-overlay.show .db-delete-dialog { transform: scale(1); }
        .db-delete-title {
          font-size: 16px; font-weight: 600; color: var(--t1);
          margin-bottom: 8px;
        }
        .db-delete-message {
          font-size: 13px; color: var(--t2); line-height: 1.5;
          margin-bottom: 20px;
        }
        .db-delete-actions {
          display: flex; gap: 8px; justify-content: flex-end;
        }
        .db-delete-btn {
          padding: 8px 16px; border-radius: 6px; font-size: 12px;
          font-weight: 500; cursor: pointer; transition: all .15s;
          border: 1px solid var(--b); background: transparent;
        }
        .db-delete-btn.cancel {
          color: var(--t2);
        }
        .db-delete-btn.cancel:hover {
          background: var(--s2); color: var(--t1);
        }
        .db-delete-btn.confirm {
          background: #ef4444; color: white; border-color: #ef4444;
        }
        .db-delete-btn.confirm:hover {
          background: #f87171; border-color: #f87171;
        }
        .db-delete-btn.confirm:disabled {
          background: var(--t3); border-color: var(--t3); cursor: not-allowed;
        }

        /* ── Empty state ── */
        .db-empty {
          border: 1px solid var(--b); border-radius: 12px;
          padding: 56px 24px; text-align: center;
          margin-bottom: 32px;
          opacity: 0; transform: translateY(10px);
          transition: opacity .45s ease .12s, transform .45s ease .12s;
        }
        .db-empty.in { opacity: 1; transform: none; }
        .db-empty-icon {
          width: 36px; height: 36px; margin: 0 auto 14px;
          border: 1px solid var(--b); border-radius: 8px;
          background: var(--surface);
          display: flex; align-items: center; justify-content: center; color: var(--t3);
        }
        .db-empty-title { font-size: 14px; font-weight: 600; letter-spacing: -.02em; margin-bottom: 6px; }
        .db-empty-sub { font-size: 12.5px; color: var(--t3); margin-bottom: 20px; letter-spacing: -.01em; }
        .db-empty-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; background: var(--t1); color: #000;
          border-radius: 7px; font-size: 12.5px; font-weight: 600;
          letter-spacing: -.02em; text-decoration: none;
          transition: background .15s;
        }
        .db-empty-btn:hover { background: #fff; }

        /* ── Account section ── */
        .db-account {
          border: 1px solid var(--b); border-radius: 12px; overflow: hidden;
          opacity: 0; transform: translateY(10px);
          transition: opacity .45s ease .18s, transform .45s ease .18s;
        }
        .db-account.in { opacity: 1; transform: none; }
        .db-account-row {
          display: grid; grid-template-columns: 160px 1fr;
          border-bottom: 1px solid var(--b);
          align-items: center; min-height: 44px;
        }
        .db-account-row:last-child { border-bottom: none; }
        .db-account-key {
          padding: 12px 20px; font-size: 11.5px;
          color: var(--t3); letter-spacing: -.01em;
          border-right: 1px solid var(--b);
        }
        .db-account-val {
          padding: 12px 20px; font-size: 13px;
          color: var(--t1); letter-spacing: -.01em;
        }
        .db-verified-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; color: #4ade80;
        }
        .db-verified-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; }
        .db-unverified { font-size: 11px; color: var(--t3); }

        /* Mobile */
        @media (max-width: 768px) {
          .db-stats { grid-template-columns: 1fr 1fr; }
          .db-stats .db-stat:nth-child(2) { border-right: none; }
          .db-stats .db-stat:last-child { grid-column: span 2; border-top: 1px solid var(--b); }
          .db-port-headline { max-width: 180px; }
        }
      `}</style>

      <div className="db-content">
        {/* Page header with create button */}
        <div className={`db-page-header${mounted ? ' in' : ''}`} style={{ marginBottom: '36px' }}>
          <Link href="/" className="db-create-btn">
            New portfolio
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* Stat row */}
        <div className={`db-stats${mounted ? ' in' : ''}`}>
          <div className="db-stat">
            <div className="db-stat-label">Portfolios</div>
            <div className="db-stat-val">{portfolios.length}</div>
            <div className="db-stat-sub">total created</div>
          </div>
          <div className="db-stat">
            <div className="db-stat-label">Status</div>
            <div className="db-stat-val" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
              Active
            </div>
            <div className="db-stat-sub">account in good standing</div>
          </div>
          <div className="db-stat">
            <div className="db-stat-label">Member since</div>
            <div className="db-stat-val" style={{ fontSize: '18px' }}>
              {new Date(user?.createdAt ?? Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
            <div className="db-stat-sub">{user?.emailVerified ? 'Email verified' : 'Email unverified'}</div>
          </div>
        </div>

        {/* Portfolios */}
        <div className="db-section-header" style={{ marginBottom: '12px' }}>
          <div className="db-section-title">Your portfolios</div>
          {portfolios.length > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--t3)' }}>{portfolios.length} total</span>
          )}
        </div>

        {portfolios.length === 0 ? (
          <div className={`db-empty${mounted ? ' in' : ''}`}>
            <div className="db-empty-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="db-empty-title">No portfolios yet</div>
            <div className="db-empty-sub">Paste a LinkedIn URL to generate your first portfolio.</div>
            <Link href="/" className="db-empty-btn">
              Create portfolio
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        ) : (
          <div className={`db-portfolio-list${mounted ? ' in' : ''}`}>
            {portfolios.map((portfolio, i) => (
              <div
                key={portfolio.id}
                className="db-portfolio-row"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'none' : 'translateY(6px)',
                  transition: `opacity .4s ease ${0.14 + i * 0.05}s, transform .4s ease ${0.14 + i * 0.05}s, background .15s`,
                }}
              >
                <div className="db-port-left">
                  <div className="db-port-name">{portfolio.name}</div>
                  <div className="db-port-meta">
                    <span>{formattedDate(portfolio.generatedAt)}</span>
                    {portfolio.headline && (
                      <>
                        <span className="db-port-dot" />
                        <span className="db-port-headline">{portfolio.headline}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="db-port-actions">
                  <Link href={`/edit/${portfolio.id}`} className="db-port-action">Edit</Link>
                  <button
                    className="db-port-action delete"
                    onClick={() => setShowDeleteConfirm(portfolio.id)}
                    disabled={deletingId === portfolio.id}
                  >
                    {deletingId === portfolio.id ? 'Deleting...' : 'Delete'}
                  </button>
                  <Link href={`/portfolio/${portfolio.id}`} target="_blank" className="db-port-action primary">
                    View
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                      <path d="M7 17L17 7M7 7h10v10"/>
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete confirmation dialog */}
        {showDeleteConfirm && (
          <div 
            className={`db-delete-overlay ${showDeleteConfirm ? 'show' : ''}`}
            onClick={() => setShowDeleteConfirm(null)}
          >
            <div 
              className="db-delete-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="db-delete-title">Delete Portfolio</div>
              <div className="db-delete-message">
                Are you sure you want to delete &quot;{portfolios.find(p => p.id === showDeleteConfirm)?.name}&quot;? This action cannot be undone.
              </div>
              <div className="db-delete-actions">
                <button 
                  className="db-delete-btn cancel"
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={deletingId !== null}
                >
                  Cancel
                </button>
                <button 
                  className="db-delete-btn confirm"
                  onClick={() => handleDeletePortfolio(showDeleteConfirm)}
                  disabled={deletingId !== null}
                >
                  {deletingId === showDeleteConfirm ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account */}
        <div className="db-section-header" style={{ marginBottom: '12px', marginTop: '40px' }}>
          <div className="db-section-title">Account information</div>
        </div>
        <div className={`db-account${mounted ? ' in' : ''}`}>
          {[
            { key: 'Email', val: user?.email },
            { key: 'Name', val: user?.profile?.name || 'Not set' },
            {
              key: 'Email verified',
              val: user?.emailVerified
                ? <span className="db-verified-badge"><span className="db-verified-dot" />Verified</span>
                : <span className="db-unverified">Not verified</span>
            },
            {
              key: 'Member since',
              val: new Date(user?.createdAt ?? Date.now()).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })
            },
          ].map(({ key, val }) => (
            <div key={key} className="db-account-row">
              <div className="db-account-key">{key}</div>
              <div className="db-account-val">{val}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface NavigationProps {
  currentPage: 'dashboard' | 'analytics' | 'settings';
}

export default function Navigation({ currentPage }: NavigationProps) {
  const { user } = useAuth();
  const router = useRouter();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', id: 'dashboard' },
    { href: '/analytics', label: 'Analytics', id: 'analytics' },
    { href: '/settings/profile', label: 'Settings', id: 'settings' }
  ];

  return (
    <>
      <style>{`
        .nav-header {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid var(--b);
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .nav-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 48px;
        }

        .nav-logo {
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--t1);
          text-decoration: none;
        }

        .nav-nav {
          display: flex;
          gap: 4px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 8px 14px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          color: var(--t2);
          transition: all 0.15s ease;
          position: relative;
        }

        .nav-link:hover {
          color: var(--t1);
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-1px);
        }

        .nav-link.active {
          color: var(--t1);
          background: rgba(255, 255, 255, 0.08);
          font-weight: 600;
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-user-name {
          font-size: 13px;
          color: var(--t2);
        }

        .nav-signout {
          background: var(--error);
          color: var(--t1);
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }

        .nav-signout:hover {
          background: #dc2626;
        }

        @media (max-width: 768px) {
          .nav-header-inner {
            padding: 0 20px;
          }

          .nav-brand {
            gap: 16px;
          }

          .nav-nav {
            gap: 4px;
          }

          .nav-link {
            padding: 6px 12px;
            font-size: 13px;
          }

          .nav-user {
            flex-direction: column;
            gap: 8px;
            align-items: flex-end;
          }
        }
      `}</style>

      <header className="nav-header">
        <div className="nav-header-inner">
          <div className="nav-brand">
            <Link href="/dashboard" className="nav-logo">
              Linkfolio
            </Link>
            <nav className="nav-nav">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="nav-user">
            <span className="nav-user-name">
              {user?.profile?.name || user?.email}
            </span>
            <button
              onClick={() => router.push('/auth/sign-out')}
              className="nav-signout"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

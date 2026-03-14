'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { AnalyticsService, AnalyticsSummary } from '@/lib/analytics-service';
import FullPageLoading from '@/components/ui/FullPageLoading';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface AnalyticsData {
  totalPortfolios: number;
  totalViews: number;
  recentPortfolios: Array<{
    id: string;
    name: string;
    views: number;
    createdAt: string;
  }>;
  viewsOverTime: Array<{
    date: string;
    views: number;
  }>;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user?.id) {
          throw new Error('User not authenticated');
        }

        const analyticsData = await AnalyticsService.fetchUserAnalytics(user.id, 30);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setError(error instanceof Error ? error.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  if (!user) {
    return <FullPageLoading message="Sign In Required" />;
  }

  if (loading) {
    return <FullPageLoading message="Loading analytics..." />;
  }

  if (error) {
    return (
      <DashboardLayout currentPage="analytics" title="Analytics" subtitle="Track your portfolio performance and engagement">
        <div className="analytics-content">
          <div className="empty-state">
            <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="empty-title">Error Loading Analytics</h3>
            <p className="empty-text">{error}</p>
            <button 
              className="db-empty-btn" 
              onClick={() => window.location.reload()}
              style={{ marginTop: '16px' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="analytics" title="Analytics" subtitle="Track your portfolio performance and engagement">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .analytics-content {
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
        .analytics-content *, .analytics-content *::before, .analytics-content *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: var(--surface);
          border: 1px solid var(--b);
          border-radius: 12px;
          padding: 20px;
          transition: border-color 0.15s, transform 0.15s;
        }

        .stat-card:hover {
          border-color: var(--bh);
          transform: translateY(-2px);
        }

        .stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-info {
          flex: 1;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--t3);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: var(--t1);
          letter-spacing: -0.02em;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--t2);
        }

        /* Recent Portfolios */
        .recent-portfolios {
          background: var(--surface);
          border: 1px solid var(--b);
          border-radius: 12px;
          overflow: hidden;
        }

        .section-header {
          padding: 20px;
          border-bottom: 1px solid var(--b);
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--t1);
          letter-spacing: -0.02em;
        }

        .portfolio-list {
          display: flex;
          flex-direction: column;
        }

        .portfolio-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--b);
          transition: background 0.15s;
        }

        .portfolio-item:last-child {
          border-bottom: none;
        }

        .portfolio-item:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .portfolio-info {
          flex: 1;
        }

        .portfolio-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--t1);
          margin-bottom: 2px;
        }

        .portfolio-date {
          font-size: 11px;
          color: var(--t3);
        }

        .portfolio-views {
          font-size: 14px;
          font-weight: 600;
          color: var(--green);
        }

        .portfolio-stats {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .portfolio-label {
          font-size: 10px;
          color: var(--t3);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* Views Timeline */
        .views-timeline {
          background: var(--surface);
          border: 1px solid var(--b);
          border-radius: 12px;
          padding: 24px;
          margin-top: 20px;
        }

        .timeline-header {
          margin-bottom: 20px;
        }

        .timeline-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--t1);
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .timeline-subtitle {
          font-size: 12px;
          color: var(--t3);
          line-height: 1.4;
        }

        .timeline-chart {
          min-height: 200px;
          background: var(--s2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chart-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chart-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 32px;
          max-width: 400px;
        }

        .chart-icon {
          width: 48px;
          height: 48px;
          color: var(--t3);
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .chart-content h4 {
          font-size: 16px;
          font-weight: 600;
          color: var(--t1);
          margin-bottom: 8px;
        }

        .chart-content p {
          font-size: 13px;
          color: var(--t3);
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .chart-stats {
          display: flex;
          gap: 32px;
          justify-content: center;
        }

        .chart-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .chart-stat-value {
          font-size: 20px;
          font-weight: 600;
          color: var(--t1);
          margin-bottom: 4px;
        }

        .chart-stat-label {
          font-size: 11px;
          color: var(--t3);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .empty-chart {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--t3);
          padding: 32px;
          text-align: center;
          max-width: 400px;
        }

        .empty-chart .empty-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-chart-content h4 {
          font-size: 16px;
          font-weight: 600;
          color: var(--t1);
          margin-bottom: 8px;
        }

        .empty-chart-content p {
          font-size: 13px;
          color: var(--t3);
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .empty-chart-tips {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tip {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--t3);
        }

        .tip svg {
          flex-shrink: 0;
          opacity: 0.6;
        }

        /* Empty State */
        .empty-state {
          background: var(--surface);
          border: 1px solid var(--b);
          border-radius: 12px;
          padding: 40px;
          text-align: center;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
          color: var(--t3);
        }

        .empty-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--t1);
          margin-bottom: 8px;
        }

        .empty-text {
          font-size: 13px;
          color: var(--t3);
        }

        .empty-chart {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--t3);
        }

        .empty-chart .empty-icon {
          width: 32px;
          height: 32px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .empty-chart p {
          font-size: 12px;
          margin: 4px 0;
        }

        .empty-subtext {
          font-size: 11px !important;
          opacity: 0.7;
        }

        /* Enhanced Create Portfolio Button */
        .create-portfolio-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: var(--t1);
          color: var(--bg);
          border: none;
          border-radius: 6px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
          margin-top: 12px;
        }

        .create-portfolio-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .create-portfolio-btn:hover {
          background: #fff;
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
        }

        .create-portfolio-btn:hover::before {
          opacity: 1;
        }

        .create-portfolio-btn:active {
          transform: translateY(0);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
        }

        .btn-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .btn-arrow {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }

        .create-portfolio-btn:hover .btn-arrow {
          transform: translateX(2px);
        }

        /* Mobile */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .portfolio-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .chart-stats {
            gap: 24px;
          }

          .empty-chart-tips {
            gap: 8px;
          }

          .tip {
            font-size: 11px;
          }

          .create-portfolio-btn {
            padding: 10px 16px;
            font-size: 13px;
            gap: 10px;
          }

          .btn-icon {
            width: 18px;
            height: 18px;
          }

          .btn-arrow {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>

      <div className="analytics-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <div className="stat-label">Total Portfolios</div>
                <div className="stat-value">{analytics?.totalPortfolios || 0}</div>
              </div>
              <div className="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <div className="stat-label">Total Views</div>
                <div className="stat-value">{analytics?.totalViews?.toLocaleString() || 0}</div>
              </div>
              <div className="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <div className="stat-label">Unique Visitors</div>
                <div className="stat-value">{analytics?.totalUniqueVisitors?.toLocaleString() || 0}</div>
              </div>
              <div className="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <div className="stat-label">Avg. Time on Page</div>
                <div className="stat-value">{analytics?.avgTimeOnPage ? Math.round(analytics.avgTimeOnPage) : 0}s</div>
              </div>
              <div className="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Portfolios */}
        <div className="recent-portfolios">
          <div className="section-header">
            <h2 className="section-title">Recent Portfolios</h2>
          </div>
          <div className="portfolio-list">
            {analytics?.recentPortfolios?.length ? (
              analytics.recentPortfolios.map((portfolio) => (
                <div key={portfolio.id} className="portfolio-item">
                  <div className="portfolio-info">
                    <div className="portfolio-name">{portfolio.name}</div>
                    <div className="portfolio-date">
                      Created {new Date(portfolio.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="portfolio-stats">
                    <div className="portfolio-views">{portfolio.views}</div>
                    <div className="portfolio-label">views</div>
                  </div>
                  <div className="portfolio-stats" style={{ marginLeft: '16px' }}>
                    <div className="portfolio-views">{portfolio.uniqueVisitors}</div>
                    <div className="portfolio-label">visitors</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="empty-title">No portfolio data yet</h3>
                <p className="empty-text">
                  {analytics?.totalPortfolios === 0 
                    ? "Create some portfolios to see analytics data here."
                    : "Analytics data will appear once your portfolios start getting views."
                  }
                </p>
                {analytics?.totalPortfolios === 0 && (
                  <button 
                    className="create-portfolio-btn"
                    onClick={() => window.location.href = '/'}
                  >
                    <span>Create Your First Portfolio</span>
                    <svg className="btn-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Views Timeline */}
        <div className="views-timeline">
          <div className="timeline-header">
            <h3 className="timeline-title">Views Over Time</h3>
            <div className="timeline-subtitle">
              Track how your portfolios perform over the last 30 days
            </div>
          </div>
          <div className="timeline-chart">
            {analytics?.viewsOverTime.length ? (
              <div className="chart-container">
                <div className="chart-placeholder">
                  <svg className="chart-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div className="chart-content">
                    <h4>Analytics Chart Coming Soon</h4>
                    <p>Interactive charts will visualize your portfolio performance over time</p>
                    <div className="chart-stats">
                      <div className="chart-stat">
                        <span className="chart-stat-value">{analytics?.viewsOverTime.length || 0}</span>
                        <span className="chart-stat-label">Days tracked</span>
                      </div>
                      <div className="chart-stat">
                        <span className="chart-stat-value">{analytics?.totalViews || 0}</span>
                        <span className="chart-stat-label">Total views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-chart">
                <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div className="empty-chart-content">
                  <h4>No View Data Yet</h4>
                  <p>Views will appear here once your portfolios start getting visitors</p>
                  <div className="empty-chart-tips">
                    <div className="tip">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Share your portfolio to start tracking views</span>
                    </div>
                    <div className="tip">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Check back daily to see performance trends</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

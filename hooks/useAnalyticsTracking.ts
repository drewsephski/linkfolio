import { useEffect, useRef } from 'react';

interface UseAnalyticsTrackingProps {
  portfolioId?: string;
  userId?: string;
  enabled?: boolean;
}

export function useAnalyticsTracking({ portfolioId, userId, enabled = true }: UseAnalyticsTrackingProps) {
  const startTimeRef = useRef<number>(0);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (!enabled || !portfolioId || !userId) return;

    // Initialize start time when tracking begins
    startTimeRef.current = Date.now();

    // Track page view
    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      trackPortfolioView(portfolioId, userId);
    }

    // Track page unload for engagement metrics
    const handleUnload = () => {
      const timeOnPage = Date.now() - startTimeRef.current;
      const isBounce = timeOnPage < 5000; // Less than 5 seconds = bounce
      trackEngagement(portfolioId, timeOnPage, isBounce);
    };

    // Track page visibility changes (user switching tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const timeOnPage = Date.now() - startTimeRef.current;
        const isBounce = timeOnPage < 5000;
        trackEngagement(portfolioId, timeOnPage, isBounce);
      } else {
        startTimeRef.current = Date.now(); // Reset timer when page becomes visible again
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Track engagement when component unmounts
      const timeOnPage = Date.now() - startTimeRef.current;
      const isBounce = timeOnPage < 5000;
      trackEngagement(portfolioId, timeOnPage, isBounce);
    };
  }, [portfolioId, userId, enabled]);
}

async function trackPortfolioView(portfolioId: string, userId: string) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ portfolioId, userId }),
    });
  } catch (error) {
    console.error('Failed to track portfolio view:', error);
  }
}

async function trackEngagement(portfolioId: string, timeOnPage: number, isBounce: boolean) {
  try {
    await fetch('/api/analytics/track', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ portfolioId, timeOnPage, isBounce }),
    });
  } catch (error) {
    console.error('Failed to track engagement:', error);
  }
}

import { insforge } from './insforge-client';
import { getUserPortfolios, getPortfolioMetadata } from './portfolio-storage';

export interface PortfolioAnalytics {
  id: string;
  user_id: string;
  portfolio_id: string;
  date: string;
  views: number;
  unique_visitors: number;
  avg_time_on_page: number;
  bounce_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  title?: string;
  headline?: string;
  linkedin_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSummary {
  totalPortfolios: number;
  totalViews: number;
  totalUniqueVisitors: number;
  avgTimeOnPage: number;
  avgBounceRate: number;
  recentPortfolios: Array<{
    id: string;
    name: string;
    views: number;
    uniqueVisitors: number;
    createdAt: string;
  }>;
  viewsOverTime: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
  }>;
  topPerformingPortfolios: Array<{
    id: string;
    name: string;
    views: number;
    uniqueVisitors: number;
    conversionRate: number;
  }>;
}

export class AnalyticsService {
  /**
   * Fetch comprehensive analytics data for a user
   */
  static async fetchUserAnalytics(userId: string, days: number = 30): Promise<AnalyticsSummary> {
    try {
      // Try to fetch from database first
      try {
        // Fetch user's portfolios from database
        const { data: portfolios, error: portfoliosError } = await insforge.database
          .from('portfolios')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!portfoliosError && portfolios) {
          // Fetch analytics data for the specified time period
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);
          const startDateStr = startDate.toISOString().split('T')[0];

          const { data: analyticsData, error: analyticsError } = await insforge.database
            .from('portfolio_analytics')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDateStr)
            .order('date', { ascending: false });

          if (!analyticsError && analyticsData) {
            return this.processAnalyticsData(portfolios, analyticsData, days);
          }
          
          // Return portfolios without analytics data
          return this.processAnalyticsData(portfolios, [], days);
        }
      } catch (dbError) {
        console.log('Database not available, falling back to in-memory storage');
      }

      // Fallback to in-memory storage with real portfolio data
      return this.fetchRealAnalytics(userId, days);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Process analytics data from database
   */
  private static processAnalyticsData(portfolios: any[], analyticsData: any[], days: number): AnalyticsSummary {
    // Calculate summary statistics
    const totalPortfolios = portfolios?.length || 0;
    const totalViews = analyticsData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;
    const totalUniqueVisitors = analyticsData?.reduce((sum, item) => sum + (item.unique_visitors || 0), 0) || 0;
    const avgTimeOnPage = analyticsData?.length > 0 
      ? analyticsData.reduce((sum, item) => sum + (item.avg_time_on_page || 0), 0) / analyticsData.length 
      : 0;
    const avgBounceRate = analyticsData?.length > 0
      ? analyticsData.reduce((sum, item) => sum + (item.bounce_rate || 0), 0) / analyticsData.length
      : 0;

    // Process recent portfolios with their analytics
    const recentPortfolios = portfolios?.slice(0, 5).map((portfolio) => {
      const portfolioAnalytics = analyticsData?.filter(item => item.portfolio_id === portfolio.id) || [];
      const totalPortfolioViews = portfolioAnalytics.reduce((sum, item) => sum + (item.views || 0), 0);
      const totalPortfolioVisitors = portfolioAnalytics.reduce((sum, item) => sum + (item.unique_visitors || 0), 0);

      return {
        id: portfolio.id,
        name: portfolio.name || portfolio.title || 'Untitled Portfolio',
        views: totalPortfolioViews,
        uniqueVisitors: totalPortfolioVisitors,
        createdAt: portfolio.created_at
      };
    }) || [];

    // Process views over time (group by date)
    const viewsOverTimeMap = new Map<string, { views: number; uniqueVisitors: number }>();
    
    // Initialize with all dates in the range
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      viewsOverTimeMap.set(dateStr, { views: 0, uniqueVisitors: 0 });
    }

    // Aggregate analytics data by date
    analyticsData?.forEach(item => {
      const existing = viewsOverTimeMap.get(item.date);
      if (existing) {
        existing.views += item.views || 0;
        existing.uniqueVisitors += item.unique_visitors || 0;
      }
    });

    const viewsOverTime = Array.from(viewsOverTimeMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate top performing portfolios
    const portfolioPerformance = portfolios?.map((portfolio) => {
      const portfolioAnalytics = analyticsData?.filter(item => item.portfolio_id === portfolio.id) || [];
      const totalViews = portfolioAnalytics.reduce((sum, item) => sum + (item.views || 0), 0);
      const totalVisitors = portfolioAnalytics.reduce((sum, item) => sum + (item.unique_visitors || 0), 0);
      const conversionRate = totalVisitors > 0 ? (totalViews / totalVisitors) * 100 : 0;

      return {
        id: portfolio.id,
        name: portfolio.name || portfolio.title || 'Untitled Portfolio',
        views: totalViews,
        uniqueVisitors: totalVisitors,
        conversionRate
      };
    }) || [];

    const topPerformingPortfolios = portfolioPerformance
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return {
      totalPortfolios,
      totalViews,
      totalUniqueVisitors,
      avgTimeOnPage,
      avgBounceRate,
      recentPortfolios,
      viewsOverTime,
      topPerformingPortfolios
    };
  }

  /**
   * Fetch real analytics data from in-memory storage
   */
  private static async fetchRealAnalytics(userId: string, days: number = 30): Promise<AnalyticsSummary> {
    try {
      // Get portfolios from in-memory storage
      const portfolioIds = await getUserPortfolios(userId);
      const portfolioMetadata = await Promise.all(
        portfolioIds.map(async (id) => {
          const metadata = await getPortfolioMetadata(id);
          return metadata;
        })
      );
      const portfolios = portfolioMetadata.filter(Boolean);

      // No analytics data available yet, return portfolio info only
      const totalPortfolios = portfolios.length;
      const totalViews = 0;
      const totalUniqueVisitors = 0;
      const avgTimeOnPage = 0;
      const avgBounceRate = 0;

      // Recent portfolios with zero analytics
      const recentPortfolios = portfolios.slice(0, 5).map((portfolio: any) => ({
        id: portfolio.id,
        name: portfolio.name || 'Untitled Portfolio',
        views: 0,
        uniqueVisitors: 0,
        createdAt: portfolio.generatedAt || new Date().toISOString()
      }));

      // Empty views over time data
      const viewsOverTime: Array<{ date: string; views: number; uniqueVisitors: number }> = [];

      // Empty top performing portfolios
      const topPerformingPortfolios = portfolios.map((portfolio: any) => ({
        id: portfolio.id,
        name: portfolio.name || 'Untitled Portfolio',
        views: 0,
        uniqueVisitors: 0,
        conversionRate: 0
      })).slice(0, 5);

      return {
        totalPortfolios,
        totalViews,
        totalUniqueVisitors,
        avgTimeOnPage,
        avgBounceRate,
        recentPortfolios,
        viewsOverTime,
        topPerformingPortfolios
      };
    } catch (error) {
      console.error('Error fetching real analytics:', error);
      // Return empty analytics as last resort
      return {
        totalPortfolios: 0,
        totalViews: 0,
        totalUniqueVisitors: 0,
        avgTimeOnPage: 0,
        avgBounceRate: 0,
        recentPortfolios: [],
        viewsOverTime: [],
        topPerformingPortfolios: []
      };
    }
  }

  /**
   * Track a portfolio view
   */
  static async trackPortfolioView(portfolioId: string, userId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Try database first, fall back to in-memory if not available
      try {
        // Check if analytics entry exists for today
        const { data: existingAnalytics, error: fetchError } = await insforge.database
          .from('portfolio_analytics')
          .select('*')
          .eq('portfolio_id', portfolioId)
          .eq('date', today)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // Not found error
          throw fetchError;
        }

        if (existingAnalytics) {
          // Update existing entry
          await insforge.database
            .from('portfolio_analytics')
            .update({
              views: existingAnalytics.views + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingAnalytics.id);
        } else {
          // Create new entry
          await insforge.database
            .from('portfolio_analytics')
            .insert({
              user_id: userId,
              portfolio_id: portfolioId,
              date: today,
              views: 1,
              unique_visitors: 1,
              avg_time_on_page: 0,
              bounce_rate: 0
            });
        }
      } catch (dbError) {
        console.log('Database tracking not available, using in-memory fallback');
        // In-memory fallback - could store in localStorage or simply log
        console.log(`Portfolio view tracked: ${portfolioId} by user ${userId}`);
      }
    } catch (error) {
      console.error('Error tracking portfolio view:', error);
      // Don't throw error to avoid breaking the user experience
    }
  }

  /**
   * Get detailed analytics for a specific portfolio
   */
  static async getPortfolioAnalytics(portfolioId: string, days: number = 30): Promise<PortfolioAnalytics[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const { data, error } = await insforge.database
        .from('portfolio_analytics')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .gte('date', startDateStr)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching portfolio analytics:', error);
      throw error;
    }
  }

  /**
   * Update engagement metrics for a portfolio
   */
  static async updateEngagementMetrics(
    portfolioId: string, 
    timeOnPage: number, 
    isBounce: boolean
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get current analytics
      const { data: currentAnalytics, error: fetchError } = await insforge.database
        .from('portfolio_analytics')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .eq('date', today)
        .single();

      if (fetchError || !currentAnalytics) {
        // Create entry if it doesn't exist
        await this.trackPortfolioView(portfolioId, currentAnalytics?.user_id || '');
        return;
      }

      // Calculate new averages
      const currentTotalTime = currentAnalytics.avg_time_on_page * currentAnalytics.views;
      const newTotalTime = currentTotalTime + timeOnPage;
      const newAvgTime = newTotalTime / (currentAnalytics.views + 1);

      const currentBounces = Math.round(currentAnalytics.bounce_rate * currentAnalytics.views / 100);
      const newBounces = currentBounces + (isBounce ? 1 : 0);
      const newBounceRate = (newBounces / (currentAnalytics.views + 1)) * 100;

      // Update with new metrics
      await insforge.database
        .from('portfolio_analytics')
        .update({
          avg_time_on_page: newAvgTime,
          bounce_rate: newBounceRate,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentAnalytics.id);
    } catch (error) {
      console.error('Error updating engagement metrics:', error);
      // Don't throw error to avoid breaking the user experience
    }
  }
}

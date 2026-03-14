import { insforge } from '@/lib/insforge-client';
import { PortfolioProfile } from '@/lib/data-normalization';

/**
 * InsForge Database Utilities
 * 
 * This module provides optimized database operations using InsForge's native capabilities.
 * Includes batch operations, caching strategies, and performance optimizations.
 */

// Simple in-memory cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generic cached query wrapper
 */
async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < cached.ttl) {
    return cached.data;
  }
  
  const data = await queryFn();
  cache.set(key, { data, timestamp: now, ttl });
  return data;
}

/**
 * Clear cache for a specific key or all cache
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * Bulk portfolio operations using InsForge batch processing
 */
export class PortfolioBulkOperations {
  
  /**
   * Create multiple portfolios in a single batch
   */
  static async createPortfolios(
    portfolios: Array<{ id: string; profile: PortfolioProfile; userId?: string }>
  ): Promise<{ success: string[]; failed: Array<{ id: string; error: string }> }> {
    const results = { success: [] as string[], failed: [] as Array<{ id: string; error: string }> };
    
    // Prepare batch operations for main portfolio records
    const portfolioInserts = portfolios.map(({ id, profile, userId }) => ({
      portfolio_id: id,
      name: profile.name,
      headline: profile.headline || null,
      location: profile.location || null,
      summary: profile.summary || null,
      avatar: profile.avatar || null,
      linkedin_url: profile.linkedinUrl,
      banner_image: profile.bannerImage || null,
      followers: profile.followers || null,
      connections: profile.connections || null,
      current_company: profile.currentCompany || null,
      experience_unavailable: profile.experienceUnavailable ?? false,
      user_id: userId || null
    }));
    
    try {
      // Insert main portfolios
      const { data: insertedPortfolios, error: portfolioError } = await insforge
        .database
        .from('portfolios')
        .insert(portfolioInserts)
        .select();
      
      if (portfolioError) {
        throw portfolioError;
      }
      
      // Prepare related data inserts for all portfolios
      const relatedDataOps = [];
      
      insertedPortfolios.forEach((portfolio, index) => {
        const originalProfile = portfolios[index].profile;
        const portfolioDbId = portfolio.id;
        
        // Experience data
        if (originalProfile.experience.length > 0) {
          const experienceData = originalProfile.experience.map(exp => ({
            portfolio_id: portfolioDbId,
            experience_id: exp.id,
            title: exp.title,
            company: exp.company,
            duration: exp.duration || null,
            description: exp.description || null,
            start_date: exp.startDate || null,
            end_date: exp.endDate || null,
            current: exp.current || false
          }));
          
          relatedDataOps.push(
            insforge.database.from('portfolio_experience').insert(experienceData)
          );
        }
        
        // Education data
        if (originalProfile.education.length > 0) {
          const educationData = originalProfile.education.map(edu => ({
            portfolio_id: portfolioDbId,
            education_id: edu.id,
            school: edu.school,
            degree: edu.degree,
            duration: edu.duration || null,
            start_date: edu.startDate || null,
            end_date: edu.endDate || null,
            current: edu.current || false
          }));
          
          relatedDataOps.push(
            insforge.database.from('portfolio_education').insert(educationData)
          );
        }
        
        // Skills data
        if (originalProfile.skills.length > 0) {
          const skillsData = originalProfile.skills.map(skill => ({
            portfolio_id: portfolioDbId,
            skill: skill
          }));
          
          relatedDataOps.push(
            insforge.database.from('portfolio_skills').insert(skillsData)
          );
        }
      });
      
      // Execute all related data operations in batches to avoid overwhelming the database
      const batchSize = 10; // Process 10 operations at a time
      for (let i = 0; i < relatedDataOps.length; i += batchSize) {
        const batch = relatedDataOps.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(batch);
        
        batchResults.forEach((result, batchIndex) => {
          if (result.status === 'rejected') {
            console.error(`Related data operation ${i + batchIndex} failed:`, result.reason);
          }
        });
      }
      
      // All successful
      results.success = portfolios.map(p => p.id);
      
    } catch (error) {
      // Mark all as failed if main insert failed
      results.failed = portfolios.map(p => ({
        id: p.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
    
    return results;
  }
  
  /**
   * Delete multiple portfolios and all their related data
   */
  static async deletePortfolios(portfolioIds: string[]): Promise<{ success: string[]; failed: string[] }> {
    const results = { success: [] as string[], failed: [] as string[] };
    
    try {
      // Get database IDs for the portfolios
      const { data: portfolios, error: fetchError } = await insforge
        .database
        .from('portfolios')
        .select('id, portfolio_id')
        .in('portfolio_id', portfolioIds);
      
      if (fetchError) {
        throw fetchError;
      }
      
      if (!portfolios || portfolios.length === 0) {
        return results; // No portfolios found to delete
      }
      
      const dbIds = portfolios.map(p => p.id);
      
      // Delete all related data in parallel
      const deleteOps = [
        insforge.database.from('portfolio_experience').delete().in('portfolio_id', dbIds),
        insforge.database.from('portfolio_education').delete().in('portfolio_id', dbIds),
        insforge.database.from('portfolio_skills').delete().in('portfolio_id', dbIds),
        insforge.database.from('portfolio_projects').delete().in('portfolio_id', dbIds),
        insforge.database.from('portfolio_certifications').delete().in('portfolio_id', dbIds),
        insforge.database.from('portfolios').delete().in('id', dbIds)
      ];
      
      const deleteResults = await Promise.allSettled(deleteOps);
      
      // Check if main portfolio deletion succeeded
      const portfolioDeleteResult = deleteResults[deleteResults.length - 1];
      if (portfolioDeleteResult.status === 'fulfilled') {
        results.success = portfolioIds;
      } else {
        results.failed = portfolioIds;
        console.error('Failed to delete portfolios:', portfolioDeleteResult.reason);
      }
      
    } catch (error) {
      results.failed = portfolioIds;
      console.error('Bulk delete failed:', error);
    }
    
    return results;
  }
}

/**
 * Advanced portfolio analytics and insights
 */
export class PortfolioAnalytics {
  
  /**
   * Get portfolio statistics with caching
   */
  static async getPortfolioStats(portfolioId: string): Promise<{
    experienceCount: number;
    educationCount: number;
    skillsCount: number;
    projectsCount: number;
    certificationsCount: number;
    totalConnections?: number;
    totalFollowers?: number;
  }> {
    const cacheKey = `portfolio_stats_${portfolioId}`;
    
    return cachedQuery(cacheKey, async () => {
      const { data: portfolio } = await insforge
        .database
        .from('portfolios')
        .select('followers, connections')
        .eq('portfolio_id', portfolioId)
        .single();
      
      const [
        experienceResult,
        educationResult,
        skillsResult,
        projectsResult,
        certificationsResult
      ] = await Promise.allSettled([
        insforge.database.from('portfolio_experience').select('id').eq('portfolio_id', portfolio.id),
        insforge.database.from('portfolio_education').select('id').eq('portfolio_id', portfolio.id),
        insforge.database.from('portfolio_skills').select('id').eq('portfolio_id', portfolio.id),
        insforge.database.from('portfolio_projects').select('id').eq('portfolio_id', portfolio.id),
        insforge.database.from('portfolio_certifications').select('id').eq('portfolio_id', portfolio.id)
      ]);
      
      return {
        experienceCount: experienceResult.status === 'fulfilled' ? experienceResult.value.data?.length || 0 : 0,
        educationCount: educationResult.status === 'fulfilled' ? educationResult.value.data?.length || 0 : 0,
        skillsCount: skillsResult.status === 'fulfilled' ? skillsResult.value.data?.length || 0 : 0,
        projectsCount: projectsResult.status === 'fulfilled' ? projectsResult.value.data?.length || 0 : 0,
        certificationsCount: certificationsResult.status === 'fulfilled' ? certificationsResult.value.data?.length || 0 : 0,
        totalConnections: portfolio?.connections ? Number(portfolio.connections) : undefined,
        totalFollowers: portfolio?.followers ? Number(portfolio.followers) : undefined
      };
    });
  }
  
  /**
   * Search portfolios by criteria with pagination
   */
  static async searchPortfolios(options: {
    query?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'name' | 'generated_at' | 'followers';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    portfolios: PortfolioProfile[];
    total: number;
    hasMore: boolean;
  }> {
    const {
      query,
      limit = 20,
      offset = 0,
      sortBy = 'generated_at',
      sortOrder = 'desc'
    } = options;
    
    let dbQuery = insforge.database
      .from('portfolios')
      .select('portfolio_id, name, headline, location, summary, avatar, generated_at, followers, connections')
      .range(offset, offset + limit - 1);
    
    // Apply search filter
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,headline.ilike.%${query}%,summary.ilike.%${query}%`);
    }
    
    // Apply sorting
    dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });
    
    const { data: portfolios, error, count } = await dbQuery;
    
    if (error) {
      throw error;
    }
    
    // Convert to PortfolioProfile format (simplified for search results)
    const portfolioProfiles: PortfolioProfile[] = (portfolios || []).map(p => ({
      id: p.portfolio_id,
      name: p.name,
      headline: p.headline || '',
      location: p.location || '',
      summary: p.summary || '',
      avatar: p.avatar || undefined,
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      activity: [],
      linkedinUrl: '',
      generatedAt: p.generated_at,
      followers: p.followers ? Number(p.followers) : undefined,
      connections: p.connections ? Number(p.connections) : undefined,
      experienceUnavailable: false
    }));
    
    return {
      portfolios: portfolioProfiles,
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    };
  }
}

/**
 * Database health and monitoring utilities
 */
export class DatabaseHealth {
  
  /**
   * Check database connectivity and basic operations
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      connectivity: boolean;
      tableAccess: Record<string, boolean>;
      responseTime: number;
    };
  }> {
    const startTime = Date.now();
    const details = {
      connectivity: false,
      tableAccess: {} as Record<string, boolean>,
      responseTime: 0
    };
    
    try {
      // Test basic connectivity
      const { error } = await insforge.database
        .from('portfolios')
        .select('id')
        .limit(1);
      
      details.connectivity = !error;
      
      if (error) {
        return {
          status: 'unhealthy',
          details
        };
      }
      
      // Test access to all required tables
      const tables = ['portfolios', 'portfolio_experience', 'portfolio_education', 'portfolio_skills', 'portfolio_projects', 'portfolio_certifications'];
      
      await Promise.allSettled(
        tables.map(async (table) => {
          try {
            const { error: tableError } = await insforge.database
              .from(table)
              .select('id')
              .limit(1);
            
            details.tableAccess[table] = !tableError;
          } catch {
            details.tableAccess[table] = false;
          }
        })
      );
      
      details.responseTime = Date.now() - startTime;
      
      // Determine overall health
      const allTablesAccessible = Object.values(details.tableAccess).every(Boolean);
      const status = allTablesAccessible ? 'healthy' : 'degraded';
      
      return { status, details };
      
    } catch (error) {
      details.responseTime = Date.now() - startTime;
      return {
        status: 'unhealthy',
        details
      };
    }
  }
  
  /**
   * Get database performance metrics
   */
  static async getPerformanceMetrics(): Promise<{
    tableSizes: Record<string, number>;
    recentActivity: {
      portfoliosCreated: number;
      portfoliosUpdated: number;
    };
  }> {
    const metrics = {
      tableSizes: {} as Record<string, number>,
      recentActivity: {
        portfoliosCreated: 0,
        portfoliosUpdated: 0
      }
    };
    
    try {
      // Get table sizes
      const tables = ['portfolios', 'portfolio_experience', 'portfolio_education', 'portfolio_skills', 'portfolio_projects', 'portfolio_certifications'];
      
      await Promise.allSettled(
        tables.map(async (table) => {
          try {
            const { count } = await insforge.database
              .from(table)
              .select('*', { count: 'exact', head: true });
            
            metrics.tableSizes[table] = count || 0;
          } catch {
            metrics.tableSizes[table] = 0;
          }
        })
      );
      
      // Get recent activity (last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const [createdResult, updatedResult] = await Promise.allSettled([
        insforge.database
          .from('portfolios')
          .select('id', { count: 'exact' })
          .gte('generated_at', yesterday),
        insforge.database
          .from('portfolios')
          .select('id', { count: 'exact' })
          .gte('updated_at', yesterday)
      ]);
      
      metrics.recentActivity.portfoliosCreated = createdResult.status === 'fulfilled' ? createdResult.value.count || 0 : 0;
      metrics.recentActivity.portfoliosUpdated = updatedResult.status === 'fulfilled' ? updatedResult.value.count || 0 : 0;
      
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
    }
    
    return metrics;
  }
}

const insforgeUtilities = {
  PortfolioBulkOperations,
  PortfolioAnalytics,
  DatabaseHealth,
  clearCache
};

export default insforgeUtilities;

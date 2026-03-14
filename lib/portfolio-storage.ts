import { PortfolioProfile } from '@/lib/data-normalization';

// In-memory storage for MVP - in production, this would be a database
const portfolioStore = new Map<string, PortfolioProfile>();

/**
 * Generates a unique portfolio ID
 */
export function generatePortfolioId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${timestamp}${random}`;
}

/**
 * Saves portfolio data
 */
export async function savePortfolio(portfolioId: string, profile: PortfolioProfile): Promise<void> {
  console.log('Saving portfolio:', portfolioId, 'for user:', profile.name);
  portfolioStore.set(portfolioId, profile);
  console.log('Portfolio saved. Total portfolios in storage:', portfolioStore.size);
}

/**
 * Retrieves portfolio data
 */
export async function getPortfolio(portfolioId: string): Promise<PortfolioProfile | null> {
  const portfolio = portfolioStore.get(portfolioId) || null;
  console.log('Retrieving portfolio:', portfolioId, 'found:', !!portfolio);
  if (!portfolio) {
    console.log('Available portfolio IDs:', Array.from(portfolioStore.keys()));
  }
  return portfolio;
}

/**
 * Deletes portfolio data
 */
export async function deletePortfolio(portfolioId: string): Promise<boolean> {
  return portfolioStore.delete(portfolioId);
}

/**
 * Lists all portfolio IDs (for admin purposes)
 */
export async function listPortfolioIds(): Promise<string[]> {
  return Array.from(portfolioStore.keys());
}

/**
 * Gets portfolio metadata
 */
export async function getPortfolioMetadata(portfolioId: string): Promise<{
  id: string;
  name: string;
  headline: string;
  generatedAt: string;
} | null> {
  const portfolio = portfolioStore.get(portfolioId);
  if (!portfolio) return null;

  return {
    id: portfolio.id,
    name: portfolio.name,
    headline: portfolio.headline,
    generatedAt: portfolio.generatedAt
  };
}

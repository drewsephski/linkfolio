import { PortfolioProfile } from '@/lib/data-normalization';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

// File-based storage fallback for development
const STORAGE_FILE = join(process.cwd(), '.portfolio-storage.json');

// Load existing storage from file
function loadStorage(): Map<string, PortfolioProfile> {
  if (existsSync(STORAGE_FILE)) {
    try {
      const data = readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return new Map(Object.entries(parsed));
    } catch (error) {
      console.error('Failed to load storage file:', error);
    }
  }
  return new Map();
}

// Save storage to file
function saveStorageToFile(storage: Map<string, PortfolioProfile>): void {
  try {
    const data = Object.fromEntries(storage);
    writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to save storage file:', error);
  }
}

// In-memory storage with file persistence
const portfolioStore = loadStorage();

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
  saveStorageToFile(portfolioStore); // Persist to file
  console.log('Portfolio saved. Total portfolios in storage:', portfolioStore.size);
}

/**
 * Retrieves portfolio data
 */
export async function getPortfolio(portfolioId: string): Promise<PortfolioProfile | null> {
  // Reload storage from file to ensure we have the latest data
  const latestStorage = loadStorage();
  const portfolio = latestStorage.get(portfolioId) || null;
  console.log('Retrieving portfolio:', portfolioId, 'found:', !!portfolio);
  if (!portfolio) {
    console.log('Available portfolio IDs:', Array.from(latestStorage.keys()));
  }
  return portfolio;
}

/**
 * Deletes portfolio data
 */
export async function deletePortfolio(portfolioId: string): Promise<boolean> {
  const result = portfolioStore.delete(portfolioId);
  if (result) {
    saveStorageToFile(portfolioStore);
  }
  return result;
}

/**
 * Lists all portfolio IDs (for admin purposes)
 */
export async function listPortfolioIds(): Promise<string[]> {
  // Reload storage from file to ensure we have the latest data
  const latestStorage = loadStorage();
  return Array.from(latestStorage.keys());
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
  // Reload storage from file to ensure we have the latest data
  const latestStorage = loadStorage();
  const portfolio = latestStorage.get(portfolioId);
  if (!portfolio) return null;

  return {
    id: portfolio.id,
    name: portfolio.name,
    headline: portfolio.headline,
    generatedAt: portfolio.generatedAt
  };
}

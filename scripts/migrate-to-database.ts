#!/usr/bin/env bun
/**
 * Migration script to move existing portfolio data from JSON to InsForge database
 */

import { savePortfolio } from '../lib/portfolio-storage';
import { PortfolioProfile } from '../lib/data-normalization';
import { readFileSync } from 'fs';

// Read existing data from JSON file
const existingData: Record<string, PortfolioProfile> = JSON.parse(readFileSync('.portfolio-storage.json', 'utf8'));

async function migrate() {
  console.log('Starting migration...');
  console.log(`Found ${Object.keys(existingData).length} portfolios to migrate`);

  let successCount = 0;
  let errorCount = 0;

  for (const [portfolioId, portfolio] of Object.entries(existingData)) {
    try {
      await savePortfolio(portfolioId, portfolio);
      console.log(`✅ Migrated portfolio: ${portfolioId}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to migrate portfolio ${portfolioId}:`, error);
      errorCount++;
    }
  }

  console.log('\nMigration complete!');
  console.log(`✅ Successfully migrated: ${successCount} portfolios`);
  console.log(`❌ Failed to migrate: ${errorCount} portfolios`);
  
  if (errorCount === 0) {
    console.log('\n🎉 All portfolios migrated successfully!');
    console.log('You can now backup and remove the .portfolio-storage.json file');
  } else {
    console.log('\n⚠️  Some portfolios failed to migrate. Check the errors above.');
  }
}

// Run migration
migrate().catch(console.error);

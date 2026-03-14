import { NextResponse } from 'next/server';
import { listPortfolioIds, getPortfolioMetadata } from '@/lib/portfolio-storage-file';

export async function GET() {
  try {
    const portfolioIds = await listPortfolioIds();
    
    const portfolios = await Promise.all(
      portfolioIds.map(async (id) => {
        const metadata = await getPortfolioMetadata(id);
        return { id, metadata };
      })
    );

    return NextResponse.json({
      count: portfolioIds.length,
      portfolios
    });
  } catch (error) {
    console.error('Debug storage error:', error);
    return NextResponse.json(
      { error: 'Failed to debug storage' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics-service';

export async function POST(request: NextRequest) {
  try {
    const { portfolioId, userId } = await request.json();

    if (!portfolioId || !userId) {
      return NextResponse.json(
        { error: 'portfolioId and userId are required' },
        { status: 400 }
      );
    }

    await AnalyticsService.trackPortfolioView(portfolioId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking portfolio view:', error);
    return NextResponse.json(
      { error: 'Failed to track portfolio view' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { portfolioId, timeOnPage, isBounce } = await request.json();

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'portfolioId is required' },
        { status: 400 }
      );
    }

    await AnalyticsService.updateEngagementMetrics(
      portfolioId, 
      timeOnPage || 0, 
      isBounce || false
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating engagement metrics:', error);
    return NextResponse.json(
      { error: 'Failed to update engagement metrics' },
      { status: 500 }
    );
  }
}

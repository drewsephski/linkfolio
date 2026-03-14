import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Fetch portfolios from InsForge database
    const { data: portfolios, error: portfoliosError } = await insforge.database
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (portfoliosError) throw portfoliosError;

    // Fetch analytics data
    const { data: analyticsData, error: analyticsError } = await insforge.database
      .from('portfolio_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (analyticsError) throw analyticsError;

    // Process data for display
    const totalPortfolios = portfolios?.length || 0;
    const totalViews = analyticsData?.reduce((sum: number, item: any) => sum + item.views, 0) || 0;
    
    const recentPortfolios = portfolios?.slice(0, 5).map((portfolio: any) => ({
      id: portfolio.id,
      name: portfolio.name || portfolio.title || 'Untitled Portfolio',
      views: analyticsData?.find((a: any) => a.portfolio_id === portfolio.id)?.views || 0,
      createdAt: portfolio.created_at
    })) || [];

    const viewsOverTime = analyticsData?.reduce((acc: any[], item: any) => {
      const existingDate = acc.find((a: any) => a.date === item.date);
      if (existingDate) {
        existingDate.views += item.views;
      } else {
        acc.push({
          date: item.date,
          views: item.views
        });
      }
      return acc;
    }, [] as Array<{ date: string; views: number }>).slice(-30) || []; // Last 30 days

    const analytics = {
      totalPortfolios,
      totalViews,
      recentPortfolios,
      viewsOverTime
    };

    return NextResponse.json({ data: analytics });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, portfolioId, date, views = 1 } = body;

    if (!userId || !portfolioId || !date) {
      return NextResponse.json({ error: 'User ID, portfolio ID, and date required' }, { status: 400 });
    }

    // Upsert analytics data
    const { data, error } = await insforge.database
      .from('portfolio_analytics')
      .upsert({
        user_id: userId,
        portfolio_id: portfolioId,
        date,
        views,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Analytics POST error:', error);
    return NextResponse.json(
      { error: 'Failed to update analytics data' },
      { status: 500 }
    );
  }
}

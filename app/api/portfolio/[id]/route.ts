import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio, updatePortfolio } from '@/lib/portfolio-storage';

interface PortfolioPageProps {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: PortfolioPageProps
) {
  try {
    const { id } = await params;
    const portfolio = await getPortfolio(id);

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Failed to get portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve portfolio' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: PortfolioPageProps
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    
    const updatedPortfolio = await updatePortfolio(id, updates);

    if (!updatedPortfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      portfolio: updatedPortfolio
    });
  } catch (error) {
    console.error('Failed to update portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: PortfolioPageProps
) {
  try {
    const { id } = await params;
    
    // For now, we'll implement a soft delete by marking as deleted
    // In the future, we might want to implement hard delete
    const success = await updatePortfolio(id, { deleted: true });

    if (!success) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to delete portfolio' },
      { status: 500 }
    );
  }
}

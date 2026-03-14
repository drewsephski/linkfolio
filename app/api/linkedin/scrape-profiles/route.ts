import { NextRequest, NextResponse } from 'next/server';
import { LinkedInScraper } from '@/lib/brightdata/linkedin-scraper';

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // Validate LinkedIn URLs
    const validUrls = urls.filter(url => 
      typeof url === 'string' && 
      url.includes('linkedin.com/in/')
    );

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: 'No valid LinkedIn profile URLs provided' },
        { status: 400 }
      );
    }

    const profiles = await LinkedInScraper.scrapeProfiles(validUrls);

    return NextResponse.json({
      success: true,
      data: profiles,
      count: profiles.length
    });

  } catch (error: unknown) {
    console.error('LinkedIn profiles scraping error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to scrape LinkedIn profiles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

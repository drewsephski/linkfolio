import { NextRequest, NextResponse } from 'next/server';
import { LinkedInScraper } from '@/lib/brightdata/linkedin-scraper';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    console.log('Testing LinkedIn scraper with URL:', url);
    
    const result = await LinkedInScraper.scrapeProfiles([url]);
    
    console.log('Raw result from LinkedIn scraper:', result);
    console.log('Result type:', typeof result);
    console.log('Result length:', Array.isArray(result) ? result.length : 'not array');
    
    if (Array.isArray(result) && result.length > 0) {
      console.log('First item keys:', Object.keys(result[0] || {}));
      console.log('First item data:', result[0]);
    }
    
    return NextResponse.json({
      success: true,
      result,
      debug: {
        type: typeof result,
        isArray: Array.isArray(result),
        length: Array.isArray(result) ? result.length : 0,
        firstItemKeys: Array.isArray(result) && result.length > 0 ? Object.keys(result[0] || {}) : []
      }
    });
    
  } catch (error) {
    console.error('Test scraper error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
}

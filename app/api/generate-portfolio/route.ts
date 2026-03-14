import { NextRequest, NextResponse } from 'next/server';
import { LinkedInScraper } from '@/lib/brightdata/linkedin-scraper';
import { normalizeLinkedInData } from '@/lib/data-normalization';
import { enrichProfileData } from '@/lib/ai-enrichment';
import { generatePortfolioId, savePortfolio } from '@/lib/portfolio-storage-file';

export async function POST(request: NextRequest) {
  try {
    const { linkedinUrl } = await request.json();

    if (!linkedinUrl) {
      return NextResponse.json(
        { error: 'LinkedIn URL is required' },
        { status: 400 }
      );
    }

    // Step 1: Scrape LinkedIn profile data
    console.log('Scraping LinkedIn profile:', linkedinUrl);
    let linkedinData;
    
    try {
      linkedinData = await LinkedInScraper.scrapeProfiles([linkedinUrl]);
      console.log('LinkedIn scraping successful, data:', linkedinData);
    } catch (scrapeError) {
      console.error('LinkedIn scraping failed:', scrapeError);
      
      // Check if it's the "Customer is not active" error
      if ((scrapeError as Error).message.includes('Customer is not active')) {
        console.log('Detected Bright Data account inactive error');
        // Return a helpful error message instead of failing completely
        return NextResponse.json(
          { 
            error: 'Bright Data API account is not active. Please check your Bright Data account status and API key.',
            details: 'The Bright Data API key appears to be inactive or the account needs activation.',
            troubleshooting: [
              '1. Log into your Bright Data dashboard',
              '2. Verify your account is active and has credits',
              '3. Generate a new API key if needed',
              '4. Configure a LinkedIn scraping zone'
            ],
            alternative: 'You can still test the portfolio generation with sample data by using the example portfolio.'
          },
          { status: 503 }
        );
      }
      
      // For other errors, return a generic error
      return NextResponse.json(
        { 
          error: 'LinkedIn scraping failed',
          details: (scrapeError as Error).message
        },
        { status: 500 }
      );
    }
    
    if (!linkedinData || linkedinData.length === 0) {
      console.log('No LinkedIn data returned, linkedinData:', linkedinData);
      return NextResponse.json(
        { error: 'Failed to retrieve LinkedIn profile data' },
        { status: 404 }
      );
    }

    const rawProfile = linkedinData[0];
    console.log('Raw profile data:', rawProfile);

    // Step 2: Normalize the data into our portfolio schema
    console.log('Normalizing profile data');
    const normalizedProfile = normalizeLinkedInData(rawProfile);

    // Step 3: Enrich the data with AI-generated content
    console.log('Enriching profile with AI');
    const enrichedProfile = await enrichProfileData(normalizedProfile);

    // Step 4: Generate unique portfolio ID and save
    const portfolioId = generatePortfolioId();
    await savePortfolio(portfolioId, enrichedProfile);

    console.log('Portfolio generated successfully:', portfolioId);

    return NextResponse.json({
      success: true,
      portfolioId,
      profile: enrichedProfile
    });

  } catch (error) {
    console.error('Portfolio generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate portfolio',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

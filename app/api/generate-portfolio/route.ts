import { NextRequest, NextResponse } from 'next/server';
import { LinkedInScraper } from '@/lib/brightdata/linkedin-scraper';
import { normalizeLinkedInData } from '@/lib/data-normalization';
import { enrichProfileData } from '@/lib/ai-enrichment';
import { generatePortfolioId, savePortfolio, getPortfolio } from '@/lib/portfolio-storage';

// Simple in-memory rate limiting (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // 5 requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown';
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    // New window or expired window
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const rateLimitResult = checkRateLimit(rateLimitKey);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Too many portfolio generation requests. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (rateLimitResult.resetTime || 0).toString()
          }
        }
      );
    }

    const { linkedinUrl, userId } = await request.json();

    if (!linkedinUrl) {
      return NextResponse.json(
        { error: 'LinkedIn URL is required' },
        { status: 400 }
      );
    }

    // Validate userId format if provided
    if (userId && typeof userId === 'string') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        return NextResponse.json(
          { error: 'Invalid user ID format' },
          { status: 400 }
        );
      }
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
    console.log('Raw profile keys:', Object.keys(rawProfile));
    console.log('Raw profile sample:', {
      name: rawProfile.name,
      headline: rawProfile.headline,
      experienceCount: Array.isArray(rawProfile.experience) ? rawProfile.experience.length : 'not array',
      educationCount: Array.isArray(rawProfile.education) ? rawProfile.education.length : 'not array',
      hasExperience: !!rawProfile.experience,
      hasEducation: !!rawProfile.education
    });
    
    const normalizedProfile = normalizeLinkedInData(rawProfile);
    
    console.log('Normalized profile summary:', {
      name: normalizedProfile.name,
      experienceCount: normalizedProfile.experience.length,
      educationCount: normalizedProfile.education.length,
      skillsCount: normalizedProfile.skills.length,
      projectsCount: normalizedProfile.projects.length,
      certificationsCount: normalizedProfile.certifications.length
    });
    
    // Log first few items for debugging
    if (normalizedProfile.experience.length > 0) {
      console.log('Sample experience:', normalizedProfile.experience[0]);
    }
    if (normalizedProfile.education.length > 0) {
      console.log('Sample education:', normalizedProfile.education[0]);
    }

    // Step 3: Enrich the data with AI-generated content
    console.log('Enriching profile with AI');
    console.log('Pre-enrichment data:', {
      experienceCount: normalizedProfile.experience.length,
      educationCount: normalizedProfile.education.length,
      hasSummary: !!normalizedProfile.summary,
      summaryLength: normalizedProfile.summary?.length || 0
    });
    
    const enrichedProfile = await enrichProfileData(normalizedProfile);
    
    console.log('Post-enrichment data:', {
      experienceCount: enrichedProfile.experience.length,
      educationCount: enrichedProfile.education.length,
      skillsCount: enrichedProfile.skills.length,
      hasSummary: !!enrichedProfile.summary,
      summaryLength: enrichedProfile.summary?.length || 0
    });

    // Step 4: Generate unique portfolio ID and save
    const portfolioId = generatePortfolioId();
    console.log('Saving portfolio with ID:', portfolioId);
    console.log('Data being saved:', {
      experienceCount: enrichedProfile.experience.length,
      educationCount: enrichedProfile.education.length,
      skillsCount: enrichedProfile.skills.length,
      hasProjects: enrichedProfile.projects.length > 0,
      hasCertifications: enrichedProfile.certifications.length > 0
    });
    
    await savePortfolio(portfolioId, enrichedProfile, userId);

    console.log('Portfolio saved successfully:', portfolioId);
    
    // Verify the portfolio was saved correctly
    const verification = await getPortfolio(portfolioId);
    console.log('Portfolio verification:', {
      retrieved: !!verification,
      experienceCount: verification?.experience.length || 0,
      educationCount: verification?.education.length || 0,
      skillsCount: verification?.skills.length || 0
    });

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

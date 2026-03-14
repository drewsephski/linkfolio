import { bdclient } from '@brightdata/sdk';

// Initialize Bright Data client with environment variable
const client = new bdclient({
  apiKey: process.env.BRIGHT_DATA_API_KEY,
  logLevel: 'INFO'
});

export interface LinkedInProfile {
  id?: string;
  name?: string;
  headline?: string;
  location?: string;
  city?: string;
  country_code?: string;
  about?: string; // Bright Data uses 'about' instead of 'summary'
  summary?: string;
  experience?: Array<{
    title?: string;
    company?: string;
    duration?: string;
    description?: string;
  }> | null; // Bright Data returns null if no experience
  education?: Array<{
    school?: string;
    degree?: string;
    duration?: string;
  }> | null; // Bright Data returns null if no education
  skills?: string[];
  url?: string;
  avatar?: string;
  current_company?: {
    name?: string;
    location?: string | null;
  };
  current_company_name?: string;
  projects?: Array<{
    title?: string;
    start_date?: string;
    description?: string;
  }>;
  certifications?: Array<{
    title?: string;
    subtitle?: string;
    meta?: string;
    credential_url?: string;
  }>;
  [key: string]: unknown; // Allow additional properties from Bright Data API
}

export interface LinkedInCompany {
  id?: string;
  name?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  headquarters?: string;
  founded?: string;
  specialties?: string[];
  url?: string;
  [key: string]: unknown; // Allow additional properties from Bright Data API
}

export interface LinkedInJob {
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  postedAt?: string;
  employmentType?: string;
  seniorityLevel?: string;
  url?: string;
  [key: string]: unknown; // Allow additional properties from Bright Data API
}

export interface LinkedInPost {
  id?: string;
  author?: string;
  content?: string;
  publishedAt?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  url?: string;
  [key: string]: unknown; // Allow additional properties from Bright Data API
}

export class LinkedInScraper {
  /**
   * Scrape LinkedIn profiles by URLs
   */
  static async scrapeProfiles(urls: string[]): Promise<LinkedInProfile[]> {
    try {
      console.log('Scraping LinkedIn profiles using Bright Data SDK...');
      console.log('Request URLs:', urls);
      
      const profiles = await client.datasets.linkedin.collectProfiles(urls, {
        format: 'json'
      });
      
      const profileArray = profiles as unknown as LinkedInProfile[];
      console.log(`Successfully retrieved ${profileArray.length} profiles`);
      
      // Log detailed information about each profile
      profileArray.forEach((profile, index) => {
        console.log(`Profile ${index + 1} - ${profile.name}:`, {
          hasExperience: Array.isArray(profile.experience),
          experienceCount: Array.isArray(profile.experience) ? profile.experience.length : 0,
          experienceIsNull: profile.experience === null,
          experienceIsUndefined: profile.experience === undefined,
          hasEducation: Array.isArray(profile.education),
          educationCount: Array.isArray(profile.education) ? profile.education.length : 0,
          hasSkills: Array.isArray(profile.skills),
          skillsCount: Array.isArray(profile.skills) ? profile.skills.length : 0,
          allKeys: Object.keys(profile)
        });
      });
      
      return profileArray;
    } catch (error) {
      console.error('Error scraping LinkedIn profiles:', error);
      throw new Error(`Failed to scrape profiles: ${(error as Error).message}`);
    }
  }

  /**
   * Discover LinkedIn profiles by name filters
   */
  static async discoverProfiles(filters: Array<{
    first_name: string;
    last_name: string;
    company?: string;
    position?: string;
    location?: string;
  }>) {
    try {
      const discovery = await client.datasets.linkedin.discoverProfiles(filters, {
        format: 'json'
      });
      return discovery;
    } catch (error) {
      console.error('Error discovering LinkedIn profiles:', error);
      throw new Error(`Failed to discover profiles: ${(error as Error).message}`);
    }
  }

  /**
   * Scrape LinkedIn company pages by URLs
   */
  static async scrapeCompanies(urls: string[]): Promise<LinkedInCompany[]> {
    try {
      const companies = await client.datasets.linkedin.collectCompanies(urls, {
        format: 'json'
      });
      return companies as unknown as LinkedInCompany[];
    } catch (error) {
      console.error('Error scraping LinkedIn companies:', error);
      throw new Error(`Failed to scrape companies: ${(error as Error).message}`);
    }
  }

  /**
   * Scrape LinkedIn job postings by URLs
   */
  static async scrapeJobs(urls: string[]): Promise<LinkedInJob[]> {
    try {
      const jobs = await client.datasets.linkedin.collectJobs(urls, {
        format: 'json'
      });
      return jobs as unknown as LinkedInJob[];
    } catch (error) {
      console.error('Error scraping LinkedIn jobs:', error);
      throw new Error(`Failed to scrape jobs: ${(error as Error).message}`);
    }
  }

  /**
   * Discover LinkedIn jobs by filters
   */
  static async discoverJobs(filters: Array<{
    keyword?: string;
    location: string;
    company?: string;
    country?: string;
    time_range?: 'Past week' | 'Past 24 hours' | 'Past month' | 'Any time';
    job_type?: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Volunteer';
    experience_level?: 'Internship' | 'Entry level' | 'Associate' | 'Mid-Senior level' | 'Director' | 'Executive';
    remote?: 'On-site' | 'Remote' | 'Hybrid';
  }>) {
    try {
      // Convert filters to match Bright Data's expected format
      const brightDataFilters = filters.map(filter => ({
        keyword: filter.keyword,
        location: filter.location,
        company: filter.company,
        country: filter.country,
        time_range: filter.time_range,
        job_type: filter.job_type,
        experience_level: filter.experience_level,
        remote: filter.remote
      }));

      const discovery = await client.datasets.linkedin.discoverJobs(brightDataFilters, {
        format: 'json'
      });
      return discovery;
    } catch (error) {
      console.error('Error discovering LinkedIn jobs:', error);
      throw new Error(`Failed to discover jobs: ${(error as Error).message}`);
    }
  }

  /**
   * Scrape LinkedIn posts by URLs
   */
  static async scrapePosts(urls: string[]): Promise<LinkedInPost[]> {
    try {
      const posts = await client.datasets.linkedin.collectPosts(urls, {
        format: 'json'
      });
      return posts as unknown as LinkedInPost[];
    } catch (error) {
      console.error('Error scraping LinkedIn posts:', error);
      throw new Error(`Failed to scrape posts: ${(error as Error).message}`);
    }
  }

  /**
   * Discover company posts from LinkedIn company URLs
   */
  static async discoverCompanyPosts(urls: string[]) {
    try {
      const discovery = await client.datasets.linkedin.discoverCompanyPosts(
        urls.map(url => ({ url })),
        { format: 'jsonl' }
      );
      return discovery;
    } catch (error) {
      console.error('Error discovering company posts:', error);
      throw new Error(`Failed to discover company posts: ${(error as Error).message}`);
    }
  }

  /**
   * Download snapshot data when ready
   */
  static async downloadSnapshot(snapshotId: string, filename: string) {
    try {
      const filePath = await client.datasets.snapshot.download(snapshotId, {
        statusPolling: true,
        filename,
        format: 'jsonl',
        compress: false
      });
      return filePath;
    } catch (error) {
      console.error('Error downloading snapshot:', error);
      throw new Error(`Failed to download snapshot: ${(error as Error).message}`);
    }
  }

  /**
   * Check snapshot status
   */
  static async getSnapshotStatus(snapshotId: string) {
    try {
      const status = await client.datasets.snapshot.getStatus(snapshotId);
      return status;
    } catch (error) {
      console.error('Error checking snapshot status:', error);
      throw new Error(`Failed to check snapshot status: ${(error as Error).message}`);
    }
  }

  /**
   * Cancel a running snapshot
   */
  static async cancelSnapshot(snapshotId: string) {
    try {
      const result = await client.datasets.snapshot.cancel(snapshotId);
      return result;
    } catch (error) {
      console.error('Error canceling snapshot:', error);
      throw new Error(`Failed to cancel snapshot: ${(error as Error).message}`);
    }
  }
}

export default LinkedInScraper;

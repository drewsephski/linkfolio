import { LinkedInProfile } from '@/lib/brightdata/linkedin-scraper';

/**
 * Normalizes LinkedIn input to a full URL
 * Accepts either a username (e.g., "johndoe") or a full LinkedIn URL
 */
export function normalizeLinkedInInput(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('LinkedIn username or URL is required');
  }

  // Trim whitespace
  const trimmedInput = input.trim();

  // If it's already a full LinkedIn URL, validate and return it
  if (trimmedInput.startsWith('https://')) {
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
    if (!linkedinRegex.test(trimmedInput)) {
      throw new Error('Invalid LinkedIn profile URL format');
    }
    return trimmedInput;
  }

  // If it starts with linkedin.com but no protocol, add https://
  if (trimmedInput.startsWith('linkedin.com/in/')) {
    return `https://${trimmedInput}`;
  }

  // If it starts with www.linkedin.com, add https://
  if (trimmedInput.startsWith('www.linkedin.com/in/')) {
    return `https://${trimmedInput}`;
  }

  // If it starts with /in/, assume it's a partial path
  if (trimmedInput.startsWith('/in/')) {
    return `https://linkedin.com${trimmedInput}`;
  }

  // Otherwise, treat it as a username
  const usernameRegex = /^[\w-]+$/;
  if (!usernameRegex.test(trimmedInput)) {
    throw new Error('Invalid LinkedIn username. Usernames can only contain letters, numbers, hyphens, and underscores.');
  }

  return `https://linkedin.com/in/${trimmedInput}`;
}

export interface PortfolioProfile {
  id: string;
  name: string;
  headline: string;
  location: string;
  summary: string;
  avatar?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  linkedinUrl: string;
  generatedAt: string;
  bannerImage?: string;
  followers?: number;
  connections?: number;
  currentCompany?: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  duration: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  startDate?: string;
  url?: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
  credentialId?: string;
}

/**
 * Normalizes raw LinkedIn data into our portfolio schema
 */
export function normalizeLinkedInData(rawData: LinkedInProfile): PortfolioProfile {
  // Defensive: Check if rawData exists and is valid
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid LinkedIn data: rawData is null or not an object');
  }
  
  const id = generateId();
  const name = rawData.name || 'Anonymous';
  const headline = rawData.headline || `${rawData.current_company?.name || ''} | ${rawData.city || ''}`;
  const location = rawData.city || '';
  const summary = rawData.about || '';
  const avatar = rawData.avatar ? rawData.avatar.replace(/^https:\/\//, 'https://') : '';
  const linkedinUrl = rawData.url || '';

  // Normalize experience (Bright Data returns null if no experience)
  const experience = Array.isArray(rawData.experience) 
    ? rawData.experience.map((exp) => ({
        id: generateId(),
        title: exp.title || 'Unknown Role',
        company: exp.company || 'Unknown Company',
        duration: exp.duration || '',
        description: exp.description || '',
        startDate: extractStartDate(exp.duration),
        endDate: extractEndDate(exp.duration),
        current: isCurrentRole(exp.duration)
      }))
    : []; // Handle null case

  // Normalize education (Bright Data returns null if no education)
  const education = Array.isArray(rawData.education)
    ? rawData.education.map((edu) => ({
        id: generateId(),
        school: edu.school || 'Unknown School',
        degree: edu.degree || 'Unknown Degree',
        duration: edu.duration || '',
        startDate: extractStartDate(edu.duration),
        endDate: extractEndDate(edu.duration),
        current: isCurrentRole(edu.duration)
      }))
    : []; // Handle null case

  // Normalize skills (extract from projects, certifications, and bio)
  const skills: string[] = [];
  
  // Extract skills from projects
  if (Array.isArray(rawData.projects)) {
    rawData.projects.forEach(project => {
      if (project.description) {
        // Simple skill extraction from project descriptions
        const techKeywords = ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'AI', 'Machine Learning', 'Full-stack', 'Web Development'];
        techKeywords.forEach(keyword => {
          if (project.description!.toLowerCase().includes(keyword.toLowerCase()) && !skills.includes(keyword)) {
            skills.push(keyword);
          }
        });
      }
    });
  }
  
  // Normalize projects
  const projects = Array.isArray(rawData.projects) 
    ? rawData.projects.map((project) => ({
        id: generateId(),
        title: project.title || 'Untitled Project',
        description: project.description || '',
        startDate: project.start_date || undefined
      }))
    : [];

  // Normalize certifications
  const certifications = Array.isArray(rawData.certifications)
    ? rawData.certifications.map((cert) => ({
        id: generateId(),
        title: cert.title || 'Certification',
        issuer: cert.subtitle || 'Unknown Issuer',
        issueDate: cert.meta?.split('Issued ')[1]?.split(' ')[0] || undefined,
        credentialUrl: cert.credential_url || undefined
      }))
    : [];

  return {
    id,
    name,
    headline,
    location,
    summary,
    avatar,
    experience,
    education,
    skills,
    projects,
    certifications,
    linkedinUrl,
    generatedAt: new Date().toISOString(),
    bannerImage: (rawData.banner_image as string) ? 
      ((rawData.banner_image as string).replace(/^https:\/\//, 'https://')) : undefined,
    followers: rawData.followers ? Number(rawData.followers) : undefined,
    connections: rawData.connections ? Number(rawData.connections) : undefined,
    currentCompany: rawData.current_company?.name || rawData.current_company_name || undefined
  };
}

/**
 * Extract start date from duration string
 */
function extractStartDate(duration?: string): string | undefined {
  if (!duration) return undefined;
  
  // Match patterns like "Jan 2020 - Present" or "2020 - 2022"
  const startMatch = duration.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4}/);
  return startMatch ? startMatch[0] : undefined;
}

/**
 * Extract end date from duration string
 */
function extractEndDate(duration?: string): string | undefined {
  if (!duration) return undefined;
  
  // Check if it's a current role
  if (duration.toLowerCase().includes('present') || duration.toLowerCase().includes('current')) {
    return undefined;
  }
  
  // Match end date patterns
  const endMatch = duration.match(/-\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4}$/);
  return endMatch ? endMatch[1] || endMatch[0] : undefined;
}

/**
 * Check if role is current based on duration
 */
function isCurrentRole(duration?: string): boolean {
  if (!duration) return false;
  return duration.toLowerCase().includes('present') || 
         duration.toLowerCase().includes('current') ||
         duration.toLowerCase().includes('till now');
}

/**
 * Generate a simple ID
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Clean and format text content
 */
export function cleanText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n')       // Replace multiple newlines with single newline
    .replace(/^\s+|\s+$/g, '')      // Trim whitespace
    .replace(/[^\w\s\-\.\,\!\?\;\:\@\#\$\%\&\*\(\)\/\+\=\[\]\{\}\'\"`~]/g, '') // Remove special chars except common punctuation
    .trim();
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substr(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/**
 * Format duration for display
 */
export function formatDuration(duration: string): string {
  if (!duration) return 'Unknown duration';
  
  // Clean up common LinkedIn duration formats
  return duration
    .replace(/\s+/g, ' ')
    .replace(/(\d+)\s*(yr|year|years)s?/gi, '$1 year$2')
    .replace(/(\d+)\s*(mo|month|months)s?/gi, '$1 month$2')
    .trim();
}

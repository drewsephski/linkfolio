import { LinkedInProfile } from '@/lib/brightdata/linkedin-scraper';

/**
 * Normalizes LinkedIn input to a full URL
 * Accepts either a username (e.g., "johndoe") or a full LinkedIn URL
 */
export function normalizeLinkedInInput(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('LinkedIn username or URL is required');
  }

  const trimmedInput = input.trim();

  if (trimmedInput.startsWith('https://')) {
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
    if (!linkedinRegex.test(trimmedInput)) {
      throw new Error('Invalid LinkedIn profile URL format');
    }
    return trimmedInput;
  }

  if (trimmedInput.startsWith('linkedin.com/in/')) {
    return `https://${trimmedInput}`;
  }

  if (trimmedInput.startsWith('www.linkedin.com/in/')) {
    return `https://${trimmedInput}`;
  }

  if (trimmedInput.startsWith('/in/')) {
    return `https://linkedin.com${trimmedInput}`;
  }

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
  activity?: ActivityItem[];
  /**
   * True when Bright Data returned experience: null for this profile.
   * The AI enrichment layer uses this to skip fabricating bullets and instead
   * surface a "couldn't retrieve experience" notice to the user.
   */
  experienceUnavailable?: boolean;
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

export interface ActivityItem {
  id?: string;
  title: string;
  link?: string;
  img?: string;
  interaction?: string;
}

/**
 * Normalizes raw LinkedIn data into our portfolio schema.
 *
 * Key design decisions:
 * - If Bright Data returns experience: null we set experienceUnavailable: true
 *   and return an EMPTY experience array rather than a fake placeholder entry.
 *   The AI enrichment layer respects this flag and will not fabricate bullets.
 * - current_company is only used to supplement a real experience array, never
 *   to manufacture a standalone fake entry.
 */
export function normalizeLinkedInData(rawData: LinkedInProfile | any): PortfolioProfile {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid LinkedIn data: rawData is null or not an object');
  }

  const name = rawData.name || 'Anonymous';
  const headline = rawData.position || rawData.headline || '';
  const location = rawData.city || rawData.location || '';
  const summary = rawData.about || rawData.summary || '';

  // Handle Bright Data API truncation (ends with ellipsis character)
  let processedSummary = summary;
  if (summary && (summary.endsWith('…') || summary.includes('…'))) {
    processedSummary = summary.replace(/…+$/, '').replace(/…/g, '');
    console.log('Detected truncated summary from Bright Data API:', summary.length, 'characters ->', processedSummary.length, 'characters');
  }

  const avatar = rawData.avatar ? rawData.avatar.replace(/^https:\/\//, 'https://') : '';
  const linkedinUrl = rawData.url || rawData.input_url || '';

  // ─── EXPERIENCE ──────────────────────────────────────────────────────────────
  // Bright Data sometimes returns experience: null even for profiles that have
  // rich experience on LinkedIn. When that happens we must NOT fabricate data.
  // We surface experienceUnavailable: true so the UI / AI layer can handle it
  // gracefully (e.g. show a "couldn't retrieve" notice) instead of filling in
  // generic "Team Member at Current Company" placeholders.

  const rawExperience = rawData.experience;
  const experienceUnavailable = rawExperience === null || rawExperience === undefined;

  let experience: ExperienceItem[] = [];

  if (!experienceUnavailable && Array.isArray(rawExperience) && rawExperience.length > 0) {
    experience = normalizeExperienceArray(rawExperience);

    // If the parsed array is empty (all entries were invalid) treat as unavailable
    if (experience.length === 0) {
      console.log('Experience array was present but all entries were invalid — treating as unavailable');
    }
  }

  if (experienceUnavailable) {
    console.log('Bright Data returned experience: null — skipping placeholder creation, setting experienceUnavailable flag');
  }

  // ─── EDUCATION ───────────────────────────────────────────────────────────────
  const education = normalizeEducation(rawData);

  // ─── SKILLS ──────────────────────────────────────────────────────────────────
  let skills: string[] = [];

  if (Array.isArray(rawData.skills)) {
    skills = rawData.skills
      .filter((s: unknown) => s != null) // Add null check
      .map((s: unknown) => typeof s === 'string' ? s : (s as Record<string, unknown>)?.name as string)
      .filter(Boolean);
  }

  if (Array.isArray(rawData.languages)) {
    const langSkills = rawData.languages
      .filter((l: unknown) => l != null) // Add null check
      .map((l: unknown) => typeof l === 'string' ? l : (l as Record<string, unknown>)?.name as string)
      .filter(Boolean);
    skills = [...skills, ...langSkills];
  }

  // ─── CERTIFICATIONS ──────────────────────────────────────────────────────────
  const certifications: CertificationItem[] = Array.isArray(rawData.certifications)
    ? rawData.certifications.map((cert: unknown) => {
        const c = cert as Record<string, unknown>;
        return {
          id: generateId(),
          title: (c.title as string) || 'Certification',
          issuer: (c.subtitle as string) || '',
          issueDate: (c.meta as string) || '',
          credentialUrl: (c.credential_url as string) || '',
          credentialId: (c.credential_id as string) || '',
        };
      })
    : [];

  // ─── PROJECTS ────────────────────────────────────────────────────────────────
  const projects: ProjectItem[] = Array.isArray(rawData.projects)
    ? rawData.projects.map((p: unknown) => ({
        id: generateId(),
        title: (p as Record<string, unknown>).title as string || 'Project',
        description: (p as Record<string, unknown>).description as string || '',
        url: (p as Record<string, unknown>).url as string || '',
        startDate: (p as Record<string, unknown>).start_date as string || '',
      }))
    : [];

  // ─── ACTIVITY ────────────────────────────────────────────────────────────────
  const activity: ActivityItem[] = Array.isArray(rawData.activity)
    ? rawData.activity.map((item: unknown) => ({
        id: generateId(),
        title: (item as Record<string, unknown>).title as string || 'Activity',
        link: (item as Record<string, unknown>).link as string || '',
        img: (item as Record<string, unknown>).img as string || '',
        interaction: (item as Record<string, unknown>).interaction as string || '',
      }))
    : [];

  // Derive currentCompany from the experience array first, then fall back to
  // the top-level current_company field (which sometimes only has location).
  const currentCompanyFromExp = experience.find(e => e.current)?.company;
  const currentCompanyFromField =
    (rawData.current_company as Record<string, unknown>)?.name as string ||
    rawData.current_company_name as string ||
    undefined;
  const currentCompany = currentCompanyFromExp || currentCompanyFromField || undefined;

  console.log('Normalized profile summary:', {
    name,
    experienceCount: experience.length,
    experienceUnavailable,
    educationCount: education.length,
    skillsCount: skills.length,
    projectsCount: projects.length,
    certificationsCount: certifications.length,
  });

  if (experience.length > 0) {
    console.log('Sample experience:', experience[0]);
  }
  if (education.length > 0) {
    console.log('Sample education:', education[0]);
  }

  return {
    id: generateId(),
    name,
    headline,
    location,
    summary: processedSummary,
    avatar,
    experience,
    education,
    skills,
    projects,
    certifications,
    activity,
    linkedinUrl,
    generatedAt: new Date().toISOString(),
    bannerImage: rawData.banner_image
      ? (rawData.banner_image as string).replace(/^https:\/\//, 'https://')
      : undefined,
    followers: rawData.followers ? Number(rawData.followers) : undefined,
    connections: rawData.connections ? Number(rawData.connections) : undefined,
    currentCompany,
    experienceUnavailable,
  };
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────

/**
 * Converts a raw experience array (from Bright Data) into ExperienceItem[].
 * Handles the grouped-positions format (e.g. EMS with sub-roles) and the
 * standard flat format.
 */
function normalizeExperienceArray(rawArray: unknown[]): ExperienceItem[] {
  const items: ExperienceItem[] = [];

  for (let index = 0; index < rawArray.length; index++) {
    const exp = rawArray[index] as Record<string, unknown>;
    console.log(`Processing experience item ${index + 1}:`, Object.keys(exp));

    // ── Grouped positions (e.g. EMS with sub-roles array) ─────────────────────
    // Some Bright Data responses nest multiple roles under a single company entry
    // using a `positions` array. Expand each sub-position into its own item.
    if (Array.isArray(exp.positions) && exp.positions.length > 0) {
      const parentCompany = (exp.company as string) || (exp.title as string) || '';
      for (const pos of exp.positions as Record<string, unknown>[]) {
        const subTitle = (pos.title as string) || '';
        if (!subTitle || !parentCompany) continue;

        const subStart = (pos.start_date as string) || '';
        const subEnd = (pos.end_date as string) || '';
        const subDuration = buildDuration(subStart, subEnd, pos.meta as string);

        items.push({
          id: generateId(),
          title: subTitle.trim(),
          company: parentCompany.trim(),
          duration: subDuration,
          description: (pos.description_html as string) || '',
          startDate: subStart,
          endDate: subEnd,
          current: isCurrentDate(subEnd),
        });
      }
      continue;
    }

    // ── Standard flat entry ────────────────────────────────────────────────────
    const title =
      (exp.title as string) ||
      (exp.position as string) ||
      (exp.role as string) ||
      (exp.job_title as string) ||
      '';

    const company =
      (exp.company as string) ||
      (exp.organization as string) ||
      (exp.employer as string) ||
      '';

    // Skip entries that lack both a title and a company — they carry no info.
    if (!title.trim() && !company.trim()) {
      console.log(`Skipping experience item ${index + 1} — no title or company`);
      continue;
    }

    // Skip entries that look like they were synthesised from current_company
    // (title === company or company is a generic placeholder). This prevents
    // re-introducing the "Team Member at Current Company" problem.
    if (
      company.toLowerCase() === 'current company' ||
      title.toLowerCase() === 'team member'
    ) {
      console.log(`Skipping experience item ${index + 1} — detected placeholder entry`);
      continue;
    }

    const description =
      (exp.description as string) ||
      (exp.description_html as string) ||
      (exp.summary as string) ||
      (exp.details as string) ||
      '';

    const startDate =
      (exp.start_date as string) ||
      (exp.startDate as string) ||
      (exp.start_year as string) ||
      '';

    const endDate =
      (exp.end_date as string) ||
      (exp.endDate as string) ||
      (exp.end_year as string) ||
      '';

    const duration =
      (exp.duration as string) ||
      buildDuration(startDate, endDate);

    items.push({
      id: generateId(),
      title: title.trim(),
      company: company.trim(),
      duration,
      description,
      startDate,
      endDate,
      current: isCurrentDate(endDate),
    });
  }

  return items;
}

/**
 * Normalizes education data from all the places Bright Data might put it.
 *
 * Priority:
 *  1. rawData.education (array)              — full structured data
 *  2. rawData.educations_details (string)    — just school name(s), comma-separated
 */
function normalizeEducation(rawData: Record<string, unknown>): EducationItem[] {
  const items: EducationItem[] = [];

  // ── 1. Structured array ───────────────────────────────────────────────────
  if (Array.isArray(rawData.education) && rawData.education.length > 0) {
    for (const edu of rawData.education as Record<string, unknown>[]) {
      if (!edu) continue;

      // Bright Data uses `title` for the school name in some responses
      const school =
        (edu.school as string) ||
        (edu.university as string) ||
        (edu.college as string) ||
        (edu.institution as string) ||
        (edu.title as string) ||        // ← key fix: map title → school
        '';

      if (!school.trim()) {
        console.log('Skipping education item with no school name');
        continue;
      }

      const degree =
        (edu.degree as string) ||
        (edu.major as string) ||
        (edu.field_of_study as string) ||
        (edu.specialization as string) ||
        (edu.description as string) ||
        '';

      // Duration from explicit field or constructed from years
      const startYear = (edu.start_year as string) || (edu.start_date as string) || '';
      const endYear = (edu.end_year as string) || (edu.end_date as string) || '';
      const duration =
        (edu.duration as string) ||
        buildDuration(startYear, endYear);

      items.push({
        id: generateId(),
        school: school.trim(),
        degree: degree.trim(),
        duration,
        startDate: startYear,
        endDate: endYear,
        current: isCurrentDate(endYear),
      });
    }
    return items;
  }

  // ── 2. Plain string fallback (educations_details) ────────────────────────
  const detailsRaw = rawData.educations_details;
  if (typeof detailsRaw === 'string' && detailsRaw.trim()) {
    // Could be a single school or comma-separated list
    const schools = detailsRaw
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    for (const school of schools) {
      items.push({
        id: generateId(),
        school,
        degree: '', // No degree info available; AI enrichment will infer
        duration: '',
        startDate: undefined,
        endDate: undefined,
        current: false,
      });
    }
    return items;
  }

  console.log('No education data found in any field');
  return items;
}

/**
 * Builds a human-readable duration string from start/end date strings.
 * Prefers an explicit meta string if provided (Bright Data sometimes includes it).
 */
function buildDuration(start: string, end: string, meta?: string): string {
  if (meta && meta.trim()) return meta.trim();
  if (start && end) return `${start} - ${end}`;
  if (start) return `${start} - Present`;
  if (end) return `Until ${end}`;
  return '';
}

/**
 * Returns true if the end date string indicates a current/active role.
 */
function isCurrentDate(endDate: string): boolean {
  if (!endDate) return true; // No end date → assume current
  const lower = endDate.toLowerCase();
  return lower === 'present' || lower === 'current' || lower === 'till now';
}

// ─── PUBLIC UTILITIES ──────────────────────────────────────────────────────────

export function generateId(): string {
  return crypto.randomUUID();
}

export function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .replace(/^\s+|\s+$/g, '')
    .replace(/[^\w\s\-\.\,\!\?\;\:\@\#\$\%\&\*\(\)\/\+\=\[\]\{\}\'\"`~]/g, '')
    .trim();
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substr(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

export function formatDuration(duration: string): string {
  if (!duration) return 'Unknown duration';
  return duration
    .replace(/\s+/g, ' ')
    .replace(/(\d+)\s*(yr|year|years)s?/gi, '$1 year$2')
    .replace(/(\d+)\s*(mo|month|months)s?/gi, '$1 month$2')
    .trim();
}
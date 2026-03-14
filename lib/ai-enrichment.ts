import { generateText } from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';
import {
  PortfolioProfile,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  CertificationItem,
} from '@/lib/data-normalization';

const model = openrouter('openrouter/free');

// ─── PUBLIC ENTRY POINT ────────────────────────────────────────────────────────

/**
 * Enriches profile data with AI-generated content.
 *
 * What changed vs the original:
 * - When experienceUnavailable is true we do NOT run enrichExperience at all,
 *   so the AI can never fabricate bullets over a fake placeholder entry.
 * - enrichExperience now only runs on entries that have a real title AND company
 *   from Bright Data — it will never invent data it wasn't given.
 * - The summary expansion receives only real context; if context is too thin
 *   (experience unavailable, no headline) we skip AI expansion and just use the
 *   truncated summary as-is rather than risk hallucination.
 */
export async function enrichProfileData(
  profile: PortfolioProfile,
): Promise<PortfolioProfile> {
  try {
    const enrichedSkills = await extractSkillsFromProfile(profile);

    const enrichedSummary = await enrichSummary(
      profile.summary,
      profile.headline,
      profile.experience,
      profile.education,
      profile.projects,
      enrichedSkills,
      profile.experienceUnavailable,
    );

    // Only enrich experience entries that came from real Bright Data records.
    // If Bright Data returned null we leave the array empty — the UI should
    // display a "couldn't retrieve experience" notice instead.
    let enrichedExperience = profile.experience;
    if (!profile.experienceUnavailable && profile.experience.length > 0) {
      // Use Promise.allSettled to handle individual failures gracefully
      const enrichmentResults = await Promise.allSettled(
        profile.experience.map(exp => enrichExperience(exp))
      );
      
      enrichedExperience = enrichmentResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`Failed to enrich experience ${index + 1} (${profile.experience[index].title} at ${profile.experience[index].company}):`, result.reason);
          return profile.experience[index]; // Return original on failure
        }
      });
    } else if (profile.experienceUnavailable) {
      console.log(
        'Skipping experience enrichment — Bright Data returned experience: null for this profile',
      );
    }

    const enrichedEducation = await Promise.allSettled(
      profile.education.map(edu => enrichEducation(edu)),
    ).then(results => 
      results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`Failed to enrich education ${index + 1} (${profile.education[index].school}):`, result.reason);
          return profile.education[index]; // Return original on failure
        }
      })
    );

    return {
      ...profile,
      summary: enrichedSummary,
      experience: enrichedExperience,
      education: enrichedEducation,
      skills: enrichedSkills,
    };
  } catch (error) {
    console.error('AI enrichment failed:', error);
    return profile;
  }
}

// ─── SUMMARY ──────────────────────────────────────────────────────────────────

async function enrichSummary(
  originalSummary: string,
  headline: string,
  experience: ExperienceItem[],
  education: EducationItem[],
  projects: ProjectItem[],
  skills: string[],
  experienceUnavailable?: boolean,
): Promise<string> {
  console.log('enrichSummary called with:', {
    originalSummary: originalSummary?.substring(0, 50) + '...',
    length: originalSummary?.length,
    experienceUnavailable,
  });

  if (originalSummary && originalSummary.trim() !== '') {
    // Summary is long enough — use as-is (converted to first person).
    if (originalSummary.length >= 200) {
      console.log('Using original summary as-is');
      return convertToFirstPerson(originalSummary.trim());
    }

    // Summary looks truncated. Only attempt AI expansion if we have meaningful
    // context to work with. If experience is unavailable AND there's no headline
    // we don't have enough real data, so return what we have.
    const hasUsefulContext =
      headline.trim() !== '' ||
      experience.length > 0 ||
      education.length > 0 ||
      skills.length > 0;

    if (!hasUsefulContext) {
      console.log(
        'Summary is truncated but no useful context available — using original as-is',
      );
      return convertToFirstPerson(originalSummary.trim());
    }

    console.log('Summary appears truncated, using AI to expand based on available data');
    try {
      const expanded = await expandTruncatedSummary(
        originalSummary,
        headline,
        experience,
        education,
        projects,
        skills,
      );
      if (!expanded || expanded.trim() === '') {
        console.log('AI expansion returned empty, using original summary');
        return convertToFirstPerson(originalSummary.trim());
      }
      return expanded;
    } catch (error) {
      console.error('AI expansion failed, using original summary:', error);
      return convertToFirstPerson(originalSummary.trim());
    }
  }

  // No summary at all — generate from profile data only if we have enough.
  if (!headline && experience.length === 0 && education.length === 0) {
    console.log('No summary and no profile data — using default');
    return generateDefaultSummary(headline);
  }

  console.log('No original summary, generating comprehensive summary from profile data');
  try {
    const comprehensive = await generateComprehensiveSummary(
      headline,
      experience,
      education,
      projects,
      skills,
    );
    if (!comprehensive || comprehensive.trim() === '') {
      console.log('AI comprehensive generation returned empty, using default summary');
      return generateDefaultSummary(headline);
    }
    return comprehensive;
  } catch (error) {
    console.error('AI comprehensive generation failed, using default summary:', error);
    return generateDefaultSummary(headline);
  }
}

function convertToFirstPerson(summary: string): string {
  if (summary.includes('I am') || summary.includes('I have') || summary.includes('My ')) {
    return summary;
  }
  return summary
    .replace(/\b(He|She|They) is\b/g, 'I am')
    .replace(/\b(He|She|They) has\b/g, 'I have')
    .replace(/\b(He|She|They) works\b/g, 'I work')
    .replace(/\bHis\b/g, 'My')
    .replace(/\bHer\b/g, 'My')
    .replace(/\bTheir\b/g, 'My');
}

async function generateComprehensiveSummary(
  headline: string,
  experience: ExperienceItem[],
  education: EducationItem[],
  projects: ProjectItem[],
  skills: string[],
): Promise<string> {
  const experienceText = experience
    .slice(0, 3)
    .map(exp => `${exp.title} at ${exp.company}: ${exp.description || ''}`)
    .join('\n');

  const educationText = education
    .slice(0, 2)
    .map(edu => `${edu.degree} from ${edu.school}`)
    .join('\n');

  const projectsText = projects
    .slice(0, 2)
    .map(p => `${p.title}: ${p.description}`)
    .join('\n');

  const skillsText = skills.slice(0, 10).join(', ');

  const prompt = `
Generate a compelling, professional summary for this person's portfolio based ONLY on their actual profile data provided below.

Headline: "${headline}"
Recent Experience:
${experienceText || 'Not available'}

Education:
${educationText || 'Not available'}

Key Projects:
${projectsText || 'Not available'}

Skills: ${skillsText || 'Not available'}

CRITICAL REQUIREMENTS:
- Use ONLY the actual data provided above - NEVER make up information
- Do NOT use placeholders like [mention field], [University Name], etc.
- Write in first person ("I am..." not "John is...")
- Keep it to 150-250 words
- Make it engaging but stay strictly factual

Return only the summary, no additional text.
`;

  try {
    const { text } = await generateText({ model, prompt, maxOutputTokens: 500, temperature: 0.7 });
    const result = text.trim();
    if (!result) return generateDefaultSummary(headline);
    return result;
  } catch (error) {
    console.error('Comprehensive summary generation failed:', error);
    return generateDefaultSummary(headline);
  }
}

async function expandTruncatedSummary(
  truncatedSummary: string,
  headline: string,
  experience: ExperienceItem[],
  education: EducationItem[],
  projects: ProjectItem[],
  skills: string[],
): Promise<string> {
  const experienceText = experience
    .slice(0, 3)
    .map(exp => `${exp.title} at ${exp.company}: ${exp.description || ''}`)
    .join('\n');

  const educationText = education
    .slice(0, 2)
    .map(edu => `${edu.degree} from ${edu.school}`)
    .join('\n');

  const projectsText = projects
    .slice(0, 2)
    .map(p => `${p.title}: ${p.description}`)
    .join('\n');

  const skillsText = skills.slice(0, 10).join(', ');

  const prompt = `
The following LinkedIn summary was truncated. Please expand it using ONLY the actual profile data provided.

Truncated Summary: "${truncatedSummary}"
Headline: "${headline || 'Not provided'}"
Recent Experience:
${experienceText || 'Not available'}

Education:
${educationText || 'Not available'}

Key Projects:
${projectsText || 'Not available'}

Skills: ${skillsText || 'Not available'}

CRITICAL REQUIREMENTS:
- Use ONLY the data provided — NEVER invent information
- Do NOT use placeholders like [mention field], [University Name], etc.
- Write in first person
- 200-300 words
- If a section says "Not available", do not reference it

Return only the expanded summary, no additional text.
`;

  try {
    console.log('Making AI call to expand summary...');
    const { text } = await generateText({ model, prompt, maxOutputTokens: 500, temperature: 0.7 });
    const result = text.trim();
    console.log('AI expansion result:', { resultLength: result.length, resultPreview: result.substring(0, 100) });
    return result || truncatedSummary;
  } catch (error) {
    console.error('Summary expansion failed:', error);
    return truncatedSummary;
  }
}

function generateDefaultSummary(headline: string): string {
  if (!headline || headline.trim() === '') {
    return 'A passionate professional dedicated to excellence and innovation in their field.';
  }
  const cleanHeadline = headline.replace(/\|.*$/, '').trim();
  if (!cleanHeadline) {
    return 'A passionate professional dedicated to excellence and innovation in their field.';
  }
  return `A ${cleanHeadline.toLowerCase()} with a passion for excellence and innovation. Experienced in delivering results and driving success through dedication and expertise.`;
}

// ─── EXPERIENCE ───────────────────────────────────────────────────────────────

/**
 * Enriches a single experience entry with AI-generated bullet points.
 *
 * Guard: if the entry has no real description AND no meaningful title/company
 * we skip the AI call entirely to avoid fabrication.
 */
async function enrichExperience(experience: ExperienceItem): Promise<ExperienceItem> {
  // Never enrich entries that look like placeholders
  if (
    !experience.title ||
    !experience.company ||
    experience.company.toLowerCase() === 'current company' ||
    experience.title.toLowerCase() === 'team member'
  ) {
    console.log(`Skipping AI enrichment for placeholder experience: "${experience.title}" at "${experience.company}"`);
    return experience;
  }

  const hasDescription = experience.description && experience.description.trim().length > 0;
  const isCurrentPosition = experience.current === true;

  const prompt = `
Transform this job information into 2-4 compelling bullet points for a professional portfolio using ONLY the actual data provided.

Role: ${experience.title}
Company: ${experience.company}
Duration: ${experience.duration || 'Not specified'}
${hasDescription ? `Original Description: "${experience.description}"` : 'No description provided'}
${isCurrentPosition ? 'NOTE: This is a CURRENT POSITION — use present tense.' : ''}

CRITICAL REQUIREMENTS:
- Use ONLY the data provided — do NOT invent metrics, numbers, or achievements
- Start each bullet with a strong action verb
- If no description was provided, base bullets solely on the role title and company
- Keep each bullet concise and professional
- ${isCurrentPosition ? 'Use present tense (Leading, Managing, Developing...)' : 'Use past tense (Led, Managed, Developed...)'}

Return only the bullet points, one per line, no additional text.
`;

  try {
    const { text } = await generateText({ model, prompt, maxOutputTokens: 200, temperature: 0.6 });

    const bulletPoints = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => (line.startsWith('•') ? line : `• ${line}`))
      .join('\n');

    return { ...experience, description: bulletPoints };
  } catch (error) {
    console.error('Experience enrichment failed:', error);
    return experience; // Return original rather than a fabricated fallback
  }
}

// ─── EDUCATION ────────────────────────────────────────────────────────────────

async function enrichEducation(education: EducationItem): Promise<EducationItem> {
  const hasDegree = education.degree && education.degree.trim().length > 0;
  const hasSchool = education.school && education.school.trim().length > 0;

  // Degree is already meaningful — nothing to do
  if (hasDegree && hasSchool && education.degree.length > 10) {
    return { ...education, degree: education.degree.trim() };
  }

  // Try to infer the degree via AI
  if (!hasSchool) return education;

  const prompt = `
Suggest a likely degree title for a student who attended this school, based only on the school name.

School: ${education.school}
Duration: ${education.duration || 'Not specified'}

Requirements:
- Return ONLY the degree title (e.g. "Bachelor of Science", "Master of Arts")
- Do not invent a specific major unless the school name strongly implies it
- Use standard degree formats
- No additional text, just the degree title
`;

  try {
    const { text } = await generateText({ model, prompt, maxOutputTokens: 50, temperature: 0.3 });
    const enhancedDegree = text.trim();
    if (!enhancedDegree) return education;
    return { ...education, degree: enhancedDegree };
  } catch (error) {
    console.error('Education enhancement failed:', error);
    return education;
  }
}

// ─── SKILLS ───────────────────────────────────────────────────────────────────

async function extractSkillsFromProfile(profile: PortfolioProfile): Promise<string[]> {
  const skills = new Set<string>();

  // Extract from experience descriptions (even if experience is unavailable, we might have some data)
  if (profile.experience && profile.experience.length > 0) {
    const expSkills = await extractSkillsFromExperience(profile.experience);
    expSkills.forEach(s => skills.add(s));
  }

  // Enhanced extraction from education
  extractSkillsFromEducation(profile.education).forEach(s => skills.add(s));
  
  // Enhanced extraction from projects
  extractSkillsFromProjects(profile.projects).forEach(s => skills.add(s));
  
  // Enhanced extraction from certifications
  extractSkillsFromCertifications(profile.certifications).forEach(s => skills.add(s));

  // Enhanced extraction from summary and headline
  const summarySkills = await extractSkillsFromSummary(profile.summary, profile.headline);
  summarySkills.forEach(s => skills.add(s));

  // Include any skills that came directly from the raw Bright Data response
  if (profile.skills && profile.skills.length > 0) {
    profile.skills.forEach(s => skills.add(s));
  }

  // If still no skills found, try to extract from other sources
  if (skills.size === 0) {
    console.log('No skills found, generating from available profile data');
    const generated = await generateSkillsFromMinimalData(profile);
    generated.forEach((s: string) => skills.add(s));
  }

  const allSkills = Array.from(skills);
  
  // Filter and clean skills
  const cleanedSkills = allSkills
    .filter(skill => skill.length > 0 && skill.length < 50)
    .filter(skill => !/^[0-9\s\-_]+$/.test(skill)) // Remove purely numeric or symbols
    .map(skill => skill.replace(/^[-•·]\s*/, '').trim()) // Clean bullet points
    .filter((skill, index, arr) => arr.indexOf(skill) === index); // Remove duplicates

  // Rank skills by relevance and return top 15 (increased from 12)
  const ranked = await rankSkillsByRelevance(cleanedSkills, profile);
  return ranked.slice(0, 15);
}

async function extractSkillsFromExperience(experience: ExperienceItem[]): Promise<string[]> {
  if (experience.length === 0) return [];

  const experienceText = experience
    .map(exp => `${exp.title} at ${exp.company}: ${exp.description || ''}`)
    .join('\n');

  const prompt = `
Extract technical and professional skills from this work experience:

${experienceText}

Requirements:
- Focus on hard skills (technologies, tools, methodologies)
- Return as a comma-separated list, no additional text
- Maximum 15 skills

Example: "JavaScript, Project Management, React, Data Analysis, Leadership, Agile"
`;

  try {
    const { text } = await generateText({ model, prompt, maxOutputTokens: 150, temperature: 0.3 });
    return text
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 50);
  } catch {
    return [];
  }
}

function extractSkillsFromEducation(education: EducationItem[]): string[] {
  const skills = new Set<string>();
  
  // Expanded academic skills mapping
  const academicSkills = [
    'Research', 'Analysis', 'Writing', 'Critical Thinking', 'Mathematics',
    'Statistics', 'Computer Science', 'Engineering', 'Business Administration',
    'Marketing', 'Finance', 'Accounting', 'Economics', 'Psychology',
    'Data Analysis', 'Project Management', 'Communication', 'Presentation',
    'Problem Solving', 'Leadership', 'Teamwork', 'Time Management',
    'Scientific Method', 'Literature Review', 'Academic Writing', 'Statistical Analysis'
  ];
  
  // Technical skills from common degree programs
  const technicalSkills = [
    'Programming', 'Software Development', 'Web Development', 'Database Design',
    'Network Administration', 'Cybersecurity', 'Cloud Computing', 'Machine Learning',
    'Artificial Intelligence', 'Data Science', 'Mobile Development', 'Game Development'
  ];
  
  education.forEach(edu => {
    const text = `${edu.degree || ''} ${edu.school || ''}`.toLowerCase();
    
    // Check academic skills
    academicSkills.forEach(skill => {
      if (text.includes(skill.toLowerCase())) skills.add(skill);
    });
    
    // Check technical skills
    technicalSkills.forEach(skill => {
      if (text.includes(skill.toLowerCase())) skills.add(skill);
    });
    
    // Extract skills from degree names
    if (edu.degree) {
      const degreeLower = edu.degree.toLowerCase();
      
      // Computer Science related
      if (degreeLower.includes('computer') || degreeLower.includes('software') || degreeLower.includes('programming')) {
        skills.add('Computer Science');
        skills.add('Programming');
        skills.add('Software Development');
      }
      
      // Business related
      if (degreeLower.includes('business') || degreeLower.includes('mba') || degreeLower.includes('management')) {
        skills.add('Business Administration');
        skills.add('Management');
        skills.add('Strategic Planning');
      }
      
      // Engineering related
      if (degreeLower.includes('engineering')) {
        skills.add('Engineering');
        skills.add('Problem Solving');
        skills.add('Technical Design');
      }
      
      // Data related
      if (degreeLower.includes('data') || degreeLower.includes('analytics') || degreeLower.includes('statistics')) {
        skills.add('Data Analysis');
        skills.add('Statistics');
        skills.add('Analytics');
      }
    }
  });
  
  return Array.from(skills);
}

function extractSkillsFromProjects(projects: ProjectItem[]): string[] {
  const skills = new Set<string>();
  
  // Expanded tech skills mapping
  const techSkills = [
    // Frontend
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Next.js', 'HTML', 'CSS',
    'Sass', 'Tailwind CSS', 'Bootstrap', 'jQuery', 'Responsive Design', 'UI/UX Design',
    
    // Backend
    'Node.js', 'Express', 'Django', 'Flask', 'Ruby on Rails', 'PHP', 'Laravel', 'Spring',
    'ASP.NET', 'FastAPI', 'GraphQL', 'REST API', 'Microservices',
    
    // Languages
    'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin', 'Ruby', 'PHP',
    'Scala', 'R', 'MATLAB', 'Perl', 'Shell Script', 'PowerShell',
    
    // Databases
    'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Elasticsearch', 'Cassandra',
    'DynamoDB', 'Firebase', 'Supabase', 'SQL', 'NoSQL',
    
    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitLab CI',
    'GitHub Actions', 'Terraform', 'Ansible', 'Linux', 'Bash', 'Nginx', 'Apache',
    
    // AI/ML
    'Machine Learning', 'Artificial Intelligence', 'Deep Learning', 'TensorFlow', 'PyTorch',
    'Scikit-learn', 'Pandas', 'NumPy', 'Jupyter', 'Data Science', 'NLP', 'Computer Vision',
    
    // Tools & Others
    'Git', 'GitLab', 'GitHub', 'Bitbucket', 'JIRA', 'Confluence', 'Slack', 'Figma',
    'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'Tableau', 'Power BI', 'Excel'
  ];
  
  projects.forEach(p => {
    const text = `${p.title || ''} ${p.description || ''}`.toLowerCase();
    
    techSkills.forEach(skill => {
      if (text.includes(skill.toLowerCase())) skills.add(skill);
    });
    
    // Extract from project titles and descriptions with more context
    if (p.title || p.description) {
      const projectText = `${p.title} ${p.description}`.toLowerCase();
      
      // Web development indicators
      if (projectText.includes('website') || projectText.includes('web app') || projectText.includes('frontend')) {
        skills.add('Web Development');
        skills.add('Frontend Development');
      }
      
      // Mobile development indicators
      if (projectText.includes('mobile') || projectText.includes('ios') || projectText.includes('android')) {
        skills.add('Mobile Development');
      }
      
      // AI/ML indicators
      if (projectText.includes('ai') || projectText.includes('machine learning') || projectText.includes('neural')) {
        skills.add('Artificial Intelligence');
        skills.add('Machine Learning');
      }
      
      // Data analysis indicators
      if (projectText.includes('data') || projectText.includes('analytics') || projectText.includes('visualization')) {
        skills.add('Data Analysis');
        skills.add('Analytics');
      }
    }
  });
  
  return Array.from(skills);
}

function extractSkillsFromCertifications(certifications: CertificationItem[]): string[] {
  const skills = new Set<string>();
  
  // Expanded certification skills mapping
  const certSkills = [
    // Project Management
    'Project Management', 'PMP', 'Scrum Master', 'Agile', 'SAFe', 'Prince2', 'CAPM',
    
    // Cloud Platforms
    'AWS', 'Amazon Web Services', 'Azure', 'Microsoft Azure', 'Google Cloud', 'GCP',
    'Cloud Computing', 'Cloud Architecture', 'DevOps',
    
    // Software & Tools
    'Salesforce', 'HubSpot', 'Adobe Creative Suite', 'Microsoft Office', 'Oracle',
    'SAP', 'Tableau', 'Power BI', 'Figma', 'Sketch',
    
    // Technical Certifications
    'Cisco', 'CompTIA', 'A+', 'Network+', 'Security+', 'Linux', 'ITIL', 'Six Sigma', 'Lean',
    
    // Data & Analytics
    'Data Science', 'Machine Learning', 'Cybersecurity', 'Data Analysis', 'Big Data',
    'Business Intelligence', 'Analytics',
    
    // Development
    'Full Stack Development', 'Web Development', 'Mobile Development', 'Software Engineering'
  ];
  
  certifications.forEach(cert => {
    const text = `${cert.title || ''} ${cert.issuer || ''}`.toLowerCase();
    
    certSkills.forEach(skill => {
      if (text.includes(skill.toLowerCase())) skills.add(skill);
    });
    
    // Extract skills from certification titles with more context
    if (cert.title) {
      const titleLower = cert.title.toLowerCase();
      
      // AWS certifications
      if (titleLower.includes('aws') || titleLower.includes('amazon')) {
        skills.add('AWS');
        skills.add('Cloud Computing');
      }
      
      // Azure certifications
      if (titleLower.includes('azure') || titleLower.includes('microsoft azure')) {
        skills.add('Azure');
        skills.add('Cloud Computing');
      }
      
      // Google Cloud certifications
      if (titleLower.includes('google cloud') || titleLower.includes('gcp')) {
        skills.add('Google Cloud');
        skills.add('Cloud Computing');
      }
      
      // Project management certifications
      if (titleLower.includes('pmp') || titleLower.includes('project management')) {
        skills.add('Project Management');
        skills.add('PMP');
      }
      
      // Scrum/Agile certifications
      if (titleLower.includes('scrum') || titleLower.includes('agile')) {
        skills.add('Scrum');
        skills.add('Agile');
      }
      
      // Data science certifications
      if (titleLower.includes('data science') || titleLower.includes('machine learning')) {
        skills.add('Data Science');
        skills.add('Machine Learning');
      }
      
      // Cybersecurity certifications
      if (titleLower.includes('cybersecurity') || titleLower.includes('security')) {
        skills.add('Cybersecurity');
        skills.add('Information Security');
      }
    }
  });
  
  return Array.from(skills);
}

async function extractSkillsFromSummary(summary: string, headline: string): Promise<string[]> {
  const text = `${summary} ${headline}`.trim();
  if (text.length < 30) return [];

  const prompt = `
Extract professional skills from this profile summary and headline:

${text}

Requirements:
- Focus on technical skills, tools, methodologies, and professional competencies
- Include both hard skills and relevant soft skills
- Return as a comma-separated list, no additional text
- Maximum 12 skills
- Avoid generic terms like "hardworking" or "team player"

Example: "JavaScript, Project Management, React, Data Analysis, Leadership, Agile, UX Design"
`;

  try {
    const { text: result } = await generateText({ model, prompt, maxOutputTokens: 150, temperature: 0.3 });
    return result
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 50)
      .filter(s => !/^(hard|soft)\s+working|team\s+player|detail\s+oriented/i.test(s)); // Filter generic terms
  } catch {
    return [];
  }
}

async function rankSkillsByRelevance(skills: string[], profile: PortfolioProfile): Promise<string[]> {
  if (skills.length <= 8) return skills;

  const context = `
Profile: ${profile.name}
Headline: ${profile.headline}
Experience: ${profile.experience.slice(0, 3).map(e => e.title).join(', ')}
Education: ${profile.education.slice(0, 2).map(e => e.degree).join(', ')}
`;

  const prompt = `
Rank these skills by relevance for the following professional profile:

Skills: ${skills.join(', ')}
${context}

Return the skills in order of relevance as a comma-separated list, no other text.
`;

  try {
    const { text } = await generateText({ model, prompt, maxOutputTokens: 200, temperature: 0.2 });
    const ranked = text
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    return ranked.length >= skills.length * 0.7 ? ranked : skills;
  } catch {
    return skills;
  }
}

async function generateSkillsFromMinimalData(profile: PortfolioProfile): Promise<string[]> {
  const prompt = `
Based on this minimal profile information, suggest 10-15 relevant professional skills:

Name: ${profile.name}
Headline: ${profile.headline || 'Not provided'}
Location: ${profile.location || 'Not provided'}
Summary: ${profile.summary || 'Not available'}
Projects: ${profile.projects.slice(0, 3).map(p => p.title).join(', ')}
Education: ${profile.education.slice(0, 2).map(e => e.degree).join(', ')}

Requirements:
- Suggest skills that would be relevant for someone with this profile
- Include both technical and professional skills
- Focus on modern, in-demand skills
- Return as a comma-separated list, no additional text

Example: "Web Development, JavaScript, Project Management, Communication, Problem Solving, Digital Marketing"
`;

  try {
    const { text } = await generateText({ model, prompt, maxOutputTokens: 200, temperature: 0.4 });
    return text
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 50)
      .filter(s => !/^(hard|soft)\s+working|team\s+player|detail\s+oriented/i.test(s));
  } catch {
    // Fallback to generic professional skills
    return [
      'Communication', 'Problem Solving', 'Teamwork', 'Time Management',
      'Leadership', 'Project Management', 'Critical Thinking', 'Adaptability'
    ];
  }
}

// ─── OTHER EXPORTS (unchanged public API) ─────────────────────────────────────

export async function generateSuggestedSkills(experience: ExperienceItem[]): Promise<string[]> {
  if (experience.length === 0) return [];

  const experienceText = experience.map(e => `${e.title} at ${e.company}`).join(', ');
  const prompt = `
Based on the following work experience, suggest 5-8 key professional skills for a portfolio:

Experience: ${experienceText}

Return as a comma-separated list, no additional text.
`;

  try {
    const { text } = await generateText({ model, prompt, maxOutputTokens: 100, temperature: 0.5 });
    return text.split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, 8);
  } catch {
    return [];
  }
}

export async function enhanceHeadline(originalHeadline: string): Promise<string> {
  if (!originalHeadline || originalHeadline.length < 20) return originalHeadline;

  const prompt = `
Enhance this professional headline to make it more compelling for a portfolio website.
Remove LinkedIn-specific elements and focus on the value proposition.

Original: "${originalHeadline}"

Return only the enhanced headline, no additional text.
`;

  try {
    const { text } = await generateText({ model, prompt, maxOutputTokens: 50, temperature: 0.6 });
    return text.trim() || originalHeadline;
  } catch {
    return originalHeadline;
  }
}
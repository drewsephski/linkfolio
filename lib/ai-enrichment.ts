import { generateText } from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { PortfolioProfile, ExperienceItem, EducationItem } from '@/lib/data-normalization';

// Initialize OpenRouter model
const model = openrouter('openrouter/free');

/**
 * Enriches profile data with AI-generated content
 */
export async function enrichProfileData(profile: PortfolioProfile): Promise<PortfolioProfile> {
  try {
    // Enrich the professional summary
    const enrichedSummary = await enrichSummary(profile.summary, profile.headline, profile.experience);
    
    // Enrich experience descriptions
    const enrichedExperience = await Promise.all(
      profile.experience.map(exp => enrichExperience(exp))
    );
    
    // Enrich education if needed
    const enrichedEducation = await Promise.all(
      profile.education.map(edu => enrichEducation(edu))
    );

    return {
      ...profile,
      summary: enrichedSummary,
      experience: enrichedExperience,
      education: enrichedEducation
    };
  } catch (error) {
    console.error('AI enrichment failed:', error);
    // Return original data if AI enrichment fails
    return profile;
  }
}

/**
 * Enriches the professional summary using AI
 */
async function enrichSummary(originalSummary: string, headline: string, experience: ExperienceItem[]): Promise<string> {
  if (!originalSummary && experience.length === 0) {
    return generateDefaultSummary(headline);
  }

  const prompt = `
You are a professional resume writer. Transform the following LinkedIn summary into a compelling, concise professional summary for a portfolio website.

Original Summary: "${originalSummary}"
Headline: "${headline}"
Recent Experience: ${experience.slice(0, 3).map(exp => `${exp.title} at ${exp.company}`).join(', ')}

Requirements:
- Write in first person ("I am..." not "John is...")
- Keep it under 150 words
- Focus on key achievements and skills
- Make it engaging and professional
- Remove LinkedIn-specific language
- Highlight what makes this person unique

Return only the enriched summary, no additional text.
`;

  try {
    const { text } = await generateText({
      model,
      prompt,
      maxOutputTokens: 200,
      temperature: 0.7,
    });

    return text.trim();
  } catch (error) {
    console.error('Summary enrichment failed:', error);
    return originalSummary || generateDefaultSummary(headline);
  }
}

/**
 * Enriches experience descriptions using AI
 */
async function enrichExperience(experience: ExperienceItem): Promise<ExperienceItem> {
  if (!experience.description || experience.description.length < 50) {
    return experience;
  }

  const prompt = `
Transform this job description into 2-3 compelling bullet points for a portfolio. Focus on achievements and impact.

Original Description: "${experience.description}"
Role: ${experience.title} at ${experience.company}

Requirements:
- Start each bullet point with a strong action verb
- Quantify achievements when possible (numbers, percentages, etc.)
- Keep each bullet point under 100 characters
- Focus on results, not just responsibilities
- Use professional, engaging language

Return only the bullet points, one per line, no additional text.
`;

  try {
    const { text } = await generateText({
      model,
      prompt,
      maxOutputTokens: 150,
      temperature: 0.6,
    });

    const bulletPoints = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.startsWith('•') ? line : `• ${line}`)
      .join('\n');

    return {
      ...experience,
      description: bulletPoints
    };
  } catch (error) {
    console.error('Experience enrichment failed:', error);
    return experience;
  }
}

/**
 * Enriches education information if needed
 */
async function enrichEducation(education: EducationItem): Promise<EducationItem> {
  // Education data is usually straightforward, but we can enhance degree descriptions
  if (!education.degree || education.degree.length < 10) {
    return education;
  }

  // For now, return education as-is since it's typically well-formatted
  return education;
}

/**
 * Generates a default summary when no original summary is available
 */
function generateDefaultSummary(headline: string): string {
  if (!headline) {
    return "A passionate professional dedicated to excellence and innovation in their field.";
  }

  return `A ${headline.toLowerCase()} with a passion for excellence and innovation. Experienced in delivering results and driving success through dedication and expertise.`;
}

/**
 * Generates suggested skills based on experience
 */
export async function generateSuggestedSkills(experience: ExperienceItem[]): Promise<string[]> {
  if (experience.length === 0) return [];

  const experienceText = experience.map(exp => `${exp.title} at ${exp.company}`).join(', ');
  
  const prompt = `
Based on the following work experience, suggest 5-8 key professional skills that would be relevant for a portfolio:

Experience: ${experienceText}

Requirements:
- Return only technical and professional skills
- Focus on in-demand skills
- Separate each skill with a comma
- No additional text, just the skills

Example: "Project Management, JavaScript, Leadership, Data Analysis, Communication"
`;

  try {
    const { text } = await generateText({
      model,
      prompt,
      maxOutputTokens: 100,
      temperature: 0.5,
    });

    return text
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .slice(0, 8);
  } catch (error) {
    console.error('Skill generation failed:', error);
    return [];
  }
}

/**
 * Enhances the headline for better portfolio presentation
 */
export async function enhanceHeadline(originalHeadline: string): Promise<string> {
  if (!originalHeadline || originalHeadline.length < 20) {
    return originalHeadline;
  }

  const prompt = `
Enhance this professional headline to make it more compelling for a portfolio website:

Original Headline: "${originalHeadline}"

Requirements:
- Keep it under 60 characters
- Make it impactful and professional
- Remove LinkedIn-specific elements
- Focus on value proposition
- Return only the enhanced headline

Example:
Input: "Senior Software Engineer at Tech Company | Full Stack Developer | Team Lead"
Output: "Senior Software Engineer & Team Lead"
`;

  try {
    const { text } = await generateText({
      model,
      prompt,
      maxOutputTokens: 50,
      temperature: 0.6,
    });

    return text.trim();
  } catch (error) {
    console.error('Headline enhancement failed:', error);
    return originalHeadline;
  }
}

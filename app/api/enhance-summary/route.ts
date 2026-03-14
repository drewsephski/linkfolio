import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';

// Initialize OpenRouter model
const model = openrouter('openrouter/free');

export async function POST(request: NextRequest) {
  try {
    const { summary, headline, experience, education, projects, skills } = await request.json();

    if (!summary && !headline) {
      return NextResponse.json(
        { error: 'Summary or headline is required' },
        { status: 400 }
      );
    }

    // Build comprehensive context from all profile data
    const experienceText = experience?.slice(0, 3).map((exp: { title: string; company: string; description?: string }) => 
      `${exp.title} at ${exp.company}: ${exp.description || ''}`
    ).join('\n') || '';
    
    const educationText = education?.slice(0, 2).map((edu: { degree: string; school: string }) => 
      `${edu.degree} from ${edu.school}`
    ).join('\n') || '';
    
    const projectsText = projects?.slice(0, 2).map((project: { title: string; description: string }) => 
      `${project.title}: ${project.description}`
    ).join('\n') || '';
    
    const skillsText = skills?.slice(0, 10).join(', ') || '';

    const prompt = `
Transform this professional information into a compelling, first-person portfolio summary using ONLY the actual data provided below.

Current Summary: "${summary || ''}"
Headline: "${headline || ''}"
Recent Experience:
${experienceText}

Education:
${educationText}

Key Projects:
${projectsText}

Skills: ${skillsText}

CRITICAL REQUIREMENTS:
- Use ONLY the actual data provided above - NEVER make up information
- Do NOT use placeholders like [mention field], [University Name], etc.
- If specific details are missing, be general but truthful
- Write in first person ("I am..." not "John is...")
- Keep it to 150-250 words
- Focus on what can be verified from the provided data
- Make it engaging but stay factual
- Remove LinkedIn-specific language and formatting
- If education details are vague, say "my education" rather than inventing specifics
- If project details are limited, focus on what is known

WRONG EXAMPLE (do not use placeholders):
"As a highly motivated professional with a strong foundation in [mention core field]..."

RIGHT EXAMPLE (use only real data):
"As a Software Engineer at Northrop Grumman, I specialize in systems engineering and Python programming..."

Return only the enhanced summary, no additional text or explanations.
`;

    const { text } = await generateText({
      model,
      prompt,
      maxOutputTokens: 500,
      temperature: 0.7,
    });

    const enhancedSummary = text.trim();

    return NextResponse.json({
      enhancedSummary,
      originalLength: summary?.length || 0,
      enhancedLength: enhancedSummary.length
    });

  } catch (error) {
    console.error('Summary enhancement failed:', error);
    return NextResponse.json(
      { error: 'Failed to enhance summary' },
      { status: 500 }
    );
  }
}

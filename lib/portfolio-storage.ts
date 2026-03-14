import { PortfolioProfile, ExperienceItem, EducationItem } from '@/lib/data-normalization';
import { insforge } from '@/lib/insforge-client';

/**
 * Generates a unique portfolio ID using crypto.randomUUID() for better collision resistance
 */
export function generatePortfolioId(): string {
  return crypto.randomUUID();
}

/**
 * Saves portfolio data to InsForge database using batch operations
 */
export async function savePortfolio(portfolioId: string, profile: PortfolioProfile, userId?: string): Promise<void> {
  console.log('Saving portfolio:', portfolioId, 'for user:', profile.name);
  
  try {
    // Step 1: Insert main portfolio record
    const { data: portfolioData, error: portfolioError } = await insforge
      .database
      .from('portfolios')
      .insert([{
        portfolio_id: portfolioId,
        name: profile.name,
        headline: profile.headline || null,
        location: profile.location || null,
        summary: profile.summary || null,
        avatar: profile.avatar || null,
        linkedin_url: profile.linkedinUrl,
        banner_image: profile.bannerImage || null,
        followers: profile.followers || null,
        connections: profile.connections || null,
        current_company: profile.currentCompany || null,
        experience_unavailable: profile.experienceUnavailable ?? false,
        user_id: userId || null
      }])
      .select()
      .single();

    if (portfolioError) {
      console.error('Error saving portfolio:', portfolioError);
      throw portfolioError;
    }

    const portfolioDbId = portfolioData.id;
    console.log('Portfolio record created with ID:', portfolioDbId);

    // Step 2: Batch insert all related data in parallel for better performance
    const batchOperations = [];

    // Experience batch insert
    if (profile.experience.length > 0) {
      const experienceData = profile.experience.map(exp => ({
        portfolio_id: portfolioDbId,
        experience_id: exp.id,
        title: exp.title,
        company: exp.company,
        duration: exp.duration || null,
        description: exp.description || null,
        start_date: exp.startDate || null,
        end_date: exp.endDate || null,
        current: exp.current || false
      }));
      
      batchOperations.push(
        insforge.database.from('portfolio_experience').insert(experienceData)
      );
    }

    // Education batch insert
    if (profile.education.length > 0) {
      const educationData = profile.education.map(edu => ({
        portfolio_id: portfolioDbId,
        education_id: edu.id,
        school: edu.school,
        degree: edu.degree,
        duration: edu.duration || null,
        start_date: edu.startDate || null,
        end_date: edu.endDate || null,
        current: edu.current || false
      }));
      
      batchOperations.push(
        insforge.database.from('portfolio_education').insert(educationData)
      );
    }

    // Skills batch insert
    if (profile.skills.length > 0) {
      const skillsData = profile.skills.map(skill => ({
        portfolio_id: portfolioDbId,
        skill: skill
      }));
      
      batchOperations.push(
        insforge.database.from('portfolio_skills').insert(skillsData)
      );
    }

    // Projects batch insert
    if (profile.projects && profile.projects.length > 0) {
      const projectsData = profile.projects.map(project => ({
        portfolio_id: portfolioDbId,
        project_id: project.id,
        title: project.title,
        description: project.description || null,
        start_date: project.startDate || null,
        url: project.url || null
      }));
      
      batchOperations.push(
        insforge.database.from('portfolio_projects').insert(projectsData)
      );
    }

    // Certifications batch insert
    if (profile.certifications.length > 0) {
      const certificationsData = profile.certifications.map(cert => ({
        portfolio_id: portfolioDbId,
        certification_id: cert.id,
        title: cert.title,
        issuer: cert.issuer,
        issue_date: cert.issueDate || null,
        credential_url: cert.credentialUrl || null,
        credential_id: cert.credentialId || null
      }));
      
      batchOperations.push(
        insforge.database.from('portfolio_certifications').insert(certificationsData)
      );
    }

    // Execute all batch operations in parallel
    if (batchOperations.length > 0) {
      const results = await Promise.allSettled(batchOperations);
      
      // Check for any failures in batch operations
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Batch operation ${index} failed:`, result.reason);
          // In production, you might want to implement cleanup logic here
          throw new Error(`Failed to save portfolio data: ${result.reason}`);
        }
      });
    }

    console.log('Portfolio saved successfully to database with all related data');
  } catch (error) {
    console.error('Failed to save portfolio:', error);
    // Consider implementing cleanup logic here if needed
    throw error;
  }
}

/**
 * Retrieves portfolio data from InsForge database with optimized queries
 */
export async function getPortfolio(portfolioId: string): Promise<PortfolioProfile | null> {
  console.log('Retrieving portfolio:', portfolioId);
  
  try {
    // Get the main portfolio record
    const { data: portfolio, error: portfolioError } = await insforge
      .database
      .from('portfolios')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .single();

    if (portfolioError || !portfolio) {
      console.log('Portfolio not found:', portfolioId);
      return null;
    }

    // Get all related data in parallel using optimized queries
    const portfolioDbId = portfolio.id;
    
    const [
      experienceResult,
      educationResult,
      skillsResult,
      projectsResult,
      certificationsResult
    ] = await Promise.allSettled([
      // Experience with ordering
      insforge.database
        .from('portfolio_experience')
        .select('*')
        .eq('portfolio_id', portfolioDbId)
        .order('start_date', { ascending: false }),
      
      // Education with ordering
      insforge.database
        .from('portfolio_education')
        .select('*')
        .eq('portfolio_id', portfolioDbId)
        .order('start_date', { ascending: false }),
      
      // Skills with ordering
      insforge.database
        .from('portfolio_skills')
        .select('skill')
        .eq('portfolio_id', portfolioDbId)
        .order('skill', { ascending: true }),
      
      // Projects with ordering
      insforge.database
        .from('portfolio_projects')
        .select('*')
        .eq('portfolio_id', portfolioDbId)
        .order('start_date', { ascending: false }),
      
      // Certifications with ordering
      insforge.database
        .from('portfolio_certifications')
        .select('*')
        .eq('portfolio_id', portfolioDbId)
        .order('issue_date', { ascending: false })
    ]);

    // Handle results safely
    const experience = experienceResult.status === 'fulfilled' ? experienceResult.value.data || [] : [];
    const education = educationResult.status === 'fulfilled' ? educationResult.value.data || [] : [];
    const skills = skillsResult.status === 'fulfilled' ? (skillsResult.value.data || []).map(s => s.skill) : [];
    const projects = projectsResult.status === 'fulfilled' ? projectsResult.value.data || [] : [];
    const certifications = certificationsResult.status === 'fulfilled' ? certificationsResult.value.data || [] : [];

    // Log any errors for debugging
    if (experienceResult.status === 'rejected') {
      console.error('Failed to fetch experience:', experienceResult.reason);
    }
    if (educationResult.status === 'rejected') {
      console.error('Failed to fetch education:', educationResult.reason);
    }
    if (skillsResult.status === 'rejected') {
      console.error('Failed to fetch skills:', skillsResult.reason);
    }
    if (projectsResult.status === 'rejected') {
      console.error('Failed to fetch projects:', projectsResult.reason);
    }
    if (certificationsResult.status === 'rejected') {
      console.error('Failed to fetch certifications:', certificationsResult.reason);
    }

    // Convert back to PortfolioProfile format
    const portfolioProfile: PortfolioProfile = {
      id: portfolio.portfolio_id,
      name: portfolio.name,
      headline: portfolio.headline || '',
      location: portfolio.location || '',
      summary: portfolio.summary || '',
      avatar: portfolio.avatar || undefined,
      experience: experience?.map(exp => ({
        id: exp.experience_id,
        title: exp.title,
        company: exp.company,
        duration: exp.duration || '',
        description: exp.description || undefined,
        startDate: exp.start_date || undefined,
        endDate: exp.end_date || undefined,
        current: exp.current
      })) || [],
      education: education?.map(edu => ({
        id: edu.education_id,
        school: edu.school,
        degree: edu.degree,
        duration: edu.duration || '',
        startDate: edu.start_date || undefined,
        endDate: edu.end_date || undefined,
        current: edu.current
      })) || [],
      skills: skills,
      projects: projects?.map(project => ({
        id: project.project_id,
        title: project.title,
        description: project.description || '',
        startDate: project.start_date || undefined,
        url: project.url || undefined
      })) || [],
      certifications: certifications?.map(cert => ({
        id: cert.certification_id,
        title: cert.title,
        issuer: cert.issuer,
        issueDate: cert.issue_date || undefined,
        credentialUrl: cert.credential_url || undefined,
        credentialId: cert.credential_id || undefined
      })) || [],
      activity: [], // TEMPORARILY DISABLED until table is created
      linkedinUrl: portfolio.linkedin_url,
      generatedAt: portfolio.generated_at,
      bannerImage: portfolio.banner_image || undefined,
      followers: portfolio.followers ? Number(portfolio.followers) : undefined,
      connections: portfolio.connections ? Number(portfolio.connections) : undefined,
      currentCompany: portfolio.current_company || undefined,
      experienceUnavailable: portfolio.experience_unavailable ?? false
    };

    console.log('Portfolio retrieved successfully from database');
    return portfolioProfile;
  } catch (error) {
    console.error('Failed to retrieve portfolio:', error);
    return null;
  }
}

/**
 * Deletes portfolio data from InsForge database
 */
export async function deletePortfolio(portfolioId: string): Promise<boolean> {
  console.log('Deleting portfolio:', portfolioId);
  
  try {
    const { error } = await insforge
      .database
      .from('portfolios')
      .delete()
      .eq('portfolio_id', portfolioId);

    if (error) {
      console.error('Error deleting portfolio:', error);
      return false;
    }

    console.log('Portfolio deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete portfolio:', error);
    return false;
  }
}

/**
 * Lists all portfolio IDs (for admin purposes)
 */
export async function listPortfolioIds(): Promise<string[]> {
  try {
    const { data, error } = await insforge
      .database
      .from('portfolios')
      .select('portfolio_id')
      .order('generated_at', { ascending: false });

    if (error) {
      console.error('Error listing portfolio IDs:', error);
      return [];
    }

    return data?.map(p => p.portfolio_id) || [];
  } catch (error) {
    console.error('Failed to list portfolio IDs:', error);
    return [];
  }
}

/**
 * Gets portfolios for a specific user
 */
export async function getUserPortfolios(userId: string): Promise<string[]> {
  try {
    const { data, error } = await insforge
      .database
      .from('portfolios')
      .select('portfolio_id')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false });

    if (error) {
      console.error('Error listing user portfolios:', error);
      return [];
    }

    return data?.map(p => p.portfolio_id) || [];
  } catch (error) {
    console.error('Failed to list user portfolios:', error);
    return [];
  }
}

/**
 * Updates an existing portfolio using InsForge batch operations
 */
export async function updatePortfolio(portfolioId: string, updates: Partial<PortfolioProfile> & { deleted?: boolean }): Promise<PortfolioProfile | null> {
  try {
    // Get the portfolio database ID first
    const { data: portfolio, error: portfolioError } = await insforge
      .database
      .from('portfolios')
      .select('id')
      .eq('portfolio_id', portfolioId)
      .single();

    if (portfolioError || !portfolio) {
      console.error('Portfolio not found:', portfolioError);
      return null;
    }

    // Prepare batch operations
    const batchOperations = [];
    const updateData: Record<string, unknown> = {};
    
    // Main portfolio fields to update
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.headline !== undefined) updateData.headline = updates.headline;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.summary !== undefined) updateData.summary = updates.summary;
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
    if (updates.bannerImage !== undefined) updateData.banner_image = updates.bannerImage;
    if (updates.followers !== undefined) updateData.followers = updates.followers;
    if (updates.connections !== undefined) updateData.connections = updates.connections;
    if (updates.currentCompany !== undefined) updateData.current_company = updates.currentCompany;
    if (updates.deleted !== undefined) updateData.deleted = updates.deleted;

    // Update main portfolio if there are fields to update
    if (Object.keys(updateData).length > 0) {
      batchOperations.push(
        insforge.database
          .from('portfolios')
          .update(updateData)
          .eq('portfolio_id', portfolioId)
          .select()
      );
    }

    // Handle skills update with delete+insert pattern
    if (updates.skills !== undefined) {
      // Delete existing skills
      batchOperations.push(
        insforge.database
          .from('portfolio_skills')
          .delete()
          .eq('portfolio_id', portfolio.id)
      );

      // Insert new skills if any
      if (updates.skills.length > 0) {
        const skillsData = updates.skills.map(skill => ({
          portfolio_id: portfolio.id,
          skill: skill
        }));
        
        batchOperations.push(
          insforge.database
            .from('portfolio_skills')
            .insert(skillsData)
        );
      }
    }

    // Execute all operations in parallel
    if (batchOperations.length > 0) {
      const results = await Promise.allSettled(batchOperations);
      
      // Check for any failures
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Batch operation ${index} failed during update:`, result.reason);
          throw new Error(`Failed to update portfolio: ${result.reason}`);
        }
      });
    }

    // Return the updated portfolio
    return await getPortfolio(portfolioId);
  } catch (error) {
    console.error('Failed to update portfolio:', error);
    return null;
  }
}

/**
 * Gets portfolio metadata from InsForge database
 */
export async function getPortfolioMetadata(portfolioId: string): Promise<{
  id: string;
  name: string;
  headline: string;
  generatedAt: string;
} | null> {
  try {
    const { data, error } = await insforge
      .database
      .from('portfolios')
      .select('portfolio_id, name, headline, generated_at')
      .eq('portfolio_id', portfolioId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.portfolio_id,
      name: data.name,
      headline: data.headline || '',
      generatedAt: data.generated_at
    };
  } catch (error) {
    console.error('Failed to get portfolio metadata:', error);
    return null;
  }
}

/**
 * Adds a new experience entry to a portfolio
 */
export async function addExperienceEntry(portfolioId: string, experience: Omit<ExperienceItem, 'id'>): Promise<ExperienceItem | null> {
  try {
    // Get the portfolio database ID
    const { data: portfolio, error: portfolioError } = await insforge
      .database
      .from('portfolios')
      .select('id')
      .eq('portfolio_id', portfolioId)
      .single();

    if (portfolioError || !portfolio) {
      console.error('Portfolio not found:', portfolioError);
      return null;
    }

    // Generate a new ID for the experience
    const experienceId = Math.random().toString(36).substr(2, 9);

    // Insert the new experience
    const { data: newExperience, error: experienceError } = await insforge
      .database
      .from('portfolio_experience')
      .insert([{
        portfolio_id: portfolio.id,
        experience_id: experienceId,
        title: experience.title,
        company: experience.company,
        duration: experience.duration || null,
        description: experience.description || null,
        start_date: experience.startDate || null,
        end_date: experience.endDate || null,
        current: experience.current || false
      }])
      .select()
      .single();

    if (experienceError || !newExperience) {
      console.error('Failed to add experience:', experienceError);
      return null;
    }

    return {
      id: newExperience.experience_id,
      title: newExperience.title,
      company: newExperience.company,
      duration: newExperience.duration || '',
      description: newExperience.description || undefined,
      startDate: newExperience.start_date || undefined,
      endDate: newExperience.end_date || undefined,
      current: newExperience.current
    };
  } catch (error) {
    console.error('Failed to add experience entry:', error);
    return null;
  }
}

/**
 * Deletes an experience entry from a portfolio
 */
export async function deleteExperienceEntry(portfolioId: string, experienceId: string): Promise<boolean> {
  try {
    // Get the portfolio database ID
    const { data: portfolio, error: portfolioError } = await insforge
      .database
      .from('portfolios')
      .select('id')
      .eq('portfolio_id', portfolioId)
      .single();

    if (portfolioError || !portfolio) {
      console.error('Portfolio not found:', portfolioError);
      return false;
    }

    // Delete the experience
    const { error } = await insforge
      .database
      .from('portfolio_experience')
      .delete()
      .eq('portfolio_id', portfolio.id)
      .eq('experience_id', experienceId);

    if (error) {
      console.error('Failed to delete experience:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete experience entry:', error);
    return false;
  }
}

/**
 * Adds a new education entry to a portfolio
 */
export async function addEducationEntry(portfolioId: string, education: Omit<EducationItem, 'id'>): Promise<EducationItem | null> {
  try {
    // Get the portfolio database ID
    const { data: portfolio, error: portfolioError } = await insforge
      .database
      .from('portfolios')
      .select('id')
      .eq('portfolio_id', portfolioId)
      .single();

    if (portfolioError || !portfolio) {
      console.error('Portfolio not found:', portfolioError);
      return null;
    }

    // Generate a new ID for the education
    const educationId = Math.random().toString(36).substr(2, 9);

    // Insert the new education
    const { data: newEducation, error: educationError } = await insforge
      .database
      .from('portfolio_education')
      .insert([{
        portfolio_id: portfolio.id,
        education_id: educationId,
        school: education.school,
        degree: education.degree,
        duration: education.duration || null,
        start_date: education.startDate || null,
        end_date: education.endDate || null,
        current: education.current || false
      }])
      .select()
      .single();

    if (educationError || !newEducation) {
      console.error('Failed to add education:', educationError);
      return null;
    }

    return {
      id: newEducation.education_id,
      school: newEducation.school,
      degree: newEducation.degree,
      duration: newEducation.duration || '',
      startDate: newEducation.start_date || undefined,
      endDate: newEducation.end_date || undefined,
      current: newEducation.current
    };
  } catch (error) {
    console.error('Failed to add education entry:', error);
    return null;
  }
}

/**
 * Deletes an education entry from a portfolio
 */
export async function deleteEducationEntry(portfolioId: string, educationId: string): Promise<boolean> {
  try {
    // Get the portfolio database ID
    const { data: portfolio, error: portfolioError } = await insforge
      .database
      .from('portfolios')
      .select('id')
      .eq('portfolio_id', portfolioId)
      .single();

    if (portfolioError || !portfolio) {
      console.error('Portfolio not found:', portfolioError);
      return false;
    }

    // Delete the education
    const { error } = await insforge
      .database
      .from('portfolio_education')
      .delete()
      .eq('portfolio_id', portfolio.id)
      .eq('education_id', educationId);

    if (error) {
      console.error('Failed to delete education:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete education entry:', error);
    return false;
  }
}

// Database table types based on InsForge schema

export interface Portfolio {
  id: string
  portfolio_id: string
  name: string
  headline: string | null
  location: string | null
  summary: string | null
  avatar: string | null
  linkedin_url: string
  banner_image: string | null
  followers: number | null
  connections: number | null
  current_company: string | null
  generated_at: string
  updated_at: string
  user_id: string | null
}

export interface PortfolioExperience {
  id: string
  portfolio_id: string
  experience_id: string
  title: string
  company: string
  duration: string | null
  description: string | null
  start_date: string | null
  end_date: string | null
  current: boolean
  created_at: string
}

export interface PortfolioEducation {
  id: string
  portfolio_id: string
  education_id: string
  school: string
  degree: string
  duration: string | null
  start_date: string | null
  end_date: string | null
  current: boolean
  created_at: string
}

export interface PortfolioSkills {
  id: string
  portfolio_id: string
  skill: string
  created_at: string
}

export interface PortfolioProjects {
  id: string
  portfolio_id: string
  project_id: string
  title: string
  description: string | null
  start_date: string | null
  url: string | null
  created_at: string
}

export interface PortfolioCertifications {
  id: string
  portfolio_id: string
  certification_id: string
  title: string
  issuer: string
  issue_date: string | null
  credential_url: string | null
  credential_id: string | null
  created_at: string
}

export interface PortfolioActivity {
  id: string
  portfolio_id: string
  activity_id: string
  title: string
  link: string | null
  img: string | null
  interaction: string | null
  created_at: string
}

// Complete portfolio with all related data
export interface CompletePortfolio extends Portfolio {
  experience: PortfolioExperience[]
  education: PortfolioEducation[]
  skills: PortfolioSkills[]
  projects: PortfolioProjects[]
  certifications: PortfolioCertifications[]
  activity: PortfolioActivity[]
}

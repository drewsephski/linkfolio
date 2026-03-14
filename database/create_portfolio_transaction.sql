-- Database transaction for creating a complete portfolio
-- This ensures all related data is saved atomically
CREATE OR REPLACE FUNCTION create_portfolio_transaction(
  p_portfolio_id TEXT,
  p_name TEXT,
  p_headline TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_summary TEXT DEFAULT NULL,
  p_avatar TEXT DEFAULT NULL,
  p_linkedin_url TEXT,
  p_banner_image TEXT DEFAULT NULL,
  p_followers INTEGER DEFAULT NULL,
  p_connections INTEGER DEFAULT NULL,
  p_current_company TEXT DEFAULT NULL,
  p_experience_unavailable BOOLEAN DEFAULT FALSE,
  p_user_id TEXT DEFAULT NULL,
  p_experience JSON DEFAULT '[]',
  p_education JSON DEFAULT '[]',
  p_skills JSON DEFAULT '[]',
  p_projects JSON DEFAULT '[]',
  p_certifications JSON DEFAULT '[]'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  portfolio_record_id INTEGER;
BEGIN
  -- Start transaction by inserting main portfolio
  INSERT INTO portfolios (
    portfolio_id, name, headline, location, summary, avatar, linkedin_url,
    banner_image, followers, connections, current_company, experience_unavailable, user_id
  ) VALUES (
    p_portfolio_id, p_name, p_headline, p_location, p_summary, p_avatar, p_linkedin_url,
    p_banner_image, p_followers, p_connections, p_current_company, p_experience_unavailable, p_user_id
  )
  RETURNING id INTO portfolio_record_id;
  
  -- Insert experience entries
  IF json_array_length(p_experience) > 0 THEN
    INSERT INTO portfolio_experience (portfolio_id, experience_id, title, company, duration, description, start_date, end_date, current)
    SELECT 
      portfolio_record_id,
      exp->>'id',
      exp->>'title',
      exp->>'company', 
      exp->>'duration',
      exp->>'description',
      exp->>'startDate',
      exp->>'endDate',
      (exp->>'current')::boolean
    FROM json_array_elements(p_experience) exp;
  END IF;
  
  -- Insert education entries
  IF json_array_length(p_education) > 0 THEN
    INSERT INTO portfolio_education (portfolio_id, education_id, school, degree, duration, start_date, end_date, current)
    SELECT 
      portfolio_record_id,
      edu->>'id',
      edu->>'school',
      edu->>'degree',
      edu->>'duration', 
      edu->>'startDate',
      edu->>'endDate',
      (edu->>'current')::boolean
    FROM json_array_elements(p_education) edu;
  END IF;
  
  -- Insert skills
  IF json_array_length(p_skills) > 0 THEN
    INSERT INTO portfolio_skills (portfolio_id, skill)
    SELECT portfolio_record_id, skill.value
    FROM json_array_elements(p_skills) skill;
  END IF;
  
  -- Insert projects
  IF json_array_length(p_projects) > 0 THEN
    INSERT INTO portfolio_projects (portfolio_id, project_id, title, description, start_date, url)
    SELECT 
      portfolio_record_id,
      proj->>'id',
      proj->>'title',
      proj->>'description',
      proj->>'startDate',
      proj->>'url'
    FROM json_array_elements(p_projects) proj;
  END IF;
  
  -- Insert certifications
  IF json_array_length(p_certifications) > 0 THEN
    INSERT INTO portfolio_certifications (portfolio_id, certification_id, title, issuer, issue_date, credential_url, credential_id)
    SELECT 
      portfolio_record_id,
      cert->>'id',
      cert->>'title',
      cert->>'issuer',
      cert->>'issueDate',
      cert->>'credentialUrl',
      cert->>'credentialId'
    FROM json_array_elements(p_certifications) cert;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Transaction will automatically rollback on error
    RAISE;
END;
$$;

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { getPortfolio, updatePortfolio, addExperienceEntry, deleteExperienceEntry, addEducationEntry, deleteEducationEntry } from '@/lib/portfolio-storage';
import { PortfolioProfile } from '@/lib/data-normalization';

export default function EditPortfolioPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [enhancingSummary, setEnhancingSummary] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [newExperience, setNewExperience] = useState({ title: '', company: '', duration: '', description: '', startDate: '', endDate: '', current: false });
  const [newEducation, setNewEducation] = useState({ school: '', degree: '', duration: '', startDate: '', endDate: '', current: false });
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const portfolioId = params.id as string;

  useEffect(() => {
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    if (!portfolioId) {
      setError('Portfolio ID is required');
      setLoading(false);
      return;
    }

    const loadPortfolio = async () => {
      try {
        const data = await getPortfolio(portfolioId);
        if (!data) {
          setError('Portfolio not found');
        } else {
          setPortfolio(data);
        }
      } catch {
        setError('Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [user, portfolioId, router]);

  const handleSave = async (updates: Partial<PortfolioProfile>) => {
    if (!portfolio) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const updatedPortfolio = await updatePortfolio(portfolioId, updates);
      if (updatedPortfolio) {
        setPortfolio(updatedPortfolio);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Failed to update portfolio');
      }
    } catch {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof PortfolioProfile, value: string) => {
    if (!portfolio) return;
    
    const updatedPortfolio = { ...portfolio, [field]: value };
    setPortfolio(updatedPortfolio);
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    if (!portfolio) return;
    
    const updatedExperience = [...portfolio.experience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    
    setPortfolio({ ...portfolio, experience: updatedExperience });
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    if (!portfolio) return;
    
    const updatedEducation = [...portfolio.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    
    setPortfolio({ ...portfolio, education: updatedEducation });
  };

  const handleSkillChange = (index: number, value: string) => {
    if (!portfolio) return;
    
    const updatedSkills = [...portfolio.skills];
    updatedSkills[index] = value;
    
    setPortfolio({ ...portfolio, skills: updatedSkills });
  };

  const handleEnhanceSummary = async () => {
    if (!portfolio) return;

    setEnhancingSummary(true);
    setError('');

    try {
      const response = await fetch('/api/enhance-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: portfolio.summary,
          headline: portfolio.headline,
          experience: portfolio.experience
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enhance summary');
      }

      // Only save to database, let the save function update the state
      const updatedPortfolio = await updatePortfolio(portfolioId, { summary: data.enhancedSummary });
      if (updatedPortfolio) {
        setPortfolio(updatedPortfolio);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Failed to save enhanced summary');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enhance summary');
    } finally {
      setEnhancingSummary(false);
    }
  };

  const handleAddExperience = async () => {
    if (!portfolio || !newExperience.title || !newExperience.company) return;

    try {
      const addedExperience = await addExperienceEntry(portfolioId, newExperience);
      if (addedExperience) {
        const updatedPortfolio = { 
          ...portfolio, 
          experience: [...portfolio.experience, addedExperience] 
        };
        setPortfolio(updatedPortfolio);
        
        // Reset form
        setNewExperience({ title: '', company: '', duration: '', description: '', startDate: '', endDate: '', current: false });
        setShowAddExperience(false);
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Failed to add experience');
      }
    } catch (err) {
      setError('Failed to add experience');
    }
  };

  const handleDeleteExperience = async (experienceId: string) => {
    if (!portfolio) return;

    try {
      const success = await deleteExperienceEntry(portfolioId, experienceId);
      if (success) {
        const updatedPortfolio = { 
          ...portfolio, 
          experience: portfolio.experience.filter(exp => exp.id !== experienceId) 
        };
        setPortfolio(updatedPortfolio);
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Failed to delete experience');
      }
    } catch (err) {
      setError('Failed to delete experience');
    }
  };

  const handleAddEducation = async () => {
    if (!portfolio || !newEducation.school || !newEducation.degree) return;

    try {
      const addedEducation = await addEducationEntry(portfolioId, newEducation);
      if (addedEducation) {
        const updatedPortfolio = { 
          ...portfolio, 
          education: [...portfolio.education, addedEducation] 
        };
        setPortfolio(updatedPortfolio);
        
        // Reset form
        setNewEducation({ school: '', degree: '', duration: '', startDate: '', endDate: '', current: false });
        setShowAddEducation(false);
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Failed to add education');
      }
    } catch (err) {
      setError('Failed to add education');
    }
  };

  const handleDeleteEducation = async (educationId: string) => {
    if (!portfolio) return;

    try {
      const success = await deleteEducationEntry(portfolioId, educationId);
      if (success) {
        const updatedPortfolio = { 
          ...portfolio, 
          education: portfolio.education.filter(edu => edu.id !== educationId) 
        };
        setPortfolio(updatedPortfolio);
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Failed to delete education');
      }
    } catch (err) {
      setError('Failed to delete education');
    }
  };

  const handleAddSkill = async () => {
    if (!portfolio || !newSkill.trim()) return;

    try {
      const updatedPortfolio = { 
        ...portfolio, 
        skills: [...portfolio.skills, newSkill.trim()] 
      };
      setPortfolio(updatedPortfolio);
      
      // Auto-save the updated skills
      await handleSave({ skills: updatedPortfolio.skills });
      
      // Reset form
      setNewSkill('');
      setShowAddSkill(false);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to add skill');
    }
  };

  const handleDeleteSkill = async (index: number) => {
    if (!portfolio) return;

    try {
      const updatedPortfolio = { 
        ...portfolio, 
        skills: portfolio.skills.filter((_, i) => i !== index) 
      };
      setPortfolio(updatedPortfolio);
      
      // Auto-save the updated skills
      await handleSave({ skills: updatedPortfolio.skills });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to delete skill');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <div className="edit-loading">
        <div className="loading-spinner"></div>
        <p>Loading portfolio...</p>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="edit-error">
        <h2>Error</h2>
        <p>{error || 'Portfolio not found'}</p>
        <Link href="/dashboard" className="back-link">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .edit-page {
          --bg: #000;
          --surface: #0a0a0a;
          --s2: #111;
          --b: rgba(255,255,255,0.08);
          --bh: rgba(255,255,255,0.16);
          --bf: rgba(255,255,255,0.22);
          --t1: #ededed;
          --t2: #a1a1a1;
          --t3: #555;
          --success: #34d399;
          --error: #f87171;
          --font: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          background: var(--bg);
          color: var(--t1);
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
          moz-osx-font-smoothing: grayscale;
        }

        .edit-page *, .edit-page *::before, .edit-page *::after { 
          box-sizing: border-box; 
          margin: 0; 
          padding: 0; 
        }

        /* Header */
        .edit-header {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid var(--b);
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .edit-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .edit-title {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--t1);
        }

        .edit-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .edit-button {
          background: var(--t1);
          color: #000;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .edit-button:hover:not(:disabled) {
          background: #fff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255,255,255,0.15);
        }

        .edit-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(255,255,255,0.1);
        }

        .edit-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .edit-button.secondary {
          background: transparent;
          color: var(--t2);
          border: 1px solid var(--b);
        }

        .edit-button.secondary:hover:not(:disabled) {
          border-color: var(--bh);
          color: var(--t1);
          background: rgba(255,255,255,0.05);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255,255,255,0.08);
        }

        .edit-button.secondary:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(255,255,255,0.05);
        }

        /* Main Content */
        .edit-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px;
        }

        .edit-section {
          background: var(--surface);
          border: 1px solid var(--b);
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 24px;
        }

        .edit-section-title {
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--t1);
          margin-bottom: 24px;
        }

        /* Form Elements */
        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .edit-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .edit-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--t2);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .edit-input, .edit-textarea {
          background: var(--s2);
          border: 1px solid var(--b);
          border-radius: 6px;
          padding: 12px;
          font-family: var(--font);
          font-size: 13px;
          color: var(--t1);
          transition: border-color 0.15s;
        }

        .edit-input:focus, .edit-textarea:focus {
          outline: none;
          border-color: var(--bf);
        }

        .edit-textarea {
          min-height: 100px;
          resize: vertical;
        }

        /* Lists */
        .edit-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .edit-list-item {
          background: var(--s2);
          border: 1px solid var(--b);
          border-radius: 8px;
          padding: 20px;
        }

        .edit-list-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .edit-list-item-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--t1);
        }

        .edit-list-item-fields {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Success/Error Messages */
        .edit-success {
          background: rgba(52, 211, 153, 0.1);
          border: 1px solid var(--success);
          color: var(--success);
          padding: 12px;
          border-radius: 6px;
          font-size: 12px;
          margin-bottom: 16px;
        }

        .edit-error-message {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid var(--error);
          color: var(--error);
          padding: 12px;
          border-radius: 6px;
          font-size: 12px;
          margin-bottom: 16px;
        }

        /* Loading */
        .edit-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          text-align: center;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 2px solid var(--b);
          border-top-color: var(--t1);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .edit-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          text-align: center;
        }

        .back-link {
          color: var(--t2);
          text-decoration: none;
          font-weight: 500;
          margin-top: 16px;
        }

        .back-link:hover {
          color: var(--t1);
        }

        /* Enhanced button styles */
        .edit-button:disabled:not(.secondary) {
          background: var(--t3) !important;
          color: var(--t2) !important;
          cursor: not-allowed;
        }

        .edit-button.enhance-loading {
  background: var(--success) !important;
  color: #000 !important;
  animation: pulse 2s infinite;
}

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        /* Form validation styles */
        .edit-input:invalid, .edit-textarea:invalid {
          border-color: var(--error);
        }

        .edit-input:focus:invalid, .edit-textarea:focus:invalid {
          border-color: var(--error);
          box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.1);
        }

        /* Required field indicator */
        .edit-label.required::after {
          content: ' *';
          color: var(--error);
          font-weight: 600;
        }

        /* Add form styles */
        .add-form-item {
          background: var(--s2);
          border: 2px dashed var(--bh);
          border-radius: 8px;
          padding: 20px;
          margin-top: 16px;
          transition: all 0.2s ease;
        }

        .add-form-item:hover {
          border-color: var(--bf);
          background: rgba(255,255,255,0.02);
        }

        /* Delete button styles */
        .edit-button.delete {
          background: rgba(248, 113, 113, 0.1);
          color: var(--error);
          border: 1px solid rgba(248, 113, 113, 0.2);
        }

        .edit-button.delete:hover:not(:disabled) {
          background: rgba(248, 113, 113, 0.2);
          border-color: var(--error);
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(248, 113, 113, 0.15);
        }

        .edit-button.delete:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(248, 113, 113, 0.1);
        }

        @media (max-width: 768px) {
          .edit-header-inner {
            padding: 0 20px;
          }

          .edit-main {
            padding: 20px;
          }

          .edit-section {
            padding: 20px;
          }

          .edit-actions {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>

      <div className="edit-page">
        {/* Header */}
        <header className="edit-header">
          <div className="edit-header-inner">
            <div className="edit-title">Edit Portfolio</div>
            <div className="edit-actions">
              <Link href={`/portfolio/${portfolioId}`} className="edit-button secondary" target="_blank">
                View Portfolio
              </Link>
              <Link href="/dashboard" className="edit-button secondary">
                Back to Dashboard
              </Link>
              <button
                onClick={() => handleSave(portfolio)}
                disabled={saving}
                className="edit-button"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="edit-main">
          {success && (
            <div className="edit-success">
              Changes saved successfully!
            </div>
          )}

          {error && (
            <div className="edit-error-message">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="edit-section">
            <h2 className="edit-section-title">Basic Information</h2>
            <div className="edit-form">
              <div className="edit-field">
                <label className="edit-label">Name</label>
                <input
                  type="text"
                  className="edit-input"
                  value={portfolio.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                />
              </div>
              
              <div className="edit-field">
                <label className="edit-label">Headline</label>
                <input
                  type="text"
                  className="edit-input"
                  value={portfolio.headline}
                  onChange={(e) => handleFieldChange('headline', e.target.value)}
                />
              </div>
              
              <div className="edit-field">
                <label className="edit-label">Location</label>
                <input
                  type="text"
                  className="edit-input"
                  value={portfolio.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                />
              </div>
              
              <div className="edit-field">
                <label className="edit-label">Summary</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <textarea
                    className="edit-textarea"
                    value={portfolio.summary}
                    onChange={(e) => handleFieldChange('summary', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={handleEnhanceSummary}
                    disabled={enhancingSummary || !portfolio.summary.trim()}
                    className={`edit-button ${enhancingSummary ? 'enhance-loading' : ''}`}
                    style={{ 
                      alignSelf: 'flex-end',
                      background: enhancingSummary ? 'var(--success)' : 'var(--t1)',
                      color: enhancingSummary ? '#000' : '#000',
                      minWidth: '140px'
                    }}
                  >
                    {enhancingSummary ? 'Enhancing...' : 'Enhance with AI'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="edit-section">
            <h2 className="edit-section-title">Experience</h2>
            <div className="edit-list">
              {portfolio.experience.map((exp, index) => (
                <div key={exp.id} className="edit-list-item">
                  <div className="edit-list-item-header">
                    <div className="edit-list-item-title">{exp.title} at {exp.company}</div>
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="edit-button secondary delete"
                      style={{ fontSize: '11px', padding: '6px 12px' }}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="edit-list-item-fields">
                    <div className="edit-field">
                      <label className="edit-label">Title</label>
                      <input
                        type="text"
                        className="edit-input"
                        value={exp.title}
                        onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                      />
                    </div>
                    <div className="edit-field">
                      <label className="edit-label">Company</label>
                      <input
                        type="text"
                        className="edit-input"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                      />
                    </div>
                    <div className="edit-field">
                      <label className="edit-label">Duration</label>
                      <input
                        type="text"
                        className="edit-input"
                        value={exp.duration}
                        onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                      />
                    </div>
                    <div className="edit-field">
                      <label className="edit-label">Description</label>
                      <textarea
                        className="edit-textarea"
                        value={exp.description}
                        onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Experience Button */}
            {!showAddExperience && (
              <button
                onClick={() => setShowAddExperience(true)}
                className="edit-button secondary"
                style={{ width: '100%', marginTop: '16px' }}
              >
                + Add Experience
              </button>
            )}

            {/* Add Experience Form */}
            {showAddExperience && (
              <div className="edit-list-item" style={{ border: '2px dashed var(--bh)' }}>
                <div className="edit-list-item-header">
                  <div className="edit-list-item-title">Add New Experience</div>
                  <button
                    onClick={() => setShowAddExperience(false)}
                    className="edit-button secondary"
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                  >
                    Cancel
                  </button>
                </div>
                <div className="edit-list-item-fields">
                  <div className="edit-field">
                    <label className="edit-label required">Title</label>
                    <input
                      type="text"
                      className="edit-input"
                      value={newExperience.title}
                      onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                      required
                    />
                  </div>
                  <div className="edit-field">
                    <label className="edit-label required">Company</label>
                    <input
                      type="text"
                      className="edit-input"
                      value={newExperience.company}
                      onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                      placeholder="e.g. Tech Company"
                      required
                    />
                  </div>
                  <div className="edit-field">
                    <label className="edit-label">Duration</label>
                    <input
                      type="text"
                      className="edit-input"
                      value={newExperience.duration}
                      onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                      placeholder="e.g. Jan 2020 - Present"
                    />
                  </div>
                  <div className="edit-field">
                    <label className="edit-label">Description</label>
                    <textarea
                      className="edit-textarea"
                      value={newExperience.description}
                      onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                      placeholder="Describe your role and achievements..."
                    />
                  </div>
                  <button
                    onClick={handleAddExperience}
                    disabled={!newExperience.title.trim() || !newExperience.company.trim()}
                    className="edit-button"
                    style={{ marginTop: '12px' }}
                  >
                    Add Experience
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Education */}
          <div className="edit-section">
            <h2 className="edit-section-title">Education</h2>
            <div className="edit-list">
              {portfolio.education.map((edu, index) => (
                <div key={edu.id} className="edit-list-item">
                  <div className="edit-list-item-header">
                    <div className="edit-list-item-title">{edu.degree} at {edu.school}</div>
                    <button
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="edit-button secondary delete"
                      style={{ fontSize: '11px', padding: '6px 12px' }}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="edit-list-item-fields">
                    <div className="edit-field">
                      <label className="edit-label">School</label>
                      <input
                        type="text"
                        className="edit-input"
                        value={edu.school}
                        onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                      />
                    </div>
                    <div className="edit-field">
                      <label className="edit-label">Degree</label>
                      <input
                        type="text"
                        className="edit-input"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      />
                    </div>
                    <div className="edit-field">
                      <label className="edit-label">Duration</label>
                      <input
                        type="text"
                        className="edit-input"
                        value={edu.duration}
                        onChange={(e) => handleEducationChange(index, 'duration', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Education Button */}
            {!showAddEducation && (
              <button
                onClick={() => setShowAddEducation(true)}
                className="edit-button secondary"
                style={{ width: '100%', marginTop: '16px' }}
              >
                + Add Education
              </button>
            )}

            {/* Add Education Form */}
            {showAddEducation && (
              <div className="edit-list-item" style={{ border: '2px dashed var(--bh)' }}>
                <div className="edit-list-item-header">
                  <div className="edit-list-item-title">Add New Education</div>
                  <button
                    onClick={() => setShowAddEducation(false)}
                    className="edit-button secondary"
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                  >
                    Cancel
                  </button>
                </div>
                <div className="edit-list-item-fields">
                  <div className="edit-field">
                    <label className="edit-label required">School</label>
                    <input
                      type="text"
                      className="edit-input"
                      value={newEducation.school}
                      onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
                      placeholder="e.g. University of California"
                      required
                    />
                  </div>
                  <div className="edit-field">
                    <label className="edit-label required">Degree</label>
                    <input
                      type="text"
                      className="edit-input"
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                      placeholder="e.g. Bachelor of Science in Computer Science"
                      required
                    />
                  </div>
                  <div className="edit-field">
                    <label className="edit-label">Duration</label>
                    <input
                      type="text"
                      className="edit-input"
                      value={newEducation.duration}
                      onChange={(e) => setNewEducation({ ...newEducation, duration: e.target.value })}
                      placeholder="e.g. 2016 - 2020"
                    />
                  </div>
                  <button
                    onClick={handleAddEducation}
                    disabled={!newEducation.school.trim() || !newEducation.degree.trim()}
                    className="edit-button"
                    style={{ marginTop: '12px' }}
                  >
                    Add Education
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="edit-section">
            <h2 className="edit-section-title">Skills</h2>
            <div className="edit-list">
              {portfolio.skills.map((skill, index) => (
                <div key={index} className="edit-list-item">
                  <div className="edit-list-item-header">
                    <div className="edit-list-item-title">Skill {index + 1}</div>
                    <button
                      onClick={() => handleDeleteSkill(index)}
                      className="edit-button secondary delete"
                      style={{ fontSize: '11px', padding: '6px 12px' }}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="edit-list-item-fields">
                    <div className="edit-field">
                      <label className="edit-label">Skill Name</label>
                      <input
                        type="text"
                        className="edit-input"
                        value={skill}
                        onChange={(e) => handleSkillChange(index, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Skill Button */}
            {!showAddSkill && (
              <button
                onClick={() => setShowAddSkill(true)}
                className="edit-button secondary"
                style={{ width: '100%', marginTop: '16px' }}
              >
                + Add Skill
              </button>
            )}

            {/* Add Skill Form */}
            {showAddSkill && (
              <div className="edit-list-item" style={{ border: '2px dashed var(--bh)' }}>
                <div className="edit-list-item-header">
                  <div className="edit-list-item-title">Add New Skill</div>
                  <button
                    onClick={() => setShowAddSkill(false)}
                    className="edit-button secondary"
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                  >
                    Cancel
                  </button>
                </div>
                <div className="edit-list-item-fields">
                  <div className="edit-field">
                    <label className="edit-label required">Skill Name</label>
                    <input
                      type="text"
                      className="edit-input"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g. JavaScript, Project Management, Data Analysis"
                      required
                    />
                  </div>
                  <button
                    onClick={handleAddSkill}
                    disabled={!newSkill.trim()}
                    className="edit-button"
                    style={{ marginTop: '12px' }}
                  >
                    Add Skill
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

import { notFound } from 'next/navigation';
import { getPortfolio } from '@/lib/portfolio-storage';
import { PortfolioHeader } from '@/components/portfolio/PortfolioHeader';
import { PortfolioSummary } from '@/components/portfolio/PortfolioSummary';
import { EducationTimeline } from '@/components/portfolio/EducationTimeline';
import { SkillsSection } from '@/components/portfolio/SkillsSection';
import { ProjectsSection } from '@/components/portfolio/ProjectsSection';
import { CertificationsSection } from '@/components/portfolio/CertificationsSection';
import { ActivitySection } from '@/components/portfolio/ActivitySection';
import { PortfolioFooter } from '@/components/portfolio/PortfolioFooter';

interface PortfolioPageProps {
  params: Promise<{ id: string }>;
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { id } = await params;
  const portfolio = await getPortfolio(id);

  if (!portfolio) {
    notFound();
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#ededed' }}>

      <PortfolioHeader
        name={portfolio.name}
        headline={portfolio.headline}
        location={portfolio.location}
        avatar={portfolio.avatar}
        bannerImage={portfolio.bannerImage}
        followers={portfolio.followers}
        connections={portfolio.connections}
        currentCompany={portfolio.currentCompany}
      />

      <main>
        {portfolio.summary && (
          <PortfolioSummary summary={portfolio.summary} />
        )}

        {portfolio.projects?.length > 0 && (
          <ProjectsSection projects={portfolio.projects} />
        )}

        {portfolio.education?.length > 0 && (
          <EducationTimeline education={portfolio.education} />
        )}

        {/* Always show skills section if available, even if empty */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <SkillsSection skills={portfolio.skills} />
        )}

        {/* Always show certifications if available */}
        {portfolio.certifications && portfolio.certifications.length > 0 && (
          <CertificationsSection certifications={portfolio.certifications} />
        )}

        {/* Show activity if available */}
        {portfolio.activity && portfolio.activity.length > 0 && (
          <ActivitySection 
            activity={portfolio.activity} 
            followers={portfolio.followers}
            connections={portfolio.connections}
          />
        )}

        {/* Show additional profile information if sections are missing */}
        {(!portfolio.education || portfolio.education.length === 0) && 
         (!portfolio.skills || portfolio.skills.length === 0) && 
         (!portfolio.certifications || portfolio.certifications.length === 0) && (
          <section style={{ 
            padding: '72px 40px', 
            maxWidth: '860px', 
            margin: '0 auto',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: '500', 
              letterSpacing: '0.07em', 
              textTransform: 'uppercase',
              color: '#555',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#555' }}></span>
              Profile Information
            </div>
            <p style={{ 
              color: '#a1a1a1', 
              fontSize: '14px',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Detailed profile information (education, skills, and certifications) 
              will appear here once available from the LinkedIn profile.
            </p>
            {portfolio.currentCompany && (
              <p style={{ 
                color: '#ededed', 
                fontSize: '16px',
                marginTop: '20px',
                fontWeight: '500'
              }}>
                Current: {portfolio.currentCompany}
              </p>
            )}
            {portfolio.followers && (
              <p style={{ 
                color: '#a1a1a1', 
                fontSize: '14px',
                marginTop: '12px'
              }}>
                {portfolio.followers.toLocaleString()} followers • {portfolio.connections?.toLocaleString() || '0'} connections
              </p>
            )}
          </section>
        )}
      </main>

      <PortfolioFooter
        linkedinUrl={portfolio.linkedinUrl}
        generatedAt={portfolio.generatedAt}
      />

    </div>
  );
}
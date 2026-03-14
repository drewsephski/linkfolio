import { notFound } from 'next/navigation';
import { getPortfolio } from '@/lib/portfolio-storage-file';
import { PortfolioHeader } from '@/components/portfolio/PortfolioHeader';
import { PortfolioSummary } from '@/components/portfolio/PortfolioSummary';
import { ExperienceTimeline } from '@/components/portfolio/ExperienceTimeline';
import { EducationTimeline } from '@/components/portfolio/EducationTimeline';
import { SkillsSection } from '@/components/portfolio/SkillsSection';
import { ProjectsSection } from '@/components/portfolio/ProjectsSection';
import { CertificationsSection } from '@/components/portfolio/CertificationsSection';
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

        {portfolio.experience?.length > 0 && (
          <ExperienceTimeline experience={portfolio.experience} />
        )}

        {portfolio.projects?.length > 0 && (
          <ProjectsSection projects={portfolio.projects} />
        )}

        {portfolio.education?.length > 0 && (
          <EducationTimeline education={portfolio.education} />
        )}

        {portfolio.skills?.length > 0 && (
          <SkillsSection skills={portfolio.skills} />
        )}

        {portfolio.certifications?.length > 0 && (
          <CertificationsSection certifications={portfolio.certifications} />
        )}
      </main>

      <PortfolioFooter
        linkedinUrl={portfolio.linkedinUrl}
        generatedAt={portfolio.generatedAt}
      />

    </div>
  );
}
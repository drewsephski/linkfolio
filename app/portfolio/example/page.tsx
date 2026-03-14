import { PortfolioHeader } from '@/components/portfolio/PortfolioHeader';
import { PortfolioSummary } from '@/components/portfolio/PortfolioSummary';
import { ExperienceTimeline } from '@/components/portfolio/ExperienceTimeline';
import { EducationTimeline } from '@/components/portfolio/EducationTimeline';
import { SkillsSection } from '@/components/portfolio/SkillsSection';
import { ProjectsSection } from '@/components/portfolio/ProjectsSection';
import { CertificationsSection } from '@/components/portfolio/CertificationsSection';
import { PortfolioFooter } from '@/components/portfolio/PortfolioFooter';
import type { PortfolioProfile, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from '@/lib/data-normalization';

// Demo data - engaging example portfolio
const demoPortfolio: PortfolioProfile = {
  id: 'demo',
  name: 'Alexandra Chen',
  headline: 'Senior Product Designer at Stripe | Building intuitive payment experiences | ex-Spotify, Airbnb',
  location: 'San Francisco, CA',
  summary: `Passionate product designer with 8+ years of experience crafting delightful user experiences at the intersection of design, technology, and business. Currently leading design initiatives for Stripe\'s payment platform, serving millions of businesses worldwide.

My approach combines deep user research, systems thinking, and pixel-perfect execution to create products that not only look beautiful but solve real problems. I believe great design is invisible—it just works.

Specializing in design systems, fintech UX, and cross-functional collaboration. Always excited to tackle complex challenges and mentor the next generation of designers.`,
  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format',
  bannerImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop',
  followers: 2847,
  connections: 523,
  currentCompany: 'Stripe',
  linkedinUrl: 'https://linkedin.com/in/alexandrachen',
  generatedAt: new Date().toISOString(),
  experience: [
    {
      id: 'exp1',
      title: 'Senior Product Designer',
      company: 'Stripe',
      duration: '2022 - Present',
      description: `• Led the redesign of Stripe Checkout, increasing conversion rates by 23% across 50,000+ businesses
• Established and scaled Stripe\'s design system, now used by 40+ product teams globally
• Mentored 5 junior designers and led design hiring initiatives, growing the team by 60%
• Collaborated with engineering to implement new component library, reducing development time by 35%
• Conducted user research with 200+ merchants across 15 countries to inform payment flow optimizations`,
      current: true
    },
    {
      id: 'exp2',
      title: 'Product Designer',
      company: 'Spotify',
      duration: '2019 - 2022',
      description: `• Redesigned the podcast discovery experience, contributing to 45% increase in podcast engagement
• Led the mobile app redesign, improving App Store rating from 3.2 to 4.6 stars
• Created and maintained design guidelines for Spotify\'s creator tools platform
• Worked closely with data scientists to implement A/B testing framework for design decisions
• Presented design concepts to executive leadership and secured buy-in for major product initiatives`
    },
    {
      id: 'exp3',
      title: 'UX Designer',
      company: 'Airbnb',
      duration: '2017 - 2019',
      description: `• Designed new host onboarding flow, reducing time-to-first-listing by 40%
• Contributed to the redesign of Airbnb\'s search and filtering system
• Conducted ethnographic research with hosts in 12 countries to inform product strategy
• Created interactive prototypes and usability tests that informed 3 major feature launches
• Collaborated with cross-functional teams across product, engineering, and marketing`
    }
  ] as ExperienceItem[],
  education: [
    {
      id: 'edu1',
      school: 'Stanford University',
      degree: 'Master of Human-Computer Interaction',
      duration: '2015 - 2017',
      current: false
    },
    {
      id: 'edu2',
      school: 'Carnegie Mellon University',
      degree: 'Bachelor of Design, Communication Design',
      duration: '2011 - 2015',
      current: false
    }
  ] as EducationItem[],
  skills: [
    'Product Design', 'UX/UI Design', 'Design Systems', 'Figma', 'Sketch', 'Adobe Creative Suite',
    'User Research', 'Prototyping', 'Interaction Design', 'Visual Design', 'Frontend Development',
    'React', 'TypeScript', 'HTML/CSS', 'Design Thinking', 'Agile Methodology', 'Data Analysis',
    'A/B Testing', 'Usability Testing', 'Information Architecture', 'Wireframing', 'Motion Design'
  ],
  projects: [
    {
      id: 'proj1',
      title: 'Design System Architecture',
      description: 'Led the complete overhaul of Stripe\'s design system, creating a comprehensive component library used across 40+ product teams. Implemented automated testing and documentation systems that reduced design inconsistencies by 78%.',
      url: 'https://design.stripe.com'
    },
    {
      id: 'proj2',
      title: 'Mobile Payment Experience',
      description: 'Redesigned Stripe\'s mobile checkout experience from the ground up, resulting in 23% higher conversion rates and 40% fewer support tickets. The new design serves over 10 million mobile users monthly.',
      url: 'https://stripe.com/mobile'
    },
    {
      id: 'proj3',
      title: 'Accessibility Initiative',
      description: 'Championed accessibility improvements across Stripe\'s product suite, achieving WCAG 2.1 AA compliance. Created accessibility guidelines and conducted audits that improved the experience for users with disabilities.',
    }
  ] as ProjectItem[],
  certifications: [
    {
      id: 'cert1',
      title: 'Google UX Design Professional Certificate',
      issuer: 'Google',
      issueDate: '2021',
      credentialUrl: 'https://coursera.org/verify/google-ux-design'
    },
    {
      id: 'cert2',
      title: 'Certified Professional in Accessibility Core Competencies (CPACC)',
      issuer: 'International Association of Accessibility Professionals (IAAP)',
      issueDate: '2022',
      credentialId: 'CPACC-2022-3421'
    },
    {
      id: 'cert3',
      title: 'Figma Advanced Certification',
      issuer: 'Figma',
      issueDate: '2023',
      credentialUrl: 'https://figma.com/certification'
    }
  ] as CertificationItem[]
};

export default function DemoPortfolioPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#ededed' }}>
      <PortfolioHeader
        name={demoPortfolio.name}
        headline={demoPortfolio.headline}
        location={demoPortfolio.location}
        avatar={demoPortfolio.avatar}
        bannerImage={demoPortfolio.bannerImage}
        followers={demoPortfolio.followers}
        connections={demoPortfolio.connections}
        currentCompany={demoPortfolio.currentCompany}
      />

      <main>
        {demoPortfolio.summary && (
          <PortfolioSummary summary={demoPortfolio.summary} />
        )}

        {demoPortfolio.experience?.length > 0 && (
          <ExperienceTimeline experience={demoPortfolio.experience} />
        )}

        {demoPortfolio.projects?.length > 0 && (
          <ProjectsSection projects={demoPortfolio.projects} />
        )}

        {demoPortfolio.education?.length > 0 && (
          <EducationTimeline education={demoPortfolio.education} />
        )}

        {demoPortfolio.skills?.length > 0 && (
          <SkillsSection skills={demoPortfolio.skills} />
        )}

        {demoPortfolio.certifications?.length > 0 && (
          <CertificationsSection certifications={demoPortfolio.certifications} />
        )}
      </main>

      <PortfolioFooter
        linkedinUrl={demoPortfolio.linkedinUrl}
        generatedAt={demoPortfolio.generatedAt}
      />
    </div>
  );
}

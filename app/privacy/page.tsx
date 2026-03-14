import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .privacy {
          --bg: #000;
          --surface: #0a0a0a;
          --s2: #111;
          --b: rgba(255,255,255,0.08);
          --bh: rgba(255,255,255,0.14);
          --t1: #ededed;
          --t2: #a1a1a1;
          --t3: #555;
          --font: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          background: var(--bg);
          color: var(--t1);
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
          moz-osx-font-smoothing: grayscale;
        }
        .privacy *, .privacy *::before, .privacy *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Nav ── */
        .privacy-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid var(--b);
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .privacy-nav-inner {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 40px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .privacy-logo {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--t1);
          text-decoration: none;
        }
        .privacy-nav-link {
          font-size: 13px;
          color: var(--t3);
          text-decoration: none;
          padding: 5px 10px;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
          letter-spacing: -0.01em;
        }
        .privacy-nav-link:hover {
          color: var(--t2);
          background: rgba(255,255,255,0.04);
        }

        /* ── Content ── */
        .privacy-content {
          max-width: 720px;
          margin: 0 auto;
          padding: 80px 40px 120px;
        }

        .privacy-header {
          margin-bottom: 48px;
        }

        .privacy-title {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 600;
          letter-spacing: -0.05em;
          line-height: 1.1;
          color: var(--t1);
          margin-bottom: 16px;
        }

        .privacy-subtitle {
          font-size: 16px;
          font-weight: 400;
          color: var(--t3);
          line-height: 1.6;
          letter-spacing: -0.01em;
        }

        .privacy-section {
          margin-bottom: 48px;
          padding-bottom: 32px;
          border-bottom: 1px solid var(--b);
        }

        .privacy-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .privacy-section-title {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--t1);
          margin-bottom: 16px;
        }

        .privacy-text {
          font-size: 14px;
          color: var(--t3);
          line-height: 1.7;
          letter-spacing: -0.01em;
          margin-bottom: 16px;
        }

        .privacy-text:last-child {
          margin-bottom: 0;
        }

        .privacy-list {
          list-style: none;
          margin: 16px 0;
        }

        .privacy-list-item {
          font-size: 14px;
          color: var(--t3);
          line-height: 1.7;
          letter-spacing: -0.01em;
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }

        .privacy-list-item::before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--t2);
        }

        .privacy-link {
          color: #7c3aed;
          text-decoration: none;
          transition: color 0.15s;
        }

        .privacy-link:hover {
          color: #8b5cf6;
        }

        .privacy-highlight {
          color: var(--t2);
          font-weight: 500;
        }

        .privacy-contact {
          background: var(--surface);
          border: 1px solid var(--b);
          border-radius: 10px;
          padding: 24px;
          margin-top: 48px;
        }

        .privacy-contact-title {
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--t1);
          margin-bottom: 12px;
        }

        .privacy-contact-text {
          font-size: 14px;
          color: var(--t3);
          line-height: 1.6;
          letter-spacing: -0.01em;
        }

        @media (max-width: 700px) {
          .privacy-content { padding: 64px 24px 80px; }
          .privacy-nav-inner { padding: 0 24px; }
          .privacy-title { font-size: 32px; }
        }
      `}</style>

      <div className="privacy">
        {/* Nav */}
        <nav className="privacy-nav">
          <div className="privacy-nav-inner">
            <Link href="/" className="privacy-logo">Linkfolio</Link>
            <Link href="/terms" className="privacy-nav-link">Terms</Link>
          </div>
        </nav>

        {/* Content */}
        <div className="privacy-content">
          <div className="privacy-header">
            <h1 className="privacy-title">Privacy Policy</h1>
            <p className="privacy-subtitle">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section-title">Information We Collect</h2>
            <p className="privacy-text">
              Linkfolio transforms your LinkedIn profile into a beautiful portfolio. To provide this service, we collect and process certain information:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item"><span className="privacy-highlight">LinkedIn Profile Data:</span> When you provide your LinkedIn URL, we scrape publicly available information from your profile including name, headline, experience, education, skills, and other professional details.</li>
              <li className="privacy-list-item"><span className="privacy-highlight">Generated Portfolios:</span> We store the portfolio data we generate for you, including any AI-enhanced content.</li>
              <li className="privacy-list-item"><span className="privacy-highlight">Usage Data:</span> Basic analytics about how our service is used to improve our offerings.</li>
              <li className="privacy-list-item"><span className="privacy-highlight">Authentication Data:</span> If you create an account, we store your email and authentication information.</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section-title">How We Use Your Information</h2>
            <p className="privacy-text">
              We use your information to:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">Generate and host your portfolio website</li>
              <li className="privacy-list-item">Enhance your content using AI to make it more compelling</li>
              <li className="privacy-list-item">Provide you with access to your portfolio and account</li>
              <li className="privacy-list-item">Improve our services and user experience</li>
              <li className="privacy-list-item">Respond to your inquiries and provide support</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section-title">Data Sharing and Third Parties</h2>
            <p className="privacy-text">
              We work with trusted third-party services to provide our service:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item"><span className="privacy-highlight">Bright Data:</span> We use Bright Data&apos;s LinkedIn scraper to collect profile data you authorize us to access.</li>
              <li className="privacy-list-item"><span className="privacy-highlight">AI Providers:</span> We use AI services (like OpenRouter) to enhance and improve your portfolio content.</li>
              <li className="privacy-list-item"><span className="privacy-highlight">Hosting Providers:</span> Your portfolios are hosted on secure infrastructure to ensure reliability and performance.</li>
            </ul>
            <p className="privacy-text">
              We never sell your personal information to third parties. We only share data necessary to provide our services and as required by law.
            </p>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section-title">Data Security</h2>
            <p className="privacy-text">
              We implement appropriate security measures to protect your information, including:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">Encryption of data in transit and at rest</li>
              <li className="privacy-list-item">Secure authentication systems</li>
              <li className="privacy-list-item">Regular security audits and updates</li>
              <li className="privacy-list-item">Access controls and employee training</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section-title">Your Rights and Choices</h2>
            <p className="privacy-text">
              You have the right to:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">Access your personal data</li>
              <li className="privacy-list-item">Correct inaccurate information</li>
              <li className="privacy-list-item">Delete your account and associated data</li>
              <li className="privacy-list-item">Request a copy of your data</li>
              <li className="privacy-list-item">Opt out of data processing where legally permitted</li>
            </ul>
            <p className="privacy-text">
              To exercise these rights, please contact us using the information below.
            </p>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section-title">Data Retention</h2>
            <p className="privacy-text">
              We retain your information for as long as necessary to provide our services and comply with legal obligations. Generated portfolios remain available unless you delete them. If you delete your account, we will remove your personal data within 30 days, except as required by law.
            </p>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section-title">Children&apos;s Privacy</h2>
            <p className="privacy-text">
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
            </p>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section-title">International Data Transfers</h2>
            <p className="privacy-text">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with applicable data protection laws.
            </p>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section-title">Changes to This Policy</h2>
            <p className="privacy-text">
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the updated policy on our website and updating the &ldquo;Last updated&rdquo; date above.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

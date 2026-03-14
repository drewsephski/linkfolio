import Link from 'next/link';

export default function TermsPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .terms {
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
        .terms *, .terms *::before, .terms *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Nav ── */
        .terms-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid var(--b);
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .terms-nav-inner {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 40px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .terms-logo {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--t1);
          text-decoration: none;
        }
        .terms-nav-link {
          font-size: 13px;
          color: var(--t3);
          text-decoration: none;
          padding: 5px 10px;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
          letter-spacing: -0.01em;
        }
        .terms-nav-link:hover {
          color: var(--t2);
          background: rgba(255,255,255,0.04);
        }

        /* ── Content ── */
        .terms-content {
          max-width: 720px;
          margin: 0 auto;
          padding: 80px 40px 120px;
        }

        .terms-header {
          margin-bottom: 48px;
        }

        .terms-title {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 600;
          letter-spacing: -0.05em;
          line-height: 1.1;
          color: var(--t1);
          margin-bottom: 16px;
        }

        .terms-subtitle {
          font-size: 16px;
          font-weight: 400;
          color: var(--t3);
          line-height: 1.6;
          letter-spacing: -0.01em;
        }

        .terms-section {
          margin-bottom: 48px;
          padding-bottom: 32px;
          border-bottom: 1px solid var(--b);
        }

        .terms-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .terms-section-title {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--t1);
          margin-bottom: 16px;
        }

        .terms-text {
          font-size: 14px;
          color: var(--t3);
          line-height: 1.7;
          letter-spacing: -0.01em;
          margin-bottom: 16px;
        }

        .terms-text:last-child {
          margin-bottom: 0;
        }

        .terms-list {
          list-style: none;
          margin: 16px 0;
        }

        .terms-list-item {
          font-size: 14px;
          color: var(--t3);
          line-height: 1.7;
          letter-spacing: -0.01em;
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }

        .terms-list-item::before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--t2);
        }

        .terms-link {
          color: #7c3aed;
          text-decoration: none;
          transition: color 0.15s;
        }

        .terms-link:hover {
          color: #8b5cf6;
        }

        .terms-highlight {
          color: var(--t2);
          font-weight: 500;
        }

        .terms-contact {
          background: var(--surface);
          border: 1px solid var(--b);
          border-radius: 10px;
          padding: 24px;
          margin-top: 48px;
        }

        .terms-contact-title {
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--t1);
          margin-bottom: 12px;
        }

        .terms-contact-text {
          font-size: 14px;
          color: var(--t3);
          line-height: 1.6;
          letter-spacing: -0.01em;
        }

        @media (max-width: 700px) {
          .terms-content { padding: 64px 24px 80px; }
          .terms-nav-inner { padding: 0 24px; }
          .terms-title { font-size: 32px; }
        }
      `}</style>

      <div className="terms">
        {/* Nav */}
        <nav className="terms-nav">
          <div className="terms-nav-inner">
            <Link href="/" className="terms-logo">Linkfolio</Link>
            <Link href="/privacy" className="terms-nav-link">Privacy</Link>
          </div>
        </nav>

        {/* Content */}
        <div className="terms-content">
          <div className="terms-header">
            <h1 className="terms-title">Terms of Service</h1>
            <p className="terms-subtitle">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section-title">Agreement to Terms</h2>
            <p className="terms-text">
              By accessing and using Linkfolio, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section-title">Description of Service</h2>
            <p className="terms-text">
              Linkfolio is a service that transforms your LinkedIn profile data into a beautiful, shareable portfolio website. Our services include:
            </p>
            <ul className="terms-list">
              <li className="terms-list-item">LinkedIn profile data scraping and processing</li>
              <li className="terms-list-item">AI-powered content enhancement and optimization</li>
              <li className="terms-list-item">Portfolio website generation and hosting</li>
              <li className="terms-list-item">Shareable portfolio URLs</li>
              <li className="terms-list-item">Portfolio management and editing tools</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2 className="terms-section-title">User Responsibilities</h2>
            <p className="terms-text">
              As a user of Linkfolio, you agree to:
            </p>
            <ul className="terms-list">
              <li className="terms-list-item"><span className="terms-highlight">Provide Accurate Information:</span> Only provide LinkedIn profiles that you own or have explicit permission to use.</li>
              <li className="terms-list-item"><span className="terms-highlight">Comply with LinkedIn Terms:</span> Ensure your use of LinkedIn data complies with LinkedIn&apos;s terms of service and user agreement.</li>
              <li className="terms-list-item"><span className="terms-highlight">Respect Privacy:</span> Do not use Linkfolio to scrape or process LinkedIn data of others without their consent.</li>
              <li className="terms-list-item"><span className="terms-highlight">Appropriate Use:</span> Use generated portfolios for legitimate professional purposes only.</li>
              <li className="terms-list-item"><span className="terms-highlight">Account Security:</span> Maintain the security of your account and password.</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2 className="terms-section-title">Intellectual Property Rights</h2>
            <p className="terms-text">
              <span className="terms-highlight">Your Content:</span> You retain ownership of all content you provide to Linkfolio, including your LinkedIn profile data and any modifications you make to generated portfolios.
            </p>
            <p className="terms-text">
              <span className="terms-highlight">Generated Portfolios:</span> While you own your underlying content, Linkfolio grants you a license to use the portfolio designs, layouts, and AI-enhanced content we generate.
            </p>
            <p className="terms-text">
              <span className="terms-highlight">Linkfolio Property:</span> The Linkfolio service, including our software, designs, and technology, remains the property of Linkfolio and is protected by intellectual property laws.
            </p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section-title">AI-Generated Content</h2>
            <p className="terms-text">
              Linkfolio uses artificial intelligence to enhance and optimize your portfolio content. You acknowledge and agree that:
            </p>
            <ul className="terms-list">
              <li className="terms-list-item">AI-generated content may not always be accurate or reflect your exact intent</li>
              <li className="terms-list-item">You are responsible for reviewing and approving all AI-enhanced content</li>
              <li className="terms-list-item">Linkfolio is not liable for any inaccuracies or issues in AI-generated content</li>
              <li className="terms-list-item">You should verify that AI-enhanced content accurately represents your professional experience</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2 className="terms-section-title">Privacy and Data Use</h2>
            <p className="terms-text">
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using Linkfolio, you consent to the collection and use of your information as described in our Privacy Policy.
            </p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section-title">Prohibited Activities</h2>
            <p className="terms-text">
              You may not use Linkfolio to:
            </p>
            <ul className="terms-list">
              <li className="terms-list-item">Scrape or process LinkedIn data without proper authorization</li>
              <li className="terms-list-item">Create portfolios for individuals without their consent</li>
              <li className="terms-list-item">Use generated portfolios for fraudulent or misleading purposes</li>
              <li className="terms-list-item">Violate any applicable laws or regulations</li>
              <li className="terms-list-item">Interfere with or disrupt the service or servers</li>
              <li className="terms-list-item">Attempt to gain unauthorized access to our systems</li>
              <li className="terms-list-item">Use the service for spam, harassment, or other harmful activities</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2 className="terms-section-title">Service Availability</h2>
            <p className="terms-text">
              We strive to maintain high availability of our service, but we cannot guarantee uninterrupted access. Linkfolio may be temporarily unavailable for maintenance, updates, or other reasons. We are not liable for any service interruptions or downtime.
            </p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section-title">Limitation of Liability</h2>
            <p className="terms-text">
              To the maximum extent permitted by law, Linkfolio shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, or other intangible losses, resulting from your use of the service.
            </p>
            <p className="terms-text">
              Our total liability to you for any claims arising from or relating to the service shall not exceed the amount you paid for the service in the twelve months preceding the claim.
            </p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section-title">Termination</h2>
            <p className="terms-text">
              We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to:
            </p>
            <ul className="terms-list">
              <li className="terms-list-item">Breach of these Terms</li>
              <li className="terms-list-item">Violation of applicable laws</li>
              <li className="terms-list-item">Fraudulent or harmful activities</li>
              <li className="terms-list-item">Extended period of inactivity</li>
            </ul>
            <p className="terms-text">
              Upon termination, your right to use the service will cease immediately. All provisions of the Terms which by their nature should survive termination shall survive.
            </p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section-title">Changes to Terms</h2>
            <p className="terms-text">
              We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by email or by posting a notice on our site prior to the effective date of the changes. Your continued use of the service after such modifications constitutes acceptance of the updated Terms.
            </p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section-title">Governing Law</h2>
            <p className="terms-text">
              These Terms shall be interpreted and governed by the laws of the jurisdiction in which Linkfolio operates, without regard to conflict of law provisions. Any disputes arising from these Terms shall be resolved in the competent courts of that jurisdiction.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

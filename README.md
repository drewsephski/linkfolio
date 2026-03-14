# Linkfolio

Transform your LinkedIn profile into a beautiful, shareable portfolio website in seconds.

## 🚀 Features

- **Instant Portfolio Generation**: Convert any LinkedIn profile into a professional portfolio
- **AI-Powered Content Enhancement**: Uses AI to rewrite and optimize your profile content
- **Modern, Minimal Design**: Clean, responsive layouts that look great on any device
- **Shareable URLs**: Each portfolio gets a unique, shareable URL
- **Professional Sections**: Hero, summary, experience timeline, education, and skills

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Data Scraping**: Bright Data LinkedIn Scraper API
- **AI Enhancement**: Vercel AI SDK with OpenRouter provider
- **Storage**: In-memory storage (MVP - upgrade to database for production)

## 📋 Prerequisites

1. **Node.js** and **Bun** installed
2. **Bright Data API Key** for LinkedIn scraping
3. **OpenRouter API Key** for AI content enhancement

## 🚀 Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd linkfolio
   bun install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with:
   ```env
   BRIGHT_DATA_API_KEY=your_bright_data_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

3. **Run the development server**:
   ```bash
   bun dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
linkfolio/
├── app/
│   ├── api/
│   │   ├── generate-portfolio/     # Main API route
│   │   └── linkedin/               # LinkedIn scraper endpoints
│   ├── portfolio/
│   │   ├── [id]/                   # Dynamic portfolio pages
│   │   └── example/                # Example portfolio
│   ├── linkedin-scraper/           # Scraper test interface
│   └── page.tsx                    # Landing page
├── components/
│   └── portfolio/                  # Reusable UI components
├── lib/
│   ├── brightdata/                 # LinkedIn scraper integration
│   ├── data-normalization.ts       # Data transformation
│   ├── ai-enrichment.ts           # AI content enhancement
│   └── portfolio-storage.ts       # Portfolio persistence
└── README.md
```

## 🔧 How It Works

### 1. Data Pipeline
```
LinkedIn URL → Bright Data API → Raw Data → Normalization → AI Enhancement → Portfolio
```

### 2. API Flow
1. User submits LinkedIn URL on landing page
2. `/api/generate-portfolio` scrapes LinkedIn data
3. Data is normalized into portfolio schema
4. AI enhances content for better presentation
5. Portfolio is saved and user is redirected

### 3. Components Architecture
- **Modular Design**: Each section is a reusable component
- **Type Safety**: Full TypeScript integration
- **Responsive**: Mobile-first design with Tailwind CSS

## 🎨 Design System

### Color Palette
- **Primary**: Blue 600 (`#2563eb`)
- **Secondary**: Slate 900 (`#0f172a`)
- **Accent**: Green 600 (`#059669`)
- **Background**: White (`#ffffff`)

### Typography
- **Headings**: Bold, large font sizes
- **Body**: Clean, readable text with good contrast
- **Timeline**: Consistent spacing and visual hierarchy

## 📊 Data Models

### Portfolio Profile
```typescript
interface PortfolioProfile {
  id: string;
  name: string;
  headline: string;
  location: string;
  summary: string;
  avatar?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  linkedinUrl: string;
  generatedAt: string;
}
```

## 🔍 API Endpoints

### POST `/api/generate-portfolio`
Generates a portfolio from a LinkedIn URL.

**Request**:
```json
{
  "linkedinUrl": "https://www.linkedin.com/in/johndoe"
}
```

**Response**:
```json
{
  "success": true,
  "portfolioId": "abc123def",
  "profile": { ... }
}
```

### LinkedIn Scraper Endpoints
- `POST /api/linkedin/scrape-profiles`
- `POST /api/linkedin/scrape-companies`
- `POST /api/linkedin/scrape-jobs`
- `POST /api/linkedin/discover-jobs`

## 🧪 Testing

### Test the LinkedIn Scraper
Visit `/linkedin-scraper` to test the Bright Data integration with various LinkedIn URLs.

### View Example Portfolio
Visit `/portfolio/example` to see a sample portfolio with realistic data.

## 🚀 Deployment

### Environment Variables
Make sure to set these in your deployment environment:
- `BRIGHT_DATA_API_KEY`
- `OPENROUTER_API_KEY`

### Build and Deploy
```bash
bun build
bun start
```

## 🔮 Future Enhancements

### Production Features
- [ ] Database persistence (PostgreSQL)
- [ ] User authentication
- [ ] Custom domain support
- [ ] Portfolio analytics
- [ ] Multiple portfolio themes
- [ ] PDF export functionality
- [ ] Social media sharing

### Technical Improvements
- [ ] Redis caching for scraped data
- [ ] Background job processing
- [ ] Rate limiting
- [ ] Error monitoring
- [ ] Performance optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your API keys are correctly set
3. Ensure the LinkedIn profile is public
4. Check Bright Data API quota limits

## 📚 Related Documentation

- [Bright Data LinkedIn Scraper](https://brightdata.com/cp/scrapers/api/gd_l1viktl72bvl7bjuj0/pdp/overview?nav_from=library&id=hl_dc2c6abb)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

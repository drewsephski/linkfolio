import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Linkfolio - Transform LinkedIn into Beautiful Portfolios",
  description: " instantly transform your LinkedIn profile into a stunning, shareable portfolio website. AI-powered content enhancement and modern design.",
  keywords: ["LinkedIn", "portfolio", "resume", "professional", "AI", "career", "website", "shareable"],
  authors: [{ name: "Linkfolio Team" }],
  creator: "Linkfolio",
  publisher: "Linkfolio",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" }
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" }
    ],
    shortcut: [
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ]
  },
  manifest: "/manifest.json",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://linkfolio.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Linkfolio - Transform LinkedIn into Beautiful Portfolios",
    description: "Instantly transform your LinkedIn profile into a stunning, shareable portfolio website.",
    url: "/",
    siteName: "Linkfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Linkfolio - LinkedIn to Portfolio Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Linkfolio - Transform LinkedIn into Beautiful Portfolios",
    description: "Instantly transform your LinkedIn profile into a stunning, shareable portfolio website.",
    images: ["/og-image.png"],
    creator: "@linkfolio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

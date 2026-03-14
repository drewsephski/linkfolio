"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageTestPage() {
  const [mounted, setMounted] = useState(false);
  
  // Test images from our scraped portfolios
  const testAvatar = "https://media.licdn.com/dms/image/v2/D5603AQF-RYZP55jmXA/profile-displayphoto-shrink_200_200/B56ZRi8g.aGsAY-/0/1736826818802?e=2147483647&v=beta&t=bKWfN6UwwtiCqFWsG7rBELbd48qJOAMLdxhBzzkJV0k";
  const testBanner = "https://media.licdn.com/dms/image/v2/D5616AQEjhPbTCeblYg/profile-displaybackgroundimage-shrink_200_800/B56ZcytR5SGsAc-/0/1748902420393?e=2147483647&v=beta&t=a-tBeZkxzWTHWYY6MAjxt0oTEuxlW33EUkK3gm5_te4";
  
  return (
    <div style={{ padding: "20px", background: "#000", color: "#fff", minHeight: "100vh" }}>
      <h1>Image Test Page</h1>
      
      <div style={{ margin: "20px 0" }}>
        <h2>Test 1: Regular img tag (control)</h2>
        <img 
          src={testAvatar} 
          alt="Test avatar with img tag"
          style={{ width: "68px", height: "68px", borderRadius: "50%" }}
          onError={(e) => console.error("IMG tag failed:", e)}
          onLoad={() => console.log("IMG tag loaded successfully")}
        />
      </div>
      
      <div style={{ margin: "20px 0" }}>
        <h2>Test 2: Next.js Image component</h2>
        <Image 
          src={testAvatar} 
          alt="Test avatar with Next.js Image"
          width={68}
          height={68}
          className="test-avatar"
          unoptimized
          onError={(e) => {
            console.error('Next.js Image failed to load:', testAvatar, e);
            alert('Next.js Image failed to load: ' + testAvatar);
          }}
          onLoad={() => {
            console.log('Next.js Image loaded successfully:', testAvatar);
            alert('Next.js Image loaded successfully: ' + testAvatar);
          }}
        />
      </div>
      
      <div style={{ margin: "20px 0", position: "relative", height: "200px" }}>
        <h2>Test 3: Banner Image with Next.js Image (fill)</h2>
        <Image 
          src={testBanner} 
          alt="Test banner"
          fill
          className="test-banner"
          sizes="100vw"
          priority
          onError={(e) => {
            console.error('Banner Next.js Image failed:', testBanner, e);
            alert('Banner Next.js Image failed: ' + testBanner);
          }}
          onLoad={() => {
            console.log('Banner Next.js Image loaded:', testBanner);
            alert('Banner Next.js Image loaded: ' + testBanner);
          }}
        />
      </div>
      
      <style jsx>{`
        .test-avatar {
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .test-banner {
          object-fit: cover;
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
}

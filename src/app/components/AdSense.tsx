'use client';

import { useEffect } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  className?: string;
}

export default function AdSense({ 
  adSlot, 
  adFormat = "auto", 
  fullWidthResponsive = true,
  className = ""
}: AdSenseProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1299056564539263" // Replace with your actual AdSense publisher ID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  );
}

// Auto Ads Component (simplest to start with)
export function AutoAd({ className = "" }: { className?: string }) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: "ca-pub-1299056564539263",
        enable_page_level_ads: true
      });
    } catch (err) {
      console.error('Auto Ads error:', err);
    }
  }, []);

  return <div className={className}></div>;
}

// Banner Ad Component (728x90 or responsive)
export function BannerAd({ className = "" }: { className?: string }) {
  return (
    <AdSense
      adSlot="1234567890" // Temporary - will work once you access AdSense
      adFormat="horizontal"
      className={`text-center my-4 ${className}`}
    />
  );
}

// Square Ad Component (300x250)
export function SquareAd({ className = "" }: { className?: string }) {
  return (
    <AdSense
      adSlot="YOUR_SQUARE_AD_SLOT_ID" // Replace with your actual square ad slot ID from AdSense
      adFormat="rectangle"
      className={`text-center my-4 ${className}`}
    />
  );
}

// Responsive Ad Component
export function ResponsiveAd({ className = "" }: { className?: string }) {
  return (
    <AdSense
      adSlot="YOUR_RESPONSIVE_AD_SLOT_ID" // Replace with your actual responsive ad slot ID from AdSense
      adFormat="auto"
      className={`text-center my-4 ${className}`}
    />
  );
}

import React from 'react';
import { ExternalLink, Sparkles, Megaphone } from 'lucide-react';

export const SMARTLINK_URL =
  'https://www.profitableratecpmnetwork.com/f3pdmxxp?key=07f66cf702716ea7e47c05ed052f6f0a';

/**
 * 468x60 Banner Ad using iframe to prevent virtual DOM collisions
 */
export const AdBanner468x60: React.FC<{ className?: string }> = ({ className = '' }) => {
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; height: 100vh; }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '5887189f065755385faeb4b42823025c',
            'format' : 'iframe',
            'height' : 60,
            'width' : 468,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highrevenueformat.com/5887189f065755385faeb4b42823025c/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div
      className={`my-6 mx-auto w-full max-w-2xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-3 text-center shadow-2xs backdrop-blur-xs ${className}`}
      id="ad-banner-468x60-wrapper"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1.5 mb-2 px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Advertisement • বিজ্ঞাপন
        </span>
        <span className="text-[10px] text-slate-400 font-medium">468×60</span>
      </div>

      <div className="w-full overflow-x-auto flex justify-center py-1">
        <iframe
          title="Ad Banner 468x60"
          srcDoc={srcDoc}
          width={468}
          height={60}
          scrolling="no"
          frameBorder="0"
          className="border-0 overflow-hidden bg-transparent rounded-lg"
        />
      </div>
    </div>
  );
};

/**
 * Native Banner Ad (Container + Script)
 */
export const NativeBannerAd: React.FC<{ className?: string }> = ({ className = '' }) => {
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: transparent; padding: 4px; }
          #container-49108388d41dd2ff9712949878f4c4a5 { min-height: 120px; display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
        </style>
      </head>
      <body>
        <div id="container-49108388d41dd2ff9712949878f4c4a5"></div>
        <script async="async" data-cfasync="false" src="https://pl31200521.profitableratecpmnetwork.com/49108388d41dd2ff9712949878f4c4a5/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div
      className={`my-8 mx-auto w-full max-w-5xl rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 shadow-xs backdrop-blur-md ${className}`}
      id="native-ad-wrapper"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
          <Megaphone className="w-3.5 h-3.5 text-red-500" />
          <span>Sponsored Recommendations / স্পনসর্ড অফার</span>
        </div>
        <span className="text-[10px] text-slate-400 uppercase font-semibold">Promoted</span>
      </div>

      {/* Main container for native banner script */}
      <div className="w-full flex flex-col items-center justify-center">
        <div id="container-49108388d41dd2ff9712949878f4c4a5" className="w-full"></div>
        <iframe
          title="Native Sponsored Recommendations"
          srcDoc={srcDoc}
          className="w-full min-h-[140px] border-0 bg-transparent rounded-2xl"
          scrolling="no"
        />
      </div>
    </div>
  );
};

/**
 * Smartlink Sponsored Banner Card
 */
export const SmartlinkBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`my-6 mx-auto w-full max-w-4xl rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-0.5 shadow-md shadow-red-500/20 ${className}`}
      id="smartlink-banner"
    >
      <div className="rounded-[22px] bg-white dark:bg-slate-900 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/80">
            <Sparkles className="w-3.5 h-3.5" />
            <span>🔥 Special Partner Offer • স্পেশাল অফার</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Exclusive Deals, Cloud Storage &amp; Digital Utility Offers
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            আমাদের স্পনসর পার্টনারদের আকর্ষণীয় অফার ও প্রয়োজনীয় ডিজিটাল টুলস এক্সপ্লোর করুন।
          </p>
        </div>

        <a
          href={SMARTLINK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-md shadow-red-500/30 hover:scale-105 active:scale-95 transition-all"
        >
          <span>Claim Offer / অফার দেখুন</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

interface AdSlotProps {
  format?: 'banner' | 'banner-468' | 'native' | 'smartlink' | 'rectangle' | 'fluid';
  className?: string;
}

/**
 * Universal AdSlot wrapper
 */
export const AdSlot: React.FC<AdSlotProps> = ({ format = 'banner', className = '' }) => {
  if (format === 'native') {
    return <NativeBannerAd className={className} />;
  }

  if (format === 'smartlink') {
    return <SmartlinkBanner className={className} />;
  }

  // Default to 468x60 Banner ad
  return <AdBanner468x60 className={className} />;
};


import React from 'react';

interface AdSlotProps {
  format?: 'banner' | 'rectangle' | 'fluid';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ format = 'banner', className = '' }) => {
  return (
    <div
      className={`my-6 mx-auto w-full max-w-4xl rounded-xl border border-dashed border-slate-300 bg-slate-100/70 p-4 text-center text-xs text-slate-500 transition-all ${className}`}
      id={`ad-slot-${format}`}
    >
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Advertisement
        </span>
        <span className="text-[10px] text-slate-500">AdSense Space</span>
      </div>

      <div
        className={`flex flex-col items-center justify-center rounded-lg bg-white/60 p-6 ${
          format === 'rectangle' ? 'min-h-[250px]' : 'min-h-[90px]'
        }`}
      >
        <div className="flex items-center space-x-2 text-slate-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-medium text-sm text-slate-600">Sponsored Ad Space</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
          Clean non-intrusive placement compliant with Google AdSense standards.
        </p>
      </div>
    </div>
  );
};

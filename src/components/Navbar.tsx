import React from 'react';
import { FileText, Sparkles, Plus, Image as ImageIcon } from 'lucide-react';

interface NavbarProps {
  onLoadSamples: () => void;
  onOpenPicker: () => void;
  imageCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoadSamples, onOpenPicker, imageCount }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight flex items-center gap-1.5">
              <span>ইমেজ টু পিডিএফ</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                A4 স্মার্ট
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">অটো কোলাজ ও গ্রিড মেকার</p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {imageCount === 0 ? (
            <button
              onClick={onLoadSamples}
              aria-label="নমুনা ছবি দিয়ে পরীক্ষা করুন"
              className="text-xs font-semibold bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border border-blue-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>নমুনা ছবি</span>
            </button>
          ) : (
            <button
              onClick={onOpenPicker}
              aria-label="আরও ছবি যোগ করুন"
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ছবি যোগ</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

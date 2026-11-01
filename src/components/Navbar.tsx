import React from 'react';
import { Sparkles, Plus, Layers, Image as ImageIcon } from 'lucide-react';

interface NavbarProps {
  onLoadSamples: () => void;
  onOpenPicker: () => void;
  imageCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoadSamples, onOpenPicker, imageCount }) => {
  return (
    <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.08] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 ring-1 ring-white/20">
            <Layers className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>CollagePDF</span>
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                iOS Pro
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium">Smart A4 Photo Packer</p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {imageCount === 0 ? (
            <button
              onClick={onLoadSamples}
              aria-label="Load demo sample photos"
              className="text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 active:scale-95 text-purple-300 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all border border-purple-500/25 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Load Samples</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onLoadSamples}
                aria-label="Reload sample photos"
                className="hidden sm:flex text-xs font-medium text-zinc-400 hover:text-white px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors"
              >
                Reset to Samples
              </button>
              <button
                onClick={onOpenPicker}
                aria-label="Add more photos"
                className="text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30 ring-1 ring-white/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Photos</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

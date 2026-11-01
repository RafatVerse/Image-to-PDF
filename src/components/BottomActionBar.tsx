import React from 'react';
import { Plus, ArrowRight, ArrowLeft, Download } from 'lucide-react';

interface BottomActionBarProps {
  step: 'edit' | 'preview';
  imageCount: number;
  pageCount: number;
  onOpenPicker: () => void;
  onGoToPreview: () => void;
  onBackToEdit: () => void;
  onDownloadPdf: () => void;
  isGenerating: boolean;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  step,
  imageCount,
  pageCount,
  onOpenPicker,
  onGoToPreview,
  onBackToEdit,
  onDownloadPdf,
  isGenerating,
}) => {
  if (imageCount === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 z-40 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        {/* Clean Minimalist Surface Container (#272727) */}
        <div className="bg-[#272727] border border-[#383838] rounded-3xl px-4 py-2.5 shadow-xl flex items-center justify-between gap-3">
          {step === 'edit' ? (
            <>
              {/* Left count indicator & quick add */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onOpenPicker}
                  aria-label="Add more photos"
                  className="w-10 h-10 rounded-full bg-[#141414] hover:bg-[#1e1e1e] border border-[#383838] text-purple-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="w-5 h-5 stroke-[2.2]" />
                </button>
                <div>
                  <p className="text-xs font-semibold text-white leading-tight">
                    {imageCount} {imageCount === 1 ? 'Photo' : 'Photos'} Queued
                  </p>
                  <p className="text-[11px] text-zinc-400">Ready to layout</p>
                </div>
              </div>

              {/* Next / Preview Button with Solid Purple (No Glow) */}
              <button
                onClick={onGoToPreview}
                data-testid="bottom-preview-btn"
                className="flex-1 max-w-[170px] bg-[#7c3aed] hover:bg-[#6d28d9] active:scale-95 text-white font-medium text-xs sm:text-sm py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Layout Preview</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </button>
            </>
          ) : (
            <>
              {/* Back to Edit Button */}
              <button
                onClick={onBackToEdit}
                className="w-10 h-10 rounded-2xl bg-[#141414] hover:bg-[#1e1e1e] border border-[#383838] text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Back to photo queue"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Direct Download Button with Solid Purple (No Glow) */}
              <button
                onClick={onDownloadPdf}
                disabled={isGenerating}
                className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-40 active:scale-95 text-white font-medium text-xs sm:text-sm py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[2.2]" />
                    <span>Download PDF ({pageCount} {pageCount === 1 ? 'Page' : 'Pages'})</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

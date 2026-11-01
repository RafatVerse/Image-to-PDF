import React from 'react';
import { Plus, ArrowRight, ArrowLeft, Download, Eye, FileDown } from 'lucide-react';
import { motion } from 'motion/react';

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
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {step === 'edit' ? (
          <>
            {/* Left info & quick add */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenPicker}
                aria-label="আরও ছবি যোগ করুন"
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-blue-600 flex items-center justify-center transition-colors shadow-2xs"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {imageCount}টি ছবি সিলেক্টেড
                </p>
                <p className="text-[11px] text-slate-500">সিরিয়ালে রূপান্তর হবে</p>
              </div>
            </div>

            {/* Next / Preview Button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onGoToPreview}
              className="flex-1 max-w-[200px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              <span>ডান / প্রিভিউ</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </>
        ) : (
          <>
            {/* Back button */}
            <button
              onClick={onBackToEdit}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
              aria-label="ছবি এডিটে ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Direct Download Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onDownloadPdf}
              disabled={isGenerating}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>পিডিএফ ডাউনলোড ({pageCount}টি পেজ)</span>
                </>
              )}
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  X,
  FileText,
  FileCheck2,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GenerationProgress, triggerPdfDownload } from '../utils/pdfGenerator';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: GenerationProgress | null;
  generatedBlob: Blob | null;
  pdfUrl: string | null;
  pageCount: number;
  imageCount: number;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  progress,
  generatedBlob,
  pdfUrl,
  pageCount,
  imageCount,
}) => {
  const [fileName, setFileName] = useState('স্মার্ট-কোলাজ-A4.pdf');

  if (!isOpen) return null;

  const isComplete = !!generatedBlob && (!progress || progress.percent >= 100);
  const sizeMb = generatedBlob ? (generatedBlob.size / (1024 * 1024)).toFixed(2) : '0';

  const handleDownload = () => {
    if (generatedBlob) {
      const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      triggerPdfDownload(generatedBlob, safeName);
    }
  };

  const handleOpenInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!isComplete ? (
          /* Loading & Progress State */
          <div className="text-center py-6 space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                <FileText className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                A4 কোলাজ পিডিএফ তৈরি হচ্ছে...
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {progress?.statusText || 'ছবিগুলো নিখুঁতভাবে বসানো হচ্ছে...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress?.percent || 15}%` }}
              />
            </div>

            <p className="text-[11px] font-mono text-slate-600">
              {progress?.percent || 15}% সম্পন্ন
            </p>
          </div>
        ) : (
          /* Ready & Success State */
          <div className="text-center py-3 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                পিডিএফ সম্পূর্ণ তৈরি হয়েছে!
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                সবগুলো ছবি সুন্দরভাবে A4 পেজে সাজানো হয়েছে
              </p>
            </div>

            {/* Document summary box */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 text-left space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>মোট ছবি:</span>
                <span className="font-bold text-slate-800">{imageCount}টি</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>A4 পেজ সংখ্যা:</span>
                <span className="font-bold text-slate-800">{pageCount}টি পৃষ্ঠা</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ফাইল সাইজ:</span>
                <span className="font-bold text-slate-800 font-mono">{sizeMb} MB</span>
              </div>
            </div>

            {/* File name editor */}
            <div className="text-left">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                ফাইলের নাম
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Download Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>এক ক্লিকে ডাউনলোড করুন</span>
            </motion.button>

            {/* Preview link */}
            {pdfUrl && (
              <button
                onClick={handleOpenInNewTab}
                className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center justify-center gap-1.5 mx-auto transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>নতুন ট্যাবে পিডিএফ খুলুন</span>
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

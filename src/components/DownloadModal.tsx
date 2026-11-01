import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  X,
  FileText,
  ExternalLink,
} from 'lucide-react';
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
  const [fileName, setFileName] = useState('Smart-Collage-A4.pdf');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
      {/* Surface Container (#272727) */}
      <div className="relative w-full max-w-sm rounded-3xl bg-[#272727] border border-[#383838] p-6 text-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#141414] hover:bg-[#1e1e1e] border border-[#383838] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!isComplete ? (
          /* Loading State */
          <div className="text-center py-6 space-y-4">
            <div className="relative w-14 h-14 mx-auto">
              <div className="w-14 h-14 rounded-full border-3 border-[#383838] border-t-purple-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-purple-400">
                <FileText className="w-5 h-5 animate-pulse" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Rendering A4 PDF...
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {progress?.statusText || 'Measuring and fitting photos...'}
              </p>
            </div>

            <div className="w-full bg-[#141414] h-2 rounded-full overflow-hidden border border-[#383838]">
              <div
                className="bg-[#7c3aed] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress?.percent || 20}%` }}
              />
            </div>

            <p className="text-[11px] font-mono text-zinc-400">
              {progress?.percent || 20}% complete
            </p>
          </div>
        ) : (
          /* Complete State */
          <div className="text-center py-2 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-[#383838] text-purple-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 stroke-[2]" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                PDF Ready
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Formatted into standard A4 sheets
              </p>
            </div>

            {/* Document summary inside #141414 */}
            <div className="rounded-2xl bg-[#141414] border border-[#383838] p-3 divide-y divide-[#272727] text-xs">
              <div className="flex justify-between py-1.5 text-zinc-400">
                <span>Photos Included:</span>
                <span className="font-semibold text-zinc-200">{imageCount}</span>
              </div>
              <div className="flex justify-between py-1.5 text-zinc-400">
                <span>A4 Page Count:</span>
                <span className="font-semibold text-purple-400">{pageCount} {pageCount === 1 ? 'Page' : 'Pages'}</span>
              </div>
              <div className="flex justify-between py-1.5 text-zinc-400">
                <span>File Size:</span>
                <span className="font-semibold text-zinc-200 font-mono">{sizeMb} MB</span>
              </div>
            </div>

            {/* Filename Input */}
            <div className="text-left">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Document Name
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#141414] border border-[#383838] rounded-xl text-xs font-medium text-white focus:outline-hidden focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] active:scale-95 text-white font-medium text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2]" />
              <span>Download PDF</span>
            </button>

            {/* Open in Tab */}
            {pdfUrl && (
              <button
                onClick={handleOpenInNewTab}
                className="text-xs font-medium text-zinc-400 hover:text-purple-400 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in browser tab</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

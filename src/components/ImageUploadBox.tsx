import React, { useRef } from 'react';
import { Plus, Camera, Sparkles, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ImageUploadBoxProps {
  onFilesSelected: (files: FileList | File[]) => void;
  onLoadSamples: () => void;
  imageCount: number;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  onFilesSelected,
  onLoadSamples,
  imageCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleOpenPicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      // Reset input value so re-selecting same file triggers change
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp, image/heic"
        className="hidden"
        onChange={handleFileChange}
        data-testid="main-image-input"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        data-testid="camera-image-input"
      />

      {/* Main Upload Card */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative rounded-3xl border-2 border-dashed transition-all p-6 text-center ${
          imageCount === 0
            ? 'border-blue-400 bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-white shadow-sm'
            : 'border-slate-300 bg-slate-50/60 hover:border-blue-400'
        }`}
      >
        {/* Prominent Plus Button */}
        <div className="flex flex-col items-center justify-center">
          <motion.button
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleOpenPicker}
            aria-label="ছবি নির্বাচন করতে প্লাস আইকনে ক্লিক করুন"
            className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 focus:outline-hidden focus:ring-4 focus:ring-blue-300 transition-all cursor-pointer"
          >
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-25 pointer-events-none" />
            <Plus className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5] transition-transform group-hover:rotate-90 duration-300" />
          </motion.button>

          <h2 className="mt-4 text-base sm:text-lg font-bold text-slate-900">
            {imageCount === 0 ? 'প্লাস আইকনে ক্লিক করে ছবি বাছুন' : 'আরও নতুন ছবি যোগ করুন'}
          </h2>

          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            একসাথে যতখুশি ছবি সিলেক্ট করুন। সিরিয়াল অনুযায়ী A4 পেজে অটোমেটিক স্মার্ট কোলাজ হবে।
          </p>

          {/* Quick secondary buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={handleOpenPicker}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>গ্যালারি থেকে বাছুন</span>
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 text-slate-600" />
              <span>ক্যামেরা</span>
            </button>

            {imageCount === 0 && (
              <button
                onClick={onLoadSamples}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>স্যাম্পল ৪টি ছবি</span>
              </button>
            )}
          </div>
        </div>

        {/* Format hint */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-center gap-3 text-[11px] text-slate-600">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> JPG, PNG, WebP
          </span>
          <span>•</span>
          <span>আসল রেজোলিউশন অক্ষুণ্ণ থাকে</span>
        </div>
      </div>
    </div>
  );
};

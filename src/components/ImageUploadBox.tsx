import React, { useRef } from 'react';
import { Plus, Camera, Sparkles, Image as ImageIcon } from 'lucide-react';

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

      {/* Surface Container (#272727) - Clean Minimalist Box */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative bg-[#272727] rounded-3xl p-6 sm:p-8 border border-[#383838] text-center transition-all"
      >
        <div className="flex flex-col items-center justify-center">
          {/* Minimalist Solid Purple Plus Button (No Glow) */}
          <button
            onClick={handleOpenPicker}
            aria-label="Add photos"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <Plus className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.2]" />
          </button>

          <h2 className="mt-4 text-base font-semibold text-white tracking-tight">
            {imageCount === 0 ? 'Select or Drop Photos' : 'Add More Photos'}
          </h2>

          <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Multi-photo smart collage. Images are calculated to fit standard A4 sheets without clutter or empty voids.
          </p>

          {/* Action pills inside #141414 sub-container */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={handleOpenPicker}
              className="text-xs font-medium px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] border border-[#383838] text-zinc-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Browse Library</span>
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="text-xs font-medium px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] border border-[#383838] text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-zinc-400" />
              <span>Camera</span>
            </button>

            {imageCount === 0 && (
              <button
                onClick={onLoadSamples}
                className="text-xs font-medium px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] border border-[#383838] text-purple-400 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Load 4 Samples</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

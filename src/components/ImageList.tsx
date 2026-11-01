import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  RotateCw,
  Trash2,
  GripVertical,
  Maximize2,
  FileText,
} from 'lucide-react';
import { UploadedImage } from '../types';

interface ImageListProps {
  images: UploadedImage[];
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRotate: (index: number) => void;
  onRemove: (index: number) => void;
  onClearAll: () => void;
}

export const ImageList: React.FC<ImageListProps> = ({
  images,
  onMoveUp,
  onMoveDown,
  onRotate,
  onRemove,
  onClearAll,
}) => {
  if (images.length === 0) return null;

  return (
    <div className="w-full space-y-3">
      {/* Header with image count and Clear button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
            {images.length}
          </span>
          <h3 className="text-sm font-bold text-slate-800">
            নির্বাচিত ছবির সিরিয়াল ({images.length}টি)
          </h3>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-red-600 hover:text-red-700 active:scale-95 flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-red-50 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>সব মুছুন</span>
        </button>
      </div>

      <p className="text-[11px] text-slate-500 px-1 -mt-1">
        ছবিগুলো এই সিরিয়ালে পেজে বসবে। তীর চিহ্নে ক্লিক করে সিরিয়াল পরিবর্তন করতে পারেন।
      </p>

      {/* List items */}
      <div className="space-y-2">
        {images.map((image, idx) => {
          const isLandscape = image.aspect >= 1.1;
          const isPortrait = image.aspect <= 0.9;
          const ratioBadge = isLandscape ? 'ল্যান্ডস্কেপ' : isPortrait ? 'পোর্ট্রেট' : 'স্কয়ার';

          return (
            <div
              key={image.id}
              className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-2xs flex items-center gap-3 transition-all hover:border-blue-300"
            >
              {/* Order number */}
              <div className="flex flex-col items-center justify-center shrink-0 w-7 text-center">
                <span className="text-xs font-extrabold text-blue-600 bg-blue-50 w-6 h-6 rounded-lg flex items-center justify-center">
                  #{idx + 1}
                </span>
              </div>

              {/* Thumbnail with rotation */}
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <img
                  src={image.dataUrl}
                  alt={image.name}
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={{ transform: `rotate(${image.rotation}deg)` }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 truncate" title={image.name}>
                  {image.name}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md">
                    {ratioBadge}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {image.width}×{image.height}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({image.sizeFormatted})
                  </span>
                </div>
              </div>

              {/* Action Buttons: Move Up, Move Down, Rotate, Delete */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => onMoveUp(idx)}
                    disabled={idx === 0}
                    aria-label={`Move image #${idx + 1} up`}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-700 transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onMoveDown(idx)}
                    disabled={idx === images.length - 1}
                    aria-label={`Move image #${idx + 1} down`}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-700 transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onRotate(idx)}
                  aria-label={`Rotate image #${idx + 1} 90 degrees`}
                  title="৯০° ঘোরান"
                  className="w-7 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-slate-700 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onRemove(idx)}
                  aria-label={`Delete image #${idx + 1}`}
                  title="মুছুন"
                  className="w-7 h-8 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-slate-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

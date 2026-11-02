import React, { useState, useRef, useEffect } from 'react';
import {
  GripVertical,
  RotateCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  RefreshCw,
} from 'lucide-react';
import { motion, Reorder, useDragControls } from 'motion/react';
import { UploadedImage } from '../types';

interface ImageListProps {
  images: UploadedImage[];
  onReorder: (newImages: UploadedImage[]) => void;
  onRotate: (index: number) => void;
  onRemove: (index: number) => void;
  onReplace: (index: number, file: File) => void;
  onClearAll: () => void;
}

interface ImageRowProps {
  image: UploadedImage;
  index: number;
  onRotate: (index: number) => void;
  onRemove: (index: number) => void;
  onTriggerReplace: (index: number) => void;
}

const ImageRow: React.FC<ImageRowProps> = ({
  image,
  index,
  onRotate,
  onRemove,
  onTriggerReplace,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const [isThresholdPassed, setIsThresholdPassed] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDrag = (_: unknown, info: { offset: { x: number } }) => {
    const width = cardRef.current?.offsetWidth || 300;
    // Dragging to the left produces a negative x offset
    const passed = info.offset.x <= -(width * 0.5);
    setIsThresholdPassed(passed);
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    const width = cardRef.current?.offsetWidth || 300;
    if (info.offset.x <= -(width * 0.5)) {
      setIsDismissing(true);
      setTimeout(() => {
        onRemove(index);
      }, 200);
    } else {
      setIsThresholdPassed(false);
    }
  };

  return (
    <Reorder.Item
      value={image}
      dragListener={false}
      dragControls={dragControls}
      className="relative select-none overflow-hidden rounded-2xl"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Material Slide-to-Delete Red Container (Revealed from behind) */}
      <div
        className={`absolute inset-0 rounded-2xl flex items-center justify-end pr-5 transition-colors duration-200 overflow-hidden ${
          isThresholdPassed ? 'bg-rose-600' : 'bg-[#3b1219]'
        }`}
      >
        <div className="flex items-center gap-2 select-none">
          <span
            className={`text-[11px] font-semibold tracking-wide transition-colors duration-150 ${
              isThresholdPassed ? 'text-white' : 'text-rose-300/80'
            }`}
          >
            {isThresholdPassed ? 'Release to Delete' : 'Slide 50% to delete'}
          </span>
          <div
            className={`p-1.5 rounded-full transition-transform duration-200 ${
              isThresholdPassed
                ? 'bg-white text-rose-600 scale-110 shadow-lg'
                : 'bg-rose-900/80 text-rose-200 scale-95'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Foreground Interactive Card (Slidable horizontally) */}
      <motion.div
        ref={cardRef}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -1000, right: 0 }}
        dragElastic={{ left: 0.1, right: 0 }}
        dragSnapToOrigin={!isDismissing}
        animate={isDismissing ? { x: -600, opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="relative z-10 bg-[#141414] rounded-2xl p-2.5 sm:p-3 border border-[#2d2d2d] hover:border-[#404040] flex items-center gap-3 transition-colors"
      >
        {/* Vertical Reorder Grip Handle (Only drag handles vertical movement) */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="text-zinc-500 hover:text-zinc-300 active:text-purple-400 shrink-0 cursor-grab active:cursor-grabbing p-1.5 touch-none"
          title="Hold and drag up or down to reorder"
          aria-label="Reorder handle"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Sequence Number */}
        <span className="text-xs font-mono font-bold text-zinc-400 w-5 shrink-0 text-center">
          #{index + 1}
        </span>

        {/* Thumbnail Preview */}
        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-black shrink-0 border border-[#383838]">
          <img
            src={image.dataUrl}
            alt={image.name}
            className="w-full h-full object-cover"
            style={{ transform: `rotate(${image.rotation}deg)` }}
          />
        </div>

        {/* Name and File Size (clean, no dimensions) */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-medium text-zinc-100 truncate">{image.name}</p>
          <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{image.sizeFormatted}</p>
        </div>

        {/* Direct Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Replace / Reselect Single Image */}
          <button
            onClick={() => onTriggerReplace(index)}
            title="Replace photo"
            aria-label="Replace this photo"
            className="w-7 h-7 rounded-lg bg-[#272727] hover:bg-[#333333] text-zinc-300 hover:text-purple-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Rotate 90° */}
          <button
            onClick={() => onRotate(index)}
            title="Rotate 90°"
            aria-label="Rotate 90 degrees"
            className="w-7 h-7 rounded-lg bg-[#272727] hover:bg-[#333333] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Direct Trash Click (Alternative to swipe) */}
          <button
            onClick={() => onRemove(index)}
            title="Remove (or swipe left)"
            aria-label="Remove photo"
            className="w-7 h-7 rounded-lg bg-[#272727] hover:bg-[#333333] text-zinc-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </Reorder.Item>
  );
};

export const ImageList: React.FC<ImageListProps> = ({
  images,
  onReorder,
  onRotate,
  onRemove,
  onReplace,
  onClearAll,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const triggerReplace = (index: number) => {
    setReplaceIndex(index);
    replaceInputRef.current?.click();
  };

  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && replaceIndex !== null) {
      onReplace(replaceIndex, e.target.files[0]);
      e.target.value = '';
      setReplaceIndex(null);
    }
  };

  return (
    <div className="w-full bg-[#272727] rounded-3xl p-4 border border-[#383838] transition-all">
      {/* Hidden file input for single image replacement */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceFileChange}
      />

      {/* Header bar that toggles collapse/expand */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
          aria-expanded={isExpanded}
        >
          <div className="w-8 h-8 rounded-xl bg-[#141414] border border-[#383838] flex items-center justify-center text-zinc-300 shrink-0">
            <ImageIcon className="w-4 h-4 text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white tracking-wide whitespace-nowrap">
                Photo Queue ({images.length})
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-[#141414] px-1.5 py-0.2 rounded-md border border-[#383838]">
                {isExpanded ? 'Drag to order' : 'Collapsed'}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              {isExpanded ? 'Grip handle to reorder • Slide left to delete' : 'Tap to expand queue'}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {isExpanded && (
            <button
              onClick={onClearAll}
              className="text-xs font-medium text-zinc-400 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-[#141414] transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] border border-[#383838] flex items-center justify-center text-zinc-300 transition-colors cursor-pointer"
            aria-label={isExpanded ? 'Collapse queue' : 'Expand queue'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsed Horizontal Strip with Soft Edge Left & Right Fades */}
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          className="relative mt-3 pt-3 border-t border-[#383838] cursor-pointer group"
        >
          {/* Soft Left and Right Gradient Fades */}
          <div className="pointer-events-none absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-[#272727] via-[#272727]/80 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-[#272727] via-[#272727]/80 to-transparent z-10" />

          {/* Smooth Horizontal Scrollable Row */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-2 no-scrollbar">
            {images.map((img, i) => (
              <div
                key={img.id}
                className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#141414] border border-[#383838] shrink-0 transition-transform group-hover:scale-105"
              >
                <img
                  src={img.dataUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ transform: `rotate(${img.rotation}deg)` }}
                />
                <span className="absolute bottom-0 right-0 bg-black/75 px-1 text-[8px] font-mono text-zinc-300 rounded-tl-sm">
                  #{i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Animated Reorderable List */}
      {isExpanded && (
        <div className="mt-3.5 pt-3 border-t border-[#383838]">
          <Reorder.Group
            axis="y"
            values={images}
            onReorder={onReorder}
            className="space-y-2 overflow-hidden"
          >
            {images.map((image, idx) => (
              <ImageRow
                key={image.id}
                image={image}
                index={idx}
                onRotate={onRotate}
                onRemove={onRemove}
                onTriggerReplace={triggerReplace}
              />
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
};

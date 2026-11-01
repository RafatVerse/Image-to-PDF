import React, { useState } from 'react';
import {
  GripVertical,
  RotateCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { UploadedImage } from '../types';

interface ImageListProps {
  images: UploadedImage[];
  onReorder: (startIndex: number, endIndex: number) => void;
  onRotate: (index: number) => void;
  onRemove: (index: number) => void;
  onClearAll: () => void;
}

export const ImageList: React.FC<ImageListProps> = ({
  images,
  onReorder,
  onRotate,
  onRemove,
  onClearAll,
}) => {
  // Collapsed by default as requested: "select kora image er list ta collupsed thakbe"
  const [isExpanded, setIsExpanded] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onReorder(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="w-full bg-[#272727] rounded-3xl p-4 border border-[#383838] transition-all">
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
              <span className="text-xs font-bold text-white tracking-wide truncate">
                Photo Queue ({images.length})
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-[#141414] px-1.5 py-0.2 rounded-md border border-[#383838]">
                {isExpanded ? 'Drag to order' : 'Collapsed'}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate">
              {isExpanded ? 'Drag to rearrange A4 sequence' : 'Tap to expand & reorder'}
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

      {/* Collapsed Preview Strip (when not expanded) */}
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          className="mt-3 pt-3 border-t border-[#383838] flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            {images.slice(0, 6).map((img, i) => (
              <div
                key={img.id}
                className="w-8 h-8 rounded-lg overflow-hidden bg-[#141414] border border-[#383838] shrink-0"
              >
                <img
                  src={img.dataUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ transform: `rotate(${img.rotation}deg)` }}
                />
              </div>
            ))}
            {images.length > 6 && (
              <span className="text-[11px] font-mono text-zinc-400 px-1">
                +{images.length - 6}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-purple-400 group-hover:text-purple-300">
            Expand Queue &rarr;
          </span>
        </div>
      )}

      {/* Expanded Drag and Drop List */}
      {isExpanded && (
        <div className="mt-3.5 pt-3 border-t border-[#383838] space-y-2">
          {images.map((image, idx) => {
            const isDragging = draggedIndex === idx;
            const isOver = dragOverIndex === idx && draggedIndex !== idx;

            return (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`bg-[#141414] rounded-2xl p-2.5 sm:p-3 border transition-all flex items-center gap-3 cursor-grab active:cursor-grabbing ${
                  isDragging
                    ? 'opacity-40 border-purple-500 scale-[0.98]'
                    : isOver
                    ? 'border-purple-400 bg-[#1a1a1a]'
                    : 'border-[#2d2d2d] hover:border-[#404040]'
                }`}
              >
                {/* Drag Handle */}
                <div className="text-zinc-500 hover:text-zinc-300 shrink-0">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Sequence Number */}
                <span className="text-xs font-mono font-bold text-zinc-400 w-5 shrink-0 text-center">
                  #{idx + 1}
                </span>

                {/* Thumbnail */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black shrink-0 border border-[#383838]">
                  <img
                    src={image.dataUrl}
                    alt={image.name}
                    className="w-full h-full object-cover transition-transform duration-200"
                    style={{ transform: `rotate(${image.rotation}deg)` }}
                  />
                </div>

                {/* Metadata */}
                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-xs font-medium text-zinc-100 truncate">
                    {image.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-zinc-400">
                    <span className="font-mono">{image.width}×{image.height}</span>
                    <span>•</span>
                    <span className="font-mono">{image.sizeFormatted}</span>
                  </div>
                </div>

                {/* Action buttons inside #141414 */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotate(idx);
                    }}
                    title="Rotate 90°"
                    className="w-7 h-7 rounded-lg bg-[#272727] hover:bg-[#333333] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(idx);
                    }}
                    title="Remove"
                    className="w-7 h-7 rounded-lg bg-[#272727] hover:bg-[#333333] text-zinc-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

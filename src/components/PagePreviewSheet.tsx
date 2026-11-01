import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Maximize2,
  SlidersHorizontal,
  Layers,
  FileCheck,
} from 'lucide-react';
import { CalculatedPage, LayoutMode, MarginSize, Orientation, PdfSettings, UploadedImage } from '../types';

interface PagePreviewSheetProps {
  images: UploadedImage[];
  pages: CalculatedPage[];
  settings: PdfSettings;
  onUpdateSettings: (newSettings: Partial<PdfSettings>) => void;
}

export const PagePreviewSheet: React.FC<PagePreviewSheetProps> = ({
  images,
  pages,
  settings,
  onUpdateSettings,
}) => {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (pages.length === 0) return null;

  const currentPage = pages[Math.min(activePageIndex, pages.length - 1)] || pages[0];
  const isLandscape = settings.orientation === 'landscape';

  const layoutOptions: { id: LayoutMode; label: string; sub: string }[] = [
    { id: 'auto', label: 'স্মার্ট অটো কোলাজ', sub: 'সেরা ব্যালেন্স' },
    { id: 'grid2', label: '২টি প্রতি পেজ', sub: 'স্প্লিট ভিউ' },
    { id: 'grid4', label: '৪টি গ্রিড', sub: '২x২ গ্রিড' },
    { id: 'grid6', label: '৬টি গ্রিড', sub: '২x৩ গ্রিড' },
    { id: 'single', label: '১টি ফুল পেজ', sub: 'একক পেজ' },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Layout Mode Selector Pills */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <LayoutGrid className="w-4 h-4 text-blue-600" />
            <span>পেজ লেআউট স্টাইল</span>
          </label>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            মোট {pages.length}টি A4 পেজ
          </span>
        </div>

        {/* Featured Smart Auto Collage Button */}
        <button
          onClick={() => onUpdateSettings({ layoutMode: 'auto' })}
          className={`w-full mb-2 py-2.5 px-3 rounded-xl text-left transition-all border flex items-center justify-between ${
            settings.layoutMode === 'auto'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
              : 'bg-blue-50/70 hover:bg-blue-100/70 text-slate-800 border-blue-200'
          }`}
        >
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>✨ স্মার্ট অটো কোলাজ (সেরা ফিট)</span>
            </div>
            <p
              className={`text-[10px] mt-0.5 ${
                settings.layoutMode === 'auto' ? 'text-blue-100' : 'text-slate-500'
              }`}
            >
              ছবির অনুপাত মেপে স্বয়ংক্রিয়ভাবে একটি পেজে মানানসই সর্বোচ্চ ছবি রাখে
            </p>
          </div>
          {settings.layoutMode === 'auto' && (
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
              সক্রিয়
            </span>
          )}
        </button>

        {/* 2x2 Grid for Other 4 Presets */}
        <div className="grid grid-cols-2 gap-1.5">
          {layoutOptions
            .filter((opt) => opt.id !== 'auto')
            .map((opt) => {
              const isSelected = settings.layoutMode === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onUpdateSettings({ layoutMode: opt.id })}
                  className={`py-2 px-2.5 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{opt.label}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      isSelected ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {opt.sub}
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* A4 Paper Live Viewport */}
      <div className="bg-slate-900/90 rounded-3xl p-4 sm:p-6 shadow-inner text-white flex flex-col items-center">
        {/* Pagination & controls bar */}
        <div className="w-full flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <FileCheck className="w-4 h-4 text-blue-400" />
            <span>A4 লাইভ প্রিভিউ</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
              disabled={activePageIndex === 0}
              aria-label="Previous Page"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-xs bg-slate-800 px-2.5 py-1 rounded-md text-blue-300">
              {activePageIndex + 1} / {pages.length}
            </span>
            <button
              onClick={() => setActivePageIndex((prev) => Math.min(pages.length - 1, prev + 1))}
              disabled={activePageIndex >= pages.length - 1}
              aria-label="Next Page"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Exact A4 Paper Card */}
        <div className="w-full flex justify-center py-2">
          <div
            className="relative bg-white text-slate-900 rounded-sm shadow-2xl transition-all duration-300 overflow-hidden"
            style={{
              width: '100%',
              maxWidth: isLandscape ? '460px' : '340px',
              aspectRatio: isLandscape ? '297 / 210' : '210 / 297',
            }}
          >
            {/* Slots inside this A4 page */}
            {currentPage.slots.map((slot, sIdx) => {
              const img = images[slot.imageIndex];
              if (!img) return null;

              // Compute percent coordinates relative to page dimensions
              const slotLeftPct = (slot.x / currentPage.pageWidth) * 100;
              const slotTopPct = (slot.y / currentPage.pageHeight) * 100;
              const slotWidthPct = (slot.width / currentPage.pageWidth) * 100;
              const slotHeightPct = (slot.height / currentPage.pageHeight) * 100;

              const fitLeftPct = (slot.fittedX / currentPage.pageWidth) * 100;
              const fitTopPct = (slot.fittedY / currentPage.pageHeight) * 100;
              const fitWidthPct = (slot.fittedWidth / currentPage.pageWidth) * 100;
              const fitHeightPct = (slot.fittedHeight / currentPage.pageHeight) * 100;

              return (
                <React.Fragment key={slot.imageId + sIdx}>
                  {/* Slot Frame background if enabled */}
                  {settings.imageBorder && (
                    <div
                      className="absolute border border-slate-200 bg-slate-50/50 pointer-events-none"
                      style={{
                        left: `${slotLeftPct}%`,
                        top: `${slotTopPct}%`,
                        width: `${slotWidthPct}%`,
                        height: `${slotHeightPct}%`,
                      }}
                    />
                  )}

                  {/* Fitted Image */}
                  <div
                    className="absolute overflow-hidden shadow-2xs"
                    style={{
                      left: `${fitLeftPct}%`,
                      top: `${fitTopPct}%`,
                      width: `${fitWidthPct}%`,
                      height: `${fitHeightPct}%`,
                    }}
                  >
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="w-full h-full object-contain"
                      style={{ transform: `rotate(${img.rotation}deg)` }}
                    />
                  </div>

                  {/* Sequence badge */}
                  {settings.showImageIndex && (
                    <div
                      className="absolute z-10 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs"
                      style={{
                        left: `${slotLeftPct + 1}%`,
                        top: `${slotTopPct + 1}%`,
                      }}
                    >
                      {slot.imageIndex + 1}
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Page number footer */}
            {settings.showPageNumbers && (
              <div className="absolute bottom-1.5 inset-x-0 text-center text-[8px] font-medium text-slate-600 pointer-events-none">
                পৃষ্ঠা {activePageIndex + 1} / {pages.length}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Page Switcher Strip (if more than 1 page) */}
        {pages.length > 1 && (
          <div className="w-full flex items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-800 overflow-x-auto pb-1">
            {pages.map((p, pIdx) => (
              <button
                key={p.pageNumber}
                onClick={() => setActivePageIndex(pIdx)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activePageIndex === pIdx
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                পেজ {p.pageNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Settings & Toggles */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-3">
        {/* Orientation & Margin row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Orientation */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">পেজ ওরিয়েন্টেশন</label>
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => onUpdateSettings({ orientation: 'portrait' })}
                className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all ${
                  settings.orientation === 'portrait'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600'
                }`}
              >
                লম্বালম্বি
              </button>
              <button
                onClick={() => onUpdateSettings({ orientation: 'landscape' })}
                className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all ${
                  settings.orientation === 'landscape'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600'
                }`}
              >
                আড়াআড়ি
              </button>
            </div>
          </div>

          {/* Margin */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">মার্জিন ও ফাঁকা জায়গা</label>
            <select
              value={settings.margin}
              onChange={(e) => onUpdateSettings({ margin: e.target.value as MarginSize })}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">নো মার্জিন (০ মিমি)</option>
              <option value="compact">কম্প্যাক্ট (৬ মিমি)</option>
              <option value="normal">নরমাল (১২ মিমি)</option>
              <option value="relaxed">আরামদায়ক (১৮ মিমি)</option>
            </select>
          </div>
        </div>

        {/* Checkbox Toggles */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={settings.showPageNumbers}
              onChange={(e) => onUpdateSettings({ showPageNumbers: e.target.checked })}
              className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>পেজ নম্বর</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={settings.showImageIndex}
              onChange={(e) => onUpdateSettings({ showImageIndex: e.target.checked })}
              className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>ছবি ক্রম নম্বর (#১, #২)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={settings.imageBorder}
              onChange={(e) => onUpdateSettings({ imageBorder: e.target.checked })}
              className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>ছবির ফ্রেম ও বর্ডার</span>
          </label>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Check,
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
  const [zoomScale, setZoomScale] = useState(1);

  if (pages.length === 0) return null;

  const currentPage = pages[Math.min(activePageIndex, pages.length - 1)] || pages[0];
  const isLandscape = settings.orientation === 'landscape';

  const layoutOptions: { id: LayoutMode; label: string; sub: string }[] = [
    { id: 'auto', label: 'Smart Auto Collage', sub: 'Optimal aspect balance' },
    { id: 'grid2', label: '2-Up Split', sub: 'Two per sheet' },
    { id: 'grid4', label: '4-Up Grid', sub: '2×2 grid' },
    { id: 'grid6', label: '6-Up Grid', sub: '2×3 grid' },
    { id: 'grid9', label: '9-Up Grid', sub: '3×3 grid' },
    { id: 'single', label: 'Full Page', sub: '1 photo per sheet' },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Layout Mode Selector (Surface #272727, inner items #141414) */}
      <div className="bg-[#272727] rounded-3xl p-4 border border-[#383838]">
        <div className="flex items-center justify-between mb-3 px-1">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
            <span>Layout Style</span>
          </label>
          <span className="text-[11px] font-mono font-medium text-zinc-400 bg-[#141414] border border-[#383838] px-2 py-0.5 rounded-full">
            {pages.length} A4 {pages.length === 1 ? 'Page' : 'Pages'}
          </span>
        </div>

        {/* Featured Smart Auto Collage (#141414 or purple #7c3aed when active) */}
        <button
          onClick={() => onUpdateSettings({ layoutMode: 'auto' })}
          className={`w-full mb-2 p-3 rounded-2xl text-left transition-all border flex items-center justify-between cursor-pointer ${
            settings.layoutMode === 'auto'
              ? 'bg-[#7c3aed] text-white border-purple-500'
              : 'bg-[#141414] hover:bg-[#1f1f1f] text-zinc-300 border-[#383838]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold flex items-center gap-1.5">
                <span>Smart Auto Collage</span>
                <span className="text-[10px] bg-black/25 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                  Auto Fit
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 ${settings.layoutMode === 'auto' ? 'text-purple-100' : 'text-zinc-400'}`}>
                Dynamically packs photos based on aspect ratio without crowding or empty gaps
              </p>
            </div>
          </div>
          {settings.layoutMode === 'auto' && (
            <div className="w-5 h-5 rounded-full bg-white text-purple-700 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
        </button>

        {/* 2x2 Grid for Other Presets */}
        <div className="grid grid-cols-2 gap-1.5">
          {layoutOptions
            .filter((opt) => opt.id !== 'auto')
            .map((opt) => {
              const isSelected = settings.layoutMode === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onUpdateSettings({ layoutMode: opt.id })}
                  className={`py-2 px-3 rounded-xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#7c3aed] text-white border-purple-500'
                      : 'bg-[#141414] hover:bg-[#1f1f1f] text-zinc-300 border-[#383838]'
                  }`}
                >
                  <div className="text-xs font-semibold leading-tight">{opt.label}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      isSelected ? 'text-purple-200' : 'text-zinc-400'
                    }`}
                  >
                    {opt.sub}
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* A4 Paper Viewport Canvas (#272727 surface, inner background #141414) */}
      <div className="bg-[#272727] rounded-3xl border border-[#383838] p-4 sm:p-6 flex flex-col items-center">
        {/* Viewport Top Bar */}
        <div className="w-full flex items-center justify-between mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-300">A4 Live Preview</span>
            <span className="text-[10px] font-mono text-zinc-400 bg-[#141414] px-2 py-0.5 rounded-md border border-[#383838]">
              {settings.orientation.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-[#141414] border border-[#383838] rounded-xl p-0.5">
              <button
                onClick={() => setZoomScale((s) => Math.max(0.7, s - 0.1))}
                aria-label="Zoom Out"
                className="w-6 h-6 rounded-lg hover:bg-[#272727] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1.5 text-zinc-300">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale((s) => Math.min(1.4, s + 0.1))}
                aria-label="Zoom In"
                className="w-6 h-6 rounded-lg hover:bg-[#272727] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center bg-[#141414] border border-[#383838] rounded-xl p-0.5">
              <button
                onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
                disabled={activePageIndex === 0}
                aria-label="Previous Page"
                className="p-1 rounded-lg hover:bg-[#272727] text-zinc-300 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs px-2 text-zinc-200">
                {activePageIndex + 1} / {pages.length}
              </span>
              <button
                onClick={() => setActivePageIndex((prev) => Math.min(pages.length - 1, prev + 1))}
                disabled={activePageIndex >= pages.length - 1}
                aria-label="Next Page"
                className="p-1 rounded-lg hover:bg-[#272727] text-zinc-300 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* The Clean White A4 Paper inside #141414 well */}
        <div className="w-full bg-[#141414] rounded-2xl p-4 sm:p-6 border border-[#383838] flex justify-center overflow-hidden">
          <div
            className="relative bg-white text-zinc-900 rounded-xs shadow-md transition-transform duration-200 overflow-hidden"
            style={{
              width: '100%',
              maxWidth: isLandscape ? '500px' : '340px',
              aspectRatio: isLandscape ? '297 / 210' : '210 / 297',
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center',
            }}
          >
            {/* Slots inside this A4 page */}
            {currentPage.slots.map((slot, sIdx) => {
              const img = images[slot.imageIndex];
              if (!img) return null;

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
                  {/* Subtle slot boundary */}
                  {settings.imageBorder && (
                    <div
                      className="absolute border border-zinc-200 bg-zinc-50 pointer-events-none"
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
                    className="absolute overflow-hidden"
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

                  {/* Clean index badge */}
                  {settings.showImageIndex && (
                    <div
                      className="absolute z-10 w-4 h-4 rounded-full bg-[#7c3aed] text-white text-[9px] font-bold flex items-center justify-center shadow-xs"
                      style={{
                        left: `${slotLeftPct + 1.2}%`,
                        top: `${slotTopPct + 1.2}%`,
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
              <div className="absolute bottom-1.5 inset-x-0 text-center text-[8px] font-medium text-zinc-400 pointer-events-none">
                Page {activePageIndex + 1} of {pages.length}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Page Switcher Strip (if more than 1 page) */}
        {pages.length > 1 && (
          <div className="w-full flex items-center justify-center gap-2 mt-4 pt-3 border-t border-[#383838] overflow-x-auto pb-1">
            {pages.map((p, pIdx) => (
              <button
                key={p.pageNumber}
                onClick={() => setActivePageIndex(pIdx)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activePageIndex === pIdx
                    ? 'bg-[#7c3aed] text-white'
                    : 'bg-[#141414] text-zinc-400 hover:text-white border border-[#383838]'
                }`}
              >
                Page {p.pageNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Settings Bar (#272727 surface, inputs #141414) */}
      <div className="bg-[#272727] rounded-3xl border border-[#383838] p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Orientation */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1 uppercase tracking-wider">
              Orientation
            </label>
            <div className="flex bg-[#141414] p-1 rounded-xl border border-[#383838]">
              <button
                onClick={() => onUpdateSettings({ orientation: 'portrait' })}
                className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  settings.orientation === 'portrait'
                    ? 'bg-[#272727] text-white font-semibold'
                    : 'text-zinc-400'
                }`}
              >
                Portrait
              </button>
              <button
                onClick={() => onUpdateSettings({ orientation: 'landscape' })}
                className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  settings.orientation === 'landscape'
                    ? 'bg-[#272727] text-white font-semibold'
                    : 'text-zinc-400'
                }`}
              >
                Landscape
              </button>
            </div>
          </div>

          {/* Margins */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1 uppercase tracking-wider">
              Sheet Margins
            </label>
            <select
              value={settings.margin}
              onChange={(e) => onUpdateSettings({ margin: e.target.value as MarginSize })}
              className="w-full bg-[#141414] border border-[#383838] rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              <option value="none">No Margin (0 mm)</option>
              <option value="compact">Compact (6 mm)</option>
              <option value="normal">Standard (12 mm)</option>
              <option value="relaxed">Relaxed (18 mm)</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-2 border-t border-[#383838] flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-medium">
            <input
              type="checkbox"
              checked={settings.showPageNumbers}
              onChange={(e) => onUpdateSettings({ showPageNumbers: e.target.checked })}
              className="rounded-md border-[#383838] bg-[#141414] text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
            />
            <span>Page Numbers</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-medium">
            <input
              type="checkbox"
              checked={settings.showImageIndex}
              onChange={(e) => onUpdateSettings({ showImageIndex: e.target.checked })}
              className="rounded-md border-[#383838] bg-[#141414] text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
            />
            <span>Index Badges (#1, #2)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-medium">
            <input
              type="checkbox"
              checked={settings.imageBorder}
              onChange={(e) => onUpdateSettings({ imageBorder: e.target.checked })}
              className="rounded-md border-[#383838] bg-[#141414] text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
            />
            <span>Photo Frame Borders</span>
          </label>
        </div>
      </div>
    </div>
  );
};

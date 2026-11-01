/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { ImageUploadBox } from './components/ImageUploadBox';
import { ImageList } from './components/ImageList';
import { PagePreviewSheet } from './components/PagePreviewSheet';
import { BottomActionBar } from './components/BottomActionBar';
import { DownloadModal } from './components/DownloadModal';
import { UploadedImage, PdfSettings } from './types';
import { calculatePages } from './utils/collageEngine';
import { generateSampleImages } from './utils/sampleImages';
import { generatePdfBlob, GenerationProgress } from './utils/pdfGenerator';
import {
  Sparkles,
  Download,
  Plus,
  Layers,
} from 'lucide-react';

export default function App() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [step, setStep] = useState<'edit' | 'preview'>('edit');
  const [settings, setSettings] = useState<PdfSettings>({
    layoutMode: 'auto',
    orientation: 'portrait',
    margin: 'normal',
    imageFit: 'contain',
    showPageNumbers: true,
    showImageIndex: true,
    imageBorder: true,
    imageRounded: false,
    quality: 'high',
    pdfTitle: 'Smart-Collage-A4',
  });

  // PDF Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hidden file input trigger
  const filePickerRef = useRef<HTMLInputElement>(null);

  // Calculate pages reactively
  const calculatedPages = useMemo(() => {
    return calculatePages(images, settings);
  }, [images, settings]);

  // Read files and compute dimensions
  const handleFilesSelected = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    fileArray.forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const sizeKb = file.size / 1024;
          const sizeFormatted =
            sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.round(sizeKb)} KB`;

          const newImage: UploadedImage = {
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            dataUrl,
            width: img.naturalWidth || 800,
            height: img.naturalHeight || 600,
            aspect: (img.naturalWidth || 800) / (img.naturalHeight || 600),
            rotation: 0,
            sizeBytes: file.size,
            sizeFormatted,
          };

          setImages((prev) => [...prev, newImage]);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  // Sample Images Loader
  const handleLoadSamples = () => {
    const samples = generateSampleImages();
    setImages(samples);
  };

  // Drag and drop reordering
  const handleReorder = (startIndex: number, endIndex: number) => {
    setImages((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  // Rotate Image by 90 degrees
  const handleRotate = (index: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const target = copy[index];
      const newRotation = (target.rotation + 90) % 360;
      const newAspect = 1 / target.aspect;
      copy[index] = {
        ...target,
        rotation: newRotation,
        aspect: newAspect,
      };
      return copy;
    });
  };

  // Remove individual image
  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all images
  const handleClearAll = () => {
    setImages([]);
    setGeneratedBlob(null);
    setPdfUrl(null);
    setStep('edit');
  };

  // Trigger PDF Generation
  const handleGeneratePdf = async () => {
    if (images.length === 0 || calculatedPages.length === 0) return;

    setIsGenerating(true);
    setIsModalOpen(true);
    setProgress({
      currentPage: 1,
      totalPages: calculatedPages.length,
      percent: 10,
      statusText: 'Formatting A4 collage pages...',
    });

    try {
      const result = await generatePdfBlob(images, calculatedPages, settings, (p) => {
        setProgress(p);
      });
      setGeneratedBlob(result.blob);
      setPdfUrl(result.url);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans antialiased pb-28">
      {/* Hidden file input */}
      <input
        ref={filePickerRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFilesSelected(e.target.files);
          e.target.value = '';
        }}
      />

      {/* NO Header bar as requested: "header thakbe na, ekdom simple er moddhe UI ta ekdom premium ar professional productive app er moto shajabe" */}
      {/* Clean Minimalist Top Utility Ribbon */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
            <span>CollagePDF</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-400 bg-[#141414] border border-[#272727] px-2 py-0.5 rounded-md">
            A4 SMART
          </span>
        </div>

        <div className="flex items-center gap-2">
          {images.length === 0 ? (
            <button
              onClick={handleLoadSamples}
              className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#272727] hover:bg-[#333333] border border-[#383838] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Load 4 Samples</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadSamples}
                className="hidden sm:inline-block text-xs font-medium text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                Reset Samples
              </button>
              <button
                onClick={() => filePickerRef.current?.click()}
                className="text-xs font-medium bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Add Photos</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Responsive Workspace */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-2">
        {/* Mobile Switcher (< lg) */}
        {images.length > 0 && (
          <div className="lg:hidden max-w-md mx-auto mb-4 flex bg-[#272727] border border-[#383838] p-1 rounded-2xl">
            <button
              onClick={() => setStep('edit')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                step === 'edit'
                  ? 'bg-[#141414] text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Queue ({images.length})
            </button>

            <button
              onClick={() => setStep('preview')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                step === 'preview'
                  ? 'bg-[#141414] text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              A4 Preview ({calculatedPages.length})
            </button>
          </div>
        )}

        {/* Content dispatcher */}
        {images.length === 0 ? (
          /* Empty State: Focused minimalist dropzone with plenty of whitespace */
          <div className="max-w-md mx-auto space-y-4 pt-6">
            <ImageUploadBox
              onFilesSelected={handleFilesSelected}
              onLoadSamples={handleLoadSamples}
              imageCount={images.length}
            />

            {/* Surface Container #272727 */}
            <div className="p-5 rounded-3xl bg-[#272727] border border-[#383838] space-y-3">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Minimalist A4 Packing</span>
              </h4>
              <ul className="text-xs text-zinc-400 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>
                    <strong className="text-zinc-200">Zero Aspect Distortion:</strong> Calculates natural width and height to place images neatly onto A4 sheets.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>
                    <strong className="text-zinc-200">Drag & Drop Order:</strong> Images are converted to PDF strictly matching your custom sequence.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>
                    <strong className="text-zinc-200">Instant PDF Download:</strong> Compiles all pages in-browser without any server upload lag.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* Active State: Desktop Dual-Pane (lg:) or Mobile Steps (< lg) */
          <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start">
            {/* Left Column: Upload Dropzone & Collapsed/Expandable Drag-Drop Queue */}
            <div
              className={`space-y-4 lg:col-span-5 ${
                step === 'preview' ? 'hidden lg:block' : 'block max-w-md mx-auto lg:max-w-none'
              }`}
            >
              <ImageUploadBox
                onFilesSelected={handleFilesSelected}
                onLoadSamples={handleLoadSamples}
                imageCount={images.length}
              />

              {/* Collapsed by default, expandable drag-and-drop queue */}
              <ImageList
                images={images}
                onReorder={handleReorder}
                onRotate={handleRotate}
                onRemove={handleRemove}
                onClearAll={handleClearAll}
              />
            </div>

            {/* Right Column: Live A4 Preview & Settings */}
            <div
              className={`space-y-4 lg:col-span-7 ${
                step === 'edit' ? 'hidden lg:block' : 'block max-w-md mx-auto lg:max-w-none'
              }`}
            >
              <PagePreviewSheet
                images={images}
                pages={calculatedPages}
                settings={settings}
                onUpdateSettings={(newVals) => setSettings((s) => ({ ...s, ...newVals }))}
              />

              {/* Desktop Direct Export Strip */}
              <div className="hidden lg:flex items-center justify-between p-4 rounded-3xl bg-[#272727] border border-[#383838]">
                <div>
                  <p className="text-xs font-semibold text-white">
                    {images.length} photos ready &rarr; {calculatedPages.length} A4 {calculatedPages.length === 1 ? 'page' : 'pages'}
                  </p>
                  <p className="text-[11px] text-zinc-400">High-resolution client-side export</p>
                </div>

                <button
                  onClick={handleGeneratePdf}
                  disabled={isGenerating}
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-40 active:scale-95 text-white font-medium text-xs sm:text-sm py-2 px-5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 stroke-[2]" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Action Bar (Mobile Only) */}
      <div className="lg:hidden">
        <BottomActionBar
          step={step}
          imageCount={images.length}
          pageCount={calculatedPages.length}
          onOpenPicker={() => filePickerRef.current?.click()}
          onGoToPreview={() => setStep('preview')}
          onBackToEdit={() => setStep('edit')}
          onDownloadPdf={handleGeneratePdf}
          isGenerating={isGenerating}
        />
      </div>

      {/* Download & Progress Modal */}
      <DownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        progress={progress}
        generatedBlob={generatedBlob}
        pdfUrl={pdfUrl}
        pageCount={calculatedPages.length}
        imageCount={images.length}
      />
    </div>
  );
}

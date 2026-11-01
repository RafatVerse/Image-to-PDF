/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
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
  FileText,
  Sliders,
  CheckCircle2,
  Sparkles,
  Info,
  ArrowRight,
  Plus,
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
    pdfTitle: 'Smart-Collage',
  });

  // PDF Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hidden file input trigger for bottom bar "+" button
  const filePickerRef = useRef<HTMLInputElement>(null);

  // Calculate pages reactively whenever images or settings change
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

  // Reorder Images
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    setImages((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Rotate Image by 90 degrees
  const handleRotate = (index: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const target = copy[index];
      const newRotation = (target.rotation + 90) % 360;
      // Invert aspect on 90 or 270 deg rotation
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
      statusText: 'পিডিএফ সাজানো শুরু হচ্ছে...',
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
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased pb-28 selection:bg-blue-500 selection:text-white">
      {/* Hidden file input for global trigger */}
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

      {/* Top Navbar */}
      <Navbar
        onLoadSamples={handleLoadSamples}
        onOpenPicker={() => filePickerRef.current?.click()}
        imageCount={images.length}
      />

      {/* Mobile container centered */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Step Indicator Tabs */}
        {images.length > 0 && (
          <div className="flex bg-slate-200/80 p-1 rounded-2xl">
            <button
              onClick={() => setStep('edit')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                step === 'edit'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center">
                ১
              </span>
              <span>ছবি সাজান ({images.length})</span>
            </button>

            <button
              onClick={() => setStep('preview')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                step === 'preview'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center">
                ২
              </span>
              <span>A4 পেজ প্রিভিউ ({calculatedPages.length})</span>
            </button>
          </div>
        )}

        {/* View content based on active step */}
        {step === 'edit' ? (
          <div className="space-y-4">
            {/* Upload Box with big Plus Icon */}
            <ImageUploadBox
              onFilesSelected={handleFilesSelected}
              onLoadSamples={handleLoadSamples}
              imageCount={images.length}
            />

            {/* Selected Images List */}
            {images.length > 0 && (
              <ImageList
                images={images}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onRotate={handleRotate}
                onRemove={handleRemove}
                onClearAll={handleClearAll}
              />
            )}

            {/* Helper tips when no images are chosen */}
            {images.length === 0 && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>স্মার্ট ফিচারের সুবিধা সমূহ:</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed pl-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>
                      <strong>অটো স্পেস মেজার:</strong> একটি পেজে একটি ছবির বদলে পরিমাপ অনুযায়ী
                      সর্বোচ্চ সংখ্যক ছবি ফিট করা হয়।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>
                      <strong>গাদাগাদি বা ফাঁকা নয়:</strong> ল্যান্ডস্কেপ ও পোর্ট্রেট অনুপাত মিলিয়ে
                      ব্যালেন্সড গ্রিড তৈরি হয়।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>
                      <strong>এক ক্লিকে ডাউনলোড:</strong> সবগুলো পেজ একত্রিত হয়ে একক হাই-কোয়ালিটি
                      A4 পিডিএফ হিসেবে ডাউনলোড হবে।
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Page Preview & Layout Adjustment */
          <div className="space-y-4">
            <PagePreviewSheet
              images={images}
              pages={calculatedPages}
              settings={settings}
              onUpdateSettings={(newVals) => setSettings((s) => ({ ...s, ...newVals }))}
            />
          </div>
        )}
      </main>

      {/* Sticky Bottom Action Bar */}
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

      {/* Download / Progress Modal */}
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

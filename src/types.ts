export type LayoutMode = 'auto' | 'grid2' | 'grid4' | 'grid6' | 'single';

export type Orientation = 'portrait' | 'landscape';

export type MarginSize = 'none' | 'compact' | 'normal' | 'relaxed';

export type ImageFit = 'contain' | 'cover';

export type PdfQuality = 'high' | 'medium' | 'low';

export interface UploadedImage {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  aspect: number; // width / height
  rotation: number; // 0, 90, 180, 270
  sizeBytes: number;
  sizeFormatted: string;
}

export interface PageSlot {
  x: number; // in mm
  y: number; // in mm
  width: number; // in mm
  height: number; // in mm
  imageIndex: number; // index in images array
  imageId: string;
  // Computed fitted dimensions for image inside slot
  fittedX: number;
  fittedY: number;
  fittedWidth: number;
  fittedHeight: number;
}

export interface CalculatedPage {
  pageNumber: number;
  orientation: Orientation;
  pageWidth: number; // in mm (e.g. 210 for A4 portrait)
  pageHeight: number; // in mm (e.g. 297 for A4 portrait)
  slots: PageSlot[];
}

export interface PdfSettings {
  layoutMode: LayoutMode;
  orientation: Orientation;
  margin: MarginSize;
  imageFit: ImageFit;
  showPageNumbers: boolean;
  showImageIndex: boolean;
  imageBorder: boolean;
  imageRounded: boolean;
  quality: PdfQuality;
  pdfTitle: string;
}

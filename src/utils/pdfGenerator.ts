import { jsPDF } from 'jspdf';
import { CalculatedPage, PdfSettings, UploadedImage } from '../types';

export interface GenerationProgress {
  currentPage: number;
  totalPages: number;
  percent: number;
  statusText: string;
}

/**
 * Compresses an image dataUrl via temporary canvas if needed
 */
async function prepareImageDataUrl(
  dataUrl: string,
  quality: 'high' | 'medium' | 'low',
  rotation: number
): Promise<string> {
  if (rotation === 0 && quality === 'high') {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const isRotated90or270 = rotation === 90 || rotation === 270;
      let targetW = isRotated90or270 ? img.height : img.width;
      let targetH = isRotated90or270 ? img.width : img.height;

      // Scale down for medium or low quality
      if (quality === 'medium' && (targetW > 1600 || targetH > 1600)) {
        const factor = 1600 / Math.max(targetW, targetH);
        targetW = Math.round(targetW * factor);
        targetH = Math.round(targetH * factor);
      } else if (quality === 'low' && (targetW > 1000 || targetH > 1000)) {
        const factor = 1000 / Math.max(targetW, targetH);
        targetW = Math.round(targetW * factor);
        targetH = Math.round(targetH * factor);
      }

      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.save();
      ctx.translate(targetW / 2, targetH / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      const drawW = isRotated90or270 ? targetH : targetW;
      const drawH = isRotated90or270 ? targetW : targetH;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const q = quality === 'high' ? 0.95 : quality === 'medium' ? 0.8 : 0.65;
      resolve(canvas.toDataURL('image/jpeg', q));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Generates the complete A4 PDF and returns the Blob
 */
export async function generatePdfBlob(
  images: UploadedImage[],
  pages: CalculatedPage[],
  settings: PdfSettings,
  onProgress?: (progress: GenerationProgress) => void
): Promise<{ blob: Blob; url: string; sizeBytes: number }> {
  if (pages.length === 0 || images.length === 0) {
    throw new Error('পিডিএফ তৈরির জন্য কোনো ছবি পাওয়া যায়নি।');
  }

  const doc = new jsPDF({
    orientation: settings.orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const totalPages = pages.length;

  for (let pIdx = 0; pIdx < totalPages; pIdx++) {
    const page = pages[pIdx];

    if (pIdx > 0) {
      doc.addPage('a4', page.orientation);
    }

    if (onProgress) {
      onProgress({
        currentPage: pIdx + 1,
        totalPages,
        percent: Math.round(((pIdx + 0.3) / totalPages) * 100),
        statusText: `পেজ ${pIdx + 1} / ${totalPages} প্রসেস হচ্ছে...`,
      });
    }

    // Draw slots and images
    for (const slot of page.slots) {
      const img = images[slot.imageIndex];
      if (!img) continue;

      // Optional light frame background/border around slot
      if (settings.imageBorder) {
        doc.setDrawColor(226, 232, 240); // #e2e8f0
        doc.setFillColor(248, 250, 252); // #f8fafc
        doc.setLineWidth(0.25);
        doc.rect(slot.x, slot.y, slot.width, slot.height, 'FD');
      }

      // Prepare image data URL (handles rotation and compression)
      const processedUrl = await prepareImageDataUrl(img.dataUrl, settings.quality, img.rotation);

      try {
        // Add image to PDF at calculated fitted coordinates
        doc.addImage(
          processedUrl,
          'JPEG',
          slot.fittedX,
          slot.fittedY,
          slot.fittedWidth,
          slot.fittedHeight,
          undefined,
          'FAST'
        );
      } catch (err) {
        console.warn('Fallback adding image to PDF:', err);
        try {
          doc.addImage(
            img.dataUrl,
            'PNG',
            slot.fittedX,
            slot.fittedY,
            slot.fittedWidth,
            slot.fittedHeight
          );
        } catch (innerErr) {
          console.error('Failed to embed image:', innerErr);
        }
      }

      // Optional badge: Image sequence number
      if (settings.showImageIndex) {
        doc.setFillColor(37, 99, 235); // primary blue
        doc.circle(slot.x + 3.5, slot.y + 3.5, 2.5, 'F');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text(String(slot.imageIndex + 1), slot.x + 3.5, slot.y + 4.2, { align: 'center' });
      }
    }

    // Optional page number in footer
    if (settings.showPageNumbers) {
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      const footerY = page.pageHeight - 6;
      doc.text(
        `পৃষ্ঠা ${pIdx + 1} / ${totalPages}`,
        page.pageWidth / 2,
        footerY,
        { align: 'center' }
      );
    }

    if (onProgress) {
      onProgress({
        currentPage: pIdx + 1,
        totalPages,
        percent: Math.round(((pIdx + 1) / totalPages) * 100),
        statusText: `পেজ ${pIdx + 1} সম্পূর্ণ!`,
      });
    }
  }

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  return { blob, url, sizeBytes: blob.size };
}

/**
 * Triggers native browser download for a Blob
 */
export function triggerPdfDownload(blob: Blob, filename = 'collage-images.pdf') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

import {
  CalculatedPage,
  ImageFit,
  LayoutMode,
  MarginSize,
  Orientation,
  PageSlot,
  PdfSettings,
  UploadedImage,
} from '../types';

export const A4_PORTRAIT_WIDTH_MM = 210;
export const A4_PORTRAIT_HEIGHT_MM = 297;

export const MARGIN_VALUES_MM: Record<MarginSize, number> = {
  none: 0,
  compact: 6,
  normal: 12,
  relaxed: 18,
};

export const GAP_VALUES_MM: Record<MarginSize, number> = {
  none: 0,
  compact: 3,
  normal: 5,
  relaxed: 7,
};

/**
 * Calculates effective page dimensions in mm based on orientation
 */
export function getPageDimensions(orientation: Orientation): { width: number; height: number } {
  if (orientation === 'landscape') {
    return { width: A4_PORTRAIT_HEIGHT_MM, height: A4_PORTRAIT_WIDTH_MM };
  }
  return { width: A4_PORTRAIT_WIDTH_MM, height: A4_PORTRAIT_HEIGHT_MM };
}

/**
 * Calculates fitted image coordinates inside a target bounding box
 */
export function computeImageFit(
  slotX: number,
  slotY: number,
  slotW: number,
  slotH: number,
  imageAspect: number,
  fit: ImageFit = 'contain'
): { fittedX: number; fittedY: number; fittedWidth: number; fittedHeight: number } {
  if (slotW <= 0 || slotH <= 0 || !imageAspect || imageAspect <= 0) {
    return { fittedX: slotX, fittedY: slotY, fittedWidth: slotW, fittedHeight: slotH };
  }

  if (fit === 'cover') {
    return { fittedX: slotX, fittedY: slotY, fittedWidth: slotW, fittedHeight: slotH };
  }

  const slotAspect = slotW / slotH;
  let fittedWidth = slotW;
  let fittedHeight = slotH;

  if (imageAspect > slotAspect) {
    // Image is wider than slot: constrain width, center vertically
    fittedWidth = slotW;
    fittedHeight = slotW / imageAspect;
  } else {
    // Image is taller than slot: constrain height, center horizontally
    fittedHeight = slotH;
    fittedWidth = slotH * imageAspect;
  }

  const fittedX = slotX + (slotW - fittedWidth) / 2;
  const fittedY = slotY + (slotH - fittedHeight) / 2;

  return { fittedX, fittedY, fittedWidth, fittedHeight };
}

/**
 * Computes how many images should go onto each page in 'auto' mode
 * to avoid leaving awkward lone images while keeping pages cleanly balanced.
 */
export function determineAutoPageGroupSizes(images: UploadedImage[]): number[] {
  const total = images.length;
  if (total === 0) return [];
  if (total <= 4) return [total];

  const groupSizes: number[] = [];
  let remaining = total;
  let index = 0;

  while (remaining > 0) {
    if (remaining === 1) {
      groupSizes.push(1);
      break;
    }
    if (remaining === 2) {
      groupSizes.push(2);
      break;
    }
    if (remaining === 3) {
      groupSizes.push(3);
      break;
    }
    if (remaining === 4) {
      groupSizes.push(4);
      break;
    }
    if (remaining === 5) {
      // Avoid 4 + 1; balance into 3 + 2
      groupSizes.push(3);
      groupSizes.push(2);
      break;
    }
    if (remaining === 6) {
      // 3 + 3 or 4 + 2 or 6
      // If user has 6 portrait/compact, 6-up or 3+3 works nicely
      groupSizes.push(3);
      groupSizes.push(3);
      break;
    }
    if (remaining === 7) {
      // 4 + 3
      groupSizes.push(4);
      remaining -= 4;
      index += 4;
      continue;
    }

    // Default to 4 for larger sets, then adjust remainder
    groupSizes.push(4);
    remaining -= 4;
    index += 4;
  }

  return groupSizes;
}

/**
 * Generates slots for a page given a specific count of images
 */
function createSlotsForPage(
  pageImages: UploadedImage[],
  globalStartIndex: number,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  gap: number,
  layoutMode: LayoutMode,
  imageFit: ImageFit
): PageSlot[] {
  const count = pageImages.length;
  if (count === 0) return [];

  const availW = Math.max(10, pageWidth - 2 * margin);
  const availH = Math.max(10, pageHeight - 2 * margin);
  const startX = margin;
  const startY = margin;

  const rawSlots: { x: number; y: number; width: number; height: number; imgIdx: number }[] = [];

  // Layout dispatcher based on count and layoutMode
  if (count === 1 || layoutMode === 'single') {
    // 1 image full printable area
    rawSlots.push({ x: startX, y: startY, width: availW, height: availH, imgIdx: 0 });
  } else if (count === 2 || layoutMode === 'grid2') {
    // 2 images: decide horizontal vs vertical split based on image aspects
    const img1 = pageImages[0];
    const img2 = pageImages[1] || pageImages[0];
    const bothPortrait = img1.aspect < 1.05 && img2.aspect < 1.05;
    const bothLandscape = img1.aspect >= 1.05 && img2.aspect >= 1.05;

    // In portrait A4: 2 columns is great for portrait; 2 rows is great for landscape
    let splitSideBySide = bothPortrait;
    if (!bothPortrait && !bothLandscape) {
      // mixed: default to 2 rows in portrait A4, 2 cols in landscape A4
      splitSideBySide = pageWidth > pageHeight;
    } else if (bothLandscape) {
      splitSideBySide = false;
    }

    if (splitSideBySide) {
      const colW = (availW - gap) / 2;
      rawSlots.push({ x: startX, y: startY, width: colW, height: availH, imgIdx: 0 });
      rawSlots.push({ x: startX + colW + gap, y: startY, width: colW, height: availH, imgIdx: 1 });
    } else {
      const rowH = (availH - gap) / 2;
      rawSlots.push({ x: startX, y: startY, width: availW, height: rowH, imgIdx: 0 });
      rawSlots.push({ x: startX, y: startY + rowH + gap, width: availW, height: rowH, imgIdx: 1 });
    }
  } else if (count === 3) {
    // 3 images: 1 top hero, 2 bottom side-by-side (or vice versa based on aspect)
    const img0 = pageImages[0];
    const img0Landscape = img0.aspect >= 1.1;

    if (img0Landscape) {
      // 1 full top, 2 columns bottom
      const row1H = (availH - gap) * 0.52;
      const row2H = availH - gap - row1H;
      const col2W = (availW - gap) / 2;

      rawSlots.push({ x: startX, y: startY, width: availW, height: row1H, imgIdx: 0 });
      rawSlots.push({ x: startX, y: startY + row1H + gap, width: col2W, height: row2H, imgIdx: 1 });
      rawSlots.push({
        x: startX + col2W + gap,
        y: startY + row1H + gap,
        width: col2W,
        height: row2H,
        imgIdx: 2,
      });
    } else {
      // 2 columns top, 1 full bottom
      const row2H = (availH - gap) * 0.48;
      const row1H = availH - gap - row2H;
      const col1W = (availW - gap) / 2;

      rawSlots.push({ x: startX, y: startY, width: col1W, height: row1H, imgIdx: 0 });
      rawSlots.push({ x: startX + col1W + gap, y: startY, width: col1W, height: row1H, imgIdx: 1 });
      rawSlots.push({ x: startX, y: startY + row1H + gap, width: availW, height: row2H, imgIdx: 2 });
    }
  } else if (count === 4 || layoutMode === 'grid4') {
    // 2x2 grid
    const colW = (availW - gap) / 2;
    const rowH = (availH - gap) / 2;

    for (let i = 0; i < Math.min(4, count); i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      rawSlots.push({
        x: startX + col * (colW + gap),
        y: startY + row * (rowH + gap),
        width: colW,
        height: rowH,
        imgIdx: i,
      });
    }
  } else if (count === 5) {
    // 2 top, 3 bottom
    const row1H = (availH - gap) * 0.5;
    const row2H = (availH - gap) * 0.5;
    const topColW = (availW - gap) / 2;
    const btmColW = (availW - 2 * gap) / 3;

    // Top 2
    rawSlots.push({ x: startX, y: startY, width: topColW, height: row1H, imgIdx: 0 });
    rawSlots.push({ x: startX + topColW + gap, y: startY, width: topColW, height: row1H, imgIdx: 1 });

    // Bottom 3
    for (let c = 0; c < 3; c++) {
      rawSlots.push({
        x: startX + c * (btmColW + gap),
        y: startY + row1H + gap,
        width: btmColW,
        height: row2H,
        imgIdx: 2 + c,
      });
    }
  } else if (layoutMode === 'grid9') {
    // 3 cols x 3 rows = 9-up grid
    const cols = 3;
    const rows = 3;
    const colW = (availW - (cols - 1) * gap) / cols;
    const rowH = (availH - (rows - 1) * gap) / rows;

    for (let i = 0; i < Math.min(9, count); i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      rawSlots.push({
        x: startX + col * (colW + gap),
        y: startY + row * (rowH + gap),
        width: colW,
        height: rowH,
        imgIdx: i,
      });
    }
  } else {
    // 6 or more: 2 cols x 3 rows grid
    const cols = 2;
    const rows = 3;
    const colW = (availW - (cols - 1) * gap) / cols;
    const rowH = (availH - (rows - 1) * gap) / rows;

    for (let i = 0; i < Math.min(6, count); i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      rawSlots.push({
        x: startX + col * (colW + gap),
        y: startY + row * (rowH + gap),
        width: colW,
        height: rowH,
        imgIdx: i,
      });
    }
  }

  // Convert raw slots into PageSlots with computed fitted bounds
  return rawSlots.map((raw) => {
    const img = pageImages[raw.imgIdx];
    const imageIndex = globalStartIndex + raw.imgIdx;
    const fitBounds = computeImageFit(raw.x, raw.y, raw.width, raw.height, img.aspect, imageFit);

    return {
      x: raw.x,
      y: raw.y,
      width: raw.width,
      height: raw.height,
      imageIndex,
      imageId: img.id,
      fittedX: fitBounds.fittedX,
      fittedY: fitBounds.fittedY,
      fittedWidth: fitBounds.fittedWidth,
      fittedHeight: fitBounds.fittedHeight,
    };
  });
}

/**
 * Main layout calculator: converts an array of UploadedImages and PdfSettings into an array of CalculatedPages
 */
export function calculatePages(images: UploadedImage[], settings: PdfSettings): CalculatedPage[] {
  if (!images || images.length === 0) {
    return [];
  }

  const { width: pageWidth, height: pageHeight } = getPageDimensions(settings.orientation);
  const margin = MARGIN_VALUES_MM[settings.margin];
  const gap = GAP_VALUES_MM[settings.margin];

  // Group images into pages according to layoutMode
  let groupSizes: number[] = [];

  if (settings.layoutMode === 'single') {
    groupSizes = images.map(() => 1);
  } else if (settings.layoutMode === 'grid2') {
    let rem = images.length;
    while (rem > 0) {
      const take = Math.min(2, rem);
      groupSizes.push(take);
      rem -= take;
    }
  } else if (settings.layoutMode === 'grid4') {
    let rem = images.length;
    while (rem > 0) {
      const take = Math.min(4, rem);
      groupSizes.push(take);
      rem -= take;
    }
  } else if (settings.layoutMode === 'grid6') {
    let rem = images.length;
    while (rem > 0) {
      const take = Math.min(6, rem);
      groupSizes.push(take);
      rem -= take;
    }
  } else if (settings.layoutMode === 'grid9') {
    let rem = images.length;
    while (rem > 0) {
      const take = Math.min(9, rem);
      groupSizes.push(take);
      rem -= take;
    }
  } else {
    // 'auto' mode: smart dynamic grouping
    groupSizes = determineAutoPageGroupSizes(images);
  }

  const pages: CalculatedPage[] = [];
  let currentIndex = 0;

  groupSizes.forEach((size, pIndex) => {
    const pageImages = images.slice(currentIndex, currentIndex + size);
    const slots = createSlotsForPage(
      pageImages,
      currentIndex,
      pageWidth,
      pageHeight,
      margin,
      gap,
      settings.layoutMode,
      settings.imageFit
    );

    pages.push({
      pageNumber: pIndex + 1,
      orientation: settings.orientation,
      pageWidth,
      pageHeight,
      slots,
    });

    currentIndex += size;
  });

  return pages;
}

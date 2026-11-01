import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePages,
  computeImageFit,
  determineAutoPageGroupSizes,
  getPageDimensions,
  A4_PORTRAIT_WIDTH_MM,
  A4_PORTRAIT_HEIGHT_MM,
} from './collageEngine';
import { UploadedImage, PdfSettings } from '../types';

function createMockImage(id: string, width: number, height: number): UploadedImage {
  return {
    id,
    name: `test-${id}.jpg`,
    dataUrl: 'data:image/jpeg;base64,mock',
    width,
    height,
    aspect: width / height,
    rotation: 0,
    sizeBytes: 1024,
    sizeFormatted: '1 KB',
  };
}

const defaultSettings: PdfSettings = {
  layoutMode: 'auto',
  orientation: 'portrait',
  margin: 'normal',
  imageFit: 'contain',
  showPageNumbers: true,
  showImageIndex: true,
  imageBorder: true,
  imageRounded: false,
  quality: 'high',
  pdfTitle: 'My PDF',
};

test('getPageDimensions returns correct A4 sizes', () => {
  const p = getPageDimensions('portrait');
  assert.equal(p.width, A4_PORTRAIT_WIDTH_MM);
  assert.equal(p.height, A4_PORTRAIT_HEIGHT_MM);

  const l = getPageDimensions('landscape');
  assert.equal(l.width, A4_PORTRAIT_HEIGHT_MM);
  assert.equal(l.height, A4_PORTRAIT_WIDTH_MM);
});

test('computeImageFit contain preserves aspect ratio and centers', () => {
  // Slot is square: 100 x 100 at (10, 10)
  // Image is 2:1 landscape (aspect = 2)
  const fit = computeImageFit(10, 10, 100, 100, 2, 'contain');
  assert.equal(fit.fittedWidth, 100);
  assert.equal(fit.fittedHeight, 50);
  assert.equal(fit.fittedX, 10);
  assert.equal(fit.fittedY, 10 + 25); // centered vertically

  // Image is 1:2 portrait (aspect = 0.5)
  const fitPortrait = computeImageFit(0, 0, 100, 100, 0.5, 'contain');
  assert.equal(fitPortrait.fittedHeight, 100);
  assert.equal(fitPortrait.fittedWidth, 50);
  assert.equal(fitPortrait.fittedX, 25); // centered horizontally
  assert.equal(fitPortrait.fittedY, 0);
});

test('determineAutoPageGroupSizes balances image counts nicely', () => {
  assert.deepEqual(determineAutoPageGroupSizes([]), []);
  assert.deepEqual(determineAutoPageGroupSizes([createMockImage('1', 100, 100)]), [1]);
  assert.deepEqual(
    determineAutoPageGroupSizes([createMockImage('1', 100, 100), createMockImage('2', 100, 100)]),
    [2]
  );
  // 5 images should be split as [3, 2], not [4, 1]
  const mock5 = Array.from({ length: 5 }, (_, i) => createMockImage(String(i), 100, 100));
  assert.deepEqual(determineAutoPageGroupSizes(mock5), [3, 2]);

  // 6 images split as [3, 3]
  const mock6 = Array.from({ length: 6 }, (_, i) => createMockImage(String(i), 100, 100));
  assert.deepEqual(determineAutoPageGroupSizes(mock6), [3, 3]);

  // 7 images split as [4, 3]
  const mock7 = Array.from({ length: 7 }, (_, i) => createMockImage(String(i), 100, 100));
  assert.deepEqual(determineAutoPageGroupSizes(mock7), [4, 3]);
});

test('calculatePages handles empty images list', () => {
  const pages = calculatePages([], defaultSettings);
  assert.equal(pages.length, 0);
});

test('calculatePages puts single image centered within bounds', () => {
  const img = createMockImage('1', 800, 600);
  const pages = calculatePages([img], defaultSettings);
  assert.equal(pages.length, 1);
  assert.equal(pages[0].slots.length, 1);
  const slot = pages[0].slots[0];
  assert.equal(slot.imageIndex, 0);
  assert.equal(slot.imageId, '1');
  assert.ok(slot.fittedX >= 0);
  assert.ok(slot.fittedY >= 0);
  assert.ok(slot.fittedX + slot.fittedWidth <= A4_PORTRAIT_WIDTH_MM + 0.1);
  assert.ok(slot.fittedY + slot.fittedHeight <= A4_PORTRAIT_HEIGHT_MM + 0.1);
});

test('calculatePages in grid4 divides 4 images into 2x2 grid', () => {
  const imgs = Array.from({ length: 4 }, (_, i) => createMockImage(String(i), 400, 300));
  const pages = calculatePages(imgs, { ...defaultSettings, layoutMode: 'grid4' });
  assert.equal(pages.length, 1);
  assert.equal(pages[0].slots.length, 4);

  // Check that indices are strictly sequential 0, 1, 2, 3
  pages[0].slots.forEach((s, idx) => {
    assert.equal(s.imageIndex, idx);
    assert.equal(s.imageId, String(idx));
  });

  // Verify all slots remain inside printable boundaries
  for (const slot of pages[0].slots) {
    assert.ok(slot.x >= 12, `slot x ${slot.x} should be >= margin 12`);
    assert.ok(slot.y >= 12, `slot y ${slot.y} should be >= margin 12`);
    assert.ok(slot.x + slot.width <= A4_PORTRAIT_WIDTH_MM + 0.1);
    assert.ok(slot.y + slot.height <= A4_PORTRAIT_HEIGHT_MM + 0.1);
  }
});

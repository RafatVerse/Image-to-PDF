import { UploadedImage } from '../types';

/**
 * Creates high-quality data URLs dynamically using Canvas so no external network call is needed
 */
function createSampleCanvasImage(
  title: string,
  subtitle: string,
  width: number,
  height: number,
  gradientStart: string,
  gradientEnd: string,
  badgeText: string
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, gradientStart);
  grad.addColorStop(1, gradientEnd);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle decorative pattern lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = Math.max(2, width / 200);
  for (let i = 0; i < width + height; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i - height, height);
    ctx.stroke();
  }

  // Inner card container
  const pad = Math.min(width, height) * 0.08;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  const radius = Math.min(24, pad);
  ctx.beginPath();
  ctx.roundRect(pad, pad, width - pad * 2, height - pad * 2, radius);
  ctx.fill();

  // Badge on top right
  const badgeW = Math.min(140, (width - pad * 2) * 0.45);
  const badgeH = Math.max(28, height * 0.06);
  ctx.fillStyle = gradientStart;
  ctx.beginPath();
  ctx.roundRect(width - pad - badgeW - 16, pad + 16, badgeW, badgeH, 8);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(badgeH * 0.55)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, width - pad - badgeW / 2 - 16, pad + 16 + badgeH / 2);

  // Main Title
  ctx.fillStyle = '#1e293b';
  const titleSize = Math.max(22, Math.min(48, Math.round(width / 16)));
  ctx.font = `bold ${titleSize}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, width / 2, height / 2 - titleSize * 0.4);

  // Subtitle
  ctx.fillStyle = '#64748b';
  const subSize = Math.max(14, Math.min(24, Math.round(titleSize * 0.52)));
  ctx.font = `500 ${subSize}px system-ui, sans-serif`;
  ctx.fillText(subtitle, width / 2, height / 2 + subSize * 1.2);

  // Dimension info at bottom
  ctx.fillStyle = '#94a3b8';
  const infoSize = Math.max(12, Math.min(18, Math.round(titleSize * 0.4)));
  ctx.font = `normal ${infoSize}px monospace`;
  ctx.fillText(`${width} × ${height} px`, width / 2, height - pad - 24);

  return canvas.toDataURL('image/jpeg', 0.92);
}

export function generateSampleImages(): UploadedImage[] {
  const samples = [
    {
      id: 'sample-1',
      name: 'Scenic_Panorama_1.jpg',
      title: 'Alpine Meadow',
      subtitle: 'Ultra-wide 16:9 Landscape',
      badge: 'Landscape',
      width: 1200,
      height: 675,
      grad1: '#8b5cf6',
      grad2: '#3b82f6',
      size: '240 KB',
    },
    {
      id: 'sample-2',
      name: 'Invoice_Scan_2.jpg',
      title: 'Tax Receipt & Invoice',
      subtitle: 'Standard 1:1.4 Document',
      badge: 'Document',
      width: 800,
      height: 1120,
      grad1: '#6366f1',
      grad2: '#a855f7',
      size: '310 KB',
    },
    {
      id: 'sample-3',
      name: 'National_ID_Card_3.jpg',
      title: 'Digital ID Pass',
      subtitle: 'Smart Card 3:2 Ratio',
      badge: 'ID Card',
      width: 900,
      height: 600,
      grad1: '#7c3aed',
      grad2: '#ec4899',
      size: '185 KB',
    },
    {
      id: 'sample-4',
      name: 'Studio_Portrait_4.jpg',
      title: 'Editorial Portrait',
      subtitle: 'Square 1:1 Aspect',
      badge: 'Square',
      width: 800,
      height: 800,
      grad1: '#9333ea',
      grad2: '#c084fc',
      size: '220 KB',
    },
  ];

  return samples.map((s) => {
    const dataUrl = createSampleCanvasImage(
      s.title,
      s.subtitle,
      s.width,
      s.height,
      s.grad1,
      s.grad2,
      s.badge
    );

    return {
      id: s.id,
      name: s.name,
      dataUrl,
      width: s.width,
      height: s.height,
      aspect: s.width / s.height,
      rotation: 0,
      sizeBytes: 250000,
      sizeFormatted: s.size,
    };
  });
}

// Playwright CLI run-code argument function
module.exports = async (page) => {
  const fs = await import('node:fs');
  const svg = fs.readFileSync('public/icon.svg', 'utf8');
  await page.setContent('<div id="root" style="margin:0;padding:0;display:inline-block;">' + svg + '</div>');
  
  await page.setViewportSize({ width: 512, height: 512 });
  const el512 = await page.$('#root');
  if (el512) {
    await el512.screenshot({ path: 'public/pwa-512x512.png', type: 'png' });
    await el512.screenshot({ path: 'public/pwa-maskable-512x512.png', type: 'png' });
  }

  await page.setContent('<div id="root" style="width:192px;height:192px;">' + svg.replace(/width="512"/g, 'width="192"').replace(/height="512"/g, 'height="192"') + '</div>');
  const el192 = await page.$('#root');
  if (el192) {
    await el192.screenshot({ path: 'public/pwa-192x192.png', type: 'png' });
  }

  await page.setContent('<div id="root" style="width:180px;height:180px;">' + svg.replace(/width="512"/g, 'width="180"').replace(/height="512"/g, 'height="180"') + '</div>');
  const el180 = await page.$('#root');
  if (el180) {
    await el180.screenshot({ path: 'public/apple-touch-icon.png', type: 'png' });
  }
  console.log('PNG icons generated successfully!');
};

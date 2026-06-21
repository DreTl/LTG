import html2canvas from 'html2canvas';
import {
  EXPORT_TOTAL_WIDTH,
  EXPORT_TOTAL_HEIGHT,
} from './exportDimensions';

function stripAllClasses(element) {
  element.removeAttribute('class');
  Array.from(element.children).forEach(stripAllClasses);
}

function removeStylesheets(clonedDoc) {
  clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => node.remove());
}

/**
 * Captures a standings table element as a canvas for export/sharing.
 * Uses an isolated iframe with no Tailwind CSS to avoid oklab color parsing errors in html2canvas.
 */
export async function captureStandingsElement(elementId) {
  const source = document.getElementById(elementId);
  if (!source) {
    throw new Error('Standings table not found');
  }

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText =
    `position:fixed;left:0;top:0;border:none;z-index:99999;opacity:0;pointer-events:none;width:${EXPORT_TOTAL_WIDTH}px;height:${EXPORT_TOTAL_HEIGHT}px;`;

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('Could not create export frame');
  }

  doc.open();
  doc.write(
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700;800&family=Roboto+Condensed:wght@700;800&family=Bebas+Neue&display=swap" rel="stylesheet">' +
    '</head><body style="margin:0;padding:0;background:#0b1120;"></body></html>'
  );
  doc.close();

  const preloadImage = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    });

  // Preload background + heading/numeric fonts.
  await Promise.all([
    preloadImage('/export-stadium-bg.png'),
    doc.fonts?.load('700 64px "Oswald"').catch(() => {}) ?? Promise.resolve(),
    doc.fonts?.load('300 48px "Oswald"').catch(() => {}) ?? Promise.resolve(),
    doc.fonts?.load('800 48px "Rajdhani"').catch(() => {}) ?? Promise.resolve(),
    doc.fonts?.load('400 180px "Bebas Neue"').catch(() => {}) ?? Promise.resolve(),
  ]);

  const clone = source.cloneNode(true);
  clone.id = `${elementId}-capture`;
  stripAllClasses(clone);
  doc.body.appendChild(clone);

  // Wait for any team-logo images inside the clone to finish loading.
  const imgs = Array.from(clone.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          })
    )
  );

  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  try {
    const rawCanvas = await html2canvas(clone, {
      scale: 1,
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      logging: false,
      width: EXPORT_TOTAL_WIDTH,
      height: EXPORT_TOTAL_HEIGHT,
      windowWidth: EXPORT_TOTAL_WIDTH,
      windowHeight: EXPORT_TOTAL_HEIGHT,
      onclone: (clonedDoc) => {
        removeStylesheets(clonedDoc);
        const root = clonedDoc.getElementById(`${elementId}-capture`);
        if (root) stripAllClasses(root);
      },
    });

    return normalizeCanvas(rawCanvas, EXPORT_TOTAL_WIDTH, EXPORT_TOTAL_HEIGHT);
  } finally {
    document.body.removeChild(iframe);
  }
}

function normalizeCanvas(source, width, height) {
  if (source.width === width && source.height === height) {
    return source;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0b1120';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

export function canvasToBlob(canvas, type = 'image/png', quality = 0.95) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

export function downloadCanvas(canvas, filename, format = 'png') {
  const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = canvas.toDataURL(mime, 0.95);
  link.click();
}

export async function downloadCanvasAsPdf(canvas, filename) {
  const { jsPDF } = await import('jspdf');

  // Preserve EXACT pixel dimensions (1438 × 1451) — page == canvas, lossless PNG.
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
    compress: false,
    hotfixes: ['px_scaling'],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height, undefined, 'NONE');
  pdf.save(`${filename}.pdf`);
}

export async function shareWithNativeApi(blob, filename, title, text) {
  const file = new File([blob], `${filename}.png`, { type: 'image/png' });
  const shareData = { files: [file], title, text };

  if (navigator.share && navigator.canShare?.(shareData)) {
    await navigator.share(shareData);
    return true;
  }
  return false;
}

export function openShareWindow(platform, text, url) {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  const fullMessage = encodeURIComponent(`${text} ${url}`);

  const urls = {
    whatsapp: `https://api.whatsapp.com/send?text=${fullMessage}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?text=${fullMessage}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
  };

  const shareUrl = urls[platform];
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  }
}

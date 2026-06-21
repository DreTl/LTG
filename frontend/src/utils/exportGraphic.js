import html2canvas from 'html2canvas';

function stripAllClasses(element) {
  element.removeAttribute('class');
  Array.from(element.children).forEach(stripAllClasses);
}

function removeStylesheets(clonedDoc) {
  clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => node.remove());
}

/**
 * Captures an inline-styled graphic element at its natural size.
 * Renders inside an isolated iframe (no Tailwind) to avoid html2canvas
 * oklab color parsing errors. Returns a high-DPI canvas (scale 2).
 */
export async function captureGraphicElement(elementId, { scale = 2 } = {}) {
  const source = document.getElementById(elementId);
  if (!source) {
    throw new Error('Graphic not found');
  }

  const width = source.offsetWidth;
  const height = source.offsetHeight;

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText =
    `position:fixed;left:0;top:0;border:none;z-index:99999;opacity:0;pointer-events:none;width:${width}px;height:${height}px;`;
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
    '<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">' +
    '</head><body style="margin:0;padding:0;background:#0b1120;"></body></html>'
  );
  doc.close();

  await Promise.all([
    doc.fonts?.load('700 64px "Oswald"').catch(() => {}) ?? Promise.resolve(),
    doc.fonts?.load('300 48px "Oswald"').catch(() => {}) ?? Promise.resolve(),
    doc.fonts?.load('700 48px "Rajdhani"').catch(() => {}) ?? Promise.resolve(),
  ]);

  const clone = source.cloneNode(true);
  clone.id = `${elementId}-capture`;
  stripAllClasses(clone);
  doc.body.appendChild(clone);

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
    return await html2canvas(clone, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#0b1120',
      logging: false,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      onclone: (clonedDoc) => {
        removeStylesheets(clonedDoc);
        const root = clonedDoc.getElementById(`${elementId}-capture`);
        if (root) stripAllClasses(root);
      },
    });
  } finally {
    document.body.removeChild(iframe);
  }
}

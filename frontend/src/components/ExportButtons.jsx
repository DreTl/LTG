import { useState } from 'react';
import {
  FaFileImage,
  FaFilePdf,
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaTelegram,
  FaLink,
  FaCopy,
  FaShareAlt,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  captureStandingsElement,
  canvasToBlob,
  downloadCanvas,
  downloadCanvasAsPdf,
  shareWithNativeApi,
  openShareWindow,
} from '../utils/exportStandings';

export default function ExportButtons({
  elementId,
  filename = 'league-standings',
  tournamentName,
  shareUrl,
  capture: captureProp,
  shareText: shareTextProp,
  heading = 'Download standings',
  subtitle = 'High-resolution graphics for WhatsApp, Facebook, Instagram, and printing.',
  onExported,
}) {
  const [exporting, setExporting] = useState(false);

  const bumpExportCount = () => {
    const next = Number(localStorage.getItem('ltg-export-count') || 0) + 1;
    localStorage.setItem('ltg-export-count', String(next));
  };

  const getShareText = () =>
    shareTextProp || `🏆 ${tournamentName || 'League'} standings — generated with LTG`;

  const getShareLink = () => shareUrl || window.location.href;

  const runExport = async (action) => {
    setExporting(true);
    try {
      await action();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const capture = () =>
    captureProp ? captureProp() : captureStandingsElement(elementId);

  const handleDownloadImage = (format) =>
    runExport(async () => {
      const canvas = await capture();
      downloadCanvas(canvas, filename, format);
      bumpExportCount();
      onExported?.(canvas);
      toast.success(`${format.toUpperCase()} downloaded`);
    });

  const handleDownloadPdf = () =>
    runExport(async () => {
      const canvas = await capture();
      await downloadCanvasAsPdf(canvas, filename);
      bumpExportCount();
      onExported?.(canvas);
      toast.success('PDF downloaded');
    });

  const handleCopyImage = () =>
    runExport(async () => {
      const canvas = await capture();
      const blob = await canvasToBlob(canvas);
      try {
        await navigator.clipboard.write([
          new window.ClipboardItem({ 'image/png': blob }),
        ]);
        onExported?.(canvas);
        toast.success('Image copied to clipboard');
      } catch {
        downloadCanvas(canvas, filename, 'png');
        toast.info('Clipboard not supported — image downloaded instead');
      }
    });

  const handleShare = (platform) =>
    runExport(async () => {
      const canvas = await capture();
      const blob = await canvasToBlob(canvas);
      const text = getShareText();
      const url = getShareLink();

      downloadCanvas(canvas, filename, 'png');
      onExported?.(canvas);

      if (platform === 'instagram') {
        const shared = await shareWithNativeApi(blob, filename, tournamentName, text);
        if (shared) {
          toast.success('Opened share menu — pick Instagram');
        } else {
          toast.info('PNG saved! Upload it to Instagram from your gallery or downloads.');
        }
        return;
      }

      if (platform === 'native') {
        const shared = await shareWithNativeApi(blob, filename, tournamentName, `${text} ${url}`);
        if (shared) {
          toast.success('Shared successfully');
        } else {
          openShareWindow('whatsapp', text, url);
          toast.success('PNG saved — share dialog opened');
        }
        return;
      }

      openShareWindow(platform, text, url);
      toast.success(`PNG saved — opening ${platform}`);
    });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${getShareText()} ${getShareLink()}`);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <div className="glass-card p-6 space-y-5">
      <div>
        <span className="pill-badge mb-3">
          <FaShareAlt className="text-xs" /> Export & Share
        </span>
        <h3 className="display-heading text-2xl text-white mt-2">{heading}</h3>
        <p className="text-sm text-white/50 mt-1">{subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => handleDownloadImage('png')} disabled={exporting} className="btn-ltg btn-ltg-primary">
          <FaFileImage /> PNG
        </button>
        <button onClick={() => handleDownloadImage('jpg')} disabled={exporting} className="btn-ltg btn-ltg-secondary">
          <FaFileImage /> JPG
        </button>
        <button onClick={handleDownloadPdf} disabled={exporting} className="btn-ltg btn-ltg-danger">
          <FaFilePdf /> PDF
        </button>
        <button onClick={handleCopyImage} disabled={exporting} className="btn-ltg btn-ltg-ghost">
          <FaCopy /> Copy Image
        </button>
      </div>

      <div className="border-t border-white/10 pt-5">
        <p className="text-xs uppercase tracking-widest text-white/40 mb-3">Share on social</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => handleShare('whatsapp')} disabled={exporting} className="btn-ltg btn-ltg-success">
            <FaWhatsapp /> WhatsApp
          </button>
          <button
            onClick={() => handleShare('facebook')}
            disabled={exporting}
            className="btn-ltg"
            style={{ background: '#1877F2' }}
          >
            <FaFacebook /> Facebook
          </button>
          <button
            onClick={() => handleShare('telegram')}
            disabled={exporting}
            className="btn-ltg"
            style={{ background: '#229ED9' }}
          >
            <FaTelegram /> Telegram
          </button>
          <button
            onClick={() => handleShare('instagram')}
            disabled={exporting}
            className="btn-ltg"
            style={{ background: 'linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)' }}
          >
            <FaInstagram /> Instagram
          </button>
          <button onClick={copyLink} disabled={exporting} className="btn-ltg btn-ltg-ghost">
            <FaLink /> Copy Link
          </button>
        </div>
      </div>

      {exporting && (
        <div className="flex items-center gap-2 text-sm text-white/50">
          <div className="spinner-border spinner-border-sm text-white/50" role="status" />
          Generating image…
        </div>
      )}
    </div>
  );
}

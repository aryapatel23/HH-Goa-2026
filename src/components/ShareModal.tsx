import React, { useState, useEffect } from 'react';
import type { Mode, CornerStyle } from '../types';
import {
  getStoredCloudinaryCredentials,
  saveCloudinaryCredentials,
  uploadToCloudinary,
  DEFAULT_CLOUD_NAME
} from '../utils/cloudinary';
import {
  X, Copy, Download, Check, Sparkles, ExternalLink,
  Share2, CloudUpload, HelpCircle, Link, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string;
  mode: Mode;
  cornerStyle: CornerStyle;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  imageDataUrl,
  mode,
  cornerStyle,
}) => {
  const [cloudName, setCloudName] = useState(DEFAULT_CLOUD_NAME);
  const [uploadPreset, setUploadPreset] = useState('');
  const [uploading, setUploading] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedCloudUrl, setCopiedCloudUrl] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredCloudinaryCredentials();
      setCloudName(stored.cloudName || DEFAULT_CLOUD_NAME);
      setUploadPreset(stored.uploadPreset || '');
      setCloudinaryUrl('');
      setUploadError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isSquare = cornerStyle === 'square';

  const defaultCaption = mode === 'pfp'
    ? `Just generated my official @HHGoa2026 PFP! 🌴⚡ Excited for Hacker House Goa by 2:47 PM Studio (28-31 Oct 2026)! #FrameInGoa ${cloudinaryUrl || ''}`
    : mode === 'story'
    ? `Here's my Hacker House Goa 2026 story card! 🌊🔥 28-31 Oct, Goa, India! #FrameInGoa ${cloudinaryUrl || ''}`
    : `Check out my official @HHGoa2026 Builder Pass! 🌊💻 Ready to hack alongside top builders in Goa! #FrameInGoa ${cloudinaryUrl || ''}`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(defaultCaption)}`;

  const handleSaveCredentials = () => saveCloudinaryCredentials(cloudName, uploadPreset);

  const handleCloudinaryUpload = async () => {
    const finalCloud = cloudName.trim() || DEFAULT_CLOUD_NAME;
    const finalPreset = uploadPreset.trim();
    setUploading(true);
    setUploadError('');
    if (finalPreset) saveCloudinaryCredentials(finalCloud, finalPreset);
    try {
      const hostedUrl = await uploadToCloudinary(imageDataUrl, finalCloud, finalPreset);
      setCloudinaryUrl(hostedUrl);
      setUploading(false);
      confetti({ particleCount: 90, spread: 80, colors: ['#ffcc00', '#ff4d00', '#00d4c8'] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload.';
      setUploadError(msg);
      setUploading(false);
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(defaultCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleCopyCloudUrl = () => {
    if (cloudinaryUrl) {
      navigator.clipboard.writeText(cloudinaryUrl);
      setCopiedCloudUrl(true);
      setTimeout(() => setCopiedCloudUrl(false), 2000);
    }
  };

  const handleCopyImageToClipboard = async () => {
    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch {
      handleDownload();
    }
  };

  const handleNativeShare = async () => {
    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'hhgoa2026-builder.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'HH Goa 2026 Builder Card', text: defaultCaption, files: [file] });
        confetti({ particleCount: 80, spread: 70, colors: ['#ffcc00', '#ff4d00', '#00d4c8'] });
        return;
      }
    } catch {
      // fall through
    }
    window.open(twitterShareUrl, '_blank');
  };

  const handleDownload = () => {
    confetti({ particleCount: 70, spread: 60, colors: ['#ffcc00', '#ff4d00', '#00d4c8'] });
    const link = document.createElement('a');
    const suffix = mode === 'pfp' ? 'pfp' : mode === 'story' ? 'story' : 'builder-card';
    link.download = `hhgoa2026-${suffix}-${Date.now()}.png`;
    link.href = imageDataUrl;
    link.click();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(5, 13, 31, 0.94)',
      backdropFilter: 'blur(14px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div className={`glass-panel ${isSquare ? 'square-corners' : 'rounded-corners'}`} style={{
        maxWidth: '560px', width: '100%', padding: '1.5rem',
        maxHeight: '92vh', overflowY: 'auto',
        border: '2px solid var(--accent-yellow)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="var(--accent-yellow)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--accent-yellow)' }}>
              SHARE TO X (#FrameInGoa)
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none', color: 'var(--text-main)',
              cursor: 'pointer', padding: '0.4rem', borderRadius: isSquare ? '0px' : '50%', display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Image Preview */}
        <div style={{
          textAlign: 'center', marginBottom: '1.2rem',
          background: '#020810', padding: '0.75rem',
          borderRadius: isSquare ? '0px' : '8px',
          border: '1px solid rgba(255, 77, 0, 0.3)'
        }}>
          <img
            src={imageDataUrl} alt="HH Goa Graphic"
            style={{
              maxHeight: '200px', maxWidth: '100%', objectFit: 'contain',
              borderRadius: isSquare ? '0px' : '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.7)'
            }}
          />
        </div>

        {/* PRIMARY ACTION: Native Share / X */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
          <button
            onClick={handleNativeShare}
            className={`btn btn-sunset ${isSquare ? 'btn-square' : 'btn-rounded'}`}
            style={{ fontSize: '0.95rem', padding: '0.9rem' }}
          >
            <Share2 size={18} />
            {typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' ? 'Share Image Directly (Native)' : 'Open X / Twitter Post'}
            <ExternalLink size={14} />
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <button
              onClick={handleCopyImageToClipboard}
              className={`btn btn-secondary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {copiedImage ? <Check size={16} color="var(--accent-yellow)" /> : <Copy size={16} />}
              {copiedImage ? 'Image Copied!' : 'Copy Image'}
            </button>
            <button
              onClick={handleDownload}
              className={`btn btn-primary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
              style={{ fontSize: '0.8rem' }}
            >
              <Download size={16} /> Save PNG
            </button>
          </div>
        </div>

        {/* Caption */}
        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label">Pre-filled Tweet Caption</label>
            <button
              onClick={handleCopyCaption}
              style={{
                background: 'none', border: 'none', color: 'var(--accent-yellow)', fontSize: '0.75rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem',
                fontFamily: 'var(--font-mono)', fontWeight: 700
              }}
            >
              {copiedCaption ? <Check size={12} /> : <Copy size={12} />}
              {copiedCaption ? 'Copied!' : 'Copy Caption'}
            </button>
          </div>
          <textarea
            readOnly className={`input-field ${isSquare ? 'square-corners' : 'rounded-corners'}`}
            rows={3} value={defaultCaption}
            style={{ fontSize: '0.85rem', resize: 'none', fontFamily: 'var(--font-main)' }}
          />
        </div>

        {/* ADVANCED: Cloudinary URL hosting (collapsible) */}
        <div style={{ border: '1px solid rgba(255, 204, 0, 0.2)', borderRadius: isSquare ? '0px' : '8px' }}>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              width: '100%', background: 'rgba(8, 18, 40, 0.9)', border: 'none',
              color: 'var(--text-muted)', padding: '0.7rem 1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700,
              borderRadius: isSquare ? '0px' : '6px'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CloudUpload size={14} /> ADVANCED: CLOUDINARY URL HOSTING (for OG preview link)
            </span>
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdvanced && (
            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255, 204, 0, 0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                <button
                  onClick={() => setShowGuide(!showGuide)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <HelpCircle size={13} /> {showGuide ? 'Hide help' : 'How to get Upload Preset?'}
                </button>
              </div>

              {showGuide && (
                <div style={{
                  background: 'rgba(255, 204, 0, 0.1)', borderLeft: '4px solid var(--accent-yellow)',
                  padding: '0.7rem 0.85rem', fontSize: '0.78rem', marginBottom: '0.8rem',
                  color: 'var(--text-main)', lineHeight: 1.5
                }}>
                  <strong>2 steps:</strong>
                  <ol style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                    <li>Cloudinary dashboard → sidebar → <strong>Upload</strong></li>
                    <li>Scroll to <strong>Upload presets</strong> → <strong>Add upload preset</strong> → set Signing Mode to <strong>Unsigned</strong> → copy preset name</li>
                  </ol>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-yellow)', display: 'block', marginBottom: '0.2rem', fontFamily: 'var(--font-mono)' }}>Cloud Name</span>
                  <input
                    type="text" placeholder="e.g. dhyds3low"
                    className={`input-field ${isSquare ? 'square-corners' : 'rounded-corners'}`}
                    value={cloudName}
                    onChange={(e) => { setCloudName(e.target.value); handleSaveCredentials(); }}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-yellow)', display: 'block', marginBottom: '0.2rem', fontFamily: 'var(--font-mono)' }}>Upload Preset (Unsigned)</span>
                  <input
                    type="text" placeholder="e.g. ml_default"
                    className={`input-field ${isSquare ? 'square-corners' : 'rounded-corners'}`}
                    value={uploadPreset}
                    onChange={(e) => { setUploadPreset(e.target.value); handleSaveCredentials(); }}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>
              </div>

              {uploadError && (
                <p style={{ fontSize: '0.75rem', color: '#ff4d4d', marginBottom: '0.5rem', fontWeight: 600 }}>
                  ⚠️ {uploadError}
                </p>
              )}

              <button
                onClick={handleCloudinaryUpload} disabled={uploading}
                className={`btn btn-primary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
                style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
              >
                {uploading ? <Loader2 size={16} /> : <CloudUpload size={16} />}
                {uploading ? 'Uploading...' : 'Upload & Get Live URL for OG Preview'}
              </button>

              {cloudinaryUrl && (
                <div style={{ marginTop: '0.6rem', background: 'rgba(255, 204, 0, 0.12)', padding: '0.5rem', border: '1px solid var(--accent-yellow)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Link size={12} /> LIVE URL:
                    </span>
                    <button onClick={handleCopyCloudUrl} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {copiedCloudUrl ? 'Copied!' : 'Copy URL'}
                    </button>
                  </div>
                  <input type="text" readOnly value={cloudinaryUrl} className="input-field"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', marginTop: '0.2rem', background: '#020810' }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

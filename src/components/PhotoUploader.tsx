import React, { useRef, useState } from 'react';
import { Upload, Camera, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import type { CornerStyle } from '../types';
import { DEMO_AVATARS } from '../constants/avatars';
import { playUploadSound, playClickSound } from '../utils/audio';

interface PhotoUploaderProps {
  onImageSelected: (img: HTMLImageElement) => void;
  cornerStyle: CornerStyle;
  hasPhoto: boolean;
}

function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return (
    type === 'image/heic' ||
    type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
}

async function fileToImageSrc(file: File): Promise<string> {
  if (isHeicFile(file)) {
    const heic2any = (await import('heic2any')).default;
    const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    return URL.createObjectURL(blob as Blob);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = src;
  });
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onImageSelected,
  cornerStyle,
  hasPhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const processFile = async (file: File) => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const src = await fileToImageSrc(file);
      const img = await loadImage(src);
      onImageSelected(img);
      playUploadSound();
    } catch {
      setError('Could not process that photo. Try JPG or PNG, or another HEIC export.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleLoadDemo = (url: string) => {
    playClickSound();
    setLoading(true);
    setError('');
    loadImage(url)
      .then((img) => {
        onImageSelected(img);
        playUploadSound();
      })
      .catch(() => setError('Sample photo failed to load.'))
      .finally(() => setLoading(false));
  };

  const isSquare = cornerStyle === 'square';

  return (
    <div className={`glass-panel ${isSquare ? 'square-corners' : 'rounded-corners'}`} style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div className="input-label" style={{ fontSize: '0.85rem' }}>
          <Camera size={16} /> STEP 1: UPLOAD PHOTO
        </div>
        {hasPhoto && (
          <span className={`pill-tag ${isSquare ? 'square' : 'rounded'}`} style={{ color: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}>
            <CheckCircle2 size={12} /> PHOTO LOADED
          </span>
        )}
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--hh-yellow)' : 'rgba(251, 247, 233, 0.25)'}`,
          background: isDragging ? 'rgba(245, 213, 5, 0.1)' : 'rgba(6, 35, 26, 0.55)',
          borderRadius: isSquare ? 0 : 12,
          padding: '1.5rem 1rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.6rem',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif,image/heic,image/heif"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files?.[0]) processFile(e.target.files[0]);
            e.target.value = '';
          }}
        />

        <div style={{
          width: 50, height: 50,
          borderRadius: isSquare ? 0 : '50%',
          background: 'rgba(245, 213, 5, 0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--hh-yellow)',
        }}>
          <Upload size={24} />
        </div>

        <div>
          <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {loading ? 'Processing photo…' : 'Tap to upload · drag & drop · camera'}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
            JPG · PNG · WEBP · HEIC (iPhone)
          </p>
        </div>
      </div>

      {error && (
        <p style={{
          marginTop: '0.65rem', fontSize: '0.75rem', color: 'var(--hh-pink)',
          display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)',
        }}>
          <AlertCircle size={14} /> {error}
        </p>
      )}

      <div style={{ marginTop: '1rem' }}>
        <p style={{
          fontSize: '0.75rem', color: 'var(--text-yellow)', marginBottom: '0.5rem',
          display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-mono)',
        }}>
          <Sparkles size={12} color="var(--hh-pink)" /> Or try a sample builder photo:
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {DEMO_AVATARS.map((avatar, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadDemo(avatar.url)}
              title={`Load ${avatar.name}`}
              className={`btn btn-secondary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
              style={{
                padding: 2, width: 64, height: 64, overflow: 'hidden',
                border: '2px solid var(--hh-yellow)', cursor: 'pointer',
              }}
            >
              <img
                src={avatar.url}
                alt={avatar.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: isSquare ? 0 : 4 }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

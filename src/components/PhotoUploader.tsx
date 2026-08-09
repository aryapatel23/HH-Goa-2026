import React, { useRef, useState } from 'react';
import { Upload, Camera, Sparkles, CheckCircle2 } from 'lucide-react';
import type { CornerStyle } from '../types';
import { DEMO_AVATARS } from '../constants/avatars';
import { playUploadSound, playClickSound } from '../utils/audio';

interface PhotoUploaderProps {
  onImageSelected: (img: HTMLImageElement) => void;
  cornerStyle: CornerStyle;
  hasPhoto: boolean;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onImageSelected,
  cornerStyle,
  hasPhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const processFile = (file: File) => {
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        onImageSelected(img);
        setLoading(false);
        playUploadSound();
      };
      img.onerror = () => {
        setLoading(false);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleLoadDemo = (url: string) => {
    playClickSound();
    setLoading(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      onImageSelected(img);
      setLoading(false);
      playUploadSound();
    };
    img.onerror = () => setLoading(false);
    img.src = url;
  };

  return (
    <div className={`glass-panel ${cornerStyle === 'square' ? 'square-corners' : 'rounded-corners'}`} style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div className="input-label" style={{ fontSize: '0.85rem' }}>
          <Camera size={16} /> STEP 1: UPLOAD PHOTO
        </div>
        {hasPhoto && (
          <span className={`pill-tag ${cornerStyle === 'square' ? 'square' : 'rounded'}`} style={{ color: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}>
            <CheckCircle2 size={12} /> PHOTO LOADED
          </span>
        )}
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.2)'}`,
          background: isDragging ? 'rgba(0, 240, 255, 0.08)' : 'rgba(4, 7, 18, 0.6)',
          borderRadius: cornerStyle === 'square' ? '0px' : '12px',
          padding: '1.5rem 1rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.6rem'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
        />

        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: cornerStyle === 'square' ? '0px' : '50%',
          background: 'rgba(0, 240, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-cyan)'
        }}>
          <Upload size={24} />
        </div>

        <div>
          <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {loading ? 'Processing Photo...' : 'Click to Upload or Drag & Drop'}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Supports JPG, PNG, WEBP & HEIC (iPhone) photos
          </p>
        </div>
      </div>

      {/* Quick Demo Avatars */}
      <div style={{ marginTop: '1rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-yellow)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-mono)' }}>
          <Sparkles size={12} color="var(--accent-pink)" /> Or test with a sample builder photo:
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {DEMO_AVATARS.map((avatar, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadDemo(avatar.url)}
              title={`Load ${avatar.name}`}
              className={`btn btn-secondary ${cornerStyle === 'square' ? 'btn-square' : 'btn-rounded'}`}
              style={{
                padding: '2px',
                width: '64px',
                height: '64px',
                overflow: 'hidden',
                position: 'relative',
                border: '2px solid var(--accent-yellow)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
            >
              <img
                src={avatar.url}
                alt={avatar.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  borderRadius: cornerStyle === 'square' ? '0px' : '4px'
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

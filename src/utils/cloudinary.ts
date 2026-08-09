export interface CloudinaryCredentials {
  cloudName: string;
  uploadPreset: string;
}

const LOCAL_STORAGE_KEY_CLOUD = 'hhgoa_cloudinary_cloud_name';
const LOCAL_STORAGE_KEY_PRESET = 'hhgoa_cloudinary_upload_preset';

export const DEFAULT_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dhyds3low';
export const DEFAULT_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export function getStoredCloudinaryCredentials(): CloudinaryCredentials {
  return {
    cloudName: localStorage.getItem(LOCAL_STORAGE_KEY_CLOUD) || DEFAULT_CLOUD_NAME,
    uploadPreset: localStorage.getItem(LOCAL_STORAGE_KEY_PRESET) || DEFAULT_UPLOAD_PRESET,
  };
}

export function saveCloudinaryCredentials(cloudName: string, uploadPreset: string) {
  localStorage.setItem(LOCAL_STORAGE_KEY_CLOUD, cloudName.trim());
  localStorage.setItem(LOCAL_STORAGE_KEY_PRESET, uploadPreset.trim());
}

/** Compress canvas dataURL to JPEG ~200-600KB before uploading */
async function compressImage(dataUrl: string, maxPx = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}

export async function uploadToCloudinary(
  canvasDataUrl: string,
  cloudName: string,
  uploadPreset: string
): Promise<string> {
  const cloud = cloudName.trim() || DEFAULT_CLOUD_NAME;
  const preset = uploadPreset.trim();

  // Step 1: Compress to JPEG (prevents 400 from oversized files)
  const compressed = await compressImage(canvasDataUrl, 1200, 0.82);

  // --- Strategy 1: Vercel serverless /api/upload (no CORS, server-side) ---
  try {
    const resp = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageDataUrl: compressed,
        cloudName: cloud,
        uploadPreset: preset,
      }),
    });

    if (resp.ok) {
      const data = await resp.json() as { url?: string; error?: string };
      if (data.url) {
        if (preset) saveCloudinaryCredentials(cloud, preset);
        return data.url;
      }
    }
  } catch (_) {}

  // --- Strategy 2: Direct Cloudinary upload (user-provided preset) ---
  if (cloud && preset) {
    try {
      const body = new URLSearchParams();
      body.append('file', compressed);
      body.append('upload_preset', preset);

      const resp2 = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        }
      );
      if (resp2.ok) {
        const data2 = await resp2.json() as { secure_url?: string };
        if (data2.secure_url) {
          saveCloudinaryCredentials(cloud, preset);
          return data2.secure_url;
        }
      }
    } catch (_) {}
  }

  // --- Strategy 3: Tmpfiles.org (CORS-friendly, 1hr free hosting) ---
  try {
    // Convert base64 back to blob for FormData
    const byteString = atob(compressed.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const jpegBlob = new Blob([ab], { type: 'image/jpeg' });

    const fd = new FormData();
    fd.append('file', jpegBlob, 'hhgoa-builder.jpg');

    const resp3 = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: fd,
    });
    if (resp3.ok) {
      const data3 = await resp3.json() as { data?: { url?: string } };
      const raw = data3?.data?.url || '';
      if (raw) return raw.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
    }
  } catch (_) {}

  throw new Error('Upload failed. Please use "Download Image" and attach it manually to your tweet.');
}

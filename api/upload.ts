import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageDataUrl, cloudName, uploadPreset } = req.body as {
      imageDataUrl: string;
      cloudName?: string;
      uploadPreset?: string;
    };

    if (!imageDataUrl) {
      return res.status(400).json({ error: 'Missing imageDataUrl' });
    }

    const cloud = (cloudName || process.env.VITE_CLOUDINARY_CLOUD_NAME || 'dhyds3low').trim();
    const preset = (uploadPreset || process.env.VITE_CLOUDINARY_UPLOAD_PRESET || '').trim();

    if (!preset) {
      return res.status(400).json({ error: 'No upload preset configured. Add VITE_CLOUDINARY_UPLOAD_PRESET to Vercel env vars.' });
    }

    // Node fetch to Cloudinary (no CORS issue!)
    const body = new URLSearchParams();
    body.append('file', imageDataUrl);
    body.append('upload_preset', preset);

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      }
    );

    const data = await cloudRes.json() as any;

    if (!cloudRes.ok) {
      return res.status(500).json({ error: data?.error?.message || 'Cloudinary upload failed' });
    }

    return res.status(200).json({ url: data.secure_url || data.url });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

# HH Goa 2026 — Frame & ID Card Generator

> Official PFP frame + Builder ID Card generator for **Hacker House Goa 2026**  
> Built by **2:47 PM Studio** · [hhgoa.com](https://hhgoa.com)

![HH Goa 2026](https://hhgoa.com/og.png)

## Features

- 🖼️ **PFP Frame Generator** — 2000×2000 HD overlays with 6 frame templates
- 🪪 **Builder ID Card** — 4 distinct styles: Classic Dark, Editorial Light, Terminal Hacker, Magazine Cover
- 📖 **Instagram Story** — 1080×1920 vertical story card
- 🎨 **4 Themes** — Neon Shore, Emerald Studio, Sunset Goa, Cyber Night
- 🔗 **Unique Shareable Link** — every card gets a QR-code-embedded verification URL
- 📋 **Recently Generated Gallery** — thumbnail strip of your last 6 cards
- 📱 **Mobile-first wizard** — step-by-step flow optimized for phones
- 🌐 **Web Share API** — native share sheet on mobile (no Cloudinary needed)

## Tech Stack

- React 19 + TypeScript + Vite
- Canvas API (all graphics rendered client-side)
- Vercel Serverless Functions (image upload)
- Cloudinary (optional sharing backend)

## Getting Started

```bash
# 1. Clone
git clone https://github.com/aryapatel23/HH-Goa-2026.git
cd HH-Goa-2026

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Cloudinary credentials and app URL

# 4. Run dev server
npm run dev
```

## Deployment

```bash
npm run build
# Deploy the dist/ folder to Vercel, Netlify, or any static host
```

## Environment Variables

See `.env.example` for all required variables.

| Variable | Description |
|---|---|
| `VITE_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Your unsigned upload preset |
| `VITE_APP_URL` | Your production URL (for QR codes) |

## License

MIT — built for the HH Goa 2026 shortlisting task.

---

`#FrameInGoa` · **28–31 Oct 2026** · Goa, India 🌴

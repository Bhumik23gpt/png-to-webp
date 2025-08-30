import sharp from 'sharp';
import fetch from 'node-fetch';
import { put } from '@vercel/blob';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { pngUrl, quality = 80 } = req.body;
    if (!pngUrl) return res.status(400).json({ error: 'pngUrl is required' });

    // 1️⃣ Download PNG from URL
    const response = await fetch(pngUrl);
    if (!response.ok) throw new Error('Failed to fetch PNG');
    const inputBuffer = await response.arrayBuffer();

    // 2️⃣ Convert to WebP
    const webpBuffer = await sharp(Buffer.from(inputBuffer))
      .webp({ quality: Math.min(Math.max(parseInt(quality), 1), 100) })
      .toBuffer();

    // 3️⃣ Upload WebP to Vercel Blob
    const fileName = pngUrl.split('/').pop().replace(/\.png$/i, '.webp');
    const { url } = await put(fileName, webpBuffer, { access: 'public', token: BLOB_TOKEN });

    // 4️⃣ Return WebP URL
    res.status(200).json({ webpUrl: url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

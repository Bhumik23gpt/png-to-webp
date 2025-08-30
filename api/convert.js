import { put } from '@vercel/blob';
import formidable from 'formidable';
import sharp from 'sharp';

// Disable Next.js body parser (important for formidable)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form-data upload
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert image -> WebP
    const webpBuffer = await sharp(file.filepath)
      .webp({ quality: 80 })
      .toBuffer();

    // Create unique file name
    const fileName = `converted-${Date.now()}.webp`;

    // Upload to Vercel Blob
    const blob = await put(fileName, webpBuffer, {
      access: 'public',
    });

    // Respond with JSON URL
    return res.status(200).json({
      success: true,
      url: blob.url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Conversion failed' });
  }
}

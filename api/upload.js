import { put } from '@vercel/blob';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { data, fileName } = req.body;
    if (!data || !fileName) {
      return res.status(400).json({ error: 'data and fileName are required' });
    }

    // Parse IMTBuffer string
    const match = data.match(/binary, ([0-9a-f]+)/i);
    if (!match) throw new Error('Invalid IMTBuffer format');

    const hexString = match[1];
    const buffer = Buffer.from(hexString, 'hex');

    // Upload to Vercel Blob
    const { url } = await put(fileName, buffer, { access: 'public', token: BLOB_TOKEN });

    res.status(200).json({ pngUrl: url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

import sharp from 'sharp';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const inputBuffer = await new Promise((resolve, reject) => {
      let data = [];
      req.on('data', chunk => data.push(chunk));
      req.on('end', () => resolve(Buffer.concat(data)));
      req.on('error', err => reject(err));
    });

    const quality = Math.min(Math.max(parseInt(req.query.quality) || 80, 1), 100);

    const outputBuffer = await sharp(inputBuffer)
      .webp({ quality })
      .toBuffer();

    res.setHeader('Content-Type', 'image/webp');
    res.status(200).send(outputBuffer);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}

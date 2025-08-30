import sharp from "sharp";
import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST with PNG file" });
    return;
  }

  try {
    // Collect incoming PNG buffer
    const inputBuffer = await new Promise((resolve, reject) => {
      let data = [];
      req.on("data", chunk => data.push(chunk));
      req.on("end", () => resolve(Buffer.concat(data)));
      req.on("error", err => reject(err));
    });

    // Clamp quality between 1–100
    const quality = Math.min(Math.max(parseInt(req.query.quality) || 80, 1), 100);

    // Convert to WebP
    const outputBuffer = await sharp(inputBuffer)
      .webp({ quality })
      .toBuffer();

    // Upload to Blob Storage
    const fileName = `converted-${Date.now()}.webp`;
    const { url } = await put(fileName, outputBuffer, {
      access: "public",
      contentType: "image/webp",
    });

    // Return JSON with public URL
    res.status(200).json({ fileUrl: url });
  } catch (error) {
    console.error("Conversion failed:", error);
    res.status(500).json({ error: error.message });
  }
}

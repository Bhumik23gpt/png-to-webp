import { put } from "@vercel/blob";
import formidable from "formidable";
import sharp from "sharp";

export const config = {
  api: {
    bodyParser: false, // we’ll handle form-data manually
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      return res.status(500).json({ error: "Error parsing file" });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Convert to WebP
      const buffer = await sharp(file.filepath)
        .webp({ quality: 80 })
        .toBuffer();

      // Upload to Vercel Blob
      const filename = `${Date.now()}.webp`;
      const blob = await put(filename, buffer, {
        access: "public",
      });

      return res.status(200).json({ url: blob.url });
    } catch (err) {
      console.error("Processing error:", err);
      return res.status(500).json({ error: "Conversion failed" });
    }
  });
}

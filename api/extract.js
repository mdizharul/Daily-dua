// Vercel serverless function: POST /api/extract (screenshot → dua)
import { extractFromImage } from "../server/gemini.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed", message: "Method Not Allowed" });
  }
  const { status, body } = await extractFromImage(req.body, process.env.GEMINI_API_KEY);
  return res.status(status).json(body);
}

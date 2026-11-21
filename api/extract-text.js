// Vercel serverless function: POST /api/extract-text (pasted Arabic text → dua)
import { extractFromText } from "../server/gemini.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed", message: "Method Not Allowed" });
  }
  const { status, body } = await extractFromText(req.body, process.env.GEMINI_API_KEY);
  return res.status(status).json(body);
}

// Netlify function: POST /api/extract-text (pasted Arabic text → dua).
// netlify.toml redirects /api/* to /.netlify/functions/*.
import { extractFromText } from "../../server/gemini.js";
import { netlifyHandler } from "../../server/netlify.js";

export const handler = netlifyHandler(extractFromText);

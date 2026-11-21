// Netlify function: POST /api/extract (screenshot → dua).
// netlify.toml redirects /api/* to /.netlify/functions/*.
import { extractFromImage } from "../../server/gemini.js";
import { netlifyHandler } from "../../server/netlify.js";

export const handler = netlifyHandler(extractFromImage);

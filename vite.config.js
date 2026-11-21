import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { ROUTES } from './server/gemini.js'

// Serves /api/extract and /api/extract-text during `npm run dev`, using the
// same code as the Vercel/Netlify functions. Reads GEMINI_API_KEY from .env.local.
function devApi(apiKey) {
  return {
    name: 'daily-dua-dev-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const route = ROUTES[req.url.replace(/^\/|\?.*$/g, '')]
        if (!route) return next()

        const send = (status, body) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }
        if (req.method !== 'POST') return send(405, { error: 'method_not_allowed', message: 'Method Not Allowed' })

        let raw = ''
        for await (const chunk of req) raw += chunk
        let payload
        try {
          payload = JSON.parse(raw || '{}')
        } catch {
          return send(400, { error: 'bad_request', message: 'Invalid request body.' })
        }
        const { status, body } = await route(payload, apiKey)
        send(status, body)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), devApi(env.GEMINI_API_KEY)],
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: false,
    },
  }
})

import { readFileSync } from 'node:fs'
import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const USERSCRIPT = 'media-saver.user.js'

// Sites the YouTube helper userscript may run on:
//  • SITE_URL — comma-separated origins, e.g. a custom domain (first = home)
//  • the Cloudflare Pages project domain, derived from CF_PAGES_URL, which Pages
//    sets during builds (https://<hash>.<project>.pages.dev); previews included
//  • localhost while developing
function userscriptSites(devOrigin) {
  const origins = (process.env.SITE_URL || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean)
  const lines = origins.map((o) => `// @match        ${o}/*`)
  let home = origins[0] || ''

  const cfHost = process.env.CF_PAGES_URL && new URL(process.env.CF_PAGES_URL).hostname
  const project = cfHost?.endsWith('.pages.dev') && cfHost.split('.').slice(-3).join('.')
  if (project) {
    lines.push(`// @match        https://${project}/*`, `// @match        https://*.${project}/*`)
    home ||= `https://${project}`
  }

  if (devOrigin) {
    lines.push('// @include      http://localhost:*/*', '// @include      http://127.0.0.1:*/*')
    home ||= devOrigin
  }

  const hasSite = lines.length > 0
  if (home) lines.push(`// @downloadURL  ${home}/${USERSCRIPT}`, `// @updateURL    ${home}/${USERSCRIPT}`)
  return { lines, home, hasSite }
}

function buildUserscript(devOrigin) {
  const { lines, home, hasSite } = userscriptSites(devOrigin)
  const template = readFileSync(new URL(`./userscript/${USERSCRIPT}`, import.meta.url), 'utf8')
  const source = template
    .replace('// {{SITE_MATCHES}}', lines.join('\n') || '// (no site configured)')
    .replace('{{SITE_HOME}}', home)
  return { source, hasSite }
}

// Serves the helper at /media-saver.user.js in dev and emits it into the build.
function userscriptPlugin() {
  return {
    name: 'media-saver-userscript',
    configureServer(server) {
      server.middlewares.use(`/${USERSCRIPT}`, (req, res) => {
        res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
        res.end(buildUserscript(`http://${req.headers.host}`).source)
      })
    },
    generateBundle() {
      const { source, hasSite } = buildUserscript()
      if (!hasSite) {
        this.warn('Neither SITE_URL nor CF_PAGES_URL is set, so the YouTube helper userscript matches no site.')
      }
      this.emitFile({ type: 'asset', fileName: USERSCRIPT, source })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), userscriptPlugin()],

  // @ffmpeg/ffmpeg spins up its own worker; pre-bundling breaks that.
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
})

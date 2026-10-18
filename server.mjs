// HAILLA — serveur de production + proxy du Guide IA.
// - Sert le dossier dist/ (après `npm run build`)
// - POST /api/chat : relaie la conversation vers Claude en streaming (SSE)
// Sans clé API, /api/chat répond 503 et le site bascule sur le guide local (src/chat/engine.js).
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './src/chat/system-prompt.js';

const PORT = Number(process.env.PORT || 8787);
const DIST = join(process.cwd(), 'dist');
const hasKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
const client = hasKey ? new Anthropic() : null;
const SYSTEM = buildSystemPrompt();

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.json': 'application/json', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

const readBody = (req) =>
  new Promise((ok, ko) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 200_000) ko(new Error('payload too large')); });
    req.on('end', () => ok(data));
    req.on('error', ko);
  });

async function handleChat(req, res) {
  if (!client) {
    res.writeHead(503, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ error: 'no_api_key' }));
  }
  let body;
  try { body = JSON.parse(await readBody(req)); } catch {
    res.writeHead(400); return res.end();
  }
  // Only plain text turns from the browser; the last 16 are enough context for a travel chat.
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-16)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    res.writeHead(400); return res.end();
  }
  const lang = ['fr', 'en', 'ar'].includes(body.lang) ? body.lang : 'fr';

  res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  try {
    const stream = client.beta.messages.stream({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: `${SYSTEM}\n\nLangue de l'interface : ${lang}. Réponds dans la langue du dernier message du voyageur.`,
      messages,
    });
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') send({ t: event.delta.text });
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') send({ refusal: true });
    send({ done: true });
  } catch (err) {
    console.error('[chat]', err?.status ?? '', err?.message ?? err);
    send({ error: true });
  }
  res.end();
}

async function serveStatic(req, res) {
  const url = new URL(req.url, 'http://x');
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^[\/]+/, '');
  if (path.includes('..')) { res.writeHead(400); return res.end(); }
  let file = join(DIST, path || 'index.html');
  try {
    const s = await stat(file);
    if (s.isDirectory()) file = join(file, 'index.html');
  } catch {
    if (!extname(file)) file += '.html';
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Page introuvable');
  }
}

http
  .createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/chat') return handleChat(req, res);
    if (req.method === 'GET' && req.url === '/api/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ ai: hasKey }));
    }
    return serveStatic(req, res);
  })
  .listen(PORT, () => console.log(`HAILLA → http://localhost:${PORT}  (Guide IA ${hasKey ? 'Claude activé' : 'local'})`));

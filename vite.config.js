import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pages = ['index', 'explorer', 'lieu', 'carte', 'patrimoine', 'guide', 'voyages', 'compte', 'pro', 'a-propos', 'experiences'];

// <!--@include header--> → src/partials/header.html (header/footer shared by all pages, kept static for SEO)
const includePartials = () => ({
  name: 'hailla-partials',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) =>
      html.replace(/<!--@include ([\w-]+)-->/g, (_, name) =>
        readFileSync(resolve(__dirname, 'src/partials', `${name}.html`), 'utf8')
      ),
  },
});

export default defineConfig({
  // Relative URLs everywhere: the build works at a domain root or under /<repo>/ on GitHub Pages.
  base: './',
  plugins: [includePartials()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:8787' },
  },
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(__dirname, `${p}.html`)])),
    },
  },
});

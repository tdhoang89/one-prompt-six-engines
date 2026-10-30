#!/usr/bin/env node
// Rebuilds games.json from the files in games/<game>/<tech>.html.
//
//   node scripts/update-manifest.mjs                 # update games.json, index fallback, README tables
//   node scripts/update-manifest.mjs --screenshots   # also capture assets/screenshots/<game>-<tech>.png
//
// Auto fields (always recomputed): fileSizeKB, linesOfCode, libraryLoading, available, screenshot.
// Every other field is entered by hand and is never overwritten.
// No dependencies. --screenshots needs Playwright: `npm i -D playwright && npx playwright install chromium`.

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'games.json');
const GAMES_DIR = path.join(ROOT, 'games');
const SHOTS_DIR = path.join(ROOT, 'assets', 'screenshots');
const args = new Set(process.argv.slice(2));

// Text shown on the site is bilingual: { en, vi }.
const DEFAULT_TECHS = [
  { slug: 'canvas', name: 'HTML5 Canvas 2D', version: '', dimension: '2D', librarySize: '0',
    packaging: { en: 'No library needed, the lightest option', vi: 'Không cần thư viện, nhẹ nhất' } },
  { slug: 'phaser', name: 'Phaser', version: '4.2.1', dimension: '2D', librarySize: '~1.38 MB',
    packaging: { en: 'phaser.min.js can be pasted in as-is', vi: 'Dán thẳng phaser.min.js' } },
  { slug: 'pixi', name: 'PixiJS', version: '8.22.0', dimension: '2D', librarySize: '~0.84 MB',
    packaging: { en: 'pixi.min.js can be pasted in as-is', vi: 'Dán thẳng pixi.min.js' } },
  { slug: 'three', name: 'three.js', version: '0.186.1', dimension: '3D', librarySize: '~0.81 MB (module + core)',
    packaging: { en: 'ES modules only, must be bundled before inlining', vi: 'Chỉ còn dạng ES module, cần bundle trước khi nhúng' } },
  { slug: 'babylon', name: 'Babylon.js', version: '9.33.1', dimension: '3D', librarySize: '~8.8 MB (full build)',
    packaging: { en: 'Heaviest; a partial build is possible', vi: 'Nặng nhất; có thể chỉ lấy phần cần dùng' } },
  { slug: 'playcanvas', name: 'PlayCanvas (engine)', version: '2.23.3', dimension: '3D', librarySize: '~2.55 MB',
    packaging: { en: 'Engine only, no Editor', vi: 'Chỉ dùng engine, không dùng Editor' } },
];

const DEFAULT_GAMES = {
  'neon-swarm': {
    title: 'Neon Swarm', prompt: 'prompts/neon-swarm.md',
    audience: { en: 'Adults', vi: 'Người lớn' },
    tests: {
      en: 'Hundreds of objects, glow (bloom/filter/shader), 3D lighting, screen shake, slow motion, FPS counter and a Stress test mode.',
      vi: 'Hàng trăm vật thể, phát sáng (bloom/filter/shader), ánh sáng 3D, rung màn hình, slow-motion, bộ đếm FPS và chế độ Stress test.',
    },
  },
};

// Library banners that mark an inline <script> as an embedded engine rather than hand-written code.
const LIBRARY_BANNER = /@license|\/\*!|three\.js|pixi\.js|phaser|babylon|playcanvas/i;
const AUTO_NOTE = '[auto] ';

const readJSON = (file, fallback) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback);
const lineCount = (s) => s.split(/\r?\n/).filter((l) => l.trim() !== '').length;
const isExternal = (url) => /^(https?:)?\/\//i.test(url.trim());

function analyse(html) {
  let cdn = false;
  let libraryLines = 0;
  let libraryFound = false;
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const [whole, attrs, body] = m;
    const src = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
    if (src && isExternal(src)) cdn = true;
    if (src && /^data:/i.test(src)) { libraryFound = true; libraryLines += lineCount(whole); continue; }
    // three.js style: an import map or static/dynamic imports pointing at a CDN.
    if (/type\s*=\s*["']importmap["']/i.test(attrs) && /["'](https?:)?\/\//i.test(body)) cdn = true;
    if (/\bimport\s*(?:[\w{}*\s,]+from\s*)?\(?\s*["'](https?:)?\/\//.test(body)) cdn = true;
    if (!src && (body.length > 200_000 || (body.length > 50_000 && LIBRARY_BANNER.test(body.slice(0, 3000))))) {
      libraryFound = true;
      libraryLines += lineCount(body);
    }
  }
  const bytes = Buffer.byteLength(html);
  // 'none' = plain HTML5 with no engine at all (small file, nothing external, no library block).
  const libraryLoading = cdn ? 'cdn' : libraryFound || bytes > 400_000 ? 'embedded' : 'none';
  // A big self-contained file with no recognisable library block: we cannot tell own code from library code.
  if (!cdn && !libraryFound && bytes > 400_000) {
    return { libraryLoading, linesOfCode: null, note: 'linesOfCode: could not separate the embedded library from hand-written code' };
  }
  return { libraryLoading, linesOfCode: lineCount(html) - libraryLines, note: '' };
}

function newBuild(game, tech) {
  return {
    tech: tech.slug,
    techName: tech.name,
    version: tech.version,
    dimension: tech.dimension,
    file: `games/${game}/${tech.slug}.html`,
    madeWith: '',
    model: '',
    date: '',
    libraryLoading: '',
    fileSizeKB: null,
    linesOfCode: null,
    firstTryWorks: null,
    fixRounds: null,
    avgFps: null,
    resizeOk: null,
    stressMaxObjects: null,
    builtInEffects: '',
    score: null,
    notes: '',
    available: false,
    screenshot: '',
  };
}

function setAutoNote(build, note) {
  const manual = (build.notes || '').split(' | ').filter((p) => p && !p.startsWith(AUTO_NOTE));
  if (note) manual.push(AUTO_NOTE + note);
  build.notes = manual.join(' | ');
}

function updateManifest() {
  const manifest = readJSON(MANIFEST, {});
  manifest.project ??= 'One Prompt, Six Engines';
  manifest.libraryDataMeasured ??= '2026-10-30';
  manifest.techs ??= DEFAULT_TECHS;
  manifest.games ??= [];
  const techOrder = manifest.techs.map((t) => t.slug);

  const gameIds = fs.existsSync(GAMES_DIR)
    ? fs.readdirSync(GAMES_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
    : [];
  for (const id of gameIds) {
    if (!manifest.games.some((g) => g.id === id)) {
      const d = DEFAULT_GAMES[id] ?? { title: id, prompt: `prompts/${id}.md`, audience: { en: '', vi: '' }, tests: { en: '', vi: '' } };
      manifest.games.push({ id, ...d, builds: [] });
    }
  }

  for (const game of manifest.games) {
    const dir = path.join(GAMES_DIR, game.id);
    const slugs = new Set(techOrder);
    if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) if (f.endsWith('.html')) slugs.add(f.slice(0, -5));

    for (const slug of slugs) {
      let build = game.builds.find((b) => b.tech === slug);
      if (!build) {
        const tech = manifest.techs.find((t) => t.slug === slug) ?? { slug, name: slug, version: '', dimension: '' };
        build = newBuild(game.id, tech);
        game.builds.push(build);
      }
      const file = path.join(ROOT, build.file);
      const shot = `assets/screenshots/${game.id}-${slug}.png`;
      build.screenshot = fs.existsSync(path.join(ROOT, shot)) ? shot : '';
      if (!fs.existsSync(file)) {
        Object.assign(build, { available: false, libraryLoading: '', fileSizeKB: null, linesOfCode: null });
        setAutoNote(build, '');
        continue;
      }
      const html = fs.readFileSync(file, 'utf8');
      const a = analyse(html);
      build.available = true;
      build.libraryLoading = a.libraryLoading;
      build.fileSizeKB = Math.round((fs.statSync(file).size / 1024) * 10) / 10;
      build.linesOfCode = a.linesOfCode;
      setAutoNote(build, a.note);
    }
    const rank = (b) => (techOrder.includes(b.tech) ? techOrder.indexOf(b.tech) : 999);
    game.builds.sort((a, b) => rank(a) - rank(b));
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

// index.html keeps an inline copy so it still renders when opened straight from disk (file://).
function syncIndexFallback(manifest) {
  const file = path.join(ROOT, 'index.html');
  if (!fs.existsSync(file)) return;
  const json = JSON.stringify(manifest).replace(/</g, '\\u003c');
  const html = fs.readFileSync(file, 'utf8');
  const next = html.replace(
    /(<!-- manifest:start -->)[\s\S]*?(<!-- manifest:end -->)/,
    `$1\n<script type="application/json" id="manifest-fallback">${json}</script>\n$2`,
  );
  if (next !== html) fs.writeFileSync(file, next);
}

const LABELS = {
  en: {
    tech: 'Technique', version: 'Version', dim: '2D/3D', size: 'Size (KB)', loc: 'Own LOC', loading: 'Loading',
    first: 'First try', fixes: 'Fix rounds', fps: 'Avg FPS', resize: 'Resize OK', stress: 'Stress max', score: 'Score',
    yes: 'Yes', no: 'No', missing: 'not yet', cdn: 'CDN', embedded: 'Embedded', none: 'No library',
  },
  vi: {
    tech: 'Kỹ thuật', version: 'Version', dim: '2D/3D', size: 'Dung lượng (KB)', loc: 'Dòng code', loading: 'Nạp thư viện',
    first: 'Chạy ngay', fixes: 'Số lần sửa', fps: 'FPS TB', resize: 'Xoay/gập OK', stress: 'Stress tối đa', score: 'Điểm',
    yes: 'Có', no: 'Không', missing: 'chưa có', cdn: 'CDN', embedded: 'Nhúng', none: 'Không thư viện',
  },
};

function resultsMarkdown(manifest, lang) {
  const L = LABELS[lang];
  const v = (x) => (x === null || x === undefined || x === '' ? '—' : x === true ? L.yes : x === false ? L.no : String(x));
  const out = [];
  for (const game of manifest.games) {
    const stress = game.id === 'neon-swarm';
    const cols = [L.tech, L.version, L.dim, L.size, L.loc, L.loading, L.first, L.fixes, L.fps, L.resize, ...(stress ? [L.stress] : []), L.score];
    out.push(`**${game.title}**`, '', `| ${cols.join(' | ')} |`, `|${cols.map(() => '---').join('|')}|`);
    for (const b of game.builds) {
      const name = b.available ? `[${b.techName}](${b.file})` : `${b.techName} (${L.missing})`;
      const loading = b.libraryLoading ? L[b.libraryLoading] : '';
      const row = [name, v(b.version), v(b.dimension), v(b.fileSizeKB), v(b.linesOfCode), v(loading), v(b.firstTryWorks), v(b.fixRounds), v(b.avgFps), v(b.resizeOk), ...(stress ? [v(b.stressMaxObjects)] : []), v(b.score)];
      out.push(`| ${row.join(' | ')} |`);
    }
    out.push('');
  }
  return out.join('\n').trimEnd();
}

function syncReadmes(manifest) {
  for (const [name, lang] of [['README.md', 'en'], ['README.vi.md', 'vi']]) {
    const file = path.join(ROOT, name);
    if (!fs.existsSync(file)) continue;
    const md = fs.readFileSync(file, 'utf8');
    const next = md.replace(/(<!-- results:start -->)[\s\S]*?(<!-- results:end -->)/, `$1\n${resultsMarkdown(manifest, lang)}\n$2`);
    if (next !== md) fs.writeFileSync(file, next);
  }
}

// Minimal static server so games load the way they do on GitHub Pages (http, not file://).
function serve() {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.css': 'text/css' };
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function loadPlaywright() {
  for (const name of ['playwright', 'playwright-core']) {
    try { return await import(name); } catch {}
    try { return await import(pathToFileURL(path.join(ROOT, 'node_modules', name, 'index.mjs')).href); } catch {}
  }
  return null;
}

async function captureScreenshots(manifest) {
  const pw = await loadPlaywright();
  if (!pw) {
    console.error('Playwright not found. Install it with: npm i -D playwright && npx playwright install chromium');
    process.exitCode = 1;
    return;
  }
  // Prefer installed Chrome/Edge so WebGL runs on the real GPU; fall back to Playwright's Chromium.
  let browser;
  for (const opts of [{ channel: 'chrome' }, { channel: 'msedge' }, {}]) {
    try { browser = await pw.chromium.launch({ ...opts, args: ['--enable-gpu', '--ignore-gpu-blocklist'] }); break; } catch {}
  }
  if (!browser) { console.error('Could not launch Chrome, Edge or Chromium.'); process.exitCode = 1; return; }

  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}/`;
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
  for (const game of manifest.games) {
    for (const b of game.builds.filter((x) => x.available)) {
      const out = path.join(SHOTS_DIR, `${game.id}-${b.tech}.png`);
      const page = await browser.newPage({ viewport: { width: 960, height: 600 } });
      try {
        await page.goto(base + b.file, { waitUntil: 'networkidle', timeout: 30_000 });
        await page.waitForTimeout(1500);
        // Tap to start, then steer the player in a loop for ~2.8 s so the shot shows real gameplay.
        // If a shot lands on "Game over", just run the command again.
        await page.mouse.click(480, 300);
        const start = Date.now();
        for (let a = 0; Date.now() - start < 2800; a += 0.18) {
          await page.mouse.move(480 + Math.cos(a) * 200, 300 + Math.sin(a) * 140);
          await page.waitForTimeout(25);
        }
        await page.screenshot({ path: out });
        console.log('  shot', path.relative(ROOT, out));
      } catch (e) {
        console.warn('  failed', b.file, e.message);
      }
      await page.close();
    }
  }
  await browser.close();
  server.close();
}

let manifest = updateManifest();
if (args.has('--screenshots')) {
  await captureScreenshots(manifest);
  manifest = updateManifest(); // pick up the new screenshot paths
}
syncIndexFallback(manifest);
syncReadmes(manifest);

for (const g of manifest.games) {
  const ok = g.builds.filter((b) => b.available).length;
  console.log(`${g.title}: ${ok}/${g.builds.length} builds`);
}
console.log('Wrote', path.relative(process.cwd(), MANIFEST) || 'games.json');

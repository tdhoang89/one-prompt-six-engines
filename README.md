# One Prompt, Six Engines

The same prompt, the same AI model, the same game — only the game engine changes. Which technique does an AI build best?

**▶ Play all six builds: https://&lt;user&gt;.github.io/one-prompt-six-engines/** (site in English and Vietnamese)

[Tiếng Việt](README.vi.md)

## The idea

One prompt. One variable: the line `KỸ THUẬT: [ĐIỀN Ở ĐÂY]` ("TECHNIQUE: [FILL IN HERE]"). Six techniques. One game: **Neon Swarm**.

Every build is a **single HTML file** with no outside images, sounds or fonts — everything is drawn in code and all sound comes from the Web Audio API. That way the only difference between builds is the technique.

All builds in this repo were generated in **Claude web chat (claude.ai)** with **Claude Opus 5.5, High effort**, each technique in a fresh chat. Builds made in chat load their engine from `cdn.jsdelivr.net`, so you need an internet connection to play. The game files are published unchanged.

## The six techniques

Versions and library sizes measured on **2026-10-30** from jsDelivr / npm.

| Technique | Slug | Version | Type | Library (min, not gzipped) | Packing into one HTML file |
|---|---|---|---|---|---|
| HTML5 (Canvas 2D) | `canvas` | — | 2D | 0 | No library needed, the lightest option |
| Phaser | `phaser` | 4.2.1 | 2D | ~1.38 MB | `phaser.min.js` can be pasted in as-is |
| PixiJS | `pixi` | 8.22.0 | 2D | ~0.84 MB | `pixi.min.js` can be pasted in as-is |
| three.js | `three` | 0.186.1 | 3D | ~0.81 MB (module + core) | ES modules only, must be bundled before inlining |
| Babylon.js | `babylon` | 9.33.1 | 3D | ~8.8 MB (full build) | Heaviest; a partial build is possible |
| PlayCanvas (engine) | `playcanvas` | 2.23.3 | 3D | ~2.55 MB | Engine only, no Editor |

## The game: Neon Swarm

An arcade game for adults, played with one finger: dodge a swarm of glowing shapes, collect 10 energy orbs to fire a shockwave, set off chain reactions for combos. It is a stress test for the engine: hundreds of objects, glow (bloom / filter / shader), 3D lighting, screen shake and slow motion. Every build shows FPS and object count, and has a **Stress test** button that measures the maximum number of objects while FPS stays ≥ 50. [Read the prompt](prompts/neon-swarm.md)

## Scoring criteria

| Criterion | How it is measured |
|---|---|
| Works on first try | Recorded by hand (yes / no) |
| Fix rounds | Recorded by hand: how many times the AI had to be asked to fix it |
| Average FPS during normal play | Measured on a real device |
| Breaks on rotate / fold? | Recorded by hand |
| Own lines of code (excluding embedded libraries) | Calculated by script |
| File size | Calculated by script |
| Stress test — max objects | Measured on a real device |
| Built-in vs hand-made effects | Taken from the AI's report |
| Look & feel score, 1–5 | Scored by hand |

## Results

Generated from [`games.json`](games.json) by `scripts/update-manifest.mjs`. "—" means not measured yet. Own LOC = non-blank lines in the file, excluding any embedded engine code. Size is the HTML file only; CDN builds download the engine separately.

<!-- results:start -->
**Neon Swarm**

| Technique | Version | 2D/3D | Size (KB) | Own LOC | Loading | First try | Fix rounds | Avg FPS | Resize OK | Stress max | Score |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [HTML5 Canvas 2D](games/neon-swarm/canvas.html) | — | 2D | 39.6 | 774 | No library | — | — | — | — | — | — |
| [Phaser](games/neon-swarm/phaser.html) | 4.2.1 | 2D | 43.4 | 940 | CDN | — | — | — | — | — | — |
| [PixiJS](games/neon-swarm/pixi.html) | 8.22.0 | 2D | 48.8 | 1130 | CDN | — | — | — | — | — | — |
| [three.js](games/neon-swarm/three.html) | 0.186.1 | 3D | 48.6 | 819 | CDN | — | — | — | — | — | — |
| [Babylon.js](games/neon-swarm/babylon.html) | 9.33.1 | 3D | 43.7 | 813 | CDN | — | — | — | — | — | — |
| [PlayCanvas (engine)](games/neon-swarm/playcanvas.html) | 2.23.3 | 3D | 47.4 | 970 | CDN | — | — | — | — | — | — |
<!-- results:end -->

## Hypotheses (not yet verified)

- PixiJS and Phaser reach the highest object counts among the 2D builds in the stress test.
- Plain HTML5 Canvas runs out of breath first if its glow is done with Canvas `shadowBlur`.
- three.js, Babylon.js and PlayCanvas look best thanks to lighting, but ship heavier files.

## Reproduce it yourself

1. Open a new chat.
2. Paste the prompt from [`prompts/neon-swarm.md`](prompts/neon-swarm.md).
3. Fill in the `KỸ THUẬT:` line with the technique and version, for example `Phaser 4.2.1`.
4. Save the HTML file Claude returns as `games/neon-swarm/<slug>.html` (slugs are in the table above).
5. Run `node scripts/update-manifest.mjs` (Node 18+, no dependencies). It adds new builds to `games.json`, recalculates file size, lines of code and CDN/embedded, and refreshes the results table in both READMEs and the copy inside `index.html`. Fields you entered by hand are never overwritten.
6. Fill in the hand-measured fields in `games.json`: `madeWith`, `model`, `date`, `firstTryWorks`, `fixRounds`, `avgFps`, `resizeOk`, `stressMaxObjects`, `builtInEffects`, `score`, `notes`.
7. Optional: `node scripts/update-manifest.mjs --screenshots` plays each build for about 3 seconds and saves `assets/screenshots/<game>-<tech>.png`. Needs Playwright (`npm i -D playwright`) and Chrome, Edge or `npx playwright install chromium`. If a shot lands on "Game over", run it again.

## Publish on GitHub Pages

1. Create a repository (suggested name: `one-prompt-six-engines`) and upload everything in this folder to its root, including the `.nojekyll` file.
2. In the repository go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
3. After a minute the site is live at `https://<user>.github.io/one-prompt-six-engines/`. Replace `<user>` in this README with your GitHub username.

No build step is needed. The site picks Vietnamese or English from the browser language, remembers the visitor's choice, and accepts `?lang=vi` or `?lang=en` in the link. To preview locally, serve the folder with any static server (for example `npx serve .`); opening `index.html` straight from disk also works, but the prompt and code viewers need a server.

## Notes

- The stress test only means something on a real device (for example a Galaxy Z Fold 8). Headless browsers have no real GPU, so their numbers are not representative.
- Builds made in Claude chat load their engine from a CDN and need an internet connection; builds made with Claude Code embed the engine and run offline.
- Results depend on the model and the date, so every build records both.
- The screenshots come from about 3 seconds of automated play on a laptop; the FPS visible in them is not a result.

### Why Godot, PlayCanvas Editor and Unity are not included

- **Godot**: the web export is several files, including a `.wasm` tens of MB in size, and must be served from a server, so it can't be a single HTML file. Godot is a better fit for native APK exports.
- **PlayCanvas Editor**: a web-based editor whose projects export as a folder; an AI would need MCP to operate it.
- **Unity**: depends on the editor and prefabs, and is heavy; not a good fit for an AI to build on its own.

## License

[MIT](LICENSE)

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/akbare12/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/akbare12/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Sundown Harbor — GTA-style Cover Studio

Referral: `v7znzvhb`

Turn any photo and a caption into a multi-panel GTA-style cover poster, in
the browser, fully offline. **Sundown Harbor** is an entry for the
[make.fun gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01):
a Vice City sunset / neon cover maker with seven faces, one coast, and no
way back.

## What it does

- **7 layouts** — Hero mosaic, Hero + three, Six grid, Diagonal trio, Seven
  mosaic, Comic slash, Nine-panel. The hero panel pops out of its frame
  with a hot-pink border, comic-book style.
- **6 colour grades** — Sunset, Neon night, Golden hour, Tropic teal,
  Heatwave, Ultraviolet. Each is a gradient-map wash with vignette, film
  grain and an optional halftone print texture.
- **Two-layer title** — Anton in a yellow → orange → pink → purple sunset
  gradient with a dark outline, over a glowing white Pacifico script
  subtitle ("where the tide keeps secrets").
- **Two-line labels on every panel** — the role in big caps, then
  `LOCATION · TIME · NOTE` underneath (e.g. `THE DRIVER / OCEAN DRIVE ·
  6:42 PM · LOOKING FOR TROUBLE`).
- **Full poster furniture** — the quote strip with ★★★★★ at the top, the
  `VOL. 07` badge, the gold `ORIGINAL COVER ART` seal, a `COMING SOON`
  pill, a `WANTED ★★★★★` meter, a barcode, a palm-silhouette band, and
  two lines of production credits.
- **A real editor** — layout + grade pickers, per-panel Role / Location /
  Time / Note editing, Flip / Swap / Face-focus controls, per-panel zoom,
  drag-to-pan and scroll-to-zoom on the preview, Paint / Grade / Halftone /
  Grain sliders, preview zoom, Undo / Redo, Auto layout, Surprise me, and
  Restore sample cast (7 photos).
- **Any photo** — load your own photo into any panel, or fill several
  panels with one photo. Photos are read on your machine and never
  uploaded.
- **Export PNG** — 1080 × 1080, 1080 × 1350 and 1920 × 1080, one at a time
  or all three at once.

## The sample cast

Seven AI-made portraits (no real people, no game artwork):

| Role | Location · Time · Note |
|---|---|
| THE DRIVER | Ocean Drive · 6:42 PM · Looking for trouble |
| THE BOSS | Rooftop Bar · 8:05 PM · Owns the skyline |
| THE GETAWAY | Neon Street · 11:47 PM · Full throttle |
| THE ANGLER | Old Pier · 5:15 AM · Patient as the tide |
| THE FIXER | Back Alley · 9:30 PM · No questions asked |
| THE CHARMER | Casino Floor · 10:12 PM · Never bluffs |
| THE LOOKOUT | Bonfire Beach · 6:15 PM · Sees everything |

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network request: every script, font and sample photo is a
file under `app/`.

## Hand it in

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and
writes `dossier.json` with the vendored make.fun library
(`vendor/makefun-app.ts`, the kit's copy, unchanged).

## Screenshots

| File | What it shows |
|---|---|
| `screenshots/1-cover.jpg` | Cover, landscape 1280 × 720 — Hero mosaic + Sunset grade |
| `screenshots/2-editor.jpg` | The editor with a photo loaded, 1280 × 720 |
| `screenshots/3-cover.jpg` | Cover, portrait 1024 × 1280 — pop-out hero + Neon night |
| `screenshots/4-cover.jpg` | Cover, square 1080 × 1080 — Six grid + Golden hour |

## Credits

- Fonts: **Anton** and **Pacifico**, both under the SIL Open Font License
  (texts in `app/fonts/`).
- Sample photos: made with an image model for this entry — original
  portraits, not artwork from any game.
- No Rockstar Games logo, wordmark, artwork or font is used anywhere.

## License

MIT — see [LICENSE](LICENSE).

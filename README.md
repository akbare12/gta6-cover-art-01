# SUNDOWN HARBOR — Cover Studio

[![make.fun bounty](https://img.shields.io/badge/make.fun-bounty-gta6--cover--art--01-ff2975)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun](https://img.shields.io/badge/built%20with-make.fun-ffd319)](https://make.fun)
[![referral](https://img.shields.io/badge/referral-v7znzvhb-22d3ee)](https://make.fun/?ref=v7znzvhb)

Turn any photo and caption into Vice City style multi-panel cover art, offline in your browser. Your photos never leave your machine.

## What it does

- **7 layouts** — Hero mosaic, Hero + three, Six grid, Diagonal trio, Seven mosaic, Comic slash, Nine-panel
- **6 grades** — Sunset, Neon night, Golden hour, Tropic teal, Heatwave, Ultraviolet (gradient-map wash + vignette + grain + optional halftone)
- **Two-layer lettering** — Anton sunset-gradient title with dark outline, Pacifico neon script subtitle (always high contrast over dark)
- **Poster furniture** — quote + ★★★★★ strip, VOL. 07 badge, gold "ORIGINAL COVER ART" seal, COMING SOON pill, barcode, two-line production footer, palm-silhouette band, WANTED ★★★★★ meter
- **Two-line panel labels** — role + place · time · note on every panel; pop-out hero breaks the frame
- **Any photo** — load your own photos (FileReader, never uploaded), drag to reposition, scroll to zoom, Flip / Swap / Face focus per panel, editable name tags
- **Fast export** — PNG in 1080×1080, 1080×1350 and 1920×1080, plus "Export all three"; Undo/Redo, Auto layout, "Surprise me"

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network request. Static files under `app/` only.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-app.ts`, unchanged from the kit).

## Screenshots

| File | Scene |
| --- | --- |
| `screenshots/1-cover.jpg` | Cover, landscape 1920×1080, Hero mosaic + Sunset |
| `screenshots/2-editor.jpg` | Editor with the sample cast loaded |
| `screenshots/3-cover.jpg` | Cover, portrait 1080×1350, Nine-panel + Neon night |
| `screenshots/4-cover.jpg` | Cover, square 1080×1080, Six grid + Golden hour |

Scenes are the app's own `?shot=` mode (`app/src/shots.js`); the queries live in `shots.json`.

## Credits

- Lettering: **Anton** and **Pacifico**, SIL Open Font License (texts in `app/fonts/`).
- Sample photos: made with an image model for this entry (no real people, no game artwork).
- Original work only — no Rockstar Games logo, artwork or fonts.

## License

MIT — see [LICENSE](LICENSE).

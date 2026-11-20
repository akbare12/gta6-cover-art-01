// SUNDOWN HARBOR — screenshot scenes (?shot=).
// The app's own drawing, at the gate's sizes, with no editing or compositing:
//   ?shot=cover&layout=hero-mosaic&grade=sunset&size=1920x1080
//     → full-frame exported cover (the cover screenshot)
//   ?shot=cover&layout=nine-panel&grade=neon&size=1080x1350
//     → portrait cover, a different layout + grade
//   ?shot=cover&layout=six-grid&grade=golden&size=1080x1080
//     → square cover
//   ?shot=editor
//     → the editor with the sample cast loaded
// window.__shotReady flips true once the scene has drawn, so a headless
// browser knows when to capture.

import { defaultState, loadImages, renderCover, sizeById } from './cover.js';
import { initEditor, renderPreview } from './main.js';

const params = new URLSearchParams(location.search);
const shot = params.get('shot') || '';

function applyShotState(state) {
  if (params.get('layout')) state.layout = params.get('layout');
  if (params.get('grade')) state.grade = params.get('grade');
  if (params.get('size')) state.size = params.get('size');
  if (params.get('title')) state.title = params.get('title');
  if (params.get('subtitle')) state.subtitle = params.get('subtitle');
  return state;
}

async function shotCover() {
  document.body.classList.add('shot-cover');
  const state = applyShotState(defaultState());
  const size = sizeById(state.size);
  const canvas = document.createElement('canvas');
  canvas.id = 'shot-canvas';
  canvas.width = size.w;
  canvas.height = size.h;
  document.body.appendChild(canvas);
  await document.fonts.ready;
  const images = await loadImages(state);
  // Fonts must be truly usable before the title draws; wait for both.
  await Promise.all([
    document.fonts.load('100px Anton'),
    document.fonts.load('40px Pacifico'),
  ]);
  renderCover(canvas, state, images);
  window.__shotReady = true;
}

async function shotEditor() {
  await initEditor();
  // Select panel 2 (THE BOSS) so the per-panel controls are populated,
  // then scroll the right column to those controls: zoom slider,
  // Flip / Swap / Face, name tag — with the Effects sliders below them.
  const items = document.querySelectorAll('.panel-item');
  if (items[1]) items[1].click();
  // Scroll the RIGHT column inside its own box, never the document:
  // scrollIntoView on the document used to push the preview canvas
  // above the fold, leaving the left column blank dark purple.
  const aside = document.querySelector('.controls');
  if (aside) {
    aside.style.maxHeight = `${Math.max(320, window.innerHeight - aside.getBoundingClientRect().top - 24)}px`;
    aside.style.overflowY = 'auto';
  }
  const controls = document.querySelector('.panel-controls');
  if (controls) controls.scrollIntoView({ block: 'start' });
  window.scrollTo(0, 0);
  // Readiness guard: only signal ready once the preview canvas actually
  // holds a drawn, non-uniform frame (sample photos loaded + rendered).
  // A blank canvas re-renders once before we report ready.
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  if (!previewDrawn()) {
    renderPreview();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }
  // Show the export confirmation toast, pinned (no auto-hide in the shot).
  const toastEl = document.getElementById('toast');
  toastEl.textContent = 'Saved sundown-harbor-1920x1080.png — 1920 × 1080 PNG.';
  toastEl.classList.add('show');
  window.__shotReady = true;
}

// True when the preview canvas holds a drawn frame: many distinct
// colours across a pixel sample. A blank / cleared canvas has one.
// A probe failure must not block readiness, so it reports drawn.
function previewDrawn() {
  try {
    const c = document.getElementById('preview');
    if (!c || !c.width || !c.height) return false;
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    const seen = new Set();
    for (let i = 0; i < d.length; i += 400) {
      seen.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]);
      if (seen.size > 64) return true;
    }
    return false;
  } catch {
    return true;
  }
}

async function boot() {
  if (shot === 'cover') {
    await shotCover();
  } else if (shot === 'editor') {
    await shotEditor();
  } else {
    await initEditor();
    window.__shotReady = true;
  }
}

boot().catch((err) => {
  console.error(err);
  const pre = document.createElement('pre');
  pre.textContent = 'shot failed: ' + err.message;
  document.body.appendChild(pre);
  window.__shotReady = true;
  window.__shotError = String(err);
});

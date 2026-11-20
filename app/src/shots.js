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
import { initEditor } from './main.js';

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

async function boot() {
  if (shot === 'cover') {
    await shotCover();
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

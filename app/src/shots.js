// Screenshot scenes for the entry's screenshots (?shot=...). Each scene draws
// one exported cover full-frame with the app's own renderer, after the
// fonts and sample photos have loaded, then marks the page ready.
import { defaultState, loadPanelImages, drawCover } from './cover.js';

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  const scenes = {
    cover1: { w: 1280, h: 720, layout: 'hero-mosaic', grade: 'sunset' },
    cover3: { w: 1024, h: 1280, layout: 'hero-mosaic', grade: 'neon' },
    cover4: { w: 1080, h: 1080, layout: 'six-grid', grade: 'golden' },
  };
  const scene = scenes[shot];
  if (scene) {
    // The editor stays in the DOM but hidden; this canvas owns the frame.
    document.body.classList.add('shot');
    const c = document.createElement('canvas');
    c.id = 'shotCanvas';
    c.width = scene.w; c.height = scene.h;
    c.style.width = '100vw'; c.style.height = '100vh';
    c.style.objectFit = 'contain';
    document.body.appendChild(c);
    const state = defaultState();
    state.layout = scene.layout;
    state.grade = scene.grade;
    const run = async () => {
      try {
        await document.fonts.load('80px Anton');
        await document.fonts.load('40px Pacifico');
        await document.fonts.ready;
      } catch (e) { /* fall back to system fonts */ }
      const images = await loadPanelImages(state.panels);
      const ctx = c.getContext('2d');
      drawCover(ctx, scene.w, scene.h, state, images);
      document.title = 'shot-ready';
    };
    run();
  }
}

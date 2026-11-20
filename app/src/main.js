// SUNDOWN HARBOR — editor wiring: live preview, per-panel controls,
// caption editing, undo/redo, export. All state lives in one object;
// every change re-renders the preview canvas through cover.js.

import {
  defaultState, layoutById, layoutPanels, gradeById, loadImages,
  renderCover, EXPORT_SIZES, sizeById, GRADES, LAYOUTS,
} from './cover.js';

let state = defaultState();
let images = new Map();
let selected = 0;
let history = [];
let future = [];
let previewCanvas = null;

const $ = (id) => document.getElementById(id);

function snapshot() {
  return JSON.stringify(state);
}

function pushHistory() {
  history.push(snapshot());
  if (history.length > 60) history.shift();
  future = [];
  updateUndoButtons();
}

function undo() {
  if (!history.length) return;
  future.push(snapshot());
  state = JSON.parse(history.pop());
  selected = Math.min(selected, state.panels.length - 1);
  syncControls();
  renderPreview();
  updateUndoButtons();
}

function redo() {
  if (!future.length) return;
  history.push(snapshot());
  state = JSON.parse(future.pop());
  selected = Math.min(selected, state.panels.length - 1);
  syncControls();
  renderPreview();
  updateUndoButtons();
}

function updateUndoButtons() {
  $('btn-undo').disabled = history.length === 0;
  $('btn-redo').disabled = future.length === 0;
}

async function renderPreview() {
  if (!previewCanvas) return;
  const size = sizeById(state.size);
  const box = $('preview-box');
  const maxW = Math.min(box.clientWidth || 900, 900);
  const scale = Math.min(maxW / size.w, 560 / size.h, 1);
  previewCanvas.width = Math.round(size.w * scale);
  previewCanvas.height = Math.round(size.h * scale);
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  renderCover(off, state, images);
  const ctx = previewCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(off, 0, 0, previewCanvas.width, previewCanvas.height);
  drawSelectionOutline();
}

function drawSelectionOutline() {
  const size = sizeById(state.size);
  const sx = previewCanvas.width / size.w;
  const sy = previewCanvas.height / size.h;
  const rects = layoutPanels(state.layout, size.w, size.h);
  const r = rects[selected % rects.length];
  if (!r) return;
  const ctx = previewCanvas.getContext('2d');
  ctx.save();
  ctx.strokeStyle = '#ffd319';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 6]);
  ctx.strokeRect(r.x * size.w * sx + 1, r.y * size.h * sy + 1, r.w * size.w * sx - 2, r.h * size.h * sy - 2);
  ctx.restore();
}

// ---- Panel picking: click the preview, or the panel list ----
function panelAtPoint(mx, my) {
  const size = sizeById(state.size);
  const rect = previewCanvas.getBoundingClientRect();
  const x = (mx - rect.left) / rect.width;
  const y = (my - rect.top) / rect.height;
  const rects = layoutPanels(state.layout, size.w, size.h);
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}

function bindPreviewPointer() {
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  previewCanvas.addEventListener('pointerdown', (e) => {
    const idx = panelAtPoint(e.clientX, e.clientY);
    if (idx >= 0) {
      selected = idx;
      syncPanelControls();
      renderPreview();
    }
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    previewCanvas.setPointerCapture(e.pointerId);
  });
  previewCanvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const panel = state.panels[selected % state.panels.length];
    const rect = previewCanvas.getBoundingClientRect();
    const dx = (e.clientX - lastX) / rect.width;
    const dy = (e.clientY - lastY) / rect.height;
    panel.fx = clamp((panel.fx ?? 0.5) - dx * 0.8, 0, 1);
    panel.fy = clamp((panel.fy ?? 0.5) - dy * 0.8, 0, 1);
    lastX = e.clientX;
    lastY = e.clientY;
    renderPreview();
  });
  previewCanvas.addEventListener('pointerup', () => {
    if (dragging) pushHistory();
    dragging = false;
  });
  previewCanvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const panel = state.panels[selected % state.panels.length];
    panel.zoom = clamp((panel.zoom || 1) * (e.deltaY < 0 ? 1.08 : 0.93), 1, 3);
    $('panel-zoom').value = Math.round(panel.zoom * 100);
    $('zoom-val').textContent = Math.round(panel.zoom * 100) + '%';
    renderPreview();
  }, { passive: false });
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

// ---- Controls ----
function buildPickers() {
  const layoutBox = $('layout-picker');
  LAYOUTS.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick';
    b.textContent = l.name;
    b.dataset.layout = l.id;
    b.addEventListener('click', () => {
      pushHistory();
      state.layout = l.id;
      selected = Math.min(selected, layoutById(l.id).panels - 1);
      syncControls();
      renderPreview();
    });
    layoutBox.appendChild(b);
  });
  const gradeBox = $('grade-picker');
  GRADES.forEach((g) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick';
    b.textContent = g.name;
    b.dataset.grade = g.id;
    b.addEventListener('click', () => {
      pushHistory();
      state.grade = g.id;
      syncControls();
      renderPreview();
    });
    gradeBox.appendChild(b);
  });
  const sizeSel = $('size-select');
  EXPORT_SIZES.forEach((s) => {
    const o = document.createElement('option');
    o.value = s.id;
    o.textContent = s.label;
    sizeSel.appendChild(o);
  });
  sizeSel.addEventListener('change', () => {
    pushHistory();
    state.size = sizeSel.value;
    renderPreview();
  });
}

function buildPanelList() {
  const list = $('panel-list');
  list.innerHTML = '';
  const layout = layoutById(state.layout);
  for (let i = 0; i < layout.panels; i++) {
    const p = state.panels[i % state.panels.length];
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'panel-item' + (i === selected ? ' active' : '');
    item.innerHTML = `<span class="panel-num">${i + 1}</span><span class="panel-role">${escapeHtml(p.role)}</span><span class="panel-place">${escapeHtml(p.place)} · ${escapeHtml(p.time)}</span>`;
    item.addEventListener('click', () => {
      selected = i;
      syncPanelControls();
      renderPreview();
    });
    list.appendChild(item);
  }
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function syncPanelControls() {
  buildPanelList();
  const p = state.panels[selected % state.panels.length];
  $('panel-zoom').value = Math.round((p.zoom || 1) * 100);
  $('zoom-val').textContent = Math.round((p.zoom || 1) * 100) + '%';
  $('panel-role').value = p.role || '';
  $('panel-place').value = p.place || '';
  $('panel-time').value = p.time || '';
  $('panel-note').value = p.note || '';
  $('panel-tag').textContent = `Panel ${selected + 1} — ${p.role || 'THE CREW'}`;
}

function syncControls() {
  document.querySelectorAll('#layout-picker .pick').forEach((b) => {
    b.classList.toggle('active', b.dataset.layout === state.layout);
  });
  document.querySelectorAll('#grade-picker .pick').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
  });
  $('size-select').value = state.size;
  $('title-input').value = state.title;
  $('subtitle-input').value = state.subtitle;
  $('tagline-input').value = state.tagline;
  $('quote-input').value = state.quote;
  $('popout-check').checked = !!state.popout;
  for (const k of ['paint', 'grade', 'halftone', 'grain', 'glow']) {
    $(`fx-${k}`).value = state.fx[k];
    $(`fx-${k}-val`).textContent = state.fx[k];
  }
  syncPanelControls();
}

function bindControls() {
  $('title-input').addEventListener('input', (e) => { state.title = e.target.value; renderPreview(); });
  $('subtitle-input').addEventListener('input', (e) => { state.subtitle = e.target.value; renderPreview(); });
  $('tagline-input').addEventListener('input', (e) => { state.tagline = e.target.value; renderPreview(); });
  $('quote-input').addEventListener('input', (e) => { state.quote = e.target.value; renderPreview(); });
  $('popout-check').addEventListener('change', (e) => { pushHistory(); state.popout = e.target.checked; renderPreview(); });
  for (const k of ['paint', 'grade', 'halftone', 'grain', 'glow']) {
    $(`fx-${k}`).addEventListener('input', (e) => {
      state.fx[k] = Number(e.target.value);
      $(`fx-${k}-val`).textContent = e.target.value;
      renderPreview();
    });
  }
  $('panel-zoom').addEventListener('input', (e) => {
    const p = state.panels[selected % state.panels.length];
    p.zoom = Number(e.target.value) / 100;
    $('zoom-val').textContent = e.target.value + '%';
    renderPreview();
  });
  $('panel-role').addEventListener('input', (e) => {
    state.panels[selected % state.panels.length].role = e.target.value.toUpperCase();
    buildPanelList();
    renderPreview();
  });
  $('panel-place').addEventListener('input', (e) => {
    state.panels[selected % state.panels.length].place = e.target.value.toUpperCase();
    buildPanelList();
    renderPreview();
  });
  $('panel-time').addEventListener('input', (e) => {
    state.panels[selected % state.panels.length].time = e.target.value;
    renderPreview();
  });
  $('panel-note').addEventListener('input', (e) => {
    state.panels[selected % state.panels.length].note = e.target.value.toUpperCase();
    renderPreview();
  });
  $('btn-flip').addEventListener('click', () => {
    pushHistory();
    const p = state.panels[selected % state.panels.length];
    p.flip = !p.flip;
    renderPreview();
  });
  $('btn-swap').addEventListener('click', () => {
    pushHistory();
    const n = state.panels.length;
    const a = selected % n;
    const b = (a + 1) % n;
    [state.panels[a], state.panels[b]] = [state.panels[b], state.panels[a]];
    syncPanelControls();
    renderPreview();
  });
  $('btn-face').addEventListener('click', () => {
    pushHistory();
    const p = state.panels[selected % state.panels.length];
    const spots = [[0.5, 0.35], [0.3, 0.4], [0.7, 0.4], [0.5, 0.6], [0.5, 0.5]];
    const cur = spots.findIndex(([x, y]) => Math.abs((p.fx ?? 0.5) - x) < 0.06 && Math.abs((p.fy ?? 0.5) - y) < 0.06);
    const next = spots[(cur + 1) % spots.length];
    p.fx = next[0];
    p.fy = next[1];
    renderPreview();
  });
  $('btn-undo').addEventListener('click', undo);
  $('btn-redo').addEventListener('click', redo);
  $('btn-auto').addEventListener('click', autoLayout);
  $('btn-surprise').addEventListener('click', surpriseMe);
  $('btn-export').addEventListener('click', () => exportPng(sizeById(state.size)));
  $('btn-export-all').addEventListener('click', exportAllThree);
  $('photo-upload').addEventListener('change', onPhotoUpload);
  $('btn-samples').addEventListener('click', async () => {
    pushHistory();
    state.panels = defaultState().panels;
    images = await loadImages(state);
    syncControls();
    renderPreview();
    toast('Sample cast restored — 7 photos loaded.');
  });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
  });
}

async function onPhotoUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  pushHistory();
  const img = new Image();
  await new Promise((resolve) => { img.onload = resolve; img.src = dataUrl; });
  images.set(dataUrl, img);
  const p = state.panels[selected % state.panels.length];
  p.photo = dataUrl;
  p.zoom = 1;
  p.fx = 0.5;
  p.fy = 0.4;
  syncPanelControls();
  renderPreview();
  toast('Photo loaded into panel ' + (selected + 1) + ' — it never leaves this machine.');
  e.target.value = '';
}

function autoLayout() {
  pushHistory();
  // Pick the layout that fits the cast best: hero layouts for 4-7 faces.
  const n = state.panels.length;
  state.layout = n <= 4 ? 'hero-three' : n <= 6 ? 'hero-mosaic' : 'seven-mosaic';
  syncControls();
  renderPreview();
  toast('Auto layout: ' + layoutById(state.layout).name);
}

function surpriseMe() {
  pushHistory();
  const rnd = Math.random;
  state.layout = LAYOUTS[Math.floor(rnd() * LAYOUTS.length)].id;
  state.grade = GRADES[Math.floor(rnd() * GRADES.length)].id;
  const titles = [
    ['PALM TIDE', 'salt in the air, trouble on the water'],
    ['NEON CAUSEWAY', 'every light in town knows our names'],
    ['VELVET GETAWAY', 'drive fast, look good, never look back'],
    ['CORAL HEAT', 'the summer that never asked permission'],
    ['MIDNIGHT PIER', 'where the big fish and the big lies live'],
  ];
  const [t, s] = titles[Math.floor(rnd() * titles.length)];
  state.title = t;
  state.subtitle = s;
  // Shuffle the cast order.
  for (let i = state.panels.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [state.panels[i], state.panels[j]] = [state.panels[j], state.panels[i]];
  }
  syncControls();
  renderPreview();
  toast('Surprise me: ' + t + ' · ' + layoutById(state.layout).name + ' · ' + gradeById(state.grade).name);
}

function fileName(size) {
  const slug = state.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${slug}-${size.w}x${size.h}.png`;
}

export async function exportPng(size) {
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  renderCover(off, state, images);
  const blob = await new Promise((resolve) => off.toBlob(resolve, 'image/png'));
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName(size);
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast(`Saved ${fileName(size)} — ${size.w} × ${size.h} PNG.`);
  return fileName(size);
}

async function exportAllThree() {
  for (const s of EXPORT_SIZES) {
    await exportPng(s);
    await new Promise((r) => setTimeout(r, 350));
  }
  toast('Saved all three sizes: 1080×1080, 1080×1350, 1920×1080.');
}

let toastTimer = null;
export function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

export async function initEditor() {
  previewCanvas = $('preview');
  buildPickers();
  bindControls();
  bindPreviewPointer();
  await document.fonts.ready;
  images = await loadImages(state);
  syncControls();
  updateUndoButtons();
  renderPreview();
  window.addEventListener('resize', renderPreview);
}

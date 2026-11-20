// Sundown Harbor editor: layout + grade pickers, per-panel crop/position,
// caption editing, live Canvas preview, undo/redo and PNG export in the
// three common post sizes. Photos are read locally, never uploaded.
import { CAST, LAYOUTS, GRADES, defaultState, visiblePanels, loadPanelImages, drawCover, clamp } from './cover.js';

const canvas = document.getElementById('coverCanvas');
const ctx = canvas.getContext('2d');
const saveMsg = document.getElementById('saveMsg');
const fileInput = document.getElementById('fileInput');

let state = loadSaved() || defaultState();
let undoStack = [];
let redoStack = [];
let selected = 0;
let images = new Map();
let fileTarget = 0;

function loadSaved() {
  try {
    const raw = localStorage.getItem('sundown-harbor-v2');
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.panels) || s.panels.length < 1) return null;
    return s;
  } catch (e) { return null; }
}
function saveLocal() {
  try { localStorage.setItem('sundown-harbor-v2', JSON.stringify(state)); } catch (e) { /* storage full: ignore */ }
}
function snapshot() { return JSON.stringify(state); }
function pushUndo() {
  undoStack.push(snapshot());
  if (undoStack.length > 40) undoStack.shift();
  redoStack = [];
  refreshUndoButtons();
}
function applySnapshot(json) {
  state = JSON.parse(json);
  syncCaptionInputs();
  buildChips();
  buildPanelList();
  refresh();
}
function refreshUndoButtons() {
  document.getElementById('undoBtn').disabled = undoStack.length === 0;
  document.getElementById('redoBtn').disabled = redoStack.length === 0;
}

// ---- pickers ----
function buildChips() {
  const lc = document.getElementById('layoutChips');
  lc.innerHTML = '';
  for (const [id, def] of Object.entries(LAYOUTS)) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = def.name;
    if (state.layout === id) b.classList.add('active');
    b.addEventListener('click', () => { pushUndo(); state.layout = id; selected = 0; buildChips(); buildPanelList(); refresh(); });
    lc.appendChild(b);
  }
  const gc = document.getElementById('gradeChips');
  gc.innerHTML = '';
  for (const [id, def] of Object.entries(GRADES)) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'grade-chip';
    b.innerHTML = `<span class="swatch" style="background:linear-gradient(135deg, ${def.top}, ${def.bottom})"></span>${def.name}`;
    if (state.grade === id) b.classList.add('active');
    b.addEventListener('click', () => { pushUndo(); state.grade = id; buildChips(); refresh(); });
    gc.appendChild(b);
  }
}

// ---- per-panel editor cards ----
function buildPanelList() {
  const list = document.getElementById('panelList');
  list.innerHTML = '';
  const shown = visiblePanels(state);
  shown.forEach((panel, i) => {
    const card = document.createElement('div');
    card.className = 'panel-card' + (i === selected ? ' selected' : '');
    card.addEventListener('click', () => { selected = i; buildPanelList(); });
    const title = document.createElement('h3');
    title.innerHTML = `Panel ${i + 1} · <span class="tag">${panel.id.toUpperCase()}</span>`;
    card.appendChild(title);
    const fields = [['role', 'Role', panel.role], ['location', 'Location', panel.location], ['time', 'Time', panel.time], ['note', 'Note', panel.note]];
    for (const [key, label, val] of fields) {
      const lab = document.createElement('label');
      lab.textContent = label;
      const inp = document.createElement('input');
      inp.type = 'text'; inp.value = val; inp.maxLength = key === 'role' ? 20 : 32;
      inp.addEventListener('input', () => { pushUndoLight(); panel[key] = inp.value.toUpperCase(); refresh(); });
      lab.appendChild(inp);
      card.appendChild(lab);
    }
    const zoomLab = document.createElement('label');
    zoomLab.textContent = 'Zoom';
    const zoom = document.createElement('input');
    zoom.type = 'range'; zoom.min = 100; zoom.max = 220; zoom.value = Math.round((panel.zoom || 1) * 100);
    zoom.addEventListener('input', () => { panel.zoom = zoom.value / 100; refresh(); });
    zoom.addEventListener('change', pushUndo);
    zoomLab.appendChild(zoom);
    card.appendChild(zoomLab);
    const row = document.createElement('div');
    row.className = 'row';
    const flip = document.createElement('button');
    flip.type = 'button'; flip.textContent = panel.flip ? 'Unflip' : 'Flip';
    flip.addEventListener('click', (e) => { e.stopPropagation(); pushUndo(); panel.flip = !panel.flip; buildPanelList(); refresh(); });
    const face = document.createElement('button');
    face.type = 'button'; face.textContent = 'Face';
    face.title = 'Cycle the face focus (left / centre / right)';
    face.addEventListener('click', (e) => { e.stopPropagation(); pushUndo(); cycleFace(panel); buildPanelList(); refresh(); });
    const swap = document.createElement('select');
    swap.title = 'Swap with another panel';
    const opt0 = document.createElement('option'); opt0.value = ''; opt0.textContent = 'Swap…'; swap.appendChild(opt0);
    shown.forEach((p2, j) => {
      if (j === i) return;
      const o = document.createElement('option'); o.value = String(j); o.textContent = `Swap with panel ${j + 1} (${p2.role})`;
      swap.appendChild(o);
    });
    swap.addEventListener('change', () => {
      if (swap.value === '') return;
      pushUndo();
      const j = Number(swap.value);
      const a = state.panels.indexOf(panel);
      const b = state.panels.indexOf(shown[j]);
      [state.panels[a], state.panels[b]] = [state.panels[b], state.panels[a]];
      buildPanelList(); refresh();
    });
    const load = document.createElement('button');
    load.type = 'button'; load.textContent = 'Load your photo into this panel';
    load.addEventListener('click', (e) => { e.stopPropagation(); fileTarget = i; fileInput.click(); });
    row.append(flip, face, swap, load);
    card.appendChild(row);
    list.appendChild(card);
  });
}
const FACE_SPOTS = [[0.32, 0.42], [0.5, 0.42], [0.68, 0.42]];
function cycleFace(panel) {
  const cur = FACE_SPOTS.findIndex(([x]) => Math.abs((panel.fx ?? 0.5) - x) < 0.05);
  const next = FACE_SPOTS[(cur + 1) % FACE_SPOTS.length];
  panel.fx = next[0]; panel.fy = next[1];
}
// Typing a caption should not flood the undo stack: one entry per burst.
let lightTimer = null;
function pushUndoLight() {
  if (lightTimer) return;
  pushUndo();
  lightTimer = setTimeout(() => { lightTimer = null; }, 900);
}

// ---- render ----
async function refresh() {
  images = await loadPanelImages(visiblePanels(state));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCover(ctx, canvas.width, canvas.height, state, images);
  saveLocal();
  const wrap = document.getElementById('canvasWrap');
  wrap.style.transform = `scale(${state.previewZoom || 1})`;
  wrap.style.transformOrigin = 'top center';
}

// ---- caption + effect wiring ----
function syncCaptionInputs() {
  document.getElementById('titleInput').value = state.title;
  document.getElementById('subtitleInput').value = state.subtitle;
  document.getElementById('quoteInput').value = state.quote;
}
function bindText(id, key) {
  const el = document.getElementById(id);
  el.addEventListener('input', () => {
    pushUndoLight();
    state[key] = key === 'title' || key === 'quote' ? el.value.toUpperCase() : el.value;
    refresh();
  });
}
function bindSlider(id, valId, key) {
  const el = document.getElementById(id);
  const val = document.getElementById(valId);
  el.addEventListener('input', () => {
    val.textContent = el.value;
    state.effects[key] = el.value / 100;
    refresh();
  });
  el.addEventListener('change', pushUndo);
}
function exportCover(w, h, label) {
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const octx = off.getContext('2d');
  drawCover(octx, w, h, state, images);
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `SUNDOWN-HARBOR-${w}x${h}.PNG`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    saveMsg.textContent = `Saved SUNDOWN-HARBOR-${w}x${h}.PNG ✓`;
  }, 'image/png');
  return off;
}

// ---- pointer: click selects a panel, drag pans its photo, wheel zooms ----
function panelAt(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const px = (clientX - r.left) * (canvas.width / r.width);
  const py = (clientY - r.top) * (canvas.height / r.height);
  const layout = LAYOUTS[state.layout];
  const rects = layout.rects();
  const aspect = canvas.width / canvas.height;
  const panelTop = aspect > 1.35 ? 0.048 : 0.038;
  const panelBottom = aspect > 1.35 ? 0.565 : (aspect >= 0.8 ? 0.545 : 0.52);
  const area = { x: canvas.width * 0.012, y: panelTop * canvas.height, w: canvas.width * 0.976, h: (panelBottom - panelTop) * canvas.height };
  for (let i = rects.length - 1; i >= 0; i--) {
    const rr = rects[i];
    const x = area.x + rr.x * area.w, y = area.y + rr.y * area.h, w = rr.w * area.w, h = rr.h * area.h;
    if (px >= x && px <= x + w && py >= y && py <= y + h) return i;
  }
  return -1;
}
let dragging = false, dragStart = null, dragPanel = null;
canvas.addEventListener('pointerdown', (e) => {
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  selected = i; buildPanelList();
  const shown = visiblePanels(state);
  dragPanel = shown[i];
  dragging = true;
  dragStart = { x: e.clientX, y: e.clientY, fx: dragPanel.fx, fy: dragPanel.fy };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging || !dragPanel) return;
  const r = canvas.getBoundingClientRect();
  const dx = (e.clientX - dragStart.x) * (canvas.width / r.width);
  const dy = (e.clientY - dragStart.y) * (canvas.height / r.height);
  dragPanel.fx = clamp(dragStart.fx - dx / 900, 0.05, 0.95);
  dragPanel.fy = clamp(dragStart.fy - dy / 900, 0.05, 0.95);
  refresh();
});
canvas.addEventListener('pointerup', () => { if (dragging) pushUndo(); dragging = false; dragPanel = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  const panel = visiblePanels(state)[i];
  panel.zoom = clamp((panel.zoom || 1) * (e.deltaY < 0 ? 1.08 : 0.93), 1, 2.2);
  refresh();
}, { passive: false });

// ---- file loading ----
fileInput.addEventListener('change', () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    pushUndo();
    const shown = visiblePanels(state);
    const panel = shown[fileTarget];
    panel.src = reader.result;
    panel.id = file.name.replace(/\.[^.]+$/, '').toLowerCase().slice(0, 14) || 'photo';
    buildPanelList(); refresh();
    saveMsg.textContent = `Loaded ${file.name} into panel ${fileTarget + 1} ✓`;
  };
  reader.readAsDataURL(file);
  fileInput.value = '';
});

// ---- top buttons ----
document.getElementById('undoBtn').addEventListener('click', () => {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  applySnapshot(undoStack.pop());
  refreshUndoButtons();
});
document.getElementById('redoBtn').addEventListener('click', () => {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  applySnapshot(redoStack.pop());
  refreshUndoButtons();
});
document.getElementById('autoBtn').addEventListener('click', () => {
  pushUndo();
  const picks = state.panels.length >= 7 ? ['hero-mosaic', 'seven-mosaic'] : ['hero-three', 'six-grid'];
  state.layout = picks[Math.floor(Math.random() * picks.length)];
  buildChips(); buildPanelList(); refresh();
});
document.getElementById('surpriseBtn').addEventListener('click', () => {
  pushUndo();
  const layouts = Object.keys(LAYOUTS);
  const grades = Object.keys(GRADES);
  state.layout = layouts[Math.floor(Math.random() * layouts.length)];
  state.grade = grades[Math.floor(Math.random() * grades.length)];
  for (let i = state.panels.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.panels[i], state.panels[j]] = [state.panels[j], state.panels[i]];
  }
  state.effects.halftone = Math.random() < 0.4 ? 0.5 : 0;
  buildChips(); buildPanelList(); refresh();
});
document.getElementById('restoreBtn').addEventListener('click', () => {
  pushUndo();
  const keep = { layout: state.layout, grade: state.grade, title: state.title, subtitle: state.subtitle, quote: state.quote, effects: state.effects, previewZoom: state.previewZoom };
  state = { ...defaultState(), ...keep };
  selected = 0;
  syncCaptionInputs(); buildChips(); buildPanelList(); refresh();
  saveMsg.textContent = 'Sample cast restored — 7 photos ✓';
});
document.getElementById('expSquare').addEventListener('click', () => exportCover(1080, 1080));
document.getElementById('expStory').addEventListener('click', () => exportCover(1080, 1350));
document.getElementById('expWide').addEventListener('click', () => exportCover(1920, 1080));
document.getElementById('expAll').addEventListener('click', () => {
  exportCover(1080, 1080); exportCover(1080, 1350); exportCover(1920, 1080);
  saveMsg.textContent = 'Saved all three sizes ✓';
});
document.getElementById('zoomSlider').addEventListener('input', (e) => {
  state.previewZoom = e.target.value / 100;
  document.getElementById('zoomVal').textContent = `${e.target.value}%`;
  refresh();
});

// ---- boot ----
bindText('titleInput', 'title');
bindText('subtitleInput', 'subtitle');
bindText('quoteInput', 'quote');
bindSlider('paintSlider', 'paintVal', 'paint');
bindSlider('gradeSlider', 'gradeVal', 'grade');
bindSlider('halftoneSlider', 'halftoneVal', 'halftone');
bindSlider('grainSlider', 'grainVal', 'grain');
syncCaptionInputs();
buildChips();
buildPanelList();
refreshUndoButtons();
document.fonts.load('80px Anton').then(() => document.fonts.load('40px Pacifico')).then(() => refresh()).catch(() => refresh());
refresh();

// Sundown Harbor — cover renderer. Vanilla Canvas 2D, fully offline.
// Draws the multi-panel GTA-style poster: mosaic panels, two-layer title,
// sunset / neon grades, and dense poster furniture (quote, badges, seal,
// barcode, palm band, production credits). No network, no library.
export const TITLE = 'SUNDOWN HARBOR';
export const SUBTITLE = 'where the tide keeps secrets';
export const QUOTE = 'THE COAST NEVER FORGIVES — BUT IT ALWAYS DELIVERS';
export const FOOTER_A = 'A SUNDOWN PICTURES PRODUCTION · IN ASSOCIATION WITH PALM & PISTOL · A R. VALENTINE FILM';
export const FOOTER_B = 'MUSIC BY THE NIGHT SHIFT ORCHESTRA · EDITED BY J. MORROW · WRITTEN BY M. DELACROIX & T. OKAFOR · DIRECTED BY R. VALENTINE';

// The seven faces of the coast. Sample photos are AI-made portraits, not
// real people and not game artwork. `src` is a path under app/samples/.
export const CAST = [
  { id: 'driver', src: 'samples/driver.jpg', role: 'THE DRIVER', location: 'OCEAN DRIVE', time: '6:42 PM', note: 'LOOKING FOR TROUBLE' },
  { id: 'boss', src: 'samples/boss.jpg', role: 'THE BOSS', location: 'ROOFTOP BAR', time: '8:05 PM', note: 'OWNS THE SKYLINE' },
  { id: 'getaway', src: 'samples/getaway.jpg', role: 'THE GETAWAY', location: 'NEON STREET', time: '11:47 PM', note: 'FULL THROTTLE', fx: 0.4, fy: 0.45 },
  { id: 'angler', src: 'samples/angler.jpg', role: 'THE ANGLER', location: 'OLD PIER', time: '5:15 AM', note: 'PATIENT AS THE TIDE' },
  { id: 'fixer', src: 'samples/fixer.jpg', role: 'THE FIXER', location: 'BACK ALLEY', time: '9:30 PM', note: 'NO QUESTIONS ASKED' },
  { id: 'charmer', src: 'samples/charmer.jpg', role: 'THE CHARMER', location: 'CASINO FLOOR', time: '10:12 PM', note: 'NEVER BLUFFS' },
  { id: 'lookout', src: 'samples/lookout.jpg', role: 'THE LOOKOUT', location: 'BONFIRE BEACH', time: '6:15 PM', note: 'SEES EVERYTHING', zoom: 1.0, fy: 0.48 },
];

export const FACES_WORDS = { 3: 'THREE', 4: 'FOUR', 5: 'FIVE', 6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE' };

// Layouts. Each returns rects {x,y,w,h,hero,slant} in fractions of the panel
// area (0..1). `count` is how many panels the layout shows; the tagline
// counts the faces shown, so it follows the layout.
export const LAYOUTS = {
  'hero-mosaic': {
    name: 'Hero mosaic', count: 7,
    rects() {
      return [
        { x: 0.0, y: 0.0, w: 0.47, h: 0.66, hero: true },
        { x: 0.48, y: 0.0, w: 0.255, h: 0.325 },
        { x: 0.745, y: 0.0, w: 0.255, h: 0.325 },
        { x: 0.48, y: 0.335, w: 0.255, h: 0.325 },
        { x: 0.745, y: 0.335, w: 0.255, h: 0.325 },
        { x: 0.0, y: 0.67, w: 0.495, h: 0.33 },
        { x: 0.505, y: 0.67, w: 0.495, h: 0.33 },
      ];
    },
  },
  'hero-three': {
    name: 'Hero + three', count: 4,
    rects() {
      return [
        { x: 0.0, y: 0.0, w: 0.62, h: 1.0, hero: true },
        { x: 0.63, y: 0.0, w: 0.37, h: 0.325 },
        { x: 0.63, y: 0.3375, w: 0.37, h: 0.325 },
        { x: 0.63, y: 0.675, w: 0.37, h: 0.325 },
      ];
    },
  },
  'six-grid': {
    name: 'Six grid', count: 6,
    rects() {
      const out = [];
      for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++)
        out.push({ x: c * 0.3375, y: r * 0.51, w: 0.325, h: 0.49, hero: r === 0 && c === 1 });
      return out;
    },
  },
  'diagonal-trio': {
    name: 'Diagonal trio', count: 3,
    rects() {
      return [
        { x: 0.0, y: 0.07, w: 0.36, h: 0.86, hero: true },
        { x: 0.325, y: 0.0, w: 0.36, h: 0.86 },
        { x: 0.65, y: 0.07, w: 0.35, h: 0.86 },
      ];
    },
  },
  'seven-mosaic': {
    name: 'Seven mosaic', count: 7,
    rects() {
      return [
        { x: 0.0, y: 0.0, w: 0.325, h: 0.33 },
        { x: 0.3375, y: 0.0, w: 0.325, h: 0.33 },
        { x: 0.675, y: 0.0, w: 0.325, h: 0.33 },
        { x: 0.0, y: 0.34, w: 1.0, h: 0.30, hero: true },
        { x: 0.0, y: 0.65, w: 0.325, h: 0.35 },
        { x: 0.3375, y: 0.65, w: 0.325, h: 0.35 },
        { x: 0.675, y: 0.65, w: 0.325, h: 0.35 },
      ];
    },
  },
  'comic-slash': {
    name: 'Comic slash', count: 5,
    rects() {
      return [
        { x: 0.0, y: 0.0, w: 0.30, h: 1.0, hero: true, slant: 0.05 },
        { x: 0.24, y: 0.0, w: 0.24, h: 1.0, slant: 0.05 },
        { x: 0.43, y: 0.0, w: 0.24, h: 1.0, slant: 0.05 },
        { x: 0.62, y: 0.0, w: 0.24, h: 1.0, slant: 0.05 },
        { x: 0.81, y: 0.0, w: 0.19, h: 1.0, slant: 0.05 },
      ];
    },
  },
  'nine-panel': {
    name: 'Nine-panel', count: 9,
    rects() {
      const out = [];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
        out.push({ x: c * 0.3375, y: r * 0.34, w: 0.325, h: 0.32, hero: r === 1 && c === 1 });
      return out;
    },
  },
};

// Colour grades. Each grade is a gradient-map wash: a warm top light, a deep
// bottom shade, a multiply tint and a screen glow, layered over the photo.
export const GRADES = {
  sunset: { name: 'Sunset', top: '#ffb347', bottom: '#ff2e63', tint: '#ff7a3d', glow: '#ffd166', strength: 0.55, warm: 1.25 },
  neon: { name: 'Neon night', top: '#ff2e88', bottom: '#0e2a5c', tint: '#b14dff', glow: '#37e6ff', strength: 0.62, warm: 1.05 },
  golden: { name: 'Golden hour', top: '#ffd76a', bottom: '#e86a17', tint: '#ffb347', glow: '#fff3b0', strength: 0.5, warm: 1.35 },
  teal: { name: 'Tropic teal', top: '#2ee6c8', bottom: '#ff6a3d', tint: '#19b8a6', glow: '#a7fff0', strength: 0.5, warm: 1.1 },
  heatwave: { name: 'Heatwave', top: '#ff5e3a', bottom: '#7a0e2e', tint: '#ff3d2e', glow: '#ffb03d', strength: 0.6, warm: 1.4 },
  ultraviolet: { name: 'Ultraviolet', top: '#c44dff', bottom: '#12002e', tint: '#7a2eff', glow: '#ff5ce1', strength: 0.62, warm: 0.95 },
};

export function defaultPanels() {
  return CAST.map((c) => ({ ...c, zoom: c.zoom ?? 1.15, fx: c.fx ?? 0.5, fy: c.fy ?? 0.42, flip: false }));
}

export function defaultState() {
  return {
    layout: 'hero-mosaic',
    grade: 'sunset',
    title: TITLE,
    subtitle: SUBTITLE,
    quote: QUOTE,
    panels: defaultPanels(),
    effects: { paint: 0.55, grade: 0.8, halftone: 0, grain: 0.5 },
    previewZoom: 1,
  };
}

export function visiblePanels(state) {
  const layout = LAYOUTS[state.layout] || LAYOUTS['hero-mosaic'];
  const n = layout.count;
  const panels = [];
  for (let i = 0; i < n; i++) panels.push(state.panels[i % state.panels.length]);
  return panels;
}

export function taglineFor(state) {
  const layout = LAYOUTS[state.layout] || LAYOUTS['hero-mosaic'];
  const word = FACES_WORDS[layout.count] || String(layout.count);
  return `${word} FACES · ONE COAST · NO WAY BACK`;
}

export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
export function lerp(a, b, t) { return a + (b - a) * t; }

// ---- image loading (cached, offline files or user data: URLs) ----
const imageCache = new Map();
export function loadImage(src) {
  if (imageCache.has(src)) return imageCache.get(src);
  const p = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('cannot load ' + src));
    img.src = src;
  });
  imageCache.set(src, p);
  return p;
}
export async function loadPanelImages(panels) {
  const out = new Map();
  await Promise.all(panels.map(async (p) => {
    try { out.set(p.src, await loadImage(p.src)); } catch (e) { /* missing photo: panel stays dark */ }
  }));
  return out;
}

// ---- grain + halftone patterns (generated once, reused) ----
let grainCanvas = null;
export function grainPattern(ctx) {
  if (!grainCanvas) {
    grainCanvas = document.createElement('canvas');
    grainCanvas.width = 140; grainCanvas.height = 140;
    const g = grainCanvas.getContext('2d');
    const data = g.createImageData(140, 140);
    for (let i = 0; i < data.data.length; i += 4) {
      const v = 118 + Math.floor(Math.random() * 40);
      data.data[i] = v; data.data[i + 1] = v; data.data[i + 2] = v; data.data[i + 3] = 255;
    }
    g.putImageData(data, 0, 0);
  }
  return ctx.createPattern(grainCanvas, 'repeat');
}
let dotCanvas = null;
export function halftonePattern(ctx) {
  if (!dotCanvas) {
    dotCanvas = document.createElement('canvas');
    dotCanvas.width = 12; dotCanvas.height = 12;
    const g = dotCanvas.getContext('2d');
    g.fillStyle = '#000';
    g.beginPath(); g.arc(6, 6, 2.1, 0, Math.PI * 2); g.fill();
  }
  return ctx.createPattern(dotCanvas, 'repeat');
}

// Draw one photo cover-fitting a rect, honouring zoom / focus / flip, then
// wash it with the chosen grade. `paint` (0..1) posterises the photo.
export function drawPhotoPanel(ctx, img, rect, panel, grade, paint, gradeAmt) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  if (panel.slant) {
    const s = panel.slant * w;
    ctx.moveTo(x + s, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - s, y + h); ctx.lineTo(x, y + h);
  } else ctx.rect(x, y, w, h);
  ctx.closePath(); ctx.clip();
  if (img) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const base = Math.max(w / iw, h / ih) * (panel.zoom || 1);
    const dw = iw * base, dh = ih * base;
    const cx = clamp(panel.fx ?? 0.5, 0, 1) * dw;
    const cy = clamp(panel.fy ?? 0.42, 0, 1) * dh;
    let dx = x + w / 2 - cx, dy = y + h / 2 - cy;
    dx = clamp(dx, x + w - dw, x); dy = clamp(dy, y + h - dh, y);
    if (dw <= w) dx = x + (w - dw) / 2;
    if (dh <= h) dy = y + (h - dh) / 2;
    const sat = (1 + 0.35 * paint).toFixed(2);
    const con = (1 + 0.18 * paint).toFixed(2);
    ctx.filter = `saturate(${sat}) contrast(${con})`;
    if (panel.flip) {
      ctx.translate(x + w / 2, 0); ctx.scale(-1, 1); ctx.translate(-(x + w / 2), 0);
    }
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = '#2a1230'; ctx.fillRect(x, y, w, h);
  }
  // Grade wash: warm gradient overlay, multiply tint, cool glow from below.
  const g = GRADES[grade] || GRADES.sunset;
  const a = gradeAmt * g.strength;
  ctx.globalCompositeOperation = 'overlay';
  const wash = ctx.createLinearGradient(x, y, x, y + h);
  wash.addColorStop(0, g.top); wash.addColorStop(1, g.bottom);
  ctx.globalAlpha = a * 0.85;
  ctx.fillStyle = wash; ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = a * 0.28;
  ctx.fillStyle = g.tint; ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'screen';
  const glow = ctx.createLinearGradient(x, y + h * 0.55, x, y + h);
  glow.addColorStop(0, 'rgba(0,0,0,0)'); glow.addColorStop(1, g.glow);
  ctx.globalAlpha = a * 0.35;
  ctx.fillStyle = glow; ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  // Vignette: dark corners keep the label readable.
  const vg = ctx.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.35, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
  vg.addColorStop(0, 'rgba(10,4,20,0)'); vg.addColorStop(1, 'rgba(10,4,20,0.42)');
  ctx.fillStyle = vg; ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// Two-line role label: black pill, yellow left bar, role on top, the
// location · time · note line beneath. Shrinks to fit the panel.
export function drawPanelLabel(ctx, rect, panel, scale) {
  const pad = 10 * scale;
  const barW = Math.max(3, 5 * scale);
  const roleSize = clamp(rect.h * 0.115, 11 * scale, 30 * scale);
  const subSize = clamp(roleSize * 0.52, 8 * scale, 16 * scale);
  ctx.save();
  ctx.font = `${roleSize}px Anton, sans-serif`;
  const roleW = ctx.measureText(panel.role).width;
  ctx.font = `${subSize}px Arial, sans-serif`;
  const sub = `${panel.location} · ${panel.time} · ${panel.note}`;
  const subW = ctx.measureText(sub).width;
  const innerW = Math.max(roleW, subW);
  let pillW = innerW + pad * 2 + barW + 8 * scale;
  let f = 1;
  const maxW = rect.w - 14 * scale;
  if (pillW > maxW) { f = maxW / pillW; pillW = maxW; }
  const pillH = (roleSize + subSize + pad * 1.5) * f;
  const px = rect.x + 7 * scale, py = rect.y + rect.h - pillH - 7 * scale;
  ctx.fillStyle = 'rgba(8,3,16,0.88)';
  ctx.fillRect(px, py, pillW, pillH);
  ctx.fillStyle = '#ffd21f';
  ctx.fillRect(px, py, barW * f + 1, pillH);
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${roleSize * f}px Anton, sans-serif`;
  ctx.fillText(panel.role, px + barW + pad * f, py + roleSize * f + pad * 0.55 * f);
  ctx.font = `${subSize * f}px Arial, sans-serif`;
  ctx.fillStyle = '#ffd9ec';
  ctx.fillText(sub, px + barW + pad * f, py + (roleSize + subSize) * f + pad * 0.7 * f);
  ctx.restore();
}

// A gold "ORIGINAL COVER ART" seal: radial gold disc, dark ring, star.
export function drawGoldSeal(ctx, cx, cy, r) {
  ctx.save();
  const gold = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
  gold.addColorStop(0, '#fff3b0'); gold.addColorStop(0.55, '#f5b81d'); gold.addColorStop(1, '#a86e00');
  ctx.fillStyle = gold;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.09); ctx.strokeStyle = '#5c3a00';
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#4a2c00';
  ctx.font = `${r * 0.34}px Anton, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('★', cx, cy - r * 0.34);
  ctx.font = `${r * 0.2}px Anton, sans-serif`;
  ctx.fillText('ORIGINAL', cx, cy + r * 0.18);
  ctx.fillText('COVER ART', cx, cy + r * 0.44);
  ctx.restore();
}

// Barcode: deterministic bars + number, bottom-right of the cover.
export function drawBarcode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#111111';
  let seed = 90234, bx = x + w * 0.04;
  while (bx < x + w * 0.94) {
    seed = (seed * 16807) % 2147483647;
    const bw = (seed % 3 + 1) * (w / 90);
    if (seed % 5 < 3) ctx.fillRect(bx, y + h * 0.08, bw, h * 0.62);
    bx += bw + (w / 110);
  }
  ctx.font = `${Math.max(7, h * 0.16)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('8 90234 56789', x + w / 2, y + h * 0.92);
  ctx.restore();
}

// One palm silhouette: curved trunk + five drooping fronds.
export function drawPalm(ctx, x, y, h, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = 'rgba(6,2,12,0.9)';
  ctx.fillStyle = 'rgba(6,2,12,0.9)';
  ctx.lineWidth = Math.max(3, h * 0.07);
  ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(lean * h * 0.25, -h * 0.55, lean * h * 0.45, -h);
  ctx.stroke();
  const tx = lean * h * 0.45, ty = -h;
  for (let i = 0; i < 5; i++) {
    const ang = Math.PI * (0.08 + i * 0.19) + (lean > 0 ? 0.15 : -0.15);
    const len = h * (0.42 + (i % 2) * 0.1);
    ctx.beginPath(); ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(ang) * len * 0.6, ty - Math.sin(ang) * len * 0.4 - h * 0.12, tx + Math.cos(ang) * len, ty + h * 0.22 - Math.sin(ang) * len * 0.2);
    ctx.lineWidth = Math.max(2, h * 0.045); ctx.stroke();
  }
  ctx.restore();
}

// ---- the full cover ----
export function drawCover(ctx, W, H, state, images) {
  const scale = W / 1280; // layout metrics are tuned at 1280 wide
  const aspect = W / H;
  const landscape = aspect > 1.35;
  const squareish = aspect <= 1.35 && aspect >= 0.8;
  // Zones (fractions of H). Landscape keeps the title block roomy; portrait
  // and square give the panels more of the frame.
  const quoteH = landscape ? 0.048 : 0.038;
  const panelTop = quoteH;
  const panelBottom = landscape ? 0.565 : (squareish ? 0.545 : 0.52);
  const tagY = panelBottom + (landscape ? 0.026 : 0.024);
  const titleY = panelBottom + (landscape ? 0.145 : 0.135);
  const subY = panelBottom + (landscape ? 0.245 : 0.235);
  const palmTop = landscape ? 0.875 : 0.855;
  const foot1Y = landscape ? 0.955 : 0.945;
  const foot2Y = landscape ? 0.978 : 0.972;

  // Deep violet night sky behind everything.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1b0b2e'); bg.addColorStop(0.55, '#160a24'); bg.addColorStop(1, '#0d0518');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Quote strip: the line + five stars, centred at the very top.
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${Math.max(11, H * 0.02)}px Anton, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(state.quote, W / 2 - 30 * scale, (quoteH / 2) * H);
  ctx.fillStyle = '#ffd21f';
  ctx.fillText('★★★★★', W / 2 + ctx.measureText(state.quote).width / 2 + 46 * scale, (quoteH / 2) * H);
  ctx.restore();

  // Panels.
  const layout = LAYOUTS[state.layout] || LAYOUTS['hero-mosaic'];
  const panels = visiblePanels(state);
  const rects = layout.rects();
  const area = { x: W * 0.012, y: panelTop * H, w: W * 0.976, h: (panelBottom - panelTop) * H };
  const gap = 6 * scale;
  const eff = state.effects || { paint: 0.55, grade: 0.8, halftone: 0, grain: 0.5 };
  const drawn = rects.map((r, i) => {
    const rect = {
      x: area.x + r.x * area.w + (r.x > 0 ? gap / 2 : 0),
      y: area.y + r.y * area.h + (r.y > 0 ? gap / 2 : 0),
      w: r.w * area.w - gap, h: r.h * area.h - gap,
      slant: r.slant, hero: !!r.hero,
    };
    return { rect, panel: panels[i], hero: !!r.hero };
  });
  // Non-hero panels first so the pop-out hero overlaps them.
  for (const d of drawn.filter((d) => !d.hero)) {
    drawPhotoPanel(ctx, images.get(d.panel.src), d.rect, { ...d.panel, slant: d.rect.slant }, state.grade, eff.paint, eff.grade);
    drawPanelLabel(ctx, d.rect, d.panel, scale);
  }
  for (const d of drawn.filter((d) => d.hero)) {
    // Pop-out hero: bursts out of its frame with a hot-pink border.
    const pop = Math.min(d.rect.w, d.rect.h) * 0.045;
    const hr = { x: d.rect.x - pop * 0.7, y: d.rect.y - pop * 1.15, w: d.rect.w + pop * 1.4, h: d.rect.h + pop * 1.9, slant: 0 };
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 22 * scale; ctx.shadowOffsetY = 8 * scale;
    ctx.fillStyle = '#ff2e88'; ctx.fillRect(hr.x - 3 * scale, hr.y - 3 * scale, hr.w + 6 * scale, hr.h + 6 * scale);
    ctx.restore();
    drawPhotoPanel(ctx, images.get(d.panel.src), hr, { ...d.panel, slant: 0 }, state.grade, eff.paint, eff.grade);
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(hr.x + 1, hr.y + 1, hr.w - 2, hr.h - 2);
    ctx.restore();
    drawPanelLabel(ctx, hr, d.panel, scale);
  }

  // Halftone dots over the panel area (optional print texture).
  if (eff.halftone > 0.02) {
    ctx.save();
    ctx.globalAlpha = eff.halftone * 0.16;
    ctx.fillStyle = halftonePattern(ctx);
    ctx.fillRect(area.x, area.y, area.w, area.h);
    ctx.restore();
  }

  // Furniture on the panel area.
  ctx.save();
  // VOL. 07 badge, top-left, tilted.
  ctx.translate(area.x + 34 * scale, area.y + 16 * scale);
  ctx.rotate(-0.06);
  ctx.fillStyle = '#ffd21f';
  ctx.fillRect(-34 * scale, -13 * scale, 68 * scale, 26 * scale);
  ctx.fillStyle = '#160a24';
  ctx.font = `${15 * scale}px Anton, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('VOL. 07', 0, 1);
  ctx.restore();
  // WANTED meter, top-right.
  ctx.save();
  const wanted = 'WANTED ★★★★★';
  ctx.font = `${15 * scale}px Anton, sans-serif`;
  const ww = ctx.measureText(wanted).width + 22 * scale;
  ctx.fillStyle = 'rgba(8,3,16,0.85)';
  ctx.fillRect(area.x + area.w - ww - 8 * scale, area.y + 6 * scale, ww, 26 * scale);
  ctx.strokeStyle = '#ff2e88'; ctx.lineWidth = 2 * scale;
  ctx.strokeRect(area.x + area.w - ww - 8 * scale, area.y + 6 * scale, ww, 26 * scale);
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(wanted, area.x + area.w - ww / 2 - 8 * scale, area.y + 20 * scale);
  ctx.restore();
  // COMING SOON pill, bottom-left of the panels, floating just above the
  // bottom-left panel's role label so the two never collide.
  ctx.save();
  ctx.font = `${13 * scale}px Anton, sans-serif`;
  const cw = ctx.measureText('COMING SOON').width + 24 * scale;
  ctx.fillStyle = '#160a24';
  ctx.beginPath();
  ctx.roundRect(area.x + 10 * scale, area.y + area.h - 104 * scale, cw, 26 * scale, 13 * scale);
  ctx.fill();
  ctx.strokeStyle = '#ffd21f'; ctx.lineWidth = 2 * scale; ctx.stroke();
  ctx.fillStyle = '#ffd21f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('COMING SOON', area.x + 10 * scale + cw / 2, area.y + area.h - 90 * scale);
  ctx.restore();
  // Gold seal, mid-height on the right edge, straddling the boundary
  // between the right-column panels — it never covers a role label, which
  // always sits at a panel's bottom-left.
  drawGoldSeal(ctx, area.x + area.w - 48 * scale, area.y + area.h * 0.52, 42 * scale);

  // Tagline band.
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${Math.max(12, H * 0.021)}px Anton, sans-serif`;
  ctx.fillStyle = '#ffd21f';
  ctx.fillText(taglineFor(state), W / 2, tagY * H);
  ctx.restore();

  // Two-layer title: Anton sunset gradient with a dark outline, then the
  // Pacifico script subtitle in glowing white-cyan, always high contrast.
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let titleSize = Math.min(W * 0.115, H * 0.135);
  ctx.font = `${titleSize}px Anton, sans-serif`;
  const tw = ctx.measureText(state.title).width;
  if (tw > W * 0.94) titleSize *= (W * 0.94) / tw;
  ctx.font = `${titleSize}px Anton, sans-serif`;
  const grad = ctx.createLinearGradient(W / 2 - ctx.measureText(state.title).width / 2, 0, W / 2 + ctx.measureText(state.title).width / 2, 0);
  grad.addColorStop(0, '#ffe45c'); grad.addColorStop(0.38, '#ff9a3d'); grad.addColorStop(0.68, '#ff4d7e'); grad.addColorStop(1, '#b44dff');
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#160a24'; ctx.lineWidth = titleSize * 0.1;
  ctx.strokeText(state.title, W / 2, titleY * H);
  ctx.fillStyle = grad;
  ctx.fillText(state.title, W / 2, titleY * H);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = Math.max(1, titleSize * 0.016);
  ctx.strokeText(state.title, W / 2, titleY * H);
  // Subtitle script.
  ctx.font = `${Math.max(16, W * 0.036)}px Pacifico, cursive`;
  ctx.shadowColor = '#37e6ff'; ctx.shadowBlur = 26 * scale;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(state.subtitle, W / 2, subY * H);
  ctx.restore();

  // Palm silhouette band above the footer.
  ctx.save();
  ctx.fillStyle = '#12081f';
  ctx.fillRect(0, palmTop * H, W, (foot1Y - palmTop) * H + H * 0.012);
  ctx.strokeStyle = '#ffd21f'; ctx.lineWidth = 1.5 * scale;
  ctx.beginPath(); ctx.moveTo(0, palmTop * H); ctx.lineTo(W, palmTop * H); ctx.stroke();
  const palmH = (foot1Y - palmTop) * H * 1.25;
  for (let i = 0; i < 11; i++) {
    const px = W * (0.03 + i * 0.094) + (i % 2 ? 14 * scale : -10 * scale);
    drawPalm(ctx, px, (foot1Y + 0.004) * H, palmH * (0.75 + (i % 3) * 0.14), i % 2 ? 0.5 : -0.4);
  }
  ctx.restore();

  // Barcode, bottom-right, clear of the credits.
  drawBarcode(ctx, W - 128 * scale - 14 * scale, (foot1Y - 0.028) * H, 128 * scale, 40 * scale);

  // Production credits, two lines.
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${Math.max(9, H * 0.0135)}px Anton, sans-serif`;
  ctx.fillStyle = '#e8d9f2';
  ctx.fillText(FOOTER_A, W / 2, foot1Y * H);
  ctx.font = `${Math.max(8, H * 0.011)}px Arial, sans-serif`;
  ctx.fillStyle = '#9d86ad';
  ctx.fillText(FOOTER_B, W / 2, foot2Y * H);
  ctx.restore();

  // Film grain over the whole poster.
  if (eff.grain > 0.02) {
    ctx.save();
    ctx.globalAlpha = eff.grain * 0.1;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = grainPattern(ctx);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

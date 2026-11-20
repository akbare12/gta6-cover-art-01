// SUNDOWN HARBOR — cover render engine (Canvas 2D, no dependencies).
// Draws a multi-panel Vice City style poster cover from photos + captions.
// Every function here is written for this entry: layouts, grades, lettering,
// poster furniture (quote strip, VOL badge, gold seal, barcode, palm band,
// WANTED meter, two-line panel labels, pop-out hero).

export const SAMPLE_PHOTOS = [
  'samples/woman-car.jpg',
  'samples/man-rooftop.jpg',
  'samples/friends-neon.jpg',
  'samples/man-pier.jpg',
  'samples/man-beard.jpg',
  'samples/woman-redhair.jpg',
  'samples/man-tattoo.jpg',
];

// Default cast: one face per panel. role / place / time / note feed the
// two-line label on every panel (T1 lever: a scene, not just a name).
export const DEFAULT_CAST = [
  { photo: 'samples/woman-car.jpg', role: 'THE DRIVER', place: 'OCEAN DRIVE', time: '6:42 PM', note: 'LOOKING FOR TROUBLE', zoom: 1.15, flip: false, fx: 0.5, fy: 0.42 },
  { photo: 'samples/man-rooftop.jpg', role: 'THE BOSS', place: 'ROOFTOP BAR', time: '8:05 PM', note: 'OWNS THE SKYLINE', zoom: 1.1, flip: false, fx: 0.5, fy: 0.4 },
  { photo: 'samples/friends-neon.jpg', role: 'THE GETAWAY', place: 'NEON STREET', time: '11:47 PM', note: 'FULL THROTTLE', zoom: 1.1, flip: false, fx: 0.5, fy: 0.45 },
  { photo: 'samples/man-pier.jpg', role: 'THE ANGLER', place: 'OLD PIER', time: '5:15 AM', note: 'PATIENT AS THE TIDE', zoom: 1.12, flip: false, fx: 0.5, fy: 0.4 },
  { photo: 'samples/man-beard.jpg', role: 'THE FIXER', place: 'BACK ALLEY', time: '9:30 PM', note: 'NO QUESTIONS ASKED', zoom: 1.35, flip: false, fx: 0.5, fy: 0.32 },
  { photo: 'samples/woman-redhair.jpg', role: 'THE CHARMER', place: 'CASINO FLOOR', time: '10:12 PM', note: 'NEVER BLUFFS', zoom: 1.3, flip: false, fx: 0.5, fy: 0.3 },
  { photo: 'samples/man-tattoo.jpg', role: 'THE LOOKOUT', place: 'BONFIRE BEACH', time: '6:15 PM', note: 'SEES EVERYTHING', zoom: 1.3, flip: false, fx: 0.5, fy: 0.3 },
];

export const GRADES = [
  { id: 'sunset', name: 'Sunset', filter: 'saturate(1.35) contrast(1.08) brightness(1.03)', wash: ['#ff7a18', '#ff2975'], washAlpha: 0.16 },
  { id: 'neon', name: 'Neon night', filter: 'saturate(1.5) contrast(1.12) brightness(0.98)', wash: ['#00e5ff', '#ff2975'], washAlpha: 0.2 },
  { id: 'golden', name: 'Golden hour', filter: 'saturate(1.25) contrast(1.05) brightness(1.08) sepia(0.18)', wash: ['#ffb347', '#ff8c42'], washAlpha: 0.14 },
  { id: 'teal', name: 'Tropic teal', filter: 'saturate(1.3) contrast(1.06) brightness(1.01)', wash: ['#00c9a7', '#0077ff'], washAlpha: 0.18 },
  { id: 'heat', name: 'Heatwave', filter: 'saturate(1.45) contrast(1.12) brightness(1.02)', wash: ['#ff3b30', '#ff9500'], washAlpha: 0.18 },
  { id: 'ultra', name: 'Ultraviolet', filter: 'saturate(1.4) contrast(1.1) brightness(1.0) hue-rotate(18deg)', wash: ['#8c1eff', '#ff2975'], washAlpha: 0.2 },
];

export const LAYOUTS = [
  { id: 'hero-mosaic', name: 'Hero mosaic', panels: 7, hero: 0 },
  { id: 'hero-three', name: 'Hero + three', panels: 4, hero: 0 },
  { id: 'six-grid', name: 'Six grid', panels: 6, hero: 0 },
  { id: 'diagonal-trio', name: 'Diagonal trio', panels: 3, hero: 0 },
  { id: 'seven-mosaic', name: 'Seven mosaic', panels: 7, hero: 0 },
  { id: 'comic-slash', name: 'Comic slash', panels: 5, hero: 2 },
  { id: 'nine-panel', name: 'Nine-panel', panels: 9, hero: 4 },
];

export function defaultState() {
  return {
    title: 'SUNDOWN HARBOR',
    subtitle: 'where the tide keeps secrets',
    tagline: 'SEVEN FACES · ONE COAST · NO WAY BACK',
    quote: 'THE COAST NEVER FORGIVES — BUT IT ALWAYS DELIVERS',
    layout: 'hero-mosaic',
    grade: 'sunset',
    size: '1920x1080',
    popout: true,
    fx: { paint: 35, grade: 70, halftone: 0, grain: 28, glow: 55 },
    panels: DEFAULT_CAST.map((p) => ({ ...p })),
    seed: 20261121,
  };
}

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

// Deterministic PRNG so the grain and barcode are identical every render.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('cannot load ' + src));
    img.src = src;
  });
}

export async function loadImages(state) {
  const out = new Map();
  const seen = new Set();
  for (const p of state.panels) {
    if (p.photo && p.photo.startsWith('data:')) {
      const img = await loadImage(p.photo);
      out.set(p.photo, img);
    } else if (p.photo && !seen.has(p.photo)) {
      seen.add(p.photo);
      try { out.set(p.photo, await loadImage(p.photo)); } catch { /* missing photo: panel stays dark */ }
    }
  }
  return out;
}

// Panel rectangles in unit space (0..1 of the cover), per layout id.
// The cover's top strip (quote) sits above the panel area; panels end at
// 0.60 so the tagline lane + title band below them never cover a panel
// label — the title block used to overlap the panels' lower part.
export function layoutPanels(layoutId, W, H) {
  const top = 0.042; // quote strip height fraction
  const bottom = 0.60; // panel area ends here; tagline lane + title band below
  const area = { x: 0, y: top, w: 1, h: bottom - top };
  const R = (x, y, w, h, hero = false, slant = 0) => ({
    x: area.x + x * area.w, y: area.y + y * area.h,
    w: w * area.w, h: h * area.h, hero, slant,
  });
  switch (layoutId) {
    case 'hero-three':
      return [R(0, 0, 0.58, 1, true), R(0.58, 0, 0.42, 0.34), R(0.58, 0.34, 0.42, 0.33), R(0.58, 0.67, 0.42, 0.33)];
    case 'six-grid':
      return [R(0, 0, 1 / 3, 0.5), R(1 / 3, 0, 1 / 3, 0.5), R(2 / 3, 0, 1 / 3, 0.5),
        R(0, 0.5, 1 / 3, 0.5), R(1 / 3, 0.5, 1 / 3, 0.5), R(2 / 3, 0.5, 1 / 3, 0.5)];
    case 'diagonal-trio':
      return [R(0, 0, 0.4, 1, true, 0.05), R(0.35, 0, 0.36, 1, false, 0.05), R(0.66, 0, 0.34, 1, false, 0.05)];
    case 'seven-mosaic':
      return [R(0.25, 0, 0.5, 0.55, true), R(0, 0, 0.25, 0.275), R(0, 0.275, 0.25, 0.275),
        R(0.75, 0, 0.25, 0.275), R(0.75, 0.275, 0.25, 0.275),
        R(0, 0.55, 0.5, 0.45), R(0.5, 0.55, 0.5, 0.45)];
    case 'comic-slash':
      return [R(0, 0, 0.22, 1, false, 0.07), R(0.19, 0, 0.22, 1, false, 0.07),
        R(0.38, 0, 0.26, 1, true, 0.07), R(0.61, 0, 0.2, 1, false, 0.07), R(0.78, 0, 0.22, 1, false, 0.07)];
    case 'nine-panel':
      return [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) =>
        R((i % 3) / 3, Math.floor(i / 3) / 3, 1 / 3, 1 / 3));
    case 'hero-mosaic':
    default:
      return [R(0, 0, 0.46, 0.66, true), R(0.46, 0, 0.27, 0.33), R(0.73, 0, 0.27, 0.33),
        R(0.46, 0.33, 0.27, 0.33), R(0.73, 0.33, 0.27, 0.33),
        R(0, 0.66, 0.5, 0.34), R(0.5, 0.66, 0.5, 0.34)];
  }
}

// Path for one panel rect (supports slanted comic edges).
function panelPath(ctx, px, py, pw, ph, slant) {
  ctx.beginPath();
  if (slant) {
    const s = slant * pw;
    ctx.moveTo(px + s, py);
    ctx.lineTo(px + pw, py);
    ctx.lineTo(px + pw - s, py + ph);
    ctx.lineTo(px, py + ph);
  } else {
    ctx.rect(px, py, pw, ph);
  }
  ctx.closePath();
}

// Clip path for one panel rect (supports slanted comic edges).
function clipPanel(ctx, px, py, pw, ph, slant) {
  panelPath(ctx, px, py, pw, ph, slant);
  ctx.clip();
}

// Draw one photo cover-fit into a rect, with zoom / pan / flip / face focus.
export function drawPhotoInto(ctx, img, px, py, pw, ph, panel, grade, fx) {
  ctx.save();
  clipPanel(ctx, px, py, pw, ph, 0);
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const base = Math.max(pw / iw, ph / ih);
  const zoom = base * (panel.zoom || 1);
  const dw = iw * zoom;
  const dh = ih * zoom;
  const fx0 = panel.flip ? 1 - (panel.fx ?? 0.5) : (panel.fx ?? 0.5);
  const fy0 = panel.fy ?? 0.5;
  const dx = px + pw / 2 - dw * fx0;
  const dy = py + ph / 2 - dh * fy0;
  ctx.filter = grade.filter;
  if (panel.flip) {
    // Negative-width draw mirrors the photo in place.
    ctx.drawImage(img, dx + dw, dy, -dw, dh);
  } else {
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  ctx.filter = 'none';
  // Grade wash: a diagonal sunset/neon tint over the photo.
  const wash = ctx.createLinearGradient(px, py, px + pw, py + ph);
  const ga = (grade.washAlpha * (fx.grade / 70)).toFixed(3);
  wash.addColorStop(0, hexA(grade.wash[0], ga * 0.7));
  wash.addColorStop(1, hexA(grade.wash[1], ga));
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = wash;
  ctx.fillRect(px, py, pw, ph);
  ctx.globalCompositeOperation = 'source-over';
  // Paint effect: posterised edge light, stronger with the slider.
  if (fx.paint > 0) {
    ctx.globalAlpha = (fx.paint / 100) * 0.25;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px, py, pw, 2);
    ctx.globalAlpha = (fx.paint / 100) * 0.35;
    const g2 = ctx.createLinearGradient(px, py + ph * 0.7, px, py + ph);
    g2.addColorStop(0, 'rgba(0,0,0,0)');
    g2.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = g2;
    ctx.fillRect(px, py, pw, ph);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function hexA(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function fitFont(ctx, text, fontFn, maxWidth, startPx) {
  let px = startPx;
  ctx.font = fontFn(px);
  while (px > 10 && ctx.measureText(text).width > maxWidth) {
    px -= 2;
    ctx.font = fontFn(px);
  }
  return px;
}

// Two-line panel label: role on line 1, place · time · note on line 2.
function drawPanelLabel(ctx, px, py, pw, ph, panel, scale) {
  const pad = 10 * scale;
  const lh1 = 17 * scale;
  const lh2 = 12.5 * scale;
  const boxH = lh1 + lh2 + pad * 1.6;
  const bx = px + 8 * scale;
  const by = py + ph - boxH - 8 * scale;
  const bw = Math.min(pw - 16 * scale, 300 * scale);
  ctx.save();
  ctx.fillStyle = 'rgba(8,6,16,0.88)';
  roundRect(ctx, bx, by, bw, boxH, 4 * scale);
  ctx.fill();
  ctx.fillStyle = '#ffd319';
  ctx.fillRect(bx, by, 4 * scale, boxH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${lh1}px Anton, "Arial Narrow", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const role = (panel.role || 'THE CREW').toUpperCase();
  ctx.fillText(role, bx + 12 * scale, by + pad + lh1 / 2, bw - 20 * scale);
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.font = `${lh2}px "Helvetica Neue", Arial, sans-serif`;
  const line2 = `${(panel.place || '').toUpperCase()} · ${panel.time || ''} · ${(panel.note || '').toUpperCase()}`;
  ctx.fillText(line2, bx + 12 * scale, by + pad + lh1 + lh2 / 2 + 2 * scale, bw - 20 * scale);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// A palm silhouette: trunk + 6 fronds, drawn in one colour.
function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, s * 0.05);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.08, y - s * 0.55, x + s * 0.02, y - s * 0.95);
  ctx.stroke();
  const topX = x + s * 0.02, topY = y - s * 0.95;
  for (let i = 0; i < 6; i++) {
    const a = (-160 + i * 52) * Math.PI / 180;
    const len = s * (0.5 + (i % 2) * 0.12);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * len * 0.6, topY + Math.sin(a) * len * 0.45 - s * 0.12,
      topX + Math.cos(a) * len, topY + Math.sin(a) * len + s * 0.18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBarcode(ctx, x, y, w, h, seed) {
  const rnd = mulberry32(seed + 77);
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  let bx = x + w * 0.05;
  ctx.fillStyle = '#111111';
  while (bx < x + w * 0.94) {
    const bw = (1 + Math.floor(rnd() * 4)) * (w / 90);
    if (rnd() > 0.35) ctx.fillRect(bx, y + h * 0.06, bw, h * 0.68);
    bx += bw + (w / 90) * (0.6 + rnd());
  }
  ctx.fillStyle = '#111111';
  ctx.font = `${Math.max(9, h * 0.14)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('8 901234 567890', x + w / 2, y + h * 0.88);
  ctx.restore();
}

function drawArcText(ctx, text, cx, cy, radius, startAngle, endAngle, font, color) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const n = text.length;
  for (let i = 0; i < n; i++) {
    const a = startAngle + (endAngle - startAngle) * (n === 1 ? 0.5 : i / (n - 1));
    const x = cx + Math.cos(a) * radius;
    const y = cy + Math.sin(a) * radius;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

function drawGoldSeal(ctx, cx, cy, r) {
  ctx.save();
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#ffe98a');
  g.addColorStop(0.55, '#f5b301');
  g.addColorStop(1, '#b97e00');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,70,0,0.9)';
  ctx.lineWidth = Math.max(1.5, r * 0.05);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();
  drawArcText(ctx, '★ ORIGINAL COVER ART ★', cx, cy, r * 0.62, -Math.PI * 0.82, -Math.PI * 0.18,
    `700 ${r * 0.17}px Anton, sans-serif`, '#5b3a00');
  drawArcText(ctx, '100% ORIGINAL', cx, cy, r * 0.62, Math.PI * 0.18, Math.PI * 0.82,
    `700 ${r * 0.17}px Anton, sans-serif`, '#5b3a00');
  // Star in the middle.
  ctx.fillStyle = '#5b3a00';
  ctx.font = `${r * 0.62}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', cx, cy + r * 0.02);
  ctx.restore();
}

// ---- Title block: two-layer lettering (Anton gradient + Pacifico script) ----
function drawTitleBlock(ctx, W, H, state, fx) {
  const s = H / 1080;
  // The title band sits below the panels (they end at 0.60), so a soft
  // scrim here only deepens the empty band — it never covers a label.
  const scrim = ctx.createLinearGradient(0, H * 0.58, 0, H);
  scrim.addColorStop(0, 'rgba(8,4,18,0)');
  scrim.addColorStop(0.45, 'rgba(8,4,18,0.55)');
  scrim.addColorStop(1, 'rgba(8,4,18,0.92)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, H * 0.58, W, H * 0.42);

  // Tagline strip in its own lane directly below the panel grid
  // (0.60–0.665) and above the title — never over a panel label.
  // The face count is dynamic: it follows the layout's panel count,
  // so a 6-panel layout never claims "SEVEN FACES".
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tagSize = Math.max(13, H * 0.016);
  ctx.font = `700 ${tagSize}px Anton, "Arial Narrow", sans-serif`;
  const numWords = { 3: 'THREE', 4: 'FOUR', 5: 'FIVE', 6: 'SIX', 7: 'SEVEN', 9: 'NINE' };
  const faces = numWords[layoutById(state.layout).panels] || '';
  const tag = state.tagline.toUpperCase().replace(/^[A-Z]+(?=\s+FACES\b)/, faces);
  const tagW = ctx.measureText(tag).width;
  ctx.fillStyle = 'rgba(8,4,18,0.55)';
  roundRect(ctx, W / 2 - tagW / 2 - 22 * s, H * 0.632 - tagSize * 0.9, tagW + 44 * s, tagSize * 1.8, 3);
  ctx.fill();
  ctx.fillStyle = '#ffd319';
  ctx.fillText(tag, W / 2, H * 0.632);
  ctx.restore();

  // Line 1: Anton, horizontal sunset gradient, dark outline + thin white stroke.
  const title = (state.title || 'SUNDOWN HARBOR').toUpperCase();
  const maxW = W * 0.94;
  const titlePx = fitFont(ctx, title, (px) => `${px}px Anton, "Arial Narrow", sans-serif`, maxW, H * 0.125);
  const titleY = H * 0.745;
  const grad = ctx.createLinearGradient(W / 2 - maxW / 2, 0, W / 2 + maxW / 2, 0);
  grad.addColorStop(0, '#ffd319');
  grad.addColorStop(0.35, '#ff7a18');
  grad.addColorStop(0.65, '#ff2975');
  grad.addColorStop(1, '#8c1eff');
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${titlePx}px Anton, "Arial Narrow", sans-serif`;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#160a24';
  ctx.lineWidth = titlePx * 0.085;
  ctx.strokeText(title, W / 2, titleY);
  ctx.fillStyle = grad;
  ctx.fillText(title, W / 2, titleY);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(1, titlePx * 0.012);
  ctx.strokeText(title, W / 2, titleY);
  ctx.restore();

  // Line 2: Pacifico script, white/cyan — always high contrast over dark.
  const subPx = fitFont(ctx, state.subtitle, (px) => `${px}px Pacifico, cursive`, W * 0.8, H * 0.048);
  ctx.save();
  ctx.translate(W / 2, H * 0.845);
  ctx.rotate(-0.02);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${subPx}px Pacifico, cursive`;
  ctx.shadowColor = '#22d3ee';
  ctx.shadowBlur = (fx.glow / 100) * 26 + 6;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(state.subtitle, 0, 0);
  ctx.restore();
}

// ---- Furniture: quote strip, badges, seal, barcode, palm band, footer ----
function drawFurniture(ctx, W, H, state, seed) {
  const s = H / 1080;
  // Quote strip + 5 stars across the very top.
  ctx.save();
  ctx.fillStyle = '#0d0718';
  ctx.fillRect(0, 0, W, H * 0.042);
  ctx.fillStyle = '#ffd319';
  ctx.fillRect(0, H * 0.042 - 2 * s, W, 2 * s);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  const qSize = Math.max(11, H * 0.0145);
  ctx.font = `700 ${qSize}px Anton, "Arial Narrow", sans-serif`;
  ctx.fillStyle = '#ffffff';
  const quote = `“${state.quote.toUpperCase()}”`;
  const stars = '  ★★★★★';
  const qW = ctx.measureText(quote).width;
  const stW = ctx.measureText(stars).width;
  const total = qW + stW;
  const startX = (W - total) / 2;
  ctx.textAlign = 'left';
  ctx.fillText(quote, startX, H * 0.021);
  ctx.fillStyle = '#ffd319';
  ctx.fillText(stars, startX + qW, H * 0.021);
  ctx.restore();

  const stripY = H * 0.042 + 12 * s;
  // VOL badge, top left.
  ctx.save();
  ctx.translate(16 * s, stripY);
  ctx.rotate(-0.06);
  ctx.fillStyle = '#ffd319';
  roundRect(ctx, 0, 0, 92 * s, 30 * s, 4 * s);
  ctx.fill();
  ctx.fillStyle = '#160a24';
  ctx.font = `700 ${16 * s}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VOL. 07', 46 * s, 16 * s);
  ctx.restore();

  // WANTED / HEAT meter, top right.
  ctx.save();
  ctx.fillStyle = 'rgba(8,6,16,0.85)';
  const heat = 'WANTED ★★★★★';
  ctx.font = `700 ${15 * s}px Anton, sans-serif`;
  const hw = ctx.measureText(heat).width + 28 * s;
  roundRect(ctx, W - hw - 16 * s, stripY, hw, 30 * s, 4 * s);
  ctx.fill();
  ctx.strokeStyle = '#ff2975';
  ctx.lineWidth = 2 * s;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(heat, W - hw / 2 - 16 * s, stripY + 16 * s);
  ctx.restore();

  // COMING SOON pill, lower left over the panels.
  ctx.save();
  ctx.fillStyle = '#160a24';
  const cs = 'COMING SOON';
  ctx.font = `700 ${14 * s}px Anton, sans-serif`;
  const cw = ctx.measureText(cs).width + 26 * s;
  const csY = H * 0.50;
  roundRect(ctx, 16 * s, csY, cw, 28 * s, 14 * s);
  ctx.fill();
  ctx.strokeStyle = '#ffd319';
  ctx.lineWidth = 2 * s;
  ctx.stroke();
  ctx.fillStyle = '#ffd319';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(cs, 16 * s + cw / 2, csY + 15 * s);
  ctx.restore();

  // Gold seal, right edge over the panels. It sits at 0.478H — the gap
  // between the panel rows' label strips (a seal at 0.40H covered the
  // CHARMER label's second line in the nine-panel layout).
  drawGoldSeal(ctx, W - 74 * s, H * 0.478, 58 * s);

  // Barcode, bottom right, lifted well clear of the palm band: palm
  // fronds reach ~0.034H above the band and used to cross the barcode's
  // number, and the box nearly touched the gold divider. Its white box
  // now ends ~0.05H above the band, above every frond tip.
  drawBarcode(ctx, W - 168 * s, H * 0.925 - 100 * s, 152 * s, 44 * s, seed);

  // Palm band + two-line production footer.
  const bandY = H * 0.925;
  const band = ctx.createLinearGradient(0, bandY, 0, H);
  band.addColorStop(0, 'rgba(16,7,28,0.92)');
  band.addColorStop(1, 'rgba(6,3,12,1)');
  ctx.fillStyle = band;
  ctx.fillRect(0, bandY, W, H - bandY);
  ctx.fillStyle = '#ffd319';
  ctx.fillRect(0, bandY, W, 2 * s);
  const rnd = mulberry32(seed + 5);
  const palmH = (H - bandY) * 0.72;
  for (let x = W * 0.04; x < W * 0.96; x += W * 0.075) {
    drawPalm(ctx, x + rnd() * 8, bandY + palmH + 4 * s, palmH * (0.8 + rnd() * 0.45), 'rgba(0,0,0,0.85)');
  }
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `700 ${Math.max(9, H * 0.0105)}px "Helvetica Neue", Arial, sans-serif`;
  ctx.fillText('A SUNDOWN PICTURES PRODUCTION  ·  IN ASSOCIATION WITH PALM & PISTOL  ·  A R. VALENTINE FILM', W / 2, bandY + (H - bandY) * 0.42);
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.font = `${Math.max(8, H * 0.0095)}px "Helvetica Neue", Arial, sans-serif`;
  ctx.fillText('MUSIC BY THE NIGHT SHIFT ORCHESTRA  ·  EDITED BY J. MORROW  ·  WRITTEN BY M. DELACROIX & T. OKAFOR  ·  DIRECTED BY R. VALENTINE', W / 2, bandY + (H - bandY) * 0.76);
  ctx.restore();
}

function drawGrain(ctx, W, H, amount, seed) {
  if (amount <= 0) return;
  const rnd = mulberry32(seed + 31);
  const n = Math.floor((W * H) / 2600 * (amount / 100));
  ctx.save();
  ctx.globalAlpha = 0.09;
  for (let i = 0; i < n; i++) {
    const v = rnd() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(rnd() * W, rnd() * H, 1.4, 1.4);
  }
  ctx.restore();
}

function drawHalftone(ctx, W, H, amount) {
  if (amount <= 0) return;
  const step = 9;
  ctx.save();
  ctx.globalAlpha = (amount / 100) * 0.22;
  ctx.fillStyle = '#000000';
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      ctx.beginPath();
      ctx.arc(x + ((Math.floor(y / step) % 2) ? step / 2 : 0), y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawVignette(ctx, W, H) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(5,2,12,0.38)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Main entry: render the whole cover onto a canvas of its own size.
export function renderCover(canvas, state, images) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const grade = gradeById(state.grade);
  const layout = layoutById(state.layout);
  const fx = state.fx;
  const s = H / 1080;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, W, H);

  const rects = layoutPanels(state.layout, W, H);
  const count = Math.min(rects.length, state.panels.length);
  const heroIdx = layout.hero;

  // Non-hero panels first, hero last so the pop-out overlaps neighbours.
  const order = rects.map((_, i) => i).sort((a, b) => {
    if (a === heroIdx) return 1;
    if (b === heroIdx) return -1;
    return a - b;
  });

  for (const i of order) {
    const r = rects[i];
    const panel = state.panels[i % state.panels.length];
    const px = r.x * W, py = r.y * H, pw = r.w * W, ph = r.h * H;
    const isHero = i === heroIdx && state.popout;
    // Pop-out hero (T2): the hero photo genuinely breaks out of its
    // frame — well past the right and bottom edges, over the neighbours
    // — with a white edge + pink glow. (The old 6px nudge was invisible:
    // the lift went under the quote strip, drawn later, and the clipped
    // stroke + glow never spilled outside the panel.)
    let ex = px, ey = py, ew = pw, eh = ph;
    if (isHero) {
      const lift = H * 0.028;
      ex = px - 6 * s; ey = py - lift; ew = pw + 28 * s; eh = ph + lift + 32 * s;
    }
    ctx.save();
    clipPanel(ctx, ex, ey, ew, eh, r.slant);
    const img = images.get(panel.photo);
    if (img) {
      drawPhotoInto(ctx, img, ex, ey, ew, eh, panel, grade, fx);
    } else {
      const g = ctx.createLinearGradient(ex, ey, ex + ew, ey + eh);
      g.addColorStop(0, '#3b1d5e');
      g.addColorStop(1, '#12081f');
      ctx.fillStyle = g;
      ctx.fillRect(ex, ey, ew, eh);
    }
    ctx.restore();
    // Frame: thin dark gutter + optional white pop-out edge + glow.
    ctx.save();
    if (isHero) {
      ctx.shadowColor = '#ff2975';
      ctx.shadowBlur = (fx.glow / 100) * 26 + 8;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2.5, 3.5 * s);
      // Stroke WITHOUT the clip: the white edge and the pink glow must
      // spill outside the expanded frame, or the pop-out reads as flat.
      panelPath(ctx, ex, ey, ew, eh, r.slant);
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(10,5,18,0.9)';
      ctx.lineWidth = Math.max(2, 3 * s);
      clipPanel(ctx, ex, ey, ew, eh, r.slant);
      ctx.stroke();
    }
    ctx.restore();
  }
  // Two-line labels in a second pass, inside each panel's own
  // (non-expanded) bottom — so the hero's expanded photo can never
  // paint over a neighbour's label.
  for (const i of order) {
    const r = rects[i];
    const panel = state.panels[i % state.panels.length];
    drawPanelLabel(ctx, r.x * W, r.y * H, r.w * W, r.h * H, panel, s);
  }

  drawVignette(ctx, W, H);
  drawHalftone(ctx, W, H, fx.halftone);
  drawTitleBlock(ctx, W, H, state, fx);
  drawFurniture(ctx, W, H, state, state.seed || 1);
  drawGrain(ctx, W, H, fx.grain, state.seed || 1);
  return canvas;
}

// Export-size presets: 1080x1080, 1080x1350, 1920x1080.
export const EXPORT_SIZES = [
  { id: '1920x1080', label: '1920 × 1080 (wide)', w: 1920, h: 1080 },
  { id: '1080x1350', label: '1080 × 1350 (portrait)', w: 1080, h: 1350 },
  { id: '1080x1080', label: '1080 × 1080 (square)', w: 1080, h: 1080 },
];

export function sizeById(id) {
  return EXPORT_SIZES.find((x) => x.id === id) || EXPORT_SIZES[0];
}

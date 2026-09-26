/* Winietki weselne – generator PDF (działa w 100% w przeglądarce)
 * Tekst jest rysowany jako wektorowe kształty glifów (fontkit -> ścieżki SVG),
 * dzięki czemu podgląd i PDF wyglądają identycznie, a polskie znaki zawsze działają. */
(() => {
  'use strict';

  const MM = 72 / 25.4; // mm -> pt

  const FONTS = [
    { id: 'GreatVibes', name: 'Great Vibes', file: 'GreatVibes-Regular.ttf' },
    { id: 'Parisienne', name: 'Parisienne', file: 'Parisienne-Regular.ttf' },
    { id: 'AlexBrush', name: 'Alex Brush', file: 'AlexBrush-Regular.ttf' },
    { id: 'Allura', name: 'Allura', file: 'Allura-Regular.ttf' },
    { id: 'PinyonScript', name: 'Pinyon Script', file: 'PinyonScript-Regular.ttf' },
    { id: 'ImperialScript', name: 'Imperial Script', file: 'ImperialScript-Regular.ttf' },
    { id: 'Italianno', name: 'Italianno', file: 'Italianno-Regular.ttf' },
    { id: 'Sacramento', name: 'Sacramento', file: 'Sacramento-Regular.ttf' },
    { id: 'Corinthia', name: 'Corinthia', file: 'Corinthia-Regular.ttf' },
    { id: 'LuxuriousScript', name: 'Luxurious Script', file: 'LuxuriousScript-Regular.ttf' },
    { id: 'Ephesis', name: 'Ephesis', file: 'Ephesis-Regular.ttf' },
    { id: 'MeaCulpa', name: 'Mea Culpa', file: 'MeaCulpa-Regular.ttf' },
    { id: 'MsMadi', name: 'Ms Madi', file: 'MsMadi-Regular.ttf' },
    { id: 'Birthstone', name: 'Birthstone', file: 'Birthstone-Regular.ttf' },
    { id: 'PetitFormalScript', name: 'Petit Formal Script', file: 'PetitFormalScript-Regular.ttf' },
    { id: 'DancingScript', name: 'Dancing Script', file: 'DancingScript.ttf' },
    { id: 'MarckScript', name: 'Marck Script', file: 'MarckScript-Regular.ttf' },
    { id: 'KaushanScript', name: 'Kaushan Script', file: 'KaushanScript-Regular.ttf' },
    { id: 'Pacifico', name: 'Pacifico', file: 'Pacifico-Regular.ttf' },
    { id: 'CormorantGaramond', name: 'Cormorant Garamond', file: 'CormorantGaramond.ttf' },
    { id: 'PlayfairDisplay', name: 'Playfair Display', file: 'PlayfairDisplay.ttf' },
  ];

  const BG_COLORS = [
    ['#FFFFFF', 'Biały'], ['#FFFDF5', 'Kość słoniowa'], ['#F6EFE2', 'Kremowy'], ['#EFE3CC', 'Szampański'],
    ['#F3DEDA', 'Pudrowy róż'], ['#DDE4D5', 'Szałwia'], ['#DCE5EE', 'Błękit'], ['#E6E0EE', 'Lawenda'],
    ['#2E2E2E', 'Grafit'], ['#1F2A44', 'Granat'], ['#1E3B30', 'Butelkowa zieleń'], ['#5A1E2B', 'Bordo'],
  ];
  const INK_COLORS = [
    ['#1A1A1A', 'Czarny'], ['#4A4A4A', 'Grafit'], ['#A9844C', 'Złoty'], ['#C9A96E', 'Jasne złoto'],
    ['#B76E79', 'Różowe złoto'], ['#1F2A44', 'Granat'], ['#1E3B30', 'Butelkowa zieleń'], ['#6B1F2E', 'Bordo'],
    ['#5E7257', 'Szałwiowy'], ['#FFFFFF', 'Biały'],
  ];
  const SIZES = [
    [90, 50, '9 × 5 cm'], [100, 70, '10 × 7 cm'], [85, 55, '8,5 × 5,5 cm'],
    [100, 50, '10 × 5 cm'], [120, 60, '12 × 6 cm'], [70, 40, '7 × 4 cm'],
  ];
  const PAPERS = { A4: [595.28, 841.89], A3: [841.89, 1190.55], A5: [419.53, 595.28], Letter: [612, 792] };

  const DEFAULTS = {
    names: 'Anna Kowalska\nŁukasz Żółkiewski | Stół 2\nMałgorzata Świątek\nJędrzej Ćwikła | Stół 5\nZofia Łęcka',
    fontId: 'GreatVibes', font2Id: 'CormorantGaramond',
    maxSize: 40, padding: 10, sameSize: false, subSize: 10,
    bg: '#FFFFFF', ink: '#1A1A1A', accent: '#A9844C',
    ornament: 'none', border: 'none',
    w: 90, h: 50, folded: true, bothSides: true,
    paper: 'A4', orient: 'auto', cut: 'marks', margin: 10, gap: 4,
  };
  const STORE_KEY = 'winietki-v1';

  let S = { ...DEFAULTS };
  try { Object.assign(S, JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); } catch (e) { /* brak storage */ }
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* ignoruj */ } };

  const $ = (id) => document.getElementById(id);
  const fk = {};          // id -> fontkit font
  const layoutCache = new Map();
  let nameIdx = 0, pageIdx = 0;

  // ---------- Fonty ----------
  function loadFont(f) {
    if (!f.promise) {
      f.promise = fetch('fonts/' + f.file)
        .then((r) => { if (!r.ok) throw new Error(f.file); return r.arrayBuffer(); })
        .then((b) => { fk[f.id] = fontkit.create(new Uint8Array(b)); return fk[f.id]; });
    }
    return f.promise;
  }

  // Układ tekstu w jednostkach fontu (z kerningiem i ligaturami)
  function textLayout(fontId, text) {
    const key = fontId + '\u0000' + text;
    let L = layoutCache.get(key);
    if (L) return L;
    const font = fk[fontId];
    const run = font.layout(text);
    let x = 0, minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const glyphs = [];
    run.glyphs.forEach((g, i) => {
      const p = run.positions[i];
      const gx = x + p.xOffset, gy = p.yOffset;
      const b = g.bbox;
      if (isFinite(b.minX) && b.maxX > b.minX) {
        minX = Math.min(minX, gx + b.minX); maxX = Math.max(maxX, gx + b.maxX);
        minY = Math.min(minY, gy + b.minY); maxY = Math.max(maxY, gy + b.maxY);
      }
      glyphs.push({ cmds: g.path.commands, x: gx, y: gy });
      x += p.xAdvance;
    });
    if (!isFinite(minX)) { minX = 0; maxX = 0; minY = 0; maxY = 0; }
    const u = font.unitsPerEm;
    L = { glyphs, upm: u, minX: minX / u, maxX: maxX / u, minY: minY / u, maxY: maxY / u };
    layoutCache.set(key, L);
    return L;
  }

  // ---------- Ścieżki ----------
  const f2 = (n) => (Math.round(n * 100) / 100).toString();
  class Pen {
    constructor(t) { this.t = t || ((x, y) => [x, y]); this.d = []; }
    pt(x, y) { const [a, b] = this.t(x, y); return f2(a) + ' ' + f2(b); }
    M(x, y) { this.d.push('M' + this.pt(x, y)); return this; }
    L(x, y) { this.d.push('L' + this.pt(x, y)); return this; }
    Q(a, b, x, y) { this.d.push('Q' + this.pt(a, b) + ' ' + this.pt(x, y)); return this; }
    C(a, b, c, d, x, y) { this.d.push('C' + this.pt(a, b) + ' ' + this.pt(c, d) + ' ' + this.pt(x, y)); return this; }
    Z() { this.d.push('Z'); return this; }
    rect(x, y, w, h) { return this.M(x, y).L(x + w, y).L(x + w, y + h).L(x, y + h).Z(); }
    circle(cx, cy, r) {
      const k = 0.5523 * r;
      return this.M(cx + r, cy).C(cx + r, cy + k, cx + k, cy + r, cx, cy + r)
        .C(cx - k, cy + r, cx - r, cy + k, cx - r, cy).C(cx - r, cy - k, cx - k, cy - r, cx, cy - r)
        .C(cx + k, cy - r, cx + r, cy - k, cx + r, cy).Z();
    }
    text(L, size, ox, oy) { // ox, oy = początek linii bazowej (y w dół)
      const s = size / L.upm;
      for (const g of L.glyphs) {
        const X = (gx) => ox + (g.x + gx) * s, Y = (gy) => oy - (g.y + gy) * s;
        for (const c of g.cmds) {
          const a = c.args;
          switch (c.command) {
            case 'moveTo': this.M(X(a[0]), Y(a[1])); break;
            case 'lineTo': this.L(X(a[0]), Y(a[1])); break;
            case 'quadraticCurveTo': this.Q(X(a[0]), Y(a[1]), X(a[2]), Y(a[3])); break;
            case 'bezierCurveTo': this.C(X(a[0]), Y(a[1]), X(a[2]), Y(a[3]), X(a[4]), Y(a[5])); break;
            case 'closePath': this.Z(); break;
          }
        }
      }
      return this;
    }
    get str() { return this.d.join(''); }
  }

  // ---------- Dane ----------
  function parseNames() {
    return S.names.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
      const i = l.search(/[|\t;]/);
      return i < 0 ? { main: l, sub: '' } : { main: l.slice(0, i).trim(), sub: l.slice(i + 1).trim() };
    }).filter((e) => e.main);
  }

  function geometry() {
    const W = S.w * MM, H = S.h * MM;
    return { W, H, cellW: W, cellH: S.folded ? 2 * H : H };
  }

  // Rozmiar imienia, który mieści się w winietce
  function fitSize(e, g) {
    const padX = g.W * S.padding / 100, padY = g.H * S.padding / 100;
    const availW = g.W - 2 * padX, availH = g.H - 2 * padY;
    const L = textLayout(S.fontId, e.main);
    const bw = L.maxX - L.minX || 1, bh = L.maxY - L.minY || 1;
    const extra = extraHeight(e, g);
    return Math.max(4, Math.min(S.maxSize, availW / bw, Math.max(availH - extra.total, availH * 0.3) / bh));
  }

  function extraHeight(e, g) {
    const gap = g.H * 0.06;
    const ornH = S.ornament === 'none' ? 0 : 4;
    let subH = 0, subSize = S.subSize, subL = null;
    if (e.sub) {
      subL = textLayout(S.font2Id, e.sub);
      const availW = g.W * (1 - 2 * S.padding / 100);
      subSize = Math.min(subSize, availW / ((subL.maxX - subL.minX) || 1));
      subH = (subL.maxY - subL.minY) * subSize;
    }
    const total = (ornH ? gap + ornH : 0) + (subL ? gap + subH : 0);
    return { gap, ornH, subH, subSize, subL, total };
  }

  function computeSizes(entries, g) {
    const sizes = entries.map((e) => fitSize(e, g));
    if (S.sameSize && sizes.length) { const m = Math.min(...sizes); return sizes.map(() => m); }
    return sizes;
  }

  // ---------- Rysowanie winietki (lista operacji w pt, y w dół) ----------
  function faceOps(ops, e, size, g, x, y, rotated, withText) {
    const T = rotated ? (px, py) => [2 * x + g.W - px, 2 * y + g.H - py] : null;
    const W = g.W, H = g.H;

    // Ramka
    if (S.border !== 'none') {
      const ins = Math.min(W, H) * 0.07;
      if (S.border === 'thin') ops.push({ d: new Pen(T).rect(x + ins, y + ins, W - 2 * ins, H - 2 * ins).str, stroke: S.accent, lw: 0.6 });
      if (S.border === 'double') {
        ops.push({ d: new Pen(T).rect(x + ins, y + ins, W - 2 * ins, H - 2 * ins).str, stroke: S.accent, lw: 0.9 });
        const i2 = ins + 2.2;
        ops.push({ d: new Pen(T).rect(x + i2, y + i2, W - 2 * i2, H - 2 * i2).str, stroke: S.accent, lw: 0.4 });
      }
      if (S.border === 'corners') {
        const l = Math.min(W, H) * 0.16, p = new Pen(T);
        const x1 = x + ins, y1 = y + ins, x2 = x + W - ins, y2 = y + H - ins;
        p.M(x1, y1 + l).L(x1, y1).L(x1 + l, y1);
        p.M(x2 - l, y1).L(x2, y1).L(x2, y1 + l);
        p.M(x2, y2 - l).L(x2, y2).L(x2 - l, y2);
        p.M(x1 + l, y2).L(x1, y2).L(x1, y2 - l);
        ops.push({ d: p.str, stroke: S.accent, lw: 0.8 });
      }
    }
    if (!withText) return;

    const L = textLayout(S.fontId, e.main);
    const ex = extraHeight(e, g);
    const hm = (L.maxY - L.minY) * size;
    const cx = x + W / 2, cy = y + H / 2;
    const top = cy - (hm + ex.total) / 2;

    // Imię
    const ox = cx - (L.minX + L.maxX) / 2 * size;
    ops.push({ d: new Pen(T).text(L, size, ox, top + L.maxY * size).str, fill: S.ink });

    let yy = top + hm;
    // Ozdoba
    if (ex.ornH) {
      yy += ex.gap;
      const oy = yy + ex.ornH / 2;
      const inkW = (L.maxX - L.minX) * size;
      const lw = Math.min(W * (1 - 2 * S.padding / 100) * 0.6, Math.max(inkW * 0.55, 28));
      if (S.ornament === 'line') {
        ops.push({ d: new Pen(T).M(cx - lw / 2, oy).L(cx + lw / 2, oy).str, stroke: S.accent, lw: 0.6 });
      } else if (S.ornament === 'diamond') {
        const r = 2.4;
        ops.push({ d: new Pen(T).M(cx - lw / 2, oy).L(cx - r - 2, oy).M(cx + r + 2, oy).L(cx + lw / 2, oy).str, stroke: S.accent, lw: 0.6 });
        ops.push({ d: new Pen(T).M(cx, oy - r).L(cx + r, oy).L(cx, oy + r).L(cx - r, oy).Z().str, fill: S.accent });
      } else if (S.ornament === 'dots') {
        const p = new Pen(T);
        [-5, 0, 5].forEach((dx) => p.circle(cx + dx, oy, 0.95));
        ops.push({ d: p.str, fill: S.accent });
      }
      yy += ex.ornH;
    }
    // Druga linia
    if (ex.subL) {
      yy += ex.gap;
      const sL = ex.subL, ss = ex.subSize;
      const sx = cx - (sL.minX + sL.maxX) / 2 * ss;
      ops.push({ d: new Pen(T).text(sL, ss, sx, yy + sL.maxY * ss).str, fill: S.ink });
    }
  }

  function cardOps(ops, e, size, g, x, y) {
    ops.push({ d: new Pen().rect(x, y, g.cellW, g.cellH).str, fill: S.bg });
    if (S.folded) {
      faceOps(ops, e, size, g, x, y, true, S.bothSides);  // tył (do góry nogami)
      faceOps(ops, e, size, g, x, y + g.H, false, true);  // przód
    } else {
      faceOps(ops, e, size, g, x, y, false, true);
    }
  }

  // ---------- Arkusz ----------
  function pageLayout(g) {
    const [pw0, ph0] = PAPERS[S.paper];
    const m = S.margin * MM, gap = S.gap * MM;
    const fit = (pw, ph) => {
      const cols = Math.floor((pw - 2 * m + gap) / (g.cellW + gap));
      const rows = Math.floor((ph - 2 * m + gap) / (g.cellH + gap));
      return { pw, ph, cols: Math.max(0, cols), rows: Math.max(0, rows) };
    };
    const P = fit(pw0, ph0), Lnd = fit(ph0, pw0);
    let r;
    if (S.orient === 'portrait') r = P;
    else if (S.orient === 'landscape') r = Lnd;
    else r = (Lnd.cols * Lnd.rows > P.cols * P.rows) ? Lnd : P;
    r.per = r.cols * r.rows;
    r.gap = gap;
    r.gridW = r.cols * g.cellW + Math.max(0, r.cols - 1) * gap;
    r.gridH = r.rows * g.cellH + Math.max(0, r.rows - 1) * gap;
    r.x0 = (r.pw - r.gridW) / 2;
    r.y0 = (r.ph - r.gridH) / 2;
    return r;
  }

  function pageOps(entries, sizes, g, P, page) {
    const ops = [];
    const start = page * P.per;
    const slice = entries.slice(start, start + P.per);
    slice.forEach((e, i) => {
      const c = i % P.cols, r = Math.floor(i / P.cols);
      const x = P.x0 + c * (g.cellW + P.gap), y = P.y0 + r * (g.cellH + P.gap);
      cardOps(ops, e, sizes[start + i], g, x, y);
      if (S.cut === 'lines') ops.push({ d: new Pen().rect(x, y, g.cellW, g.cellH).str, stroke: '#9A9A9A', lw: 0.3 });
    });
    if (S.cut !== 'none' && slice.length) cutMarks(ops, g, P, slice.length);
    return ops;
  }

  function cutMarks(ops, g, P, count) {
    const usedRows = Math.ceil(count / P.cols), usedCols = Math.min(P.cols, count);
    const off = 3, p = new Pen(), fold = new Pen();
    const gridBottom = P.y0 + usedRows * g.cellH + (usedRows - 1) * P.gap;
    const gridRight = P.x0 + usedCols * g.cellW + (usedCols - 1) * P.gap;
    const lenV = Math.min(14, P.y0 - off - 2), lenH = Math.min(14, P.x0 - off - 2);
    if (S.cut === 'marks') {
      if (lenV > 2) {
        for (let c = 0; c < usedCols; c++) {
          for (const x of [P.x0 + c * (g.cellW + P.gap), P.x0 + c * (g.cellW + P.gap) + g.cellW]) {
            p.M(x, P.y0 - off).L(x, P.y0 - off - lenV);
            p.M(x, gridBottom + off).L(x, gridBottom + off + lenV);
          }
        }
      }
      if (lenH > 2) {
        for (let r = 0; r < usedRows; r++) {
          for (const y of [P.y0 + r * (g.cellH + P.gap), P.y0 + r * (g.cellH + P.gap) + g.cellH]) {
            p.M(P.x0 - off, y).L(P.x0 - off - lenH, y);
            p.M(gridRight + off, y).L(gridRight + off + lenH, y);
          }
        }
      }
    }
    // Linie zgięcia (przerywane, tylko na marginesie)
    if (S.folded && lenH > 2) {
      for (let r = 0; r < usedRows; r++) {
        const y = P.y0 + r * (g.cellH + P.gap) + g.H;
        for (let k = 0; k < lenH; k += 3) {
          const a = Math.min(k + 1.6, lenH);
          fold.M(P.x0 - off - k, y).L(P.x0 - off - a, y);
          fold.M(gridRight + off + k, y).L(gridRight + off + a, y);
        }
      }
    }
    if (p.d.length) ops.push({ d: p.str, stroke: '#555555', lw: 0.4 });
    if (fold.d.length) ops.push({ d: fold.str, stroke: '#555555', lw: 0.4 });
  }

  // ---------- Renderery ----------
  function drawOps(ctx, ops) {
    for (const o of ops) {
      const p = new Path2D(o.d);
      if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(p); }
      if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 0.5; ctx.stroke(p); }
    }
  }

  function setupCanvas(cv, wPt, hPt, cssMaxW) {
    const dpr = window.devicePixelRatio || 1;
    const cssW = Math.min(cssMaxW, wPt * 2.2);
    const k = cssW / wPt;
    cv.width = Math.round(wPt * k * dpr);
    cv.height = Math.round(hPt * k * dpr);
    cv.style.width = Math.round(wPt * k) + 'px';
    const ctx = cv.getContext('2d');
    ctx.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
    ctx.clearRect(0, 0, wPt, hPt);
    return ctx;
  }

  const hexRgb = (h) => {
    const n = parseInt(h.replace('#', ''), 16);
    return PDFLib.rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  };

  async function makePdf() {
    const entries = parseNames();
    if (!entries.length) { status('Najpierw dodaj listę gości.'); return; }
    const btn = $('pdfBtn');
    btn.disabled = true; status('Generuję PDF…');
    try {
      await Promise.all([loadFont(byId(S.fontId)), loadFont(byId(S.font2Id))]);
      const g = geometry(), P = pageLayout(g);
      if (!P.per) { status('Winietka nie mieści się na wybranym papierze.'); return; }
      const sizes = computeSizes(entries, g);
      const doc = await PDFLib.PDFDocument.create();
      doc.setTitle('Winietki'); doc.setCreator('Generator winietek');
      const pages = Math.ceil(entries.length / P.per);
      for (let pg = 0; pg < pages; pg++) {
        const page = doc.addPage([P.pw, P.ph]);
        for (const o of pageOps(entries, sizes, g, P, pg)) {
          const opt = { x: 0, y: P.ph };
          if (o.fill) opt.color = hexRgb(o.fill);
          if (o.stroke) { opt.borderColor = hexRgb(o.stroke); opt.borderWidth = o.lw || 0.5; }
          page.drawSvgPath(o.d, opt);
        }
        if (pg % 3 === 2) await new Promise((r) => setTimeout(r));
      }
      const bytes = await doc.save();
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'winietki.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      status(`Gotowe: ${entries.length} winietek na ${pages} ${plural(pages, 'stronie', 'stronach', 'stronach')}.`);
    } catch (err) {
      console.error(err);
      status('Błąd generowania PDF: ' + err.message);
    } finally { btn.disabled = false; }
  }

  // ---------- Podgląd ----------
  function renderPreview() {
    if (!fk[S.fontId] || !fk[S.font2Id]) return;
    let entries = parseNames();
    const placeholder = !entries.length;
    if (placeholder) entries = [{ main: 'Imię Nazwisko', sub: '' }];
    const g = geometry();
    const sizes = computeSizes(entries, g);
    nameIdx = Math.min(Math.max(0, nameIdx), entries.length - 1);

    // Pojedyncza winietka
    const cv = $('cardCanvas');
    const ctx = setupCanvas(cv, g.cellW, g.cellH, Math.min(520, cv.parentElement.clientWidth - 36));
    const ops = [];
    cardOps(ops, entries[nameIdx], sizes[nameIdx], g, 0, 0);
    drawOps(ctx, ops);
    if (S.folded) { // linia zgięcia tylko w podglądzie
      ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(128,128,128,.6)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, g.H); ctx.lineTo(g.W, g.H); ctx.stroke(); ctx.restore();
    }
    $('nameIdx').textContent = placeholder ? '–' : `${nameIdx + 1} / ${entries.length}`;

    // Arkusz
    const P = pageLayout(g);
    const pc = $('pageCanvas');
    if (!P.per) {
      $('sheetInfo').textContent = '– winietka nie mieści się na papierze';
      const c2 = setupCanvas(pc, P.pw, P.ph, 380); c2.fillStyle = '#fff'; c2.fillRect(0, 0, P.pw, P.ph);
      $('pageIdx').textContent = '–';
      return;
    }
    const pages = Math.ceil(entries.length / P.per);
    pageIdx = Math.min(Math.max(0, pageIdx), pages - 1);
    const c2 = setupCanvas(pc, P.pw, P.ph, 380);
    c2.fillStyle = '#fff'; c2.fillRect(0, 0, P.pw, P.ph);
    drawOps(c2, pageOps(entries, sizes, g, P, pageIdx));
    $('pageIdx').textContent = `${pageIdx + 1} / ${pages}`;
    $('sheetInfo').textContent = `· ${P.per} na stronie (${P.cols}×${P.rows}), ${placeholder ? 0 : pages} ${plural(pages, 'strona', 'strony', 'stron')}`;
  }

  function renderFontTiles() {
    const sample = (parseNames()[0] || {}).main || 'Łucja Żółkiewska';
    document.querySelectorAll('.font-tile').forEach((tile) => {
      const id = tile.dataset.id;
      tile.setAttribute('aria-selected', id === S.fontId);
      if (!fk[id]) return;
      const cv = tile.querySelector('canvas');
      const wPt = 180, hPt = 44, dpr = window.devicePixelRatio || 1;
      cv.width = wPt * dpr; cv.height = hPt * dpr;
      const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const L = textLayout(id, sample);
      const size = Math.min(30, 168 / ((L.maxX - L.minX) || 1), 38 / ((L.maxY - L.minY) || 1));
      const ox = wPt / 2 - (L.minX + L.maxX) / 2 * size;
      const oy = hPt / 2 + (L.minY + L.maxY) / 2 * size;
      ctx.fillStyle = '#2a2622';
      ctx.fill(new Path2D(new Pen().text(L, size, ox, oy).str));
    });
  }

  // ---------- UI ----------
  const byId = (id) => FONTS.find((f) => f.id === id) || FONTS[0];
  const status = (t) => { $('status').textContent = t; };
  const plural = (n, one, few, many) => n === 1 ? one : ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? few : many);

  let raf = 0;
  function update(opts = {}) {
    save();
    $('guestCount').textContent = parseNames().length;
    $('bothSidesWrap').classList.toggle('disabled', !S.folded);
    $('bothSides').disabled = !S.folded;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { renderPreview(); if (opts.tiles) renderFontTiles(); });
  }

  function buildSwatches(el, list, key) {
    el.innerHTML = '';
    for (const [hex, name] of list) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'swatch'; b.style.background = hex; b.title = name; b.setAttribute('aria-label', name);
      b.addEventListener('click', () => { S[key] = hex; syncSwatches(); update(); });
      b.dataset.hex = hex;
      el.appendChild(b);
    }
    const c = document.createElement('input');
    c.type = 'color'; c.title = 'Własny kolor';
    c.addEventListener('input', () => { S[key] = c.value.toUpperCase(); syncSwatches(); update(); });
    el.appendChild(c);
  }
  function syncSwatches() {
    [['bgSwatches', 'bg'], ['textSwatches', 'ink'], ['accentSwatches', 'accent']].forEach(([id, key]) => {
      const el = $(id);
      el.querySelectorAll('.swatch').forEach((b) => b.setAttribute('aria-pressed', b.dataset.hex.toUpperCase() === S[key].toUpperCase()));
      el.querySelector('input[type=color]').value = S[key].toLowerCase();
    });
  }
  function syncSizeChips() {
    document.querySelectorAll('#sizePresets .chip').forEach((c) => c.setAttribute('aria-pressed', +c.dataset.w === +S.w && +c.dataset.h === +S.h));
  }

  function init() {
    // Kafelki czcionek
    const grid = $('fontGrid');
    for (const f of FONTS) {
      const t = document.createElement('button');
      t.type = 'button'; t.className = 'font-tile'; t.dataset.id = f.id; t.setAttribute('role', 'option');
      t.innerHTML = '<canvas></canvas><span></span>';
      t.querySelector('span').textContent = f.name;
      t.addEventListener('click', () => { S.fontId = f.id; loadFont(f).then(() => update({ tiles: true })); });
      grid.appendChild(t);
    }
    const sel2 = $('font2');
    for (const f of FONTS) { const o = document.createElement('option'); o.value = f.id; o.textContent = f.name; sel2.appendChild(o); }

    buildSwatches($('bgSwatches'), BG_COLORS, 'bg');
    buildSwatches($('textSwatches'), INK_COLORS, 'ink');
    buildSwatches($('accentSwatches'), INK_COLORS, 'accent');
    syncSwatches();

    const chips = $('sizePresets');
    for (const [w, h, label] of SIZES) {
      const c = document.createElement('button');
      c.type = 'button'; c.className = 'chip'; c.textContent = label; c.dataset.w = w; c.dataset.h = h;
      c.addEventListener('click', () => { S.w = w; S.h = h; $('w').value = w; $('h').value = h; syncSizeChips(); update(); });
      chips.appendChild(c);
    }
    syncSizeChips();

    // Pola formularza
    const bind = (id, key, type) => {
      const el = $(id);
      if (type === 'check') el.checked = !!S[key]; else el.value = S[key];
      const out = $(id + 'Out'); if (out) out.textContent = S[key];
      el.addEventListener(type === 'check' || el.tagName === 'SELECT' ? 'change' : 'input', () => {
        let v = type === 'check' ? el.checked : type === 'num' ? parseFloat(el.value) : el.value;
        if (type === 'num' && !isFinite(v)) return;
        S[key] = v;
        if (out) out.textContent = v;
        if (key === 'w' || key === 'h') syncSizeChips();
        if (key === 'font2Id') { loadFont(byId(v)).then(() => update()); return; }
        update({ tiles: key === 'names' });
      });
    };
    bind('names', 'names');
    bind('maxSize', 'maxSize', 'num'); bind('padding', 'padding', 'num'); bind('sameSize', 'sameSize', 'check');
    bind('font2', 'font2Id'); bind('subSize', 'subSize', 'num');
    bind('ornament', 'ornament'); bind('border', 'border');
    bind('w', 'w', 'num'); bind('h', 'h', 'num'); bind('folded', 'folded', 'check'); bind('bothSides', 'bothSides', 'check');
    bind('paper', 'paper'); bind('orient', 'orient'); bind('cut', 'cut');
    bind('margin', 'margin', 'num'); bind('gap', 'gap', 'num');

    const setNames = (txt) => { S.names = txt; $('names').value = txt; nameIdx = 0; pageIdx = 0; update({ tiles: true }); };
    $('fileInput').addEventListener('change', async (ev) => {
      const file = ev.target.files[0]; if (!file) return;
      let txt = await file.text();
      if (/\.csv$/i.test(file.name)) txt = txt.split(/\r?\n/).map((l) => l.replace(/"/g, '').split(/[,;]/).map((s) => s.trim()).filter(Boolean).join(' | ')).join('\n');
      setNames(txt.replace(/^﻿/, ''));
      ev.target.value = '';
    });
    $('sortBtn').addEventListener('click', () => setNames(S.names.split(/\r?\n/).filter((l) => l.trim()).sort((a, b) => a.localeCompare(b, 'pl')).join('\n')));
    $('dedupeBtn').addEventListener('click', () => setNames([...new Set(S.names.split(/\r?\n/).map((l) => l.trim()).filter(Boolean))].join('\n')));

    $('prevName').addEventListener('click', () => { nameIdx--; update(); });
    $('nextName').addEventListener('click', () => { nameIdx++; update(); });
    $('prevPage').addEventListener('click', () => { pageIdx--; update(); });
    $('nextPage').addEventListener('click', () => { pageIdx++; update(); });
    $('pdfBtn').addEventListener('click', makePdf);
    window.addEventListener('resize', () => update());

    // Najpierw wybrane fonty, potem reszta (kafelki)
    status('Ładuję czcionki…');
    Promise.all([loadFont(byId(S.fontId)), loadFont(byId(S.font2Id))])
      .then(() => { status(''); update({ tiles: true }); })
      .catch((e) => status('Nie udało się wczytać czcionek (' + e.message + '). Otwórz stronę przez http(s), nie jako plik.'));
    FONTS.forEach((f) => loadFont(f).then(() => { clearTimeout(init.t); init.t = setTimeout(renderFontTiles, 120); }).catch(() => {}));
  }

  init();
})();

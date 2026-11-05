/* =========================================================
   scene.js — ฉากทั้งหมดวาดด้วยโค้ด (SVG + Canvas)
   - buildTreeFx()    เอฟเฟกต์รอบภาพต้นไม้: ออร่าทองนุ่ม ละอองแสง ไฟระยิบ ประกาย ดอกบัว
   - spawnPetals()    กลีบดอกชมพู/ทองร่วงโปรย
   - buildTemples()   เงาวัดริมน้ำ + แสงไฟ
   - spawnLanterns()  โคมลอย
   - spawnKrathongs() กระทงลอยน้ำ
   - wishPositions()  ตำแหน่งแขวนป้ายคำอธิษฐาน
   - createSky()      ดาว + หิ่งห้อยลอย + เอฟเฟกต์ประกาย (burst)
   ========================================================= */
(function (root) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- helpers ---------- */
  // seeded random → ฉากเหมือนเดิมทุกครั้งที่โหลด
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function grad(defs, type, id, stops, attrs) {
    const g = el(type, Object.assign({ id: id }, attrs || {}), defs);
    stops.forEach(function (s) {
      el('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] == null ? 1 : s[2] }, g);
    });
    return g;
  }

  /* ---------- Geometry helpers ---------- */
  const inEllipse = (x, y, e, s) => {
    s = s || 1;
    const dx = (x - e.cx) / (e.rx * s), dy = (y - e.cy) / (e.ry * s);
    return dx * dx + dy * dy <= 1;
  };

  function lotus(parent, x, y, s) {
    const g = el('g', { transform: 'translate(' + x + ' ' + y + ') scale(' + s + ')' }, parent);
    el('ellipse', { cx: 0, cy: 2, rx: 30, ry: 6, fill: '#2f6d3a', opacity: .85 }, g);
    [
      'M0 0 C-22 -4 -30 -14 -32 -20 C-18 -20 -6 -12 0 0Z',
      'M0 0 C22 -4 30 -14 32 -20 C18 -20 6 -12 0 0Z',
      'M0 0 C-16 -10 -18 -24 -14 -32 C-4 -26 2 -14 0 0Z',
      'M0 0 C16 -10 18 -24 14 -32 C4 -26 -2 -14 0 0Z',
      'M0 0 C-8 -14 -6 -30 0 -38 C6 -30 8 -14 0 0Z'
    ].forEach(function (d) { el('path', { d: d, fill: 'url(#tg-lotus)', stroke: '#fff', 'stroke-opacity': .25, 'stroke-width': .8 }, g); });
    el('circle', { cx: 0, cy: -14, r: 10, fill: 'url(#tg-candle)', class: 'flicker' }, g);
  }

  /* ต้นไม้ (ภาพจริง) + เอฟเฟกต์รอบต้น ใน viewBox 0 0 1000 900
     back  : ละอองแสง (bokeh) → ออร่าทองนุ่ม → แสงพื้น → เกาะหญ้า   (อยู่หลังภาพต้นไม้)
     front : ไฟระยิบในพุ่ม → ประกายดาว → หิน/เทียน/ดอกบัว  (อยู่หน้าภาพต้นไม้) */
  const TREE = { cx: 500, cy: 327, rx: 431, ry: 222 };  // ขอบเขตพุ่มกลมในภาพ (พิกัดต้นไม้ ×1.25, y+40)

  function star(parent, x, y, s, rnd) {
    el('path', {
      d: 'M0-10C1-3 3-1 10 0 3 1 1 3 0 10-1 3-3 1-10 0-3-1-1-3 0-10Z',
      transform: 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + s.toFixed(2) + ')',
      fill: '#fffbe8', class: 'sparkle',
      style: 'animation-delay:-' + (rnd() * 3).toFixed(2) + 's;animation-duration:' + (1.8 + rnd() * 2.4).toFixed(2) + 's'
    }, parent);
  }

  function inTree(rnd, scale) {
    for (let i = 0; i < 200; i++) {
      const x = TREE.cx + (rnd() * 2 - 1) * TREE.rx * scale;
      const y = TREE.cy + (rnd() * 2 - 1) * TREE.ry * scale;
      if (inEllipse(x, y, TREE, scale)) return [x, y];
    }
    return [TREE.cx, TREE.cy];
  }

  function buildTreeFx(back, front) {
    const rnd = mulberry32(20261112);

    /* ---------- back ---------- */
    const defs = el('defs', null, back);
    grad(defs, 'radialGradient', 'tg-aura', [[0, '#fff3cf', .55], [.3, '#ffd27a', .32], [.6, '#f5b04a', .12], [.85, '#f5a623', .03], [1, '#f5a623', 0]]);
        grad(defs, 'linearGradient', 'tg-ground', [[0, '#c9a24a'], [.18, '#6f8a3a'], [.55, '#36502a'], [1, '#18241a']], { x1: 0, y1: 0, x2: 0, y2: 1 });
    grad(defs, 'radialGradient', 'tg-pool', [[0, '#ffe8a0', .75], [.5, '#ffbf47', .25], [1, '#ffbf47', 0]]);

    // ละอองแสงทอง (bokeh) ลอยช้า ๆ รอบต้นไม้ — นุ่มกว่าแสงแบบแฉก
    grad(defs, 'radialGradient', 'tg-bokeh', [[0, '#fff8dc', 1], [.45, '#ffd98a', .5], [1, '#ffc35a', 0]]);
    const bokeh = el('g', { class: 'tree-bokeh' }, back);
    for (let i = 0; i < 22; i++) {
      const a = rnd() * Math.PI * 2, r = .75 + rnd() * .5, br = 10 + rnd() * 26;
      // อยู่ในกรอบ viewBox ทั้งดวง → ไม่โดนตัดเป็นขอบเหลี่ยม
      const bx = Math.min(1000 - br - 20, Math.max(br + 20, 500 + Math.cos(a) * 470 * r));
      const by = Math.min(900 - br - 40, Math.max(br + 30, 330 + Math.sin(a) * 330 * r));
      el('circle', {
        cx: bx.toFixed(1), cy: by.toFixed(1),
        r: br.toFixed(1), fill: 'url(#tg-bokeh)', class: 'bokeh',
        style: 'animation-delay:-' + (rnd() * 8).toFixed(2) + 's;animation-duration:' + (7 + rnd() * 6).toFixed(2) + 's'
      }, bokeh);
    }
    el('ellipse', { cx: 500, cy: 820, rx: 470, ry: 78, fill: 'url(#tg-pool)' }, back);
    // ภาพต้นไม้มีเกาะหญ้า/หินในตัวแล้ว → เหลือแค่แสงทองสะท้อนพื้น

    /* ---------- front ---------- */
    const fdefs = el('defs', null, front);
    grad(fdefs, 'radialGradient', 'tg-lotus', [[0, '#fff0f7'], [.5, '#f9a8d4'], [1, '#db2777']], { cx: .5, cy: .85, r: .95 });
    grad(fdefs, 'radialGradient', 'tg-candle', [[0, '#fff7d1'], [.35, '#ffc857', .9], [1, '#ff9a3c', 0]]);
    grad(fdefs, 'radialGradient', 'tg-bulb', [[0, '#fffef5'], [.35, '#ffe9a3'], [1, '#ffc857', 0]]);

    // ไฟระยิบในพุ่ม (โทนทองอุ่น)
    const lights = el('g', { class: 'lights' }, front);
    for (let i = 0; i < 190; i++) {
      const p = inTree(rnd, 1);
      el('circle', {
        cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: (1.6 + rnd() * 2.6).toFixed(1), fill: 'url(#tg-bulb)', class: 'tw',
        style: 'animation-delay:-' + (rnd() * 3).toFixed(2) + 's;animation-duration:' + (2 + rnd() * 2.6).toFixed(2) + 's'
      }, lights);
    }
    // ไฟพันลำต้น (ลำต้นกว้างตามต้นไม้: ครึ่งกว้าง ~ 38–125 หน่วย)
    for (let i = 0; i < 52; i++) {
      const y = 550 + rnd() * 240;
      const t = (y - 550) / 240;
      const hw = (y < 637 ? 38 + (y - 550) / 87 * 24 : 61 + (y - 637) / 153 * 64) * .82;
      el('circle', {
        cx: (500 + (rnd() * 2 - 1) * hw).toFixed(1), cy: y.toFixed(1), r: (1.8 + rnd() * 1.6).toFixed(1),
        fill: 'url(#tg-bulb)', class: 'tw', style: 'animation-delay:-' + (rnd() * 3).toFixed(2) + 's'
      }, lights);
    }

    // ประกายดาว 4 แฉก
    const sparks = el('g', { class: 'sparkles' }, front);
    for (let i = 0; i < 22; i++) { const p = inTree(rnd, 1.08); star(sparks, p[0], p[1], .6 + rnd() * 1, rnd); }
    [[40, 120, 1.4], [960, 150, 1.3], [120, 30, 1.1], [880, 40, 1.2], [500, -6, 1.5], [30, 520, 1], [975, 540, 1.1]]
      .forEach(function (s) { star(sparks, s[0], s[1], s[2], rnd); });

    // เทียนกับดอกบัวบนเกาะ
    [[295, 797], [375, 817], [635, 817], [735, 797]].forEach(function (c) {
      el('circle', { cx: c[0], cy: c[1], r: 20, fill: 'url(#tg-candle)', class: 'flicker' }, front);
      el('ellipse', { cx: c[0], cy: c[1], rx: 3.1, ry: 5, fill: '#fff6d0' }, front);
    });
    [[210, 810, 1.31], [802, 807, 1.44], [335, 838, .94], [685, 840, 1.0], [65, 840, 1.56], [940, 837, 1.62]]
      .forEach(function (l) { lotus(front, l[0], l[1], l[2]); });
  }

  /* ---------- กลีบดอก (ชมพู/ทอง) ร่วงโปรย ---------- */
  function spawnPetals(container, n) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      const dur = 7 + Math.random() * 7;
      p.className = 'petal' + (i % 3 === 0 ? ' petal--gold' : '');
      p.style.cssText =
        'left:' + (8 + Math.random() * 84).toFixed(1) + '%;' +
        'top:' + (6 + Math.random() * 46).toFixed(1) + '%;' +
        '--s:' + (6 + Math.random() * 7).toFixed(1) + 'px;' +
        '--dur:' + dur.toFixed(1) + 's;' +
        '--delay:-' + (Math.random() * dur).toFixed(1) + 's;' +
        '--drift:' + ((Math.random() * 2 - 1) * 60).toFixed(0) + 'px';
      frag.appendChild(p);
    }
    container.appendChild(frag);
  }

  /* ---------- Temples on the horizon (viewBox 0 0 1440 220) ---------- */
  function chedi(cx, base, w, h) {
    return 'M' + (cx - w / 2) + ',' + base +
      ' L' + (cx - w / 2) + ',' + (base - h * .12) + ' L' + (cx - w * .42) + ',' + (base - h * .12) +
      ' L' + (cx - w * .42) + ',' + (base - h * .2) +
      ' Q' + (cx - w * .42) + ',' + (base - h * .5) + ' ' + (cx - w * .17) + ',' + (base - h * .55) +
      ' L' + (cx - w * .06) + ',' + (base - h * .62) + ' L' + cx + ',' + (base - h) +
      ' L' + (cx + w * .06) + ',' + (base - h * .62) + ' L' + (cx + w * .17) + ',' + (base - h * .55) +
      ' Q' + (cx + w * .42) + ',' + (base - h * .5) + ' ' + (cx + w * .42) + ',' + (base - h * .2) +
      ' L' + (cx + w * .42) + ',' + (base - h * .12) + ' L' + (cx + w / 2) + ',' + (base - h * .12) +
      ' L' + (cx + w / 2) + ',' + base + ' Z';
  }
  function hall(x, base, w, h) {
    const wt = base - h * .38;
    return 'M' + x + ',' + base + ' L' + x + ',' + wt + ' L' + (x - w * .07) + ',' + wt +
      ' L' + (x - w * .1) + ',' + (wt - 12) + ' L' + (x - w * .03) + ',' + (wt - 2) +
      ' L' + (x + w * .2) + ',' + (base - h * .7) + ' L' + (x + w * .14) + ',' + (base - h * .7) +
      ' L' + (x + w * .4) + ',' + (base - h * .96) + ' L' + (x + w * .5) + ',' + (base - h * 1.12) +
      ' L' + (x + w * .6) + ',' + (base - h * .96) + ' L' + (x + w * .86) + ',' + (base - h * .7) +
      ' L' + (x + w * .8) + ',' + (base - h * .7) + ' L' + (x + w * 1.03) + ',' + (wt - 2) +
      ' L' + (x + w * 1.1) + ',' + (wt - 12) + ' L' + (x + w * 1.07) + ',' + wt +
      ' L' + (x + w) + ',' + wt + ' L' + (x + w) + ',' + base + ' Z';
  }
  function buildTemples(svg) {
    const base = 206;
    const far = el('g', { fill: '#221f58' }, svg);
    const near = el('g', { fill: '#120f33' }, svg);
    const lights = el('g', { class: 'temple-lights', fill: '#ffd27a' }, svg);

    [[60, 70, 150], [318, 50, 110], [1180, 60, 132], [1392, 82, 172], [880, 34, 70]]
      .forEach(function (c) { el('path', { d: chedi(c[0], base, c[1], c[2]) }, far); });
    [[110, 170, 92], [1236, 140, 82], [640, 110, 48]]
      .forEach(function (hh) { el('path', { d: hall(hh[0], base, hh[1], hh[2]) }, far); });

    [[236, 46, 122], [1322, 52, 142], [20, 40, 96]]
      .forEach(function (c) { el('path', { d: chedi(c[0], base, c[1], c[2]) }, near); });
    [[-30, 140, 74], [1050, 150, 88], [1430, 120, 70]]
      .forEach(function (hh) { el('path', { d: hall(hh[0], base, hh[1], hh[2]) }, near); });
    el('rect', { x: 0, y: base - 4, width: 1440, height: 30 }, near);

    // ไฟริมน้ำ
    const rnd = mulberry32(99);
    for (let x = 6; x < 1440; x += 16 + rnd() * 18) {
      if (x > 470 && x < 1000 && rnd() > .45) continue;
      el('circle', { cx: x.toFixed(1), cy: (base - 2 - rnd() * 4).toFixed(1), r: (1.2 + rnd() * 1.6).toFixed(1) }, lights);
    }
    // ไฟบนองค์เจดีย์
    [[60, 150], [1392, 172], [236, 122], [1322, 142], [1180, 132]].forEach(function (c) {
      for (let i = 1; i <= 3; i++) el('circle', { cx: c[0], cy: base - c[1] * (.12 + i * .1), r: 1.6 }, lights);
    });
  }

  /* ---------- Lanterns & Krathongs ---------- */
  function spawnLanterns(container, n) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const d = document.createElement('span');
      const s = 10 + Math.random() * 18;
      const dur = 24 + Math.random() * 26;
      d.className = 'lantern';
      d.style.cssText =
        'left:' + (2 + Math.random() * 96).toFixed(1) + '%;' +
        '--s:' + s.toFixed(1) + 'px;' +
        '--dur:' + dur.toFixed(1) + 's;' +
        '--delay:-' + (Math.random() * dur).toFixed(1) + 's;' +
        '--drift:' + ((Math.random() * 2 - 1) * 50).toFixed(0) + 'px;' +
        '--o:' + (.55 + s / 28 * .4).toFixed(2);
      frag.appendChild(d);
    }
    container.appendChild(frag);
  }

  function spawnKrathongs(container, n) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const k = document.createElement('span');
      const b = 8 + Math.random() * 84;
      k.className = 'krathong';
      k.style.cssText =
        '--l:' + (3 + (i / n) * 92 + Math.random() * 4).toFixed(1) + '%;' +
        '--b:' + b.toFixed(0) + 'px;' +
        '--s:' + (14 + (100 - b) / 100 * 16).toFixed(0) + 'px;' +
        '--delay:-' + (Math.random() * 3.6).toFixed(2) + 's';
      frag.appendChild(k);
    }
    container.appendChild(frag);
  }

  /* ---------- Wish card positions ---------- */
  function wishPositions(n) {
    // จุดแขวน (ปลายเชือก) อยู่ในพุ่มดอก, viewBox 0 0 1000 900
    const rnd = mulberry32(1107);
    const e = { cx: 500, cy: 318, rx: 410, ry: 205 };
    const pts = [];
    let guard = 0;
    while (pts.length < n && guard++ < 20000) {
      const x = e.cx + (rnd() * 2 - 1) * e.rx;
      const y = e.cy + (rnd() * 2 - 1) * e.ry;
      if (!inEllipse(x, y, e)) continue;
      if (y < 125 || y > 470) continue;
      if (pts.some(function (p) { return Math.abs(p.vx - x) < 58 && Math.abs(p.vy - y) < 92; })) continue;
      pts.push({ vx: x, vy: y });
    }
    // เรียงจากบนลงล่าง → ป้ายล่างทับป้ายบนอย่างเป็นธรรมชาติ
    pts.sort(function (a, b) { return a.vy - b.vy; });
    return pts.map(function (p) {
      return { x: p.vx / 10, y: p.vy / 9, str: Math.round(4 + rnd() * 14), seed: rnd() };
    });
  }

  /* ---------- Sky: stars + fireflies + burst ---------- */
  function createSky(bg, fx) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bctx = bg.getContext('2d');
    const fctx = fx.getContext('2d');
    const stars = [], flies = [], sparks = [];
    let w = 0, h = 0;

    // sprite แสงหิ่งห้อย (วาดครั้งเดียว ใช้ซ้ำ = เร็ว)
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    (function () {
      const g = sprite.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,225,1)');
      gr.addColorStop(.16, 'rgba(250,240,140,.95)');
      gr.addColorStop(.45, 'rgba(220,240,110,.32)');
      gr.addColorStop(1, 'rgba(200,230,90,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
    })();

    function makeFly() {
      return {
        x: Math.random() * w, y: h * .2 + Math.random() * h * .8,
        vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
        p: Math.random() * 6.28, size: 5 + Math.random() * 9
      };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      w = window.innerWidth; h = window.innerHeight;
      [bg, fx].forEach(function (c) {
        c.width = w * dpr; c.height = h * dpr;
        c.style.width = w + 'px'; c.style.height = h + 'px';
      });
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars.length = 0;
      const n = Math.min(120, Math.round(w * h / 9000));
      for (let i = 0; i < n; i++) {
        stars.push({ x: Math.random() * w, y: Math.random() * h * .8, r: Math.random() * 1.1 + .25, p: Math.random() * 6.28, s: .006 + Math.random() * .02 });
      }
      if (!flies.length) for (let i = 0; i < 10; i++) flies.push(makeFly());
      if (reduce) draw();
    }

    function draw() {
      bctx.clearRect(0, 0, w, h);
      bctx.fillStyle = '#fff8e7';
      for (const s of stars) {
        s.p += s.s;
        bctx.globalAlpha = .3 + .7 * Math.abs(Math.sin(s.p));
        bctx.beginPath(); bctx.arc(s.x, s.y, s.r, 0, 6.283); bctx.fill();
      }
      for (const f of flies) {
        f.p += .035;
        f.vx += (Math.random() - .5) * .05;
        f.vy += (Math.random() - .5) * .05;
        const sp = Math.hypot(f.vx, f.vy);
        if (sp > .6) { f.vx *= .6 / sp; f.vy *= .6 / sp; }
        f.x += f.vx; f.y += f.vy;
        if (f.x < -20) f.x = w + 20;
        if (f.x > w + 20) f.x = -20;
        if (f.y < h * .15) f.vy += .03;
        if (f.y > h + 20) f.y = h * .4;
        bctx.globalAlpha = .25 + .75 * Math.max(0, Math.sin(f.p));
        bctx.drawImage(sprite, f.x - f.size, f.y - f.size, f.size * 2, f.size * 2);
      }
      bctx.globalAlpha = 1;

      fctx.clearRect(0, 0, w, h);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.vx *= .97; s.vy = s.vy * .97 - .015;
        s.x += s.vx; s.y += s.vy; s.p += .2; s.life -= s.decay;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        fctx.globalAlpha = s.life * (.6 + .4 * Math.sin(s.p));
        fctx.drawImage(sprite, s.x - s.size, s.y - s.size, s.size * 2, s.size * 2);
      }
      fctx.globalAlpha = 1;
    }

    /* ★ ท้องฟ้าวาด ~30fps และหยุดเมื่อสลับแท็บ */
    let last = 0;
    function loop(ms) { requestAnimationFrame(loop); if (document.hidden || ms - last < 33) return; last = ms; draw(); }

    /** ปล่อยหิ่งห้อยกระจายออกจากจุด (x, y) บนหน้าจอ */
    function burst(x, y, n) {
      if (reduce) return;
      n = n || 30;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, v = 1 + Math.random() * 3.2;
        sparks.push({
          x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1,
          size: 6 + Math.random() * 12, life: 1, decay: .008 + Math.random() * .012, p: Math.random() * 6.28
        });
      }
    }

    window.addEventListener('resize', resize);
    resize();
    if (!reduce) requestAnimationFrame(loop);
    return { burst: burst };
  }

  root.Scene = {
    buildTreeFx: buildTreeFx,
    spawnPetals: spawnPetals,
    buildTemples: buildTemples,
    spawnLanterns: spawnLanterns,
    spawnKrathongs: spawnKrathongs,
    wishPositions: wishPositions,
    createSky: createSky
  };
})(typeof window !== 'undefined' ? window : globalThis);

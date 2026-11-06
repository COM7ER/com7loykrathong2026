/* =========================================================
   main.js — UI & Interactions
   1) Scene setup      2) Wish cards       3) Modal
   4) Login (ดูของฉัน)  5) Composer (แขวนใหม่) 6) Stats
   7) Nav / Scroll     8) Toast
   ========================================================= */
(function () {
  'use strict';

  const D = window.WISH_DATA;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const fmt = (n) => n.toLocaleString('th-TH');
  const catMap = Object.fromEntries(D.categories.map((c) => [c.key, c]));
  const scrollOpts = (block) => ({ behavior: reduceMotion ? 'auto' : 'smooth', block: block || 'center' });

  /* ★ เชื่อมระบบจริง (backend v4.4) · แจ็ค 4 พ.ย. 2569
     PDPA: ป้ายบนต้นไม้ "ปิดผนึก" — สาธารณะเห็นแค่หมวด/สี/พลังใจ · เจ้าของเปิดอ่านได้ด้วยชื่อ+รหัสพนักงาน */
  const API = 'https://script.google.com/macros/s/AKfycbxxfSz7t00UR9g4H78boZm4RJRLN3O0uqsRnDVEnTK_sEFkZlHiweCdOnEeL0slpuAZuQ/exec';
  const TOKEN = 'COM7LKER2569';
  /* ★ 5 พ.ย.: ถ้าระบบหลังบ้านยังเป็นเวอร์ชันเก่า (ไม่รู้จักคำสั่งขอพร) → แจ้งข้อความที่เข้าใจได้ แทน "unknown action" */
  function friendly(r) {
    if (r && !r.ok && /unknown action/i.test(String(r.error || ''))) r.error = 'ระบบขอพรกำลังอัปเดต ขออภัยในความไม่สะดวก ลองใหม่อีกครั้งภายหลังนะ 🙏';
    return r;
  }
  function api(params) { return _api(params).then(friendly); }
  function _api(params) {
    return new Promise((res) => {
      const cb = '__wt' + Date.now() + Math.floor(Math.random() * 1e4), s = document.createElement('script');
      const tm = setTimeout(() => done({ ok: false, error: 'เชื่อมต่อช้า ลองใหม่อีกครั้ง' }), 15000);
      function done(d) { clearTimeout(tm); delete window[cb]; s.remove(); res(d || { ok: false }); }
      window[cb] = done;
      s.onerror = () => done({ ok: false, error: 'เชื่อมต่อระบบไม่ได้' });
      s.src = API + '?' + Object.keys(params).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&') + '&callback=' + cb;
      document.body.appendChild(s);
    });
  }
  let currentUser = null;
  let activeCat = null;   // หมวดที่กำลังไฮไลต์
  let total = 0;

  /* ---------- 1) Scene ---------- */
  Mascot.mountAll();
  Scene.buildTemples($('#temples'));
  Scene.spawnLanterns($('#lanterns'), 8);
  Scene.spawnKrathongs($('#krathongs'), 5);
  const sky = Scene.createSky($('#sky-canvas'), $('#fx-canvas'));

  /* ---------- 2) Wish cards ---------- */
  const layer = $('#wishLayer');
  /* ★ ป้ายแขวนบนกิ่งจริงของต้นไม้ canvas (tree.js) — ถ้าโหลดไม่ได้ใช้ตำแหน่งสำรองเดิม */
  const slots = (window.WishTree && WishTree.anchors.length)
    ? WishTree.anchors.filter((a) => a.y > 24 && a.y < 80).map((a, i) => ({ x: a.x, y: a.y, str: 6 + (i * 7) % 14, seed: ((i * 37) % 100) / 100 }))
    : Scene.wishPositions(48);
  
  const wishes = [];
  

  let nextFree = 0;
  function slotFor() {
    if (nextFree < slots.length) return slots[nextFree++];
    const base = slots[Math.floor(Math.random() * slots.length)];
    return Object.assign({}, base, { x: base.x + (Math.random() * 3 - 1.5), y: base.y + (Math.random() * 2 - 1) });
  }
  function loadTree() {
    return api({ action: 'wishes' }).then((r) => {
      if (!r || !r.ok) { toast((r && r.error) || 'โหลดต้นไม้ไม่สำเร็จ'); return; }
      const have = {}; wishes.forEach((w) => { have[w.id] = w; });
      r.data.forEach((d) => {
        if (have[d.id]) { have[d.id].power = d.power; if (d.text && !have[d.id].mine) { have[d.id].text = d.text; have[d.id].pub = true; } return; }
        const w = { id: d.id, cat: catMap[d.cat] ? d.cat : 'other', tag: d.tag % D.tags.length, power: d.power, pos: slotFor(), pub: !!d.text, text: d.text || '' };
        wishes.push(w); createCard(w);
      });
      total = r.total; renderTotal(); renderStats(r.stats, r.total);
    });
  }

  /** anim: 'new' = หล่นลงมา, 'pending' = ซ่อนไว้รอผึ้งมาแขวน, 'attach' = เพิ่งถูกแขวน */
  function createCard(w, anim) {
    const b = document.createElement('button');
    const c = catMap[w.cat];
    b.type = 'button';
    b.className = 'wish' + (anim ? ' is-' + anim : '');
    b.dataset.cat = w.cat;
    b.style.left = w.pos.x + '%';
    b.style.top = w.pos.y + '%';
    b.style.setProperty('--str', w.pos.str + 'px');
    b.style.setProperty('--dur', (2.6 + w.pos.seed * 2).toFixed(2) + 's');
    b.style.setProperty('--delay', (-w.pos.seed * 3).toFixed(2) + 's');
    b.setAttribute('aria-label', 'ป้ายคำอธิษฐานหมวด' + c.label + (w.pub ? ' (เปิดเผย)' : ' (ปิดผนึก)'));
    if (!w.pub) b.classList.add('is-sealed');
    w.color = D.tags[w.tag].color;
    b.innerHTML = '<img src="' + D.tags[w.tag].src + '" alt="" draggable="false">';
    b.addEventListener('click', () => openWish(w));
    if (activeCat) b.classList.toggle('is-match', w.cat === activeCat);
    layer.appendChild(b);
    w.el = b;
    return b;
  }

  function burstAt(node, n) {
    const r = node.getBoundingClientRect();
    sky.burst(r.left + r.width / 2, r.top + r.height / 2, n);
  }

  function glow(list, ms) {
    list.forEach((w) => w.el.classList.add('is-powered'));
    setTimeout(() => list.forEach((w) => w.el.classList.remove('is-powered')), ms || 2200);
  }

  /* ---------- 3) Modal ---------- */
  const modal = $('#modal');
  const modalBody = $('#modalBody');

  function openModal(html, onMount) {
    modalBody.innerHTML = html;
    Mascot.mountAll(modalBody);
    if (!modal.open) modal.showModal();
    if (onMount) onMount(modalBody);
  }
  function closeModal() { if (modal.open) modal.close(); }

  $('#modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  modalBody.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });

  function openWish(w) {
    const c = catMap[w.cat];
    openModal(
      '<div class="modal__body">' +
        '<div class="modal__mascot" data-mascot aria-hidden="true"></div>' +
        '<h3>คำอธิษฐานบนต้นไม้</h3>' +
        '<p class="sub">หมวด ' + c.icon + ' ' + c.label + '</p>' +
        ((w.text && (w.pub || w.mine))
          ? '<div class="wish-paper" style="--c:' + w.color + '"><p>“' + esc(w.text) + '”</p></div>'
          : '<div class="wish-paper wish-sealed" style="--c:' + w.color + '"><p>🔒 คำอธิษฐานนี้ถูกปิดผนึกไว้<br><small>เจ้าของเลือกเก็บเป็นความลับ</small></p></div>') +
        '<div class="wish-meta"><span>' + (w.mine ? 'คำอธิษฐานของคุณ' + (w.pub ? ' · เปิดเผย' : ' · ปิดผนึก') : 'ไม่ระบุชื่อผู้ขอพร') + '</span>' +
        '<span>💛 ได้รับพลังใจ <b>' + fmt(w.power) + '</b> ครั้ง</span></div>' +
        '<div class="modal__actions">' +
          ((w.text && (w.pub || w.mine)) ? '<button type="button" class="btn btn--ghost" data-action="card">🎴 การ์ดคำขอพร</button>' : '') +
          '<button type="button" class="btn btn--gold" data-action="power">ส่งพลังใจให้ ✨</button>' +
        '</div>' +
      '</div>',
      (body) => {
        const cb = $('[data-action="card"]', body);
        if (cb) cb.addEventListener('click', () => openCard({ text: w.text, cat: w.cat, tag: w.tag }));
        $('[data-action="power"]', body).addEventListener('click', () => {
          w.power++;
          api({ action: 'wish_power', token: TOKEN, ids: w.id });
          closeModal();
          // พลังใจลอยไปหาป้ายคำอธิษฐานบนต้นไม้
          setTimeout(() => { glow([w]); burstAt(w.el, 28); }, 120);
          toast('ส่งพลังใจถึงเจ้าของคำอธิษฐานแล้ว 💛');
        });
      }
    );
  }

  /* ---------- 4) Login: ดูคำอธิษฐานของฉัน ---------- */
  const form = $('#myWish');

  function setErr(name, msg) {
    const input = form.elements[name];
    const wrap = input.closest('.field');
    wrap.classList.toggle('has-error', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    $('.field__error', wrap).textContent = msg;
    return !msg;
  }
  ['empId'].forEach((n) => form.elements[n].addEventListener('input', () => setErr(n, '')));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = form.elements.empId.value.trim();
    const okId = setErr('empId', /^[A-Za-z0-9-]{3,30}$/.test(id) ? '' : 'กรุณากรอกรหัสพนักงานให้ถูกต้อง');
    if (!okId) { form.elements.empId.focus(); return; }
    currentUser = { id: id };
    showMine();
  });

  

  async function showMine() {
    const r = await api({ action: 'mywish', empId: currentUser.id });
    if (!r || !r.ok) { toast((r && r.error) || 'ค้นหาไม่สำเร็จ'); return; }
    $$('.wish.is-mine').forEach((n) => n.classList.remove('is-mine'));
    wishes.forEach((w) => { w.mine = false; });
    const byId = {}; wishes.forEach((w) => { byId[w.id] = w; });
    const mine = r.data.map((d) => {
      let w = byId[d.id];
      if (!w) { w = { id: d.id, cat: catMap[d.cat] ? d.cat : 'other', tag: d.tag % D.tags.length, power: d.power, pos: slotFor() }; wishes.push(w); createCard(w); }
      w.text = d.text; w.power = d.power; w.pub = !!d.public; w.mine = true; w.el.classList.add('is-mine'); w.el.classList.toggle('is-sealed', !w.pub);
      return w;
    });
    if (!mine.length) {
      openModal('<div class="modal__body"><div class="modal__mascot" data-mascot aria-hidden="true"></div><h3>ยังไม่พบคำอธิษฐานของคุณ</h3>' +
        '<p class="sub">ตรวจรหัสพนักงานให้ตรงกับตอนแขวน หรือแขวนใบแรกได้เลย 🐝</p>' +
        '<div class="modal__actions"><button type="button" class="btn btn--gold" data-action="write">+ แขวนคำอธิษฐาน</button></div></div>',
        (body) => { $('[data-action="write"]', body).addEventListener('click', openComposer); });
      return;
    }

    openModal(
      '<div class="modal__body">' +
        '<div class="modal__mascot" data-mascot aria-hidden="true"></div>' +
        '<h3>คำขอพรของคุณ 🐝</h3>' +
        '<p class="sub">คุณแขวนคำอธิษฐานไว้ ' + mine.length + ' ใบ · ไฮไลต์ขอบทองบนต้นไม้แล้ว</p>' +
        '<ul class="my-list">' + mine.map((w) => {
          const c = catMap[w.cat];
          return '<li class="wish-paper" style="--c:' + w.color + '">' +
            '<span class="chip">' + c.icon + ' ' + c.label + '</span>' +
            '<p>' + esc(w.text) + '</p>' +
            '<small>💛 ได้รับพลังใจ ' + fmt(w.power) + ' ครั้ง · ' + (w.pub ? '🌕 เปิดเผย (ไม่ระบุชื่อ)' : '🔒 ปิดผนึก') + '</small>' +
            '<button type="button" class="mini-card" data-card="' + w.id + '">🎴 สร้างการ์ด</button></li>';
        }).join('') + '</ul>' +
        '<div class="modal__actions">' +
          '<button type="button" class="btn btn--ghost" data-action="write">+ แขวนเพิ่ม</button>' +
          '<button type="button" class="btn btn--gold" data-action="view">ดูบนต้นไม้</button>' +
        '</div>' +
      '</div>',
      (body) => {
        $('[data-action="write"]', body).addEventListener('click', openComposer);
        $$('[data-card]', body).forEach((bt) => bt.addEventListener('click', () => { const w = mine.find((x) => x.id === bt.dataset.card); if (w) openCard({ text: w.text, cat: w.cat, tag: w.tag }); }));
        $('[data-action="view"]', body).addEventListener('click', () => {
          closeModal();
          $('#treeStage').scrollIntoView(scrollOpts());
          setTimeout(() => glow(mine, 2600), 500);
        });
      }
    );
  }

  /* ---------- 5) Composer: แขวนคำอธิษฐานใหม่ ---------- */
  function openComposer() {
    /* ★ แบ่ง 3 ขั้น: 1 เขียนพร+หมวด → 2 เปิดเผยหรือปิดผนึก → 3 รหัสพนักงาน+ยินยอม แล้วแขวน */
    const st = { text: '', cat: D.categories[0].key, pub: false, id: currentUser ? currentUser.id : '' };
    const dots = (n) => '<div class="wz-dots">' + [1, 2, 3].map((k) => '<i class="' + (k <= n ? 'on' : '') + '">' + k + '</i>').join('<b></b>') + '</div>';
    function step1() {
      openModal('<form class="modal__body composer" novalidate>' + dots(1) +
        '<h3>เขียนคำขอพร</h3><p class="sub">น้องผึ้งจะบินนำไปแขวนบนต้นไม้ให้ 🐝</p>' +
        '<textarea name="text" maxlength="120" placeholder="ขอให้..." required>' + esc(st.text) + '</textarea>' +
        '<div class="counter"><span data-count>' + st.text.length + '</span>/120</div>' +
        '<fieldset class="cat-picker"><legend class="sr-only">หมวด</legend>' +
        D.categories.map((c) => '<label><input type="radio" name="cat" value="' + c.key + '"' + (c.key === st.cat ? ' checked' : '') + '><span>' + c.icon + ' ' + c.label + '</span></label>').join('') +
        '</fieldset><div class="modal__actions"><button type="button" class="btn btn--ghost" data-close>ยกเลิก</button><button type="submit" class="btn btn--gold">ถัดไป →</button></div></form>', (body) => {
        const f = body.firstElementChild, ta = f.elements.text;
        ta.addEventListener('input', () => { $('[data-count]', f).textContent = ta.value.length; });
        setTimeout(() => ta.focus(), 50);
        f.addEventListener('submit', (e) => { e.preventDefault(); const t = ta.value.trim();
          if (t.length < 3) { ta.classList.remove('shake'); void ta.offsetWidth; ta.classList.add('shake'); ta.focus(); return; }
          st.text = t; st.cat = f.elements.cat.value; step2(); });
      });
    }
    function step2() {
      openModal('<form class="modal__body composer" novalidate>' + dots(2) +
        '<h3>คำขอพรนี้ เปิดเผยไหม?</h3><p class="sub">ไม่ว่าเลือกแบบไหน <b>ไม่มีการแสดงชื่อผู้ขอพร</b></p>' +
        '<div class="pub-choice big" role="radiogroup">' +
          '<label><input type="radio" name="pub" value="0"' + (st.pub ? '' : ' checked') + '><span><em>🔒</em><b>ปิดผนึก</b><small>เก็บเป็นความลับ<br>คนอื่นเห็นแค่ป้าย</small></span></label>' +
          '<label><input type="radio" name="pub" value="1"' + (st.pub ? ' checked' : '') + '><span><em>🌕</em><b>เปิดเผย</b><small>คนอื่นอ่านคำขอพรได้<br><u>ไม่ระบุชื่อ</u></small></span></label>' +
        '</div><div class="modal__actions"><button type="button" class="btn btn--ghost" data-back>← ย้อนกลับ</button><button type="submit" class="btn btn--gold">ถัดไป →</button></div></form>', (body) => {
        const f = body.firstElementChild;
        $('[data-back]', f).addEventListener('click', step1);
        f.addEventListener('submit', (e) => { e.preventDefault(); st.pub = f.elements.pub.value === '1'; step3(); });
      });
    }
    function step3() {
      openModal('<form class="modal__body composer" novalidate>' + dots(3) +
        '<h3>อีกนิดเดียว!</h3><p class="sub">ใส่รหัสพนักงาน ไว้เปิดอ่านพรของคุณเองภายหลัง</p>' +
        '<input class="wz-id" name="wid" maxlength="30" placeholder="รหัสพนักงาน" autocomplete="off" value="' + esc(st.id) + '">' +
        '<p class="who-note">🔒 รหัสพนักงานไม่แสดงให้ใครเห็น</p>' +
        '<div class="modal__actions"><button type="button" class="btn btn--ghost" data-back>← ย้อนกลับ</button><button type="submit" class="btn btn--gold">🐝 แขวนคำขอพร</button></div><p class="consent-note">🔒 การกด “แขวนคำขอพร” ถือว่ายินยอมให้เก็บคำขอพรและรหัสพนักงานไว้ในระบบกิจกรรม ดูได้เฉพาะคุณและผู้ดูแลระบบ · <a href="contest.html#pdpa" target="_blank" rel="noopener">อ่านนโยบาย</a></p></form>', (body) => {
        const f = body.firstElementChild;
        $('[data-back]', f).addEventListener('click', step2);
        setTimeout(() => f.elements.wid.focus(), 50);
        f.addEventListener('submit', (e) => { e.preventDefault();
          const id = f.elements.wid.value.trim();
          if (!/^[A-Za-z0-9-]{3,30}$/.test(id)) { toast('กรุณากรอกรหัสพนักงาน'); f.elements.wid.focus(); return; }
          const btn = f.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'กำลังส่ง…';
          const tag = Math.floor(Math.random() * D.tags.length);
          api({ action: 'wish', token: TOKEN, consent: true, public: st.pub, text: st.text, cat: st.cat, tag: tag, empId: id }).then((r) => {
            if (!r || !r.ok) { btn.disabled = false; btn.textContent = '🐝 แขวนคำขอพร'; toast((r && r.error) || 'ส่งไม่สำเร็จ ลองใหม่'); return; }
            currentUser = { id: id };
            hangWish(st.text, st.cat, r.wishId, tag, !!r.public);
            if (st.pub && !r.public) setTimeout(() => toast('มีเบอร์โทร/อีเมลในคำขอพร ระบบจึงปิดผนึกให้อัตโนมัติ 🔒'), 3200);
          });
        });
      });
    }
    step1();
  }

  function hangWish(text, cat, id, tag, pub) {
    const w = { id: id, text: text, cat: cat, tag: tag, power: 0, pos: slotFor(), mine: true, pub: !!pub };
    wishes.push(w);
    closeModal();
    $('#treeStage').scrollIntoView(scrollOpts());
    bumpTotal(1);

    // ไม่มีแอนิเมชัน / ผึ้งกำลังบินอยู่ → แขวนทันที
    if (reduceMotion || beeBusy || !Element.prototype.animate) {
      setTimeout(() => {
        createCard(w, 'new').classList.add('is-mine');
        setTimeout(() => burstAt(w.el, 36), 700);
        toast('น้องผึ้งนำคำอธิษฐานของคุณไปแขวนแล้ว 🐝✨');
        setTimeout(() => offerCard(w), 1600);
      }, 450);
      return;
    }
    setTimeout(() => beeDeliver(w), 650);   // รอเลื่อนจอเสร็จก่อน
  }

  /* ---------- 5.1) น้องผึ้งบินไปแขวนป้าย ----------
     1) ผึ้งบนต้นไม้หายไป แล้วมีผึ้งตัวบิน (flyer) ถือป้ายบินขึ้นมาแทน
     2) บินโค้งไปที่กิ่ง (bezier + ส่ายเล็กน้อย) พร้อมทิ้งประกายเป็นทาง
     3) โฉบลงแขวนป้าย → ป้ายจริงโผล่ + ประกายแตก + บอลลูนคำพูด
     4) บินกลับไปที่เดิม */
  let beeBusy = false;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function flightFrames(p0, p1, s0, s1, lift) {
    const c = { x: (p0.x + p1.x) / 2, y: Math.min(p0.y, p1.y) - lift };
    const flip = p1.x > p0.x ? -1 : 1;           // ภาพผึ้งหันซ้าย → บินไปขวาให้กลับด้าน
    const frames = [];
    const N = 36;
    for (let i = 0; i <= N; i++) {
      const t = ease(i / N), u = 1 - t;
      const x = u * u * p0.x + 2 * u * t * c.x + t * t * p1.x;
      const y = u * u * p0.y + 2 * u * t * c.y + t * t * p1.y + Math.sin(t * Math.PI * 4) * 6 * Math.sin(t * Math.PI);
      const sc = s0 + (s1 - s0) * t;
      const tilt = Math.sin(t * Math.PI * 2) * 6 * flip;
      frames.push({ transform: 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + tilt.toFixed(1) + 'deg) scale(' + (sc * flip).toFixed(3) + ',' + sc.toFixed(3) + ')' });
    }
    return frames;
  }

  function trail(node) {
    return setInterval(() => {
      const r = node.getBoundingClientRect();
      sky.burst(r.left + r.width * .55, r.top + r.height * .6, 2);
    }, 90);
  }

  async function beeDeliver(w) {
    beeBusy = true;
    const stage = $('#treeStage');
    const sH = stage.clientHeight;

    // ป้ายจริง (ซ่อนไว้ก่อน) → ใช้วัดตำแหน่งปลายทาง
    const card = createCard(w, 'pending');
    const tagH = card.offsetHeight;
    const tagX = card.offsetLeft;     // จุดกึ่งกลาง (translate -50%)
    const tagY = card.offsetTop;

    // ผึ้งตัวบิน
    const mw = mascot.offsetWidth;
    const fw = Math.max(70, mw * .78);
    const fh = fw * 560 / 549;
    const HOLD = .7;                  // ตำแหน่งมือผึ้ง (สัดส่วนความสูง)
    const flyer = document.createElement('div');
    flyer.className = 'bee-flyer';
    flyer.style.width = fw + 'px';
    flyer.style.height = fh + 'px';
    flyer.innerHTML = '<span class="bee-flyer__bee" data-mascot></span>' +
                      '<span class="bee-flyer__say">ขอให้สมหวังนะ! 💛</span>';
    stage.appendChild(flyer);
    Mascot.mountAll(flyer);
    const carry = document.createElement('img');
    carry.className = 'bee-flyer__tag';
    carry.src = D.tags[w.tag].src;
    carry.alt = '';
    carry.style.height = tagH + 'px';
    carry.style.top = (HOLD * 100) + '%';
    $('.bee__fly', flyer).appendChild(carry);   // ป้ายลอยขึ้นลงไปพร้อมตัวผึ้ง

    const home = { x: mascot.offsetLeft + mw / 2 - fw / 2, y: mascot.offsetTop + mascot.offsetHeight / 2 - fh / 2 };
    const spot = { x: tagX - fw / 2, y: tagY - fh * HOLD };
    const sHome = mw / fw;

    mascot.classList.add('is-away');
    flyer.style.transform = 'translate(' + home.x + 'px,' + home.y + 'px) scale(' + sHome + ')';

    // 1–2) บินไป
    let tr = trail(flyer);
    await flyer.animate(flightFrames(home, spot, sHome, 1, sH * .22), { duration: 1700, fill: 'forwards' }).finished;
    clearInterval(tr);

    // 3) โฉบลงแขวน
    const at = 'translate(' + spot.x + 'px,' + spot.y + 'px)';
    await flyer.animate([
      { transform: at + ' scale(1)' },
      { transform: 'translate(' + spot.x + 'px,' + (spot.y + 10) + 'px) scale(1.04)' },
      { transform: at + ' scale(1)' }
    ], { duration: 420, easing: 'ease-in-out', fill: 'forwards' }).finished;

    carry.classList.add('is-gone');
    card.classList.remove('is-pending');
    card.classList.add('is-attach', 'is-mine');
    burstAt(card, 40);
    flyer.classList.add('is-talking');
    toast('น้องผึ้งนำคำอธิษฐานของคุณไปแขวนแล้ว 🐝✨');
    setTimeout(() => offerCard(w), 2600);
    await wait(1100);
    flyer.classList.remove('is-talking');

    // 4) บินกลับบ้าน
    tr = trail(flyer);
    const back = flightFrames(spot, home, 1, sHome, sH * .12);
    back[0].transform = at + ' scale(' + (home.x > spot.x ? -1 : 1) + ',1)';
    await flyer.animate(back, { duration: 1300, fill: 'forwards' }).finished;
    clearInterval(tr);

    flyer.remove();
    mascot.classList.remove('is-away');
    mascot.classList.add('is-back');
    setTimeout(() => {
      mascot.classList.remove('is-back');
      card.classList.remove('is-attach');
    }, 700);
    beeBusy = false;
  }

  // น้องผึ้งบนต้นไม้ = ปุ่มแขวนคำอธิษฐาน
  const mascot = $('#mascotTree');
  mascot.addEventListener('click', openComposer);
  const btnWish = $('#btnWish'); if (btnWish) btnWish.addEventListener('click', openComposer);   /* ★ 5 พ.ย. ปุ่มขอพรด้านซ้าย */
  setTimeout(() => mascot.classList.add('show-bubble'), 1400);
  setTimeout(() => mascot.classList.remove('show-bubble'), 6400);

  /* ---------- 6) Stats ---------- */
  const statsList = $('#statsList');


  function rankBadge(n) {
    if (n > 3) return '<span class="stat__rank stat__rank--plain"><b>' + n + '</b></span>';
    const col = { 1: ['#fff1b8', '#e3a83f'], 2: ['#f8fafc', '#94a3b8'], 3: ['#ffe0bd', '#c27c3a'] }[n];
    const g = 'crown' + n;
    return '<span class="stat__rank">' +
      '<svg viewBox="0 0 40 32" aria-hidden="true"><defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + col[0] + '"/><stop offset="1" stop-color="' + col[1] + '"/></linearGradient></defs>' +
      '<path d="M5 25 L3 9 L12 15 L20 4 L28 15 L37 9 L35 25 Z" fill="url(#' + g + ')" stroke="rgba(0,0,0,.25)"/>' +
      '<rect x="5" y="25" width="30" height="4" rx="1.5" fill="url(#' + g + ')"/>' +
      '<circle cx="20" cy="4" r="2.4" fill="' + col[0] + '"/><circle cx="3" cy="9" r="2" fill="' + col[0] + '"/><circle cx="37" cy="9" r="2" fill="' + col[0] + '"/>' +
      '</svg><b>' + n + '</b></span>';
  }

function renderStats(stats, tot) {
    const n = Math.max(1, tot || 0);
    const cats = D.categories.map((c) => Object.assign({}, c, { pct: Math.round(((stats && stats[c.key]) || 0) / n * 100) }))
      .sort((a, b) => (a.key === 'other') - (b.key === 'other') || b.pct - a.pct);
    const maxPct = Math.max(1, ...cats.map((c) => c.pct));
    statsList.innerHTML = cats.map((c, i) =>
    '<li><button type="button" class="stat' + (i === 0 ? ' stat--top' : '') + '" data-cat="' + c.key + '" aria-pressed="false" ' +
      'aria-label="อันดับ ' + (i + 1) + ' ' + c.label + ' ' + c.pct + ' เปอร์เซ็นต์ — แตะเพื่อไฮไลต์บนต้นไม้" ' +
      'style="--c:' + c.color + ';--w:' + (Math.max(3, c.pct) / maxPct * 88).toFixed(1) + '">' +
      rankBadge(i + 1) +
      '<span class="stat__icon" aria-hidden="true">' + c.icon + '</span>' +
      '<span class="stat__label">' + c.label + '</span>' +
      '<span class="stat__pct">' + c.pct + '%</span>' +
      '<span class="stat__bar" aria-hidden="true"><i></i></span>' +
    '</button></li>'
  ).join('');
  }

  statsList.addEventListener('click', (e) => {
    const btn = e.target.closest('.stat');
    if (!btn) return;
    const key = btn.dataset.cat;
    activeCat = activeCat === key ? null : key;
    $$('.stat', statsList).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === activeCat)));
    layer.classList.toggle('is-filtering', !!activeCat);
    wishes.forEach((w) => w.el.classList.toggle('is-match', w.cat === activeCat));
    if (activeCat) {
      $('#treeStage').scrollIntoView(scrollOpts());
      toast('กำลังแสดงหมวด “' + catMap[key].label + '” · แตะอีกครั้งเพื่อดูทั้งหมด');
    }
  });

  // นับจำนวนคำอธิษฐาน + จำลอง real-time
  const totalEl = $('#totalWishes');
  function renderTotal() { totalEl.textContent = fmt(total); }
  function bumpTotal(n) {
    total += n; renderTotal();
    totalEl.classList.add('is-bump');
    setTimeout(() => totalEl.classList.remove('is-bump'), 600);
  }
  function countUp() {
    if (reduceMotion) { renderTotal(); return; }
    const start = performance.now(), dur = 1400, target = total;
    (function step(t) {
      const k = Math.min(1, (t - start) / dur);
      totalEl.textContent = fmt(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    })(start);
  }
  // ★ real-time จริง: ดึงต้นไม้ใหม่ทุก 30 วิ (ข้ามตอนแท็บไม่โฟกัส กันเปลืองโควตา Apps Script)
  setInterval(() => { if (!document.hidden) loadTree(); }, 30000);

  const stats = $('#stats');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) { stats.classList.add('is-visible'); countUp(); io.disconnect(); }
    }, { threshold: .25 });
    io.observe(stats);
  } else { stats.classList.add('is-visible'); renderTotal(); }

  // ส่งพลังใจต่อไป
  $('#sendPower').addEventListener('click', (e) => {
    burstAt(e.currentTarget, 44);
    const pick = wishes.slice().sort(() => Math.random() - .5).slice(0, 6);
    pick.forEach((w) => w.power++);
    if (pick.length) api({ action: 'wish_power', token: TOKEN, ids: pick.map((w) => w.id).join(',') });
    glow(pick);
    toast('ส่งพลังใจถึงเพื่อน ๆ 6 คนแล้ว 💛');
  });

  /* ---------- 7) Nav / Scroll ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = $('#navToggle');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  $$('#navMenu a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  $$('[data-scroll]').forEach((b) => b.addEventListener('click', () => {
    $(b.dataset.scroll).scrollIntoView(scrollOpts());
    if (b.dataset.focus) setTimeout(() => $(b.dataset.focus).focus({ preventScroll: true }), reduceMotion ? 0 : 550);
  }));

  /* ---------- 8) Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 2800);
  }


  /* ---------- 9) 🎴 การ์ดคำขอพร (ดาวน์โหลด / แชร์) — ไม่มีชื่อผู้ขอพรบนการ์ด ---------- */
  function offerCard(w) {
    if (modal.open) return;
    openModal('<div class="modal__body"><div class="modal__mascot" data-mascot aria-hidden="true"></div><h3>แขวนเรียบร้อย! ✨</h3>' +
      '<p class="sub">อยากเก็บคำขอพรเป็นการ์ดสวย ๆ ไว้แชร์ไหม?</p>' +
      '<div class="modal__actions"><button type="button" class="btn btn--ghost" data-close>ไว้ก่อน</button>' +
      '<button type="button" class="btn btn--gold" data-action="mk">🎴 สร้างการ์ด</button></div>' +
      '<p class="sub" style="margin-top:12px"><a href="float.html?wish=' + encodeURIComponent(w.text || '') + '" style="color:#ffe9a8">🪷 ลอยกระทงพร้อมพรนี้ →</a></p></div>',   /* ★ 5 พ.ย. เชื่อมหน้าลอยกระทง */
      (body) => { $('[data-action="mk"]', body).addEventListener('click', () => openCard({ text: w.text, cat: w.cat, tag: w.tag })); });
  }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function wrapTh(c, t, max) {
    const sg = (window.Intl && Intl.Segmenter) ? Array.from(new Intl.Segmenter('th', { granularity: 'word' }).segment(t), (x) => x.segment) : Array.from(t);
    const L = []; let ln = '';
    sg.forEach((w) => { if (ln && c.measureText(ln + w).width > max) { L.push(ln.trim()); ln = w; } else ln += w; });
    if (ln.trim()) L.push(ln.trim()); return L;
  }
  function seeded(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const tagImgs = D.tags.map((t) => { const i = new Image(); i.src = t.src; return i; });
  /* ★ ลายการ์ด 4 แบบ (แก้สี/ชื่อได้ที่นี่) */
  const THEMES = [
    { id: 'night', name: '🌙 คืนเพ็ญ', bg: ['#060a2c', '#2a2266', '#4b2f7c'], frame: ['#ffe9a8', '#c98a2b'], text: '#fff6dd', glow: 'rgba(255,214,140,.8)', box: 'rgba(10,14,60,.62)' },
    { id: 'gold', name: '✨ ทองอร่าม', bg: ['#2a1505', '#7a4a12', '#c98a2b'], frame: ['#fff1c7', '#e3a83f'], text: '#fff8e6', glow: 'rgba(255,200,90,.9)', box: 'rgba(40,20,4,.55)' },
    { id: 'lotus', name: '🪷 บัวชมพู', bg: ['#3a0c2e', '#a3346f', '#f39ac2'], frame: ['#ffe1f0', '#e46aa8'], text: '#fff4fa', glow: 'rgba(255,170,210,.9)', box: 'rgba(70,10,45,.5)' },
    { id: 'river', name: '🌊 สายน้ำ', bg: ['#031c33', '#0e5a86', '#2fb4d4'], frame: ['#d8f6ff', '#5fc6e8'], text: '#f2fcff', glow: 'rgba(140,230,255,.9)', box: 'rgba(3,30,55,.55)' }
  ];
  const QR = new Image(); QR.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQAQMAAAC6caSPAAAABlBMVEX/9t0qGgWndBvYAAAACXBIWXMAAA7EAAAOxAGVKw4bAAACfElEQVR4nO2bvXHDMAyF4Uuh0iNoFI0mjaZRNEJKFTkjIn5I0HYcM07hOz40NiV+rN4R4CNEhHjP4BzLMfjUhx/MO827/B8vMvYA0juy6ayBl4EPhPli44NKczZZYtVZZyBA/oCc0ot1EFnqlOmLpj1RxxRZ4iO9T5oEAqQgqjHV3MRJYynG4yUQIP+DkOxTI8uYaOZnlAwEyO+IiE9zpTySJVLs5DJ9kF6B9IbkMOQo2DVXzoac0j6WAwiQVuQmRs2NlOsxdk3+GECAPEJMbZoLk+ySLHPutFwaZAqke+TiThVz7VzpWJ0r1Rzb1gcESAuyifFAg7mjwbnSAl7fH0rlLEsgQJqQSpZcT/H6zI0KFS2QnhGLrKFwaLQlWXIlu5MFBEgrMsojnVU5VyT7mhX0Op/1kAikc2SN9jnFK5zsXHG8ZwYCpAUJuVLujStXQcKdLLqTXoEAeQ7RAt5keW1EpAgFPpDOEQvT0FllpLlx8GaXSe/8ds+VQIC0INWVjN8bkxfwusQk9dpcjAggQJoQmTHpvlc5VRppSbJV9BdIz0joDI5dnCxOFkVXYSk1PxAgDYhd+5lG2Y2InCvLlU2VK4EAaUJWl6X3XFU1/skbQe+kVyAdIuQFu8aoTtYeXAWN2Qt+IECaEbtHLk163h9DlislFgq9o0B6RUL4rOAqcC7gS2cxECBtSJBd/AzLZEjk9nrMlUCANCGba3IhPyRW/TDksuQqvQLpFrnzHZ+e8MqJkF1zZwYC5DUkuwqKmBLLtSEQIC8i6X02IoIxweKW+jkSSN+I/kaNrbnLkz130rURAQTI00iO5cqIWEg/b+DbFhogQBoQxDvGN7kEYfQxZzomAAAAAElFTkSuQmCC';
  const BEE = new Image(); BEE.src = 'assets/wish/bee-mascot.webp';
  function drawCard(cv, o) {
    const th = THEMES.find((x) => x.id === o.theme) || THEMES[0];
    const c = cv.getContext('2d'), W = 1080, H = 1350, cat = catMap[o.cat] || catMap.other, r = seeded(o.text.length * 7 + 3);
    cv.width = W; cv.height = H;
    let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, th.bg[0]); g.addColorStop(.55, th.bg[1]); g.addColorStop(1, th.bg[2]); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 130; i++) { c.globalAlpha = .2 + r() * .7; c.fillStyle = '#fff'; c.beginPath(); c.arc(r() * W, r() * H * .7, .6 + r() * 1.8, 0, 6.283); c.fill(); }
    c.globalAlpha = 1; g = c.createRadialGradient(880, 200, 10, 880, 200, 240); g.addColorStop(0, 'rgba(255,236,170,.55)'); g.addColorStop(1, 'rgba(255,200,100,0)'); c.fillStyle = g; c.fillRect(600, 0, 480, 440);
    c.fillStyle = '#fff1bd'; c.beginPath(); c.arc(880, 200, 58, 0, 6.283); c.fill();
    for (let i = 0; i < 8; i++) { const lx = 70 + r() * 940, ly = 90 + r() * 900, ls = 10 + r() * 16; g = c.createRadialGradient(lx, ly, 1, lx, ly, ls * 2.6); g.addColorStop(0, 'rgba(255,190,90,.6)'); g.addColorStop(1, 'rgba(255,150,60,0)'); c.fillStyle = g; c.fillRect(lx - ls * 3, ly - ls * 3, ls * 6, ls * 6); c.fillStyle = '#ffbe55'; c.beginPath(); c.ellipse(lx, ly, ls * .6, ls * .78, 0, 0, 6.283); c.fill(); }
    // ภาพประกอบ: ผืนน้ำ + กระทง 3 ใบ
    g = c.createLinearGradient(0, 1150, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,20,.55)'); c.fillStyle = g; c.fillRect(0, 1150, W, 200);
    [[210, 1238, 1], [540, 1262, 1.2], [870, 1238, 1]].forEach(([x, y, s]) => {
      c.fillStyle = '#2f6d3a'; c.beginPath(); c.ellipse(x, y, 62 * s, 16 * s, 0, 0, 6.283); c.fill();
      for (let k = -2; k <= 2; k++) { c.fillStyle = k % 2 ? '#f9a8d4' : '#f472b6'; c.beginPath(); c.ellipse(x + k * 20 * s, y - 16 * s, 15 * s, 30 * s, k * .3, 0, 6.283); c.fill(); }
      g = c.createRadialGradient(x, y - 56 * s, 1, x, y - 56 * s, 34 * s); g.addColorStop(0, 'rgba(255,240,180,.95)'); g.addColorStop(1, 'rgba(255,170,60,0)'); c.fillStyle = g; c.fillRect(x - 40 * s, y - 96 * s, 80 * s, 80 * s);
      c.fillStyle = '#fff3c4'; c.fillRect(x - 4 * s, y - 52 * s, 8 * s, 22 * s);
    });
    g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, th.frame[0]); g.addColorStop(.5, th.frame[1]); g.addColorStop(1, th.frame[0]); c.strokeStyle = g; c.lineWidth = 6; rr(c, 28, 28, W - 56, H - 56, 34); c.stroke(); c.lineWidth = 2; rr(c, 46, 46, W - 92, H - 92, 24); c.stroke();
    c.textAlign = 'center';
    c.fillStyle = th.frame[0]; c.shadowColor = th.glow; c.shadowBlur = 24; c.font = '700 74px Prompt,"Noto Sans Thai",sans-serif'; c.fillText('COM7', W / 2, 158);
    c.shadowBlur = 0; c.font = '600 44px Prompt,"Noto Sans Thai",sans-serif'; c.fillStyle = th.text; c.fillText('ต้นไม้แห่งคำอธิษฐาน', W / 2, 226);
    c.font = '500 30px "IBM Plex Sans Thai","Noto Sans Thai",sans-serif'; c.fillStyle = th.frame[0]; c.fillText(cat.icon + '  หมวด' + cat.label + '  ' + cat.icon, W / 2, 278);
    // กล่องคำขอพร
    c.fillStyle = th.box; rr(c, 100, 320, W - 200, 600, 36); c.fill(); c.strokeStyle = th.frame[1]; c.lineWidth = 3; c.stroke();
    let fs = 60, L; do { c.font = '500 ' + fs + 'px "IBM Plex Sans Thai","Noto Sans Thai",Prompt,sans-serif'; L = wrapTh(c, '“' + o.text + '”', W - 250); fs -= 4; } while ((L.length > 6 || (L.length > 1 && L[L.length - 1].length < 6)) && fs > 34);
    const lh = fs * 1.6, y0 = 630 - (L.length - 1) * lh / 2; c.fillStyle = th.text; c.shadowColor = th.glow; c.shadowBlur = 16;
    L.forEach((t, k) => c.fillText(t, W / 2, y0 + k * lh)); c.shadowBlur = 0;
    // น้องผึ้ง (ภาพประกอบ) มุมซ้ายล่างกล่อง
    if (BEE.complete && BEE.naturalWidth) c.drawImage(BEE, 70, 830, 190, 190 * BEE.naturalHeight / BEE.naturalWidth);
    c.font = '400 28px "IBM Plex Sans Thai","Noto Sans Thai",sans-serif'; c.fillStyle = th.text; c.globalAlpha = .8;
    c.fillText('ลอยกระทง สานสายใจ 2569 · ' + new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, 970); c.globalAlpha = 1;
    // QR ชวนเพื่อน
    const qx = W - 270, qy = 990; c.fillStyle = '#fff6dd'; rr(c, qx - 12, qy - 12, 184, 184, 18); c.fill();
    if (QR.complete && QR.naturalWidth) c.drawImage(QR, qx, qy, 160, 160);
    c.textAlign = 'right'; c.fillStyle = th.frame[0]; c.font = '600 34px Prompt,"Noto Sans Thai",sans-serif'; c.fillText('สแกนมาขอพรด้วยกัน', qx - 36, qy + 66);
    c.font = '500 28px Prompt,sans-serif'; c.fillStyle = th.text; c.fillText('#COM7สานสายใจ', qx - 36, qy + 112);
    c.textAlign = 'center';
  }
  function openCard(o) {
    if (!o || !o.text) return;
    o.theme = o.theme || 'night';
    const fl = ['600 46px Prompt', '500 40px "IBM Plex Sans Thai"'];
    Promise.all(fl.map((f) => document.fonts ? document.fonts.load(f, 'กขอ') : 0).concat([BEE, QR].map((im) => im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })))).catch(() => {}).then(() => {
      openModal('<div class="modal__body card-modal"><h3>🎴 การ์ดคำขอพร</h3><p class="sub">ไม่มีชื่อผู้ขอพรบนการ์ด · เลือกลายแล้วบันทึกหรือแชร์ได้เลย</p>' +
        '<div class="th-pick">' + THEMES.map((t) => '<button type="button" data-th="' + t.id + '" class="' + (t.id === o.theme ? 'on' : '') + '" style="--a:' + t.bg[1] + ';--b:' + t.frame[1] + '">' + t.name + '</button>').join('') + '</div>' +
        '<canvas class="card-cv" width="1080" height="1350"></canvas>' +
        '<div class="modal__actions"><button type="button" class="btn btn--ghost" data-action="save">⬇ บันทึกรูป</button>' +
        '<button type="button" class="btn btn--gold" data-action="share">↗ แชร์</button></div></div>', (body) => {
        const cv = $('.card-cv', body); drawCard(cv, o);
        $$('[data-th]', body).forEach((b) => b.addEventListener('click', () => { o.theme = b.dataset.th; $$('[data-th]', body).forEach((x) => x.classList.toggle('on', x === b)); drawCard(cv, o); }));
        const file = (cb) => cv.toBlob((b) => cb(b), 'image/png');
        const save = () => file((b) => { const a = document.createElement('a'), u = URL.createObjectURL(b); a.href = u; a.download = 'com7-wish-card.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 3000); toast('บันทึกการ์ดแล้ว 🎴'); });
        $('[data-action="save"]', body).addEventListener('click', save);
        $('[data-action="share"]', body).addEventListener('click', () => file((b) => {
          const f = new File([b], 'com7-wish-card.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: 'COM7 ต้นไม้แห่งคำอธิษฐาน', text: 'มาขอพรด้วยกัน #COM7สานสายใจ https://com7er.github.io/com7loykrathong2026/wish.html' }).catch(() => {});
          else { save(); toast('บันทึกรูปแล้ว นำไปแชร์ต่อได้เลย'); }
        }));
      });
    });
  }
  window.__openCard = openCard;

  loadTree();
  /* ★ 5 พ.ย.: มาจากหน้าลอยกระทง (แขวนพรพร้อมลอย) → เปิดพรของฉันให้อัตโนมัติ · รหัสอยู่ในแท็บนี้เท่านั้น ไม่อยู่ใน URL */
  try {
    const em = sessionStorage.getItem('c7_wish_emp');
    if (em && location.hash === '#mine') { sessionStorage.removeItem('c7_wish_emp'); currentUser = { id: em }; setTimeout(showMine, 1800); }
  } catch (e) {}

  // Entrance
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
})();

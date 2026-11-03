/* ================================================================
 *  com7-extras.js — ส่วนเสริมใช้ร่วมทุกหน้า (v4.2 · แจ็ค · 2 พ.ย. 2569)
 *   1) ช่องทางติดต่อท้ายเว็บ        → แก้ข้อมูลที่ CONTACT ด้านล่างที่เดียว
 *   2) ปุ่ม "ตรวจสอบสถานะการสมัคร"   → เรียก action=status (รหัสพนักงาน + เบอร์ 4 ตัวท้าย)
 *   3) แผงประกาศผล Top 3 หญิง/ชาย   → ใส่ <div id="com7-winners"></div> ในหน้าที่ต้องการ
 *  ★ ไม่ใช้ไลบรารีภายนอก · ไม่เก็บข้อมูลในเครื่อง · ทำงานแม้ backend ล่ม (แค่ซ่อนตัวเอง)
 * ================================================================ */
(function () {
  'use strict';

  /* ==================== CONFIG (แก้ที่นี่ที่เดียว) ==================== */
  var API = 'https://script.google.com/macros/s/AKfycbxxfSz7t00UR9g4H78boZm4RJRLN3O0uqsRnDVEnTK_sEFkZlHiweCdOnEeL0slpuAZuQ/exec';
  var CONTACT = {
    team:  'ทีมจัดงาน COM7 ลอยกระทง สานสายใจ 2569',
    // ★ เติมช่องทางจริง — ช่องที่เว้นว่าง '' จะไม่แสดง
    line:  '',          // เช่น 'https://line.me/R/ti/p/@com7xxxx'
    email: '',          // เช่น 'hr-event@comseven.com'
    phones: ['7224', '7213'],   // ★ เบอร์ภายใน (พี่อั้ม 2 พ.ย.)
    hours: ''
  };

  /* ==================== helpers ==================== */
  function esc(s) { return String(s == null ? '' : s).replace(/[<>&"']/g, function (c) { return { '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function jsonp(params, cb) {
    var name = '__c7x' + Date.now() + Math.floor(Math.random() * 9999);
    var s = document.createElement('script'), done = false;
    var t = setTimeout(function () { finish(null); }, 15000);
    function finish(d) { if (done) return; done = true; clearTimeout(t); try { delete window[name]; } catch (_) { window[name] = undefined; } if (s.parentNode) s.parentNode.removeChild(s); cb(d); }
    window[name] = finish;
    s.onerror = function () { finish(null); };
    s.src = API + '?' + Object.keys(params).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&') + '&callback=' + name;
    document.body.appendChild(s);
  }

  /* ==================== styles ==================== */
  var css = ''
    + '.c7x-foot{position:relative;z-index:5;margin:0;padding:34px 20px 40px;text-align:center;font:400 14px/1.7 "Prompt","IBM Plex Sans Thai","Noto Sans Thai",sans-serif;color:#efe6cf;background:linear-gradient(180deg,rgba(10,10,38,0),#090a26 40%)}'
    + '.c7x-foot h4{margin:0 0 6px;font-size:15px;color:#f3e2b3;font-weight:600;letter-spacing:.02em}'
    + '.c7x-foot .c7x-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:10px 0 6px}'
    + '.c7x-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;border:1px solid rgba(231,197,106,.45);color:#f7e3a8;text-decoration:none;background:rgba(255,255,255,.04);font-size:13.5px;cursor:pointer}'
    + '.c7x-chip:hover{background:rgba(231,197,106,.14)}'
    + '.c7x-muted{opacity:.6;font-size:12.5px}'
    + '.c7x-ov{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(5,6,24,.72);backdrop-filter:blur(6px)}'
    + '.c7x-ov.on{display:flex}'
    + '.c7x-pn{position:relative;width:min(420px,100%);max-height:88vh;overflow:auto;padding:26px 22px 22px;border-radius:22px;border:1px solid rgba(231,197,106,.45);background:linear-gradient(160deg,#241650,#0d1040);color:#f5ecdc;font:400 15px/1.6 "Prompt","IBM Plex Sans Thai",sans-serif;box-shadow:0 30px 80px -20px rgba(0,0,0,.8)}'
    + '.c7x-pn h3{margin:0 0 4px;font-size:19px;color:#f3e2b3}'
    + '.c7x-pn .c7x-x{position:absolute;top:10px;right:12px;border:0;background:none;color:#f3e2b3;font-size:26px;line-height:1;cursor:pointer}'
    + '.c7x-pn label{display:block;margin:12px 0 4px;font-size:13px;opacity:.85}'
    + '.c7x-pn input{width:100%;box-sizing:border-box;padding:11px 13px;border-radius:12px;border:1px solid rgba(231,197,106,.4);background:rgba(255,255,255,.06);color:inherit;font:inherit}'
    + '.c7x-btn{margin-top:16px;width:100%;padding:12px;border:0;border-radius:999px;font:600 15px "Prompt",sans-serif;color:#2b1a06;background:linear-gradient(180deg,#f8e8bd,#e2bf74 50%,#b98a3e);cursor:pointer}'
    + '.c7x-btn[disabled]{opacity:.6;cursor:wait}'
    + '.c7x-res{margin-top:14px;padding:14px;border-radius:14px;background:rgba(255,255,255,.05);display:none}'
    + '.c7x-res.on{display:block}'
    + '.c7x-res img{width:84px;height:112px;object-fit:cover;border-radius:10px;float:right;margin-left:10px;border:1px solid rgba(231,197,106,.4)}'
    + '.c7x-tag{display:inline-block;padding:3px 12px;border-radius:999px;font-weight:600;font-size:13px}'
    + '.c7x-tag.ok{background:#1f6b45;color:#d8ffe8}.c7x-tag.wait{background:#6b551f;color:#fff2c9}.c7x-tag.no{background:#6b1f2a;color:#ffd9de}'
    + '.c7x-win{max-width:980px;margin:0 auto;padding:10px 0}'
    + '.c7x-win h3{text-align:center;color:#f3e2b3;margin:18px 0 12px;font:600 20px "Prompt",sans-serif}'
    + '.c7x-wg{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}'
    + '.c7x-wc{position:relative;border-radius:20px;overflow:hidden;border:1px solid rgba(231,197,106,.45);background:#120d36;text-align:center;color:#f5ecdc}'
    + '.c7x-wc img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block;background:#1c1650}'
    + '.c7x-wc .c7x-rk{position:absolute;top:10px;left:10px;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font:700 18px "Prompt",sans-serif;color:#2b1a06;background:linear-gradient(135deg,#fff0c4,#d9a441)}'
    + '.c7x-wc:nth-child(2) .c7x-rk{background:linear-gradient(135deg,#f4f6f9,#aab2bf)}'
    + '.c7x-wc:nth-child(3) .c7x-rk{background:linear-gradient(135deg,#f0c3a0,#b2714a)}'
    + '.c7x-wc .c7x-bd{padding:12px 12px 14px}.c7x-wc b{display:block;font-size:15.5px}.c7x-wc span{font-size:13px;opacity:.75}'
    + '.c7x-wait{text-align:center;padding:26px 16px;border:1px dashed rgba(231,197,106,.45);border-radius:20px;color:#f3e2b3;background:rgba(255,255,255,.03)}';
  var st = document.createElement('style'); st.id = 'c7x-style'; st.textContent = css; document.head.appendChild(st);

  /* ==================== 2) ตรวจสอบสถานะการสมัคร ==================== */
  function buildStatusModal() {
    if (document.getElementById('c7x-status')) return;
    var ov = document.createElement('div');
    ov.className = 'c7x-ov'; ov.id = 'c7x-status';
    ov.innerHTML = ''
      + '<div class="c7x-pn" role="dialog" aria-modal="true" aria-labelledby="c7x-st-h">'
      + '<button class="c7x-x" type="button" aria-label="ปิด" data-c7x-close>&times;</button>'
      + '<h3 id="c7x-st-h">🔎 ตรวจสอบสถานะการสมัคร</h3>'
      + '<div class="c7x-muted">ประกวดนพมาศ AI · ใช้ข้อมูลเดียวกับตอนลงทะเบียน</div>'
      + '<label for="c7x-emp">รหัสพนักงาน</label><input id="c7x-emp" autocomplete="off" placeholder="เช่น 12345">'
      + '<label for="c7x-ph4">เบอร์โทร 4 ตัวท้าย</label><input id="c7x-ph4" inputmode="numeric" maxlength="4" placeholder="เช่น 5678">'
      + '<button class="c7x-btn" type="button" id="c7x-go">ตรวจสอบ</button>'
      + '<div class="c7x-res" id="c7x-res" aria-live="polite"></div>'
      + '</div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.hasAttribute('data-c7x-close')) closeStatus(); });
    document.getElementById('c7x-go').addEventListener('click', checkStatus);
    document.getElementById('c7x-ph4').addEventListener('keydown', function (e) { if (e.key === 'Enter') checkStatus(); });
  }
  function openStatus() { buildStatusModal(); document.getElementById('c7x-status').classList.add('on'); setTimeout(function () { document.getElementById('c7x-emp').focus(); }, 50); }
  function closeStatus() { var o = document.getElementById('c7x-status'); if (o) o.classList.remove('on'); }
  function checkStatus() {
    var emp = document.getElementById('c7x-emp').value.trim();
    var ph4 = document.getElementById('c7x-ph4').value.replace(/\D/g, '');
    var res = document.getElementById('c7x-res'), go = document.getElementById('c7x-go');
    res.classList.add('on');
    if (!emp || ph4.length !== 4) { res.innerHTML = '⚠️ กรอกรหัสพนักงาน และเบอร์โทร 4 ตัวท้ายให้ครบ'; return; }
    go.disabled = true; go.textContent = 'กำลังตรวจสอบ…'; res.innerHTML = '⏳ กำลังตรวจสอบ…';
    jsonp({ action: 'status', empId: emp, phone4: ph4 }, function (r) {
      go.disabled = false; go.textContent = 'ตรวจสอบ';
      if (!r) { res.innerHTML = '⚠️ เชื่อมต่อระบบไม่ได้ ลองใหม่อีกครั้ง'; return; }
      if (!r.ok) { res.innerHTML = '⚠️ ' + esc(r.error || 'ตรวจสอบไม่สำเร็จ'); return; }
      if (!r.found) { res.innerHTML = '🔍 ' + esc(r.message || 'ไม่พบใบสมัคร') + '<div class="c7x-muted" style="margin-top:6px">ตรวจรหัสพนักงาน/เบอร์อีกครั้ง หรือยังไม่ได้ลงทะเบียน → <a href="contest.html" style="color:#f7e3a8">ลงทะเบียนประกวด</a></div>'; return; }
      var s = String(r['สถานะ'] || ''), cls = s === 'อนุมัติ' ? 'ok' : s === 'ปฏิเสธ' ? 'no' : 'wait';
      var note = s === 'อนุมัติ' ? 'ผลงานของคุณแสดงในหน้าผู้เข้าประกวดแล้ว ชวนเพื่อนมาโหวตช่วง 18–23 พ.ย. ได้เลย 🎉'
               : s === 'ปฏิเสธ' ? 'ผลงานยังไม่ผ่านเกณฑ์ หากมีข้อสงสัย ติดต่อทีมจัดงานด้านล่าง'
               : 'ทีมงานกำลังตรวจสอบผลงาน โปรดรอการอนุมัติ';
      res.innerHTML = (r['รูป'] ? '<img src="' + esc(r['รูป']) + '" alt="" onerror="this.remove()">' : '')
        + '<div><b>' + esc(r['ชื่อ']) + '</b></div>'
        + '<div class="c7x-muted">' + esc(r.id) + ' · ' + (r['เพศ'] === 'ญ' ? 'นางนพมาศ (หญิง)' : 'นพมาศ (ชาย)') + '</div>'
        + '<div style="margin:10px 0 6px"><span class="c7x-tag ' + cls + '">' + esc(s || 'รออนุมัติ') + '</span></div>'
        + '<div style="font-size:14px;clear:both">' + note + '</div>';
    });
  }
  window.COM7_openStatus = openStatus;

  /* ==================== 1) ช่องทางติดต่อ (footer) ==================== */
  function buildFooter() {
    if (document.querySelector('.c7x-foot') || document.body.getAttribute('data-c7x-nofoot') !== null) return;
    var chips = '';
    if (CONTACT.line)  chips += '<a class="c7x-chip" href="' + esc(CONTACT.line) + '" target="_blank" rel="noopener">💬 LINE</a>';
    if (CONTACT.email) chips += '<a class="c7x-chip" href="mailto:' + esc(CONTACT.email) + '">✉️ ' + esc(CONTACT.email) + '</a>';
    if (CONTACT.phones && CONTACT.phones.length) chips += '<span class="c7x-chip" style="cursor:default">📞 โทรภายใน ' + CONTACT.phones.map(esc).join(' หรือ ') + '</span>';
    var f = document.createElement('div');
    f.className = 'c7x-foot';
    f.setAttribute('role', 'contentinfo');
    f.innerHTML = '<h4>มีข้อสงสัย / สมัครไม่ผ่าน? ติดต่อเรา</h4>'
      + '<div>' + esc(CONTACT.team) + '</div>'
      + '<div class="c7x-row">' + chips
      + '<button class="c7x-chip" type="button" data-c7x-status>🔎 ตรวจสอบสถานะการสมัคร</button>'
      + '<a class="c7x-chip" href="rules.html">📜 กติกา</a></div>'
      + (chips ? '' : '<div class="c7x-muted">(ช่องทางติดต่อจะแสดงที่นี่)</div>')
      + '<div class="c7x-muted">' + (CONTACT.hours ? esc(CONTACT.hours) + ' · ' : '') + '© 2569 COM7 · เพื่อพนักงานในเครือคอมเซเว่น</div>';
    document.body.appendChild(f);
  }

  /* ==================== 3) ประกาศผล Top 3 ==================== */
  function card(p) {
    return '<div class="c7x-wc"><span class="c7x-rk">' + p['อันดับ'] + '</span>'
      + (p['รูป'] ? '<img src="' + esc(p['รูป']) + '" alt="' + esc(p['ชื่อ']) + '" loading="lazy" onerror="this.style.visibility=\'hidden\'">' : '<img alt="">')
      + '<div class="c7x-bd"><b>' + esc(p['ชื่อ']) + '</b><span>' + esc(p['บริษัท'] || '') + '</span>'
      + '<div style="margin-top:6px;color:#f3e2b3;font-weight:600">' + Number(p['คะแนน'] || 0).toLocaleString('th-TH') + ' คะแนน</div></div></div>';
  }
  function buildWinners() {
    var box = document.getElementById('com7-winners');
    if (!box) return;
    box.className = 'c7x-win';
    box.innerHTML = '<div class="c7x-wait">⏳ กำลังโหลดผลประกาศ…</div>';
    jsonp({ action: 'winners' }, function (r) {
      if (!r || !r.ok) { box.innerHTML = '<div class="c7x-wait">🏆 ประกาศผลวันที่ 24 พ.ย. 2569</div>'; return; }
      if (!r.revealed) { box.innerHTML = '<div class="c7x-wait">🏆 ประกาศผล Top 3 นางนพมาศ & หนุ่มนพมาศ<br><b style="font-size:20px">24 พ.ย. 2569</b><div class="c7x-muted" style="margin-top:6px">ระหว่างเปิดโหวตจะไม่แสดงคะแนน เพื่อความยุติธรรม</div></div>'; return; }
      var f = r.female || [], m = r.male || [];
      box.innerHTML = '<h3>👑 Miss Nopphamas AI 2569</h3>'
        + (f.length ? '<div class="c7x-wg">' + f.map(card).join('') + '</div>' : '<div class="c7x-wait">ไม่มีผู้เข้าประกวดหมวดนี้</div>')
        + '<h3>👑 Mister Nopphamas AI 2569</h3>'
        + (m.length ? '<div class="c7x-wg">' + m.map(card).join('') + '</div>' : '<div class="c7x-wait">ไม่มีผู้เข้าประกวดหมวดนี้</div>');
    });
  }

  /* ==================== init ==================== */
  function init() {
    buildFooter();
    buildWinners();
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-c7x-status]');
      if (t) { e.preventDefault(); openStatus(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeStatus(); });
    if (/[?&#]status\b/.test(location.search + location.hash)) openStatus();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
